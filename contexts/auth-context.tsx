"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface MockUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface AuthContextType {
  user: MockUser | null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuario mock para demostración
const mockUser: MockUser = {
  id: "mock-user-1",
  email: "demo@docmanager.com",
  name: "Demo User",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(mockUser)
  const [loading] = useState(false)

  const signIn = () => {
    setUser(mockUser)
  }

  const signOut = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
