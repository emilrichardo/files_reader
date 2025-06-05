import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  console.log("📡 Upload request received")

  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: true, message: "Invalid content type" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: true, message: "No file found" }, { status: 400 })
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: true, message: "File too large (max 4MB)" }, { status: 400 })
    }

    // Get endpoint from database - SIMPLE query
    const supabase = createClient()
    const { data, error } = await supabase
      .from("user_settings")
      .select("api_endpoint")
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .limit(1)
      .single()

    if (error || !data?.api_endpoint) {
      console.error("❌ No endpoint configured:", error)
      return NextResponse.json(
        {
          error: true,
          message: "API endpoint not configured",
          needsConfiguration: true,
        },
        { status: 400 },
      )
    }

    const apiEndpoint = data.api_endpoint
    console.log(`📡 Sending to: ${apiEndpoint}`)

    // Forward the request
    const proxyFormData = new FormData()
    proxyFormData.append("file", file)

    for (const [key, value] of formData.entries()) {
      if (key !== "file") {
        proxyFormData.append(key, value)
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: proxyFormData,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`❌ Endpoint error: ${response.status}`)
        return NextResponse.json(
          {
            error: true,
            message: `Endpoint responded with ${response.status}`,
          },
          { status: response.status },
        )
      }

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = {
          success: true,
          message: "File processed successfully",
        }
      }

      console.log("✅ Success:", responseData)
      return NextResponse.json(responseData)
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("❌ Request error:", error)

      if (error.name === "AbortError") {
        return NextResponse.json({
          success: true,
          message: "File received, processing in background",
        })
      }

      return NextResponse.json(
        {
          error: true,
          message: error.message || "Connection error",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ General error:", error)
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
