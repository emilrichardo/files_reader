import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

// Aumentar el límite de tiempo para la función
export const maxDuration = 30 // 30 segundos

export async function POST(request: NextRequest) {
  console.log("📡 Solicitud de upload recibida")

  try {
    // Verificar si es multipart/form-data
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      console.error("❌ Tipo de contenido incorrecto:", contentType)
      return NextResponse.json({ error: true, message: "Tipo de contenido incorrecto" }, { status: 400 })
    }

    // Obtener el formulario
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("❌ No se encontró el archivo en la solicitud")
      return NextResponse.json({ error: true, message: "No se encontró el archivo en la solicitud" }, { status: 400 })
    }

    // Verificar tamaño del archivo (4MB máximo)
    const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB
    if (file.size > MAX_FILE_SIZE) {
      console.error(`❌ Archivo demasiado grande: ${file.size} bytes`)
      return NextResponse.json(
        {
          error: true,
          message: "El archivo es demasiado grande",
          details: `El tamaño máximo permitido es ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 },
      )
    }

    // Obtener la URL del endpoint desde la configuración global
    const supabase = createClient()
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("api_endpoint")
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (settingsError || !settings?.api_endpoint) {
      console.error("❌ Error al obtener la configuración o endpoint no configurado:", settingsError)
      return NextResponse.json(
        {
          error: true,
          message: "Endpoint no configurado. Por favor configura el endpoint en la sección de configuración avanzada.",
          needsConfiguration: true,
        },
        { status: 400 },
      )
    }

    const apiEndpoint = settings.api_endpoint
    console.log(`📡 Enviando archivo a: ${apiEndpoint}`)

    // Crear un nuevo FormData para enviar al endpoint
    const proxyFormData = new FormData()
    proxyFormData.append("file", file)

    // Agregar todos los demás campos del formulario original
    for (const [key, value] of formData.entries()) {
      if (key !== "file") {
        proxyFormData.append(key, value)
      }
    }

    // Configurar el timeout para la solicitud
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 segundos

    try {
      // Enviar la solicitud al endpoint
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: proxyFormData,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-Forwarded-By": "Civet-Document-System",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`❌ Error del endpoint: ${response.status} ${response.statusText}`)

        // Si es un timeout (504), devolver un mensaje más amigable
        if (response.status === 504 || response.status === 408) {
          return NextResponse.json({
            success: true,
            message: "Archivo recibido. El procesamiento continuará en segundo plano.",
            data: {
              status: "processing",
              filename: file.name,
              size: file.size,
              type: file.type,
            },
          })
        }

        return NextResponse.json(
          {
            error: true,
            message: `El endpoint respondió con estado ${response.status}`,
            details: "Error al procesar el archivo en el servidor",
          },
          { status: response.status },
        )
      }

      // Intentar parsear la respuesta como JSON
      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        console.error("❌ Error al parsear la respuesta JSON:", e)
        responseData = {
          success: true,
          message: "Archivo procesado, pero la respuesta no es JSON válido",
        }
      }

      console.log("✅ Respuesta del endpoint:", responseData)
      return NextResponse.json(responseData)
    } catch (error: any) {
      clearTimeout(timeoutId)

      console.error("❌ Error en la solicitud al endpoint:", error)

      // Si es un error de timeout o abort
      if (error.name === "AbortError") {
        return NextResponse.json({
          success: true,
          message: "Archivo recibido. El procesamiento continuará en segundo plano.",
          data: {
            status: "processing",
            filename: file.name,
            size: file.size,
            type: file.type,
          },
        })
      }

      return NextResponse.json(
        {
          error: true,
          message: error.message || "Error al enviar el archivo al endpoint",
          details: "Error de conexión con el servidor de procesamiento",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Error general en el proxy:", error)
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error interno del servidor",
        details: "Error en el procesamiento de la solicitud",
      },
      { status: 500 },
    )
  }
}
