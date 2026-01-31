"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    IconPhone,
    IconPhoneIncoming,
    IconPhoneOutgoing,
    IconClock,
    IconCalendar,
    IconMoodSmile,
    IconMoodSad,
    IconMoodNeutral,
    IconCheck,
    IconX,
} from "@tabler/icons-react"
import type { LeadCall, CallAnalysis } from "@/types/lead-calls"

interface CallCardProps {
    call: LeadCall
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes === 0) {
        return `${remainingSeconds}s`
    }
    return `${minutes}m ${remainingSeconds}s`
}

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status.toLowerCase()) {
        case "ended":
            return "default"
        case "registered":
            return "secondary"
        case "failed":
            return "destructive"
        default:
            return "outline"
    }
}

function getSentimentIcon(sentiment: string) {
    switch (sentiment.toLowerCase()) {
        case "positive":
            return <IconMoodSmile className="h-4 w-4 text-green-500" />
        case "negative":
            return <IconMoodSad className="h-4 w-4 text-red-500" />
        default:
            return <IconMoodNeutral className="h-4 w-4 text-yellow-500" />
    }
}

export function CallCard({ call }: CallCardProps) {
    const hasAnalysis = typeof call.analysis === "object" && call.analysis !== null
    const analysis = hasAnalysis ? (call.analysis as CallAnalysis) : null
    const hasRecording = call.recordingUrl && call.recordingUrl !== "recording not available"
    const hasTranscript = call.transcript && call.transcript !== "transcript not available"

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconPhone className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                            Call #{call.callId.slice(-8)}
                        </CardTitle>
                    </div>
                    <Badge variant={getStatusColor(call.status)}>
                        {call.status}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                        <IconCalendar className="h-4 w-4" />
                        {format(new Date(call.createdAt), "PPP p")}
                    </span>
                    <span className="flex items-center gap-1">
                        <IconClock className="h-4 w-4" />
                        {formatDuration(call.durationMs)}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Phone Numbers */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <IconPhoneOutgoing className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">{call.fromNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <IconPhoneIncoming className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{call.toNumber}</span>
                    </div>
                </div>

                {/* Analysis Section */}
                {analysis && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Analysis</h4>

                            {/* Metrics Row */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                                    {getSentimentIcon(analysis.user_sentiment)}
                                    <span>{analysis.user_sentiment}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                                    {analysis.call_successful ? (
                                        <IconCheck className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <IconX className="h-4 w-4 text-red-500" />
                                    )}
                                    <span>{analysis.call_successful ? "Successful" : "Unsuccessful"}</span>
                                </div>
                                {analysis.in_voicemail && (
                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                                        <span>📫 Voicemail</span>
                                    </div>
                                )}
                            </div>

                            {/* Call Summary */}
                            {analysis.call_summary && (
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {analysis.call_summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Transcript */}
                {hasTranscript && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Transcript</h4>
                            <div className="bg-muted/30 p-3 rounded-lg max-h-48 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                    {call.transcript}
                                </pre>
                            </div>
                        </div>
                    </>
                )}

                {/* Recording */}
                {hasRecording && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Recording</h4>
                            <audio
                                controls
                                className="w-full h-10"
                                preload="metadata"
                            >
                                <source src={call.recordingUrl} type="audio/wav" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
