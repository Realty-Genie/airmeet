import { Worker } from "bullmq";
import { RetellService } from '@airmeet/service';
import { redisConnection } from '@airmeet/queues'


const worker = new Worker("call-queue", async (job) => {
    console.log("Job processed:", job.data);
    const { metadata, from_number, agentId, dynamicVariables } = job.data;
    console.log(`AgentId: ${agentId}`);
    const to_number = dynamicVariables?.phone_number;
    dynamicVariables['followBackCall'] = "true";
    let phoneCall;
    try {
        phoneCall = await RetellService.createPhoneCall({
            from_number: from_number,
            to_number: to_number,
            override_agent_id: agentId,
            retell_llm_dynamic_variables: dynamicVariables,
            metadata,
        })
        console.log("Phone call created:", phoneCall);
    } catch (e) {
        console.error(`error Retell: ${e}`)
    }
}, {
    connection: redisConnection,
    concurrency: 5,
});
