// Types for lead call data from /lead/getCalls/:leadId API

export interface CustomAnalysisData {
    need_scheduling?: boolean
    "Lead Intent "?: string
    "Urgency / Timeline"?: string
    "Core Pain Point"?: string
    "Current Platform"?: string
    "Objections Raised"?: string
    "Objection Severity"?: string
    "CTA Outcome"?: string
    "Email Status"?: string
    "User Sentiment"?: string
    "Next Best Action"?: string
    [key: string]: unknown
}

export interface CallAnalysis {
    call_summary: string
    in_voicemail: boolean
    user_sentiment: string
    call_successful: boolean
    custom_analysis_data?: CustomAnalysisData
}

export interface LeadCall {
    callDBId: string
    callId: string
    createdAt: string
    status: string
    analysis: CallAnalysis | string
    transcript: string
    recordingUrl: string
    durationMs: number
    fromNumber: string
    toNumber: string
}

export interface LeadCallsResponse {
    message: string
    callsOftheLead: LeadCall[]
}
