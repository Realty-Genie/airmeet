"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    IconArrowLeft,
    IconPhone,
    IconPhoneCheck,
    IconPhoneX,
    IconClock,
    IconTarget,
    IconAlertCircle,
    IconTool,
    IconActivity,
    IconTrendingUp,
    IconSend,
    IconCalendarEvent,
    IconMoodSmile,
    IconMoodSad,
    IconDeviceDesktop,
} from "@tabler/icons-react"
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { CallCard } from "@/components/call-card"
import type { LeadCall, LeadCallsResponse, CallAnalysis } from "@/types/lead-calls"
import { ProtectedRoute } from "@/components/protected-route"

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
            const token = localStorage.getItem("airmeet_token")
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/lead/getCalls/${leadId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                if (response.ok) {
                    const data: LeadCallsResponse = await response.json()
                    console.log('Fetched calls data:', data)
                    if (data.callsOftheLead && data.callsOftheLead.length > 0) {
                        const firstCall = data.callsOftheLead[0]
                        console.log('First call analysis:', firstCall.analysis)
                        if (typeof firstCall.analysis === 'object') {
                            console.log('Custom Analysis Keys:', Object.keys((firstCall.analysis as any).custom_analysis_data || {}))
                        }
                    }
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

    // Custom Analysis Data Aggregation
    const getCustomAnalysisData = (fieldName: string) => {
        return calls.reduce((acc, call) => {
            if (typeof call.analysis === "object" && call.analysis !== null) {
                const analysis = call.analysis as CallAnalysis
                const value = analysis.custom_analysis_data?.[fieldName] as string || "Unknown"
                const existing = acc.find((d) => d.name === value)
                if (existing) {
                    existing.count++
                } else {
                    acc.push({ name: value, count: 1 })
                }
            }
            return acc
        }, [] as { name: string; count: number }[])
    }

    const leadIntentData = getCustomAnalysisData("Lead Intent ")
    const ctaOutcomeData = getCustomAnalysisData("CTA Outcome")
    const urgencyData = getCustomAnalysisData("Urgency / Timeline")
    const painPointData = getCustomAnalysisData("Core Pain Point")
    const platformData = getCustomAnalysisData("Current Platform")
    const nextActionData = getCustomAnalysisData("Next Best Action")

    // Brand color palette
    const COLORS = ["#6A4CFF", "#4CC4FF", "#8B5CF6", "#06B6D4", "#A855F7", "#22D3EE"]

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

    const createChartConfig = (data: { name: string; count: number }[]): ChartConfig => ({
        count: { label: "Calls" },
        ...data.reduce((acc, item, index) => {
            acc[item.name] = { label: item.name, color: COLORS[index % COLORS.length] }
            return acc
        }, {} as ChartConfig),
    })

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
                <SidebarInset className="bg-gradient-mesh">
                    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                        {/* Header with Go Back Button */}
                        <div className="flex items-center gap-4 py-4">
                            <SidebarTrigger className="md:hidden" />
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

                        <h2 className="text-xl font-semibold mt-4">Call Analysis Insights</h2>
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
                                        {/* Call Status Distribution - Area Chart */}
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
                                                                    <stop offset="5%" stopColor="#6A4CFF" stopOpacity={0.8} />
                                                                    <stop offset="95%" stopColor="#6A4CFF" stopOpacity={0.1} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                                            <YAxis tickLine={false} axisLine={false} />
                                                            <ChartTooltip content={<ChartTooltipContent />} />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="count"
                                                                stroke="#6A4CFF"
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
                                                                    const getSentimentColor = (sentiment: string) => {
                                                                        switch (sentiment.toLowerCase()) {
                                                                            case "positive": return "#22C55E"
                                                                            case "negative": return "#EF4444"
                                                                            case "neutral": return "#6B7280"
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

                                {/* Custom Analysis Charts - Merged Cards */}
                                {(leadIntentData.length > 0 || ctaOutcomeData.length > 0 || urgencyData.length > 0 || painPointData.length > 0) && (
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {/* Card 1: Lead Analysis - Intent, Urgency, Pain Points */}
                                        {(leadIntentData.length > 0 || urgencyData.length > 0 || painPointData.length > 0) && (() => {
                                            const urgencyScores: Record<string, number> = {
                                                'urgent': 100, 'immediate': 100, 'asap': 90,
                                                'soon': 70, 'active': 60,
                                                'exploratory': 30, 'research': 20, 'none': 10
                                            }
                                            const getUrgencyScore = (name: string) => {
                                                const lower = name.toLowerCase()
                                                for (const [key, score] of Object.entries(urgencyScores)) {
                                                    if (lower.includes(key)) return score
                                                }
                                                return 50
                                            }
                                            const urgencyRadialData = urgencyData.map((item) => ({
                                                name: item.name,
                                                count: item.count,
                                                fill: getUrgencyScore(item.name) >= 80 ? '#EF4444' :
                                                    getUrgencyScore(item.name) >= 50 ? '#F59E0B' : '#22C55E'
                                            }))
                                            const avgUrgency = urgencyData.length > 0
                                                ? Math.round(urgencyRadialData.reduce((sum, d) => sum + getUrgencyScore(d.name) * d.count, 0) / totalCalls)
                                                : 0

                                            return (
                                                <Card className="col-span-1 lg:col-span-2">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <IconTarget className="h-4 w-4 text-[#6A4CFF]" />
                                                            Lead Analysis
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-3">
                                                            {/* Lead Intent */}
                                                            {leadIntentData.length > 0 && (
                                                                <div className="flex items-start justify-between">
                                                                    <span className="text-sm text-muted-foreground">Intent:</span>
                                                                    <span className="text-sm font-medium text-right">
                                                                        {leadIntentData.slice(0, 2).map(d => d.name).join(', ')}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Urgency */}
                                                            {urgencyData.length > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-muted-foreground">Urgency:</span>
                                                                    <span className="text-sm font-medium" style={{ color: avgUrgency >= 80 ? '#EF4444' : avgUrgency >= 50 ? '#F59E0B' : '#22C55E' }}>
                                                                        {urgencyData[0]?.name || 'Unknown'} ({avgUrgency}%)
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Pain Points */}
                                                            {painPointData.length > 0 && (
                                                                <div className="flex items-start justify-between">
                                                                    <span className="text-sm text-muted-foreground">Pain Points:</span>
                                                                    <span className="text-sm font-medium text-right">
                                                                        {painPointData.slice(0, 2).map(d => d.name).join(', ')}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Current Platform */}
                                                            {platformData.length > 0 && (
                                                                <div className="flex items-start justify-between">
                                                                    <span className="text-sm text-muted-foreground">Current Platform:</span>
                                                                    <span className="text-sm font-medium text-right">
                                                                        {platformData.slice(0, 2).map(d => d.name).join(', ')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })()}

                                        {/* Card 2: Conversion & Actions - CTA + Next Actions */}
                                        {(ctaOutcomeData.length > 0 || nextActionData.length > 0) && (
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <IconSend className="h-4 w-4 text-[#22C55E]" />
                                                        Conversion & Actions
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="space-y-3">
                                                        {/* CTA Outcomes */}
                                                        {ctaOutcomeData.length > 0 && (
                                                            <div>
                                                                <div className="text-xs text-muted-foreground mb-1 font-medium">CTA Outcomes</div>
                                                                <div className="space-y-1">
                                                                    {ctaOutcomeData.slice(0, 3).map((item, i) => {
                                                                        const percentage = Math.round((item.count / totalCalls) * 100)
                                                                        const isPositive = item.name.toLowerCase().includes('sent') ||
                                                                            item.name.toLowerCase().includes('booked') ||
                                                                            item.name.toLowerCase().includes('confirmed')
                                                                        return (
                                                                            <div key={i} className="flex items-center justify-between text-xs">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-[#22C55E]' : 'bg-[#6A4CFF]'}`} />
                                                                                    <span className="truncate max-w-[100px]">{item.name}</span>
                                                                                </div>
                                                                                <span className="font-medium">{percentage}%</span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Divider */}
                                                        {ctaOutcomeData.length > 0 && nextActionData.length > 0 && (
                                                            <div className="border-t" />
                                                        )}

                                                        {/* Next Actions */}
                                                        {nextActionData.length > 0 && (
                                                            <div>
                                                                <div className="text-xs text-muted-foreground mb-1 font-medium flex items-center gap-1">
                                                                    <IconTrendingUp className="h-3 w-3 text-[#8B5CF6]" />
                                                                    Next Actions
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {nextActionData.sort((a, b) => b.count - a.count).slice(0, 2).map((item, i) => {
                                                                        const percentage = Math.round((item.count / totalCalls) * 100)
                                                                        return (
                                                                            <div key={i} className={`p-1.5 rounded text-xs ${i === 0 ? 'bg-[#8B5CF6]/10' : 'bg-muted/50'}`}>
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-[#8B5CF6] text-white' : 'bg-muted-foreground/20'}`}>
                                                                                            {i + 1}
                                                                                        </span>
                                                                                        <span className="truncate max-w-[90px]">{item.name}</span>
                                                                                    </div>
                                                                                    <span className="font-semibold">{percentage}%</span>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
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
        </ProtectedRoute>
    )
}

