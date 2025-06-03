export async function POST(request: Request) {
  try {
    console.log("🔄 Proxy recibiendo request...")

    // Verificar Content-Length antes de procesar
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 5 * 1024 * 1024) {
      console.log(`❌ Payload demasiado grande: ${contentLength} bytes`)
      return new Response(
        JSON.stringify({
          error: "Payload too large",
          maxSize: "5MB",
          receivedSize: contentLength,
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const body = await request.json()
    console.log("📦 Body recibido:", {
      filename: body.filename,
      size: body.size,
      type: body.type,
      contentLength: body.content?.length,
      retryCount: body.retryCount || 0,
    })

    // Verificar tamaño del contenido base64
    if (body.content && body.content.length > 6 * 1024 * 1024) {
      // ~4.5MB después de decodificar
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

    console.log("🎯 Enviando a webhook externo...")

    const response = await fetch("https://cibet.app.n8n.cloud/webhook-test/uploadfile", {
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
  } catch (error) {
    console.error("❌ Error en proxy:", error)

    return new Response(
      JSON.stringify({
        error: "Proxy internal error",
        message: (error as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
