export async function POST(request: Request) {
  try {
    console.log("🔄 Proxy recibiendo request...")

    // Verificar si es FormData o JSON
    const contentType = request.headers.get("content-type") || ""
    let body: any

    if (contentType.includes("multipart/form-data")) {
      // Procesar FormData
      console.log("📦 Procesando FormData...")
      const formData = await request.formData()

      // Extraer datos del FormData
      const file = formData.get("file") as File
      const fieldsJson = formData.get("fields") as string
      const existingRowsJson = formData.get("existing_rows") as string

      // Convertir el archivo a base64 si existe
      let fileContent = null
      let fileName = null
      let fileType = null
      let fileSize = null

      if (file) {
        fileName = file.name
        fileType = file.type
        fileSize = file.size

        // Leer el archivo como ArrayBuffer y convertir a base64
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        fileContent = btoa(binaryString)
      }

      // Construir el cuerpo para el webhook
      body = {
        filename: fileName,
        content: fileContent,
        type: fileType,
        size: fileSize,
        fields: fieldsJson ? JSON.parse(fieldsJson) : [],
        existingData: existingRowsJson ? JSON.parse(existingRowsJson) : [],
        timestamp: Date.now(),
      }
    } else {
      // Procesar JSON
      console.log("📦 Procesando JSON...")
      body = await request.json()
    }

    console.log("📦 Body procesado:", {
      filename: body.filename,
      size: body.size,
      type: body.type,
      contentLength: body.content?.length,
      fieldsCount: body.fields?.length || 0,
      existingDataCount: body.existingData?.length || 0,
    })

    // Verificar tamaño del contenido base64
    if (body.content && body.content.length > 6 * 1024 * 1024) {
      console.log(`❌ Contenido base64 demasiado grande: ${body.content.length} caracteres`)
      return new Response(
        JSON.stringify({
          error: "Content too large after base64 encoding",
          maxSize: "4.5MB",
          receivedSize: `${(body.content.length / 1024 / 1024).toFixed(2)}MB`,
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Obtener URL del webhook desde headers o usar el predeterminado
    // Modificado: Usar URL pública accesible para todos los usuarios
    const targetUrl = request.headers.get("X-Target-URL") || "https://cibet.app.n8n.cloud/webhook/invitu-public-upload"
    console.log("🎯 Enviando a webhook externo:", targetUrl)

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      console.log(`📡 Respuesta del webhook: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ Error del webhook:", errorText)

        return new Response(
          JSON.stringify({
            error: "External webhook error",
            status: response.status,
            message: errorText,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      const result = await response.json()
      console.log("✅ Respuesta exitosa del webhook")

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (webhookError) {
      console.error("❌ Error al llamar al webhook:", webhookError)

      return new Response(
        JSON.stringify({
          error: "Error connecting to webhook",
          message: (webhookError as Error).message,
          details: "No se pudo conectar con el servicio externo",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("❌ Error en proxy:", error)

    return new Response(
      JSON.stringify({
        error: "Proxy internal error",
        message: (error as Error).message,
        stack: (error as Error).stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
