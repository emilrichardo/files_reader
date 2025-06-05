import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log("🔍 Checking configuration...")

    // Verificar todas las configuraciones
    const { data: allSettings, error: allError } = await supabase.from("user_settings").select("*")

    console.log("📊 All settings:", allSettings)
    console.log("❌ All error:", allError)

    // Verificar configuración específica
    const { data: globalSettings, error: globalError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", "00000000-0000-0000-0000-000000000001")

    console.log("🌍 Global settings:", globalSettings)
    console.log("❌ Global error:", globalError)

    return NextResponse.json({
      allSettings,
      allError,
      globalSettings,
      globalError,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Check config error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
