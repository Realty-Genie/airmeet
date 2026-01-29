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
        "agent_id": "agent_a858e4ad7d62bcc74758c9946c",
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
        "from_number": "+17787190711",
        "to_number": "+918777562720",
        "direction": "outbound"
    }
}
```


This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
