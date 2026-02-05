"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { IconMail, IconLock, IconUser } from "@tabler/icons-react"
import { useAuth } from "@/components/auth-context"

export default function LoginPage() {
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const { login, register } = useAuth()
    const router = useRouter()

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setLoginData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setRegisterData((prev) => ({
            ...prev,
            [id.replace("register-", "")]: value,
        }))
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const success = await login(loginData.email, loginData.password)
            if (success) {
                toast.success("Login successful")
                router.push("/")
            } else {
                toast.error("Invalid email or password")
            }
        } catch (error) {
            toast.error("Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (registerData.password !== registerData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        setIsLoading(true)
        try {
            const success = await register(registerData.name, registerData.email, registerData.password)
            if (success) {
                toast.success("Registration successful")
                router.push("/")
            } else {
                toast.error("Registration failed. Email may already be in use.")
            }
        } catch (error) {
            toast.error("Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <Image
                            src="/airmeet.svg"
                            alt="Airmeet"
                            width={40}
                            height={40}
                            priority
                        />
                        <span className="text-xl font-semibold">Airmeet</span>
                    </Link>

                    {/* Tabs Card */}
                    <Card className="border-border">
                        <Tabs defaultValue="login" className="w-full p-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Sign In</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            {/* Login Tab */}
                            <TabsContent value="login">
                                <CardHeader className="space-y-1 px-6 pt-6">
                                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                                    <CardDescription>
                                        Enter your credentials to access your dashboard
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="pl-9"
                                                    value={loginData.email}
                                                    onChange={handleLoginChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <div className="relative">
                                                <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-9"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            size="lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>

                            {/* Register Tab */}
                            <TabsContent value="register">
                                <CardHeader className="space-y-1 px-6 pt-6">
                                    <CardTitle className="text-2xl">Create account</CardTitle>
                                    <CardDescription>
                                        Register to start using CallGenie
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="register-name">Name</Label>
                                            <div className="relative">
                                                <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="register-name"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="pl-9"
                                                    value={registerData.name}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-email">Email</Label>
                                            <div className="relative">
                                                <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="register-email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="pl-9"
                                                    value={registerData.email}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-password">Password</Label>
                                            <div className="relative">
                                                <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="register-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-9"
                                                    value={registerData.password}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                                            <div className="relative">
                                                <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="register-confirmPassword"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-9"
                                                    value={registerData.confirmPassword}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            size="lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Creating account..." : "Create Account"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                    </Card>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        © 2024 CallGenie. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Image/Branding */}
            <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
                <div className="max-w-md text-center space-y-6">
                    <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Image
                            src="/airmeet.svg"
                            alt="Airmeet"
                            width={64}
                            height={64}
                            priority
                        />
                    </div>
                    <span className="text-xl font-semibold">Airmeet Calling Agent</span>
                </div>
            </div>
        </div>
    )
}
