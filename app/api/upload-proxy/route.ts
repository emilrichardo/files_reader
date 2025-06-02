import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Obtener el body de la petición
    const body = await request.json()

    console.log("📡 Proxy: Recibiendo petición para reenviar")
    console.log("📋 Proxy: Body recibido:", {
      file: body.file ? { name: body.file.name, type: body.file.type, size: body.file.size } : "No file",
      entries: body.entries ? body.entries.length + " entries" : "No entries",
      fieldsStructure: body.fieldsStructure ? body.fieldsStructure.length + " fields" : "No fields",
      metadata: body.metadata || "No metadata",
    })

    // Obtener el endpoint desde los headers
    const targetEndpoint = request.headers.get("x-target-endpoint")

    if (!targetEndpoint) {
      console.error("❌ Proxy: No target endpoint provided")
      return new NextResponse(
        JSON.stringify({
          error: "No target endpoint",
          message: "No se proporcionó endpoint de destino",
        }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log("🎯 Proxy: Enviando a:", targetEndpoint)

    // Reenviar la petición al endpoint real
    const response = await fetch(targetEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Reenviar algunos headers importantes
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
      body: JSON.stringify(body),
    })

    console.log("📡 Proxy: Respuesta del servidor:", response.status)
    console.log("📡 Proxy: Headers de respuesta:", Object.fromEntries(response.headers.entries()))

    // Obtener la respuesta
    const responseData = await response.text()
    console.log(
      "📋 Proxy: Datos de respuesta:",
      responseData.substring(0, 500) + (responseData.length > 500 ? "..." : ""),
    )

    // Crear respuesta con headers CORS
    const corsResponse = new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-endpoint",
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    })

    return corsResponse
  } catch (error) {
    console.error("❌ Proxy error:", error)

    return new NextResponse(
      JSON.stringify({
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  console.log("🔄 Proxy: Handling OPTIONS preflight request")
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-endpoint",
    },
  })
}
