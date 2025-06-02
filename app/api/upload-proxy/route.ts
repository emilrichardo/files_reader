import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Obtener el body de la petición
    const body = await request.json()

    console.log("📡 Proxy: Recibiendo petición para reenviar")

    // Obtener el endpoint desde los headers o usar uno por defecto
    const targetEndpoint = request.headers.get("x-target-endpoint") || "https://cibet.app.n8n.cloud/webhook-test/upload"

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

    // Obtener la respuesta
    const responseData = await response.text()

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
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-endpoint",
    },
  })
}
