import { Queue } from 'bullmq'
import { redisConnection } from './redis'

export const queue = new Queue('call-queue', {
    connection: redisConnection
})
