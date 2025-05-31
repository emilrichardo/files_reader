import { createClient } from "@supabase/supabase-js"

// Verificar que las variables de entorno estén disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign in...")
    // Usar la URL de producción para el callback
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "https://v0-invitu.vercel.app/auth/callback"

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Google sign in error:", error)
      alert(`Error signing in with Google: ${error.message}`)
    }

    return { data, error }
  } catch (error) {
    console.error("Error signing in with Google:", error)
    alert(`Error signing in with Google: ${error}`)
    return { data: null, error }
  }
}

export const signInWithGitHub = async () => {
  try {
    console.log("Attempting GitHub sign in...")
    // Usar la URL de producción para el callback
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "https://v0-invitu.vercel.app/auth/callback"

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error("GitHub sign in error:", error)
      alert(`Error signing in with GitHub: ${error.message}`)
    }

    return { data, error }
  } catch (error) {
    console.error("Error signing in with GitHub:", error)
    alert(`Error signing in with GitHub: ${error}`)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    return { data, error }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { data: null, error }
  }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    return { data, error }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { data: null, error }
  }
}
