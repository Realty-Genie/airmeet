"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { IconPhone, IconCalendar, IconUser, IconMail, IconClock, IconBolt } from "@tabler/icons-react"
import { CreateBatchCallModal } from "@/components/create-batch-call-modal"
import { ProtectedRoute } from "@/components/protected-route"

const COUNTRY_CODES = [
    { code: "+91", label: "IN (+91)" },
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+61", label: "AU (+61)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" },
    { code: "+81", label: "JP (+81)" },
]

export default function CallsPage() {
    const [formData, setFormData] = useState({
        name: "",
        countryCode: "+91",
        phNo: "",
        email: "",
        delay: 1,
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [id]: id === "delay" ? Number(value) : value,
        }))
    }

    const handleCountryCodeChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            countryCode: value,
        }))
    }

    const handleCreateCall = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const token = localStorage.getItem("airmeet_token")
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/createCall`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phNo: `${formData.countryCode}${formData.phNo}`,
                    email: formData.email,
                }),
            })

            if (response.ok) {
                toast.success("Call initiated successfully")
            } else {
                toast.error("Failed to initiate call")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleScheduleCall = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const token = localStorage.getItem("airmeet_token")
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/scheduleCall`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    phNo: `${formData.countryCode}${formData.phNo}`,
                }),
            })

            if (response.ok) {
                toast.success("Call scheduled successfully")
            } else {
                toast.error("Failed to schedule call")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ProtectedRoute>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {/* Mobile Header with Hamburger */}
                        <div className="flex items-center gap-3 py-4 md:hidden">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold">Calls</h1>
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[85vh] w-full">
                            <div className="w-full max-w-md">
                                <Tabs defaultValue="create" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-8">
                                        <TabsTrigger value="create" className="flex items-center gap-2">
                                            <IconPhone className="h-4 w-4" />
                                            <span className="hidden sm:inline">Instant Call</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="schedule" className="flex items-center gap-2">
                                            <IconCalendar className="h-4 w-4" />
                                            <span className="hidden sm:inline">Schedule Call</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="batch" className="flex items-center gap-2">
                                            <IconBolt className="h-4 w-4" />
                                            <span className="hidden sm:inline">Batch Call</span>
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="create">
                                        <Card className="shadow-lg border-muted/60">
                                            <CardHeader>
                                                <CardTitle className="text-2xl">Create Call</CardTitle>
                                                <CardDescription>
                                                    Initiate an instant call to the user.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <form onSubmit={handleCreateCall} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Name</Label>
                                                        <div className="relative">
                                                            <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="name"
                                                                placeholder="John Doe"
                                                                className="pl-9"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phNo">Phone Number</Label>
                                                        <div className="flex gap-2">
                                                            <Select
                                                                value={formData.countryCode}
                                                                onValueChange={handleCountryCodeChange}
                                                            >
                                                                <SelectTrigger className="w-[110px]">
                                                                    <SelectValue placeholder="Code" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COUNTRY_CODES.map((country) => (
                                                                        <SelectItem key={country.code} value={country.code}>
                                                                            {country.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <div className="relative flex-1">
                                                                <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    id="phNo"
                                                                    placeholder="1234567890"
                                                                    className="pl-9"
                                                                    value={formData.phNo}
                                                                    onChange={handleInputChange}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email (Optional)</Label>
                                                        <div className="relative">
                                                            <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                placeholder="abc@example.com"
                                                                className="pl-9"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full text-md" size="lg" disabled={isLoading}>
                                                        {isLoading ? "Initiating..." : "Start Call"}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="schedule">
                                        <Card className="shadow-lg border-muted/60">
                                            <CardHeader>
                                                <CardTitle className="text-2xl">Schedule Call</CardTitle>
                                                <CardDescription>
                                                    Schedule a call to be made after a delay.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <form onSubmit={handleScheduleCall} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Name</Label>
                                                        <div className="relative">
                                                            <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="name"
                                                                placeholder="John Doe"
                                                                className="pl-9"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phNo">Phone Number</Label>
                                                        <div className="flex gap-2">
                                                            <Select
                                                                value={formData.countryCode}
                                                                onValueChange={handleCountryCodeChange}
                                                            >
                                                                <SelectTrigger className="w-[110px]">
                                                                    <SelectValue placeholder="Code" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COUNTRY_CODES.map((country) => (
                                                                        <SelectItem key={country.code} value={country.code}>
                                                                            {country.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <div className="relative flex-1">
                                                                <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    id="phNo"
                                                                    placeholder="1234567890"
                                                                    className="pl-9"
                                                                    value={formData.phNo}
                                                                    onChange={handleInputChange}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email (Optional)</Label>
                                                        <div className="relative">
                                                            <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                placeholder="abc@example.com"
                                                                className="pl-9"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="delay">Delay (minutes)</Label>
                                                        <div className="relative">
                                                            <IconClock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="delay"
                                                                type="number"
                                                                min="1"
                                                                className="pl-9"
                                                                value={formData.delay}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full text-md" size="lg" disabled={isLoading}>
                                                        {isLoading ? "Scheduling..." : "Schedule Call"}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="batch">
                                        <Card className="shadow-lg border-muted/60">
                                            <CardHeader>
                                                <CardTitle className="text-2xl">Batch Call</CardTitle>
                                                <CardDescription>
                                                    Make multiple calls at once from a list of leads.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                        <IconBolt className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <h3 className="font-medium mb-2">Create Batch Call</h3>
                                                    <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
                                                        Add leads manually, upload CSV/Excel, or use AI to extract contacts from an image.
                                                    </p>
                                                    <CreateBatchCallModal
                                                        trigger={
                                                            <Button size="lg" className="gap-2">
                                                                <IconBolt className="h-4 w-4" />
                                                                Create Batch Call
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
