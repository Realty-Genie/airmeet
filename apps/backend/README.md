# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Endpoints

### POST /call/createCall

**Example Request:**

```json
{
    "name": "Pramit",
    "phNo": "+918777562720",
    "email": "abc@example.com"
}
```
*(email is optional)*

**Example Success Response:**

```json
{
    "message": "Call created successfully callId : 697b3f346064cf1a9ff517a0",
    "phoneCall": {
        "call_id": "call_0e85ada273c4fefd7d3d661d5d6",
        "call_type": "phone_call",
        "agent_id": "agent_a858e2dggdw4562764a46c",
        "agent_version": 1,
        "agent_name": "AirMeet Agent",
        "retell_llm_dynamic_variables": {
            "name": "Pramit",
            "email": "abc@example.com",
            "phone_number": "+918777562720"
        },
        "custom_sip_headers": {},
        "call_status": "registered",
        "latency": {},
        "metadata": {
            "leadId": "697b3ceca2040a7583b784e2"
        },
        "call_cost": {
            "product_costs": [],
            "total_duration_seconds": 0,
            "total_duration_unit_price": 0,
            "combined_cost": 0
        },
        "data_storage_setting": "everything",
        "opt_in_signed_url": false,
        "from_number": "+16390711999",
        "to_number": "+9182662720",
        "direction": "outbound"
    }
}
```

### POST /call/scheduleCall

**Example Request:**

```json
{
    "name": "Pramit",
    "phNo": "+918777562720",
    "email": "abc@example.com",
    "delay": 1
}
```
*(email is optional)*
*(delay is in minutes)*

**Example Success Response:**

```json
{
    "message": "Call scheduled successfully for +918777562720 and job created job: {\"name\":\"scheduled-call\",\"data\":{\"metadata\":{\"leadId\":\"697b04wewqswewa7583b784e2\"},\"from_number\":\"+16390711\",\"agentId\":\"agent_a8gjc9946c\",\"dynamicVariables\":{\"name\":\"Pramit\",\"email\":\"abc@example.com\",\"phone_number\":\"+918226564720\"}},\"opts\":{\"attempts\":0,\"delay\":60000,\"removeOnComplete\":true},\"id\":\"5\",\"progress\":0,\"returnvalue\":null,\"stacktrace\":null,\"delay\":60000,\"priority\":0,\"attemptsStarted\":0,\"attemptsMade\":0,\"stalledCounter\":0,\"timestamp\":1769688610710,\"queueQualifiedName\":\"bull:call-queue\"}",
    "jobId": "5",
    "delay_in_Ms": 60000
}
```

### Post /lead/getCalls/:leadId

**Example Request:**

```json
{
    "leadId": "697b3ceca2040a7583b784e2"
}
```

**Example Success Response:**

```json
{
    "message": "Calls found",
    "callsOftheLead": [
        {
            "callDBId": "697b832a0d56db8449cc86ac",
            "callId": "call_a8fd40c5cee544739569507524a",
            "createdAt": "2026-01-29T15:56:26.907Z",
            "status": "registered",
            "analysis": "",
            "transcript": "transcript not available",
            "recordingUrl": "recording not available",
            "durationMs": 200,
            "fromNumber": "+17787190711",
            "toNumber": "+918777562720"
        },
        {
            "callDBId": "697b84343eee14a6369005fb",
            "callId": "call_36252feba26b24e9bc8a41af169",
            "createdAt": "2026-01-29T16:00:52.610Z",
            "status": "ended",
            "analysis": {
                "call_summary": "The agent made an outbound call to the user Pramit but the call lasted only 3 seconds with minimal interaction before the agent ended the call.",
                "in_voicemail": false,
                "user_sentiment": "Neutral",
                "call_successful": false,
                "custom_analysis_data": {
                    "need_scheduling": false
                }
            },
            "transcript": "User: Hello?\nAgent: Hello Pramit!\n",
            "recordingUrl": "https://dxc03zgurdly9.cloudfront.net/6ca6ede19d1b781e7fd87bd708524120f6947a8107dccf33e6a70671c642632e/recording.wav",
            "durationMs": 3791,
            "fromNumber": "+17787190711",
            "toNumber": "+918777562720"
        }
    ]
}
```

### GET /lead/allLeads


**Example Success Response:**

```json
{
    "message": "All Leads",
    "leads": [
        {
            "_id": "697b3ceca2040a7583b784e2",
            "name": "Pramit",
            "phNo": "+918124562626",
            "createdAt": "2026-01-29T10:56:44.848Z",
            "__v": 0
        }
    ]
}
```



This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
