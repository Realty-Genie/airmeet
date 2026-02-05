"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
    name: string
    email: string
    createdAt: Date
    totalMinsUsed: number
    plan: string
    credits: number
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    register: (name: string, email: string, password: string) => Promise<boolean>
    logout: () => void
    fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "airmeet_token"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const getToken = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(TOKEN_KEY)
        }
        return null
    }

    const setToken = (token: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(TOKEN_KEY, token)
        }
    }

    const clearToken = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(TOKEN_KEY)
        }
    }

    const fetchUser = async () => {
        const token = getToken()
        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                clearToken()
                setUser(null)
            }
        } catch (error) {
            console.error("Failed to fetch user:", error)
            clearToken()
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json()
                setToken(data.token)
                await fetchUser()
                return true
            }
            return false
        } catch (error) {
            console.error("Login failed:", error)
            return false
        }
    }

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            if (response.ok) {
                const data = await response.json()
                setToken(data.token)
                await fetchUser()
                return true
            }
            return false
        } catch (error) {
            console.error("Registration failed:", error)
            return false
        }
    }

    const logout = () => {
        clearToken()
        setUser(null)
        router.push("/login")
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
