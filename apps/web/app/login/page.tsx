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
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconArrowLeft } from "@tabler/icons-react"
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

    // Password visibility toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [showRegisterPassword, setShowRegisterPassword] = useState(false)
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotStep, setForgotStep] = useState(1) // 1=email, 2=otp, 3=new password
    const [forgotEmail, setForgotEmail] = useState("")
    const [forgotOtp, setForgotOtp] = useState("")
    const [forgotNewPassword, setForgotNewPassword] = useState("")
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState("")
    const [forgotLoading, setForgotLoading] = useState(false)
    const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
    const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)

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

    // Forgot password handlers
    const openForgotPassword = () => {
        setShowForgotPassword(true)
        setForgotStep(1)
        setForgotEmail("")
        setForgotOtp("")
        setForgotNewPassword("")
        setForgotConfirmPassword("")
        setShowForgotNewPassword(false)
        setShowForgotConfirmPassword(false)
    }

    const closeForgotPassword = () => {
        setShowForgotPassword(false)
    }

    const handleGenerateOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setForgotLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            })
            if (response.ok) {
                toast.success("OTP sent to your email")
                setForgotStep(2)
            } else {
                const data = await response.json().catch(() => null)
                toast.error(data?.message || "Failed to send OTP. Please check your email.")
            }
        } catch (error) {
            toast.error("Failed to send OTP")
        } finally {
            setForgotLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setForgotLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/veritfy-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
            })
            if (response.ok) {
                toast.success("OTP verified successfully")
                setForgotStep(3)
            } else {
                const data = await response.json().catch(() => null)
                toast.error(data?.message || "Invalid OTP. Please try again.")
            }
        } catch (error) {
            toast.error("OTP verification failed")
        } finally {
            setForgotLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (forgotNewPassword !== forgotConfirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (forgotNewPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }
        setForgotLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail, password: forgotNewPassword, otp: forgotOtp }),
            })
            if (response.ok) {
                toast.success("Password changed successfully! Please sign in.")
                closeForgotPassword()
            } else {
                const data = await response.json().catch(() => null)
                toast.error(data?.message || "Failed to change password")
            }
        } catch (error) {
            toast.error("Failed to change password")
        } finally {
            setForgotLoading(false)
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
                                                    type={showLoginPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-9 pr-9"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showLoginPassword ? (
                                                        <IconEyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <IconEye className="h-4 w-4" />
                                                    )}
                                                </button>
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
                                        <button
                                            type="button"
                                            onClick={openForgotPassword}
                                            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-2 text-center"
                                        >
                                            Forgot Password?
                                        </button>
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
                                                    type={showRegisterPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-9 pr-9"
                                                    value={registerData.password}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showRegisterPassword ? (
                                                        <IconEyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <IconEye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                                            <div className="relative">
                                                <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="register-confirmPassword"
                                                    type={showRegisterConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-9 pr-9"
                                                    value={registerData.confirmPassword}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showRegisterConfirmPassword ? (
                                                        <IconEyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <IconEye className="h-4 w-4" />
                                                    )}
                                                </button>
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

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md mx-4 border-border shadow-xl">
                        <CardHeader className="space-y-1 px-6 pt-6">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={forgotStep === 1 ? closeForgotPassword : () => setForgotStep(forgotStep - 1)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <IconArrowLeft className="h-5 w-5" />
                                </button>
                                <CardTitle className="text-2xl">
                                    {forgotStep === 1 && "Reset Password"}
                                    {forgotStep === 2 && "Enter OTP"}
                                    {forgotStep === 3 && "New Password"}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {forgotStep === 1 && "Enter your email address and we'll send you a verification code"}
                                {forgotStep === 2 && `We've sent a 6-digit OTP to ${forgotEmail}`}
                                {forgotStep === 3 && "Create a new password for your account"}
                            </CardDescription>
                            {/* Step indicator */}
                            <div className="flex gap-2 pt-2">
                                {[1, 2, 3].map((step) => (
                                    <div
                                        key={step}
                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                            step <= forgotStep ? "bg-primary" : "bg-muted"
                                        }`}
                                    />
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            {/* Step 1: Email */}
                            {forgotStep === 1 && (
                                <form onSubmit={handleGenerateOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-email">Email</Label>
                                        <div className="relative">
                                            <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="forgot-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="pl-9"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? "Sending OTP..." : "Send OTP"}
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: OTP Verification */}
                            {forgotStep === 2 && (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-otp">Verification Code</Label>
                                        <Input
                                            id="forgot-otp"
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            className="text-center text-lg tracking-widest"
                                            value={forgotOtp}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                setForgotOtp(val)
                                            }}
                                            maxLength={6}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={forgotLoading || forgotOtp.length !== 6}
                                    >
                                        {forgotLoading ? "Verifying..." : "Verify OTP"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateOtp}
                                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-1 text-center"
                                        disabled={forgotLoading}
                                    >
                                        Resend OTP
                                    </button>
                                </form>
                            )}

                            {/* Step 3: New Password */}
                            {forgotStep === 3 && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-new-password">New Password</Label>
                                        <div className="relative">
                                            <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="forgot-new-password"
                                                type={showForgotNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-9 pr-9"
                                                value={forgotNewPassword}
                                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showForgotNewPassword ? (
                                                    <IconEyeOff className="h-4 w-4" />
                                                ) : (
                                                    <IconEye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-confirm-password">Confirm New Password</Label>
                                        <div className="relative">
                                            <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="forgot-confirm-password"
                                                type={showForgotConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-9 pr-9"
                                                value={forgotConfirmPassword}
                                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showForgotConfirmPassword ? (
                                                    <IconEyeOff className="h-4 w-4" />
                                                ) : (
                                                    <IconEye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? "Changing Password..." : "Change Password"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
