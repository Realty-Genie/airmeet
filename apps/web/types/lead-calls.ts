// Types for lead call data from /lead/getCalls/:leadId API

export interface CallAnalysis {
    call_summary: string
    in_voicemail: boolean
    user_sentiment: string
    call_successful: boolean
    custom_analysis_data?: {
        need_scheduling?: boolean
        [key: string]: unknown
    }
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
