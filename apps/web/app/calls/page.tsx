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
import { toast } from "sonner"
import { IconPhone, IconCalendar, IconUser, IconMail, IconClock } from "@tabler/icons-react"

export default function CallsPage() {
    const [formData, setFormData] = useState({
        name: "",
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

    const handleCreateCall = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/createCall`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phNo: formData.phNo,
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/scheduleCall`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
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
                                <TabsList className="grid w-full grid-cols-2 mb-8">
                                    <TabsTrigger value="create" className="flex items-center gap-2">
                                        <IconPhone className="h-4 w-4" />
                                        <span>Instant Call</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="schedule" className="flex items-center gap-2">
                                        <IconCalendar className="h-4 w-4" />
                                        <span>Schedule Call</span>
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
                                                            placeholder="Pramit"
                                                            className="pl-9"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phNo">Phone Number</Label>
                                                    <div className="relative">
                                                        <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="phNo"
                                                            placeholder="+918777562720"
                                                            className="pl-9"
                                                            value={formData.phNo}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <div className="relative">
                                                        <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="abc@example.com"
                                                            className="pl-9"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            required
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
                                                            placeholder="Pramit"
                                                            className="pl-9"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phNo">Phone Number</Label>
                                                    <div className="relative">
                                                        <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="phNo"
                                                            placeholder="+918777562720"
                                                            className="pl-9"
                                                            value={formData.phNo}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <div className="relative">
                                                        <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="abc@example.com"
                                                            className="pl-9"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            required
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
                            </Tabs>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
