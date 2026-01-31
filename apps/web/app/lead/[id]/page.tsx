"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    IconArrowLeft,
    IconPhone,
    IconPhoneCheck,
    IconPhoneX,
    IconClock,
} from "@tabler/icons-react"
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { CallCard } from "@/components/call-card"
import type { LeadCall, LeadCallsResponse, CallAnalysis } from "@/types/lead-calls"

function formatTotalDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
}

export default function LeadDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const leadId = params.id as string

    const [calls, setCalls] = useState<LeadCall[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/lead/getCalls/${leadId}`
                )
                if (response.ok) {
                    const data: LeadCallsResponse = await response.json()
                    setCalls(data.callsOftheLead || [])
                } else {
                    toast.error("Failed to fetch call data")
                }
            } catch (error) {
                toast.error("Error connecting to server")
            } finally {
                setIsLoading(false)
            }
        }

        if (leadId) {
            fetchCalls()
        }
    }, [leadId])

    // Calculate statistics
    const totalCalls = calls.length
    const successfulCalls = calls.filter((call) => {
        if (typeof call.analysis === "object" && call.analysis !== null) {
            return (call.analysis as CallAnalysis).call_successful
        }
        return false
    }).length
    const failedCalls = totalCalls - successfulCalls
    const totalDuration = calls.reduce((sum, call) => sum + call.durationMs, 0)
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

    // Prepare chart data
    const statusData = calls.reduce((acc, call) => {
        const existing = acc.find((d) => d.status === call.status)
        if (existing) {
            existing.count++
        } else {
            acc.push({ status: call.status, count: 1 })
        }
        return acc
    }, [] as { status: string; count: number }[])

    const sentimentData = calls.reduce((acc, call) => {
        if (typeof call.analysis === "object" && call.analysis !== null) {
            const sentiment = (call.analysis as CallAnalysis).user_sentiment || "Unknown"
            const existing = acc.find((d) => d.sentiment === sentiment)
            if (existing) {
                existing.count++
            } else {
                acc.push({ sentiment, count: 1 })
            }
        }
        return acc
    }, [] as { sentiment: string; count: number }[])

    // Monitoring-style color palette: light blue, reddish (negative), teal, amber, soft purple
    const COLORS = ["#38bdf8", "#ef4444", "#2dd4bf", "#fbbf24", "#a78bfa"]

    const statusChartConfig: ChartConfig = {
        count: { label: "Calls" },
        ...statusData.reduce((acc, item, index) => {
            acc[item.status] = { label: item.status, color: COLORS[index % COLORS.length] }
            return acc
        }, {} as ChartConfig),
    }

    const sentimentChartConfig: ChartConfig = {
        count: { label: "Calls" },
        ...sentimentData.reduce((acc, item, index) => {
            acc[item.sentiment] = { label: item.sentiment, color: COLORS[index % COLORS.length] }
            return acc
        }, {} as ChartConfig),
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
            <SidebarInset className="bg-gradient-mesh">
                <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                    {/* Header with Go Back Button */}
                    <div className="flex items-center gap-4 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2"
                        >
                            <IconArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Lead Call Details</h1>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {/* Loading skeleton for stats */}
                            <div className="grid gap-4 md:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader className="pb-2">
                                            <Skeleton className="h-4 w-24" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-8 w-16" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Loading skeleton for calls */}
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-6 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-24 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : calls.length === 0 ? (
                        <Card className="shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <IconPhone className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">
                                    No calls found for this lead
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalCalls}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Successful</CardTitle>
                                        <IconPhoneCheck className="h-4 w-4 text-green-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{successfulCalls}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Unsuccessful</CardTitle>
                                        <IconPhoneX className="h-4 w-4 text-red-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">{failedCalls}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                                        <IconClock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatTotalDuration(totalDuration)}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Avg: {formatTotalDuration(avgDuration)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts Section */}
                            {(statusData.length > 0 || sentimentData.length > 0) && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Call Status Distribution - Bar Chart */}
                                    {statusData.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Call Status Distribution</CardTitle>
                                                <CardDescription>Breakdown of calls by status</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer config={statusChartConfig} className="h-[200px]">
                                                    <AreaChart data={statusData}>
                                                        <defs>
                                                            <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                                        <YAxis tickLine={false} axisLine={false} />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#38bdf8"
                                                            strokeWidth={2}
                                                            fill="url(#statusGradient)"
                                                        />
                                                    </AreaChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* User Sentiment Distribution - Pie Chart */}
                                    {sentimentData.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">User Sentiment</CardTitle>
                                                <CardDescription>Breakdown of calls by user sentiment</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer config={sentimentChartConfig} className="h-[200px]">
                                                    <PieChart>
                                                        <Pie
                                                            data={sentimentData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={80}
                                                            paddingAngle={2}
                                                            dataKey="count"
                                                            nameKey="sentiment"
                                                            label={({ sentiment, count }) => `${sentiment}: ${count}`}
                                                            labelLine={false}
                                                        >
                                                            {sentimentData.map((entry, index) => {
                                                                // Semantic colors for sentiments
                                                                const getSentimentColor = (sentiment: string) => {
                                                                    switch (sentiment.toLowerCase()) {
                                                                        case "positive": return "#43eb81ff" // green
                                                                        case "negative": return "#f54747ff" // red
                                                                        case "unknown": return "#58abf8ff" // dark/black
                                                                        case "neutral": return "#6b7280" // gray
                                                                        default: return COLORS[index % COLORS.length]
                                                                    }
                                                                }
                                                                return <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />
                                                            })}
                                                        </Pie>
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                    </PieChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* All Calls */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">All Calls ({calls.length})</h2>
                                <div className="grid gap-4">
                                    {calls.map((call) => (
                                        <CallCard key={call.callDBId} call={call} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
