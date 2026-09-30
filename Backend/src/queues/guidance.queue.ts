import { Queue, Worker } from 'bullmq'
import { prisma } from '@/core/prisma'
import { chunkTextContent } from '@/services/ai/rag.service'
import { generateTextEmbedding } from '@/services/ai/gemini.service'
import { broadcastDocumentIndexed } from '@/core/socket'

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}

export const guidanceQueue = new Queue('guidance-processing', { connection })

// BullMQ Worker to process 100MB+ document chunking & vectorization in background
export const guidanceWorker = new Worker(
  'guidance-processing',
  async (job) => {
    const { documentId, textContent } = job.data

    console.log(`[BullMQ Worker] Processing document ${documentId}...`)

    // Split into ~600-word chunks
    const textChunks = chunkTextContent(textContent, 600)

    // Generate vector embeddings for each chunk
    for (let index = 0; index < textChunks.length; index++) {
      const content = textChunks[index]
      const vectorEmbedding = await generateTextEmbedding(content)

      await prisma.guidanceChunk.create({
        data: {
          documentId,
          chunkIndex: index,
          content,
          vectorEmbedding: vectorEmbedding as any,
          tokenCount: content.split(/\s+/).length,
        },
      })
    }

    // Update Document Status to PUBLISHED
    await prisma.guidanceDocument.update({
      where: { id: documentId },
      data: { status: 'PUBLISHED' },
    })

    // Broadcast Real-time WebSocket event when finished
    broadcastDocumentIndexed(documentId, textChunks.length)

    console.log(`[BullMQ Worker] Document ${documentId} indexed successfully (${textChunks.length} chunks).`)
  },
  { connection, concurrency: 2 }
)
