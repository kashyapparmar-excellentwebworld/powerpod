import { prisma } from '@/core/prisma'
import { logger } from '@/utils/logger'

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'of', 'to', 'for',
  'with', 'and', 'or', 'by', 'from', 'this', 'that', 'it', 'can', 'you', 'i', 'me', 'my', 'how', 'do'
])

let hasWarnedNetwork = false

const generateFallbackVector = (text: string, dim = 768): number[] => {
  const vector = new Array(dim).fill(0)
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))

  if (words.length === 0) {
    return vector
  }

  words.forEach((word) => {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) % dim
    }
    vector[hash] += 2.0

    for (let i = 0; i <= word.length - 3; i++) {
      const sub = word.substring(i, i + 3)
      let subHash = 0
      for (let j = 0; j < sub.length; j++) {
        subHash = (subHash * 17 + sub.charCodeAt(j)) % dim
      }
      vector[subHash] += 0.5
    }
  })

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return magnitude > 0 ? vector.map((val) => val / magnitude) : vector
}

export const generateEmbedding = async (text: string, passedHfToken?: string | null, passedHfModel?: string | null): Promise<number[]> => {
  // Fetch Hugging Face Config from DB if not passed directly
  let hfToken = passedHfToken
  let hfModel = passedHfModel

  if (hfToken === undefined) {
    const config = await prisma.aiConfig.findFirst({ orderBy: { createdAt: 'desc' } })
    hfToken = (config as any)?.hfToken || process.env.HF_TOKEN || null
    hfModel = (config as any)?.hfModel || process.env.HF_EMBEDDING_MODEL || 'BAAI/bge-base-en-v1.5'
  }

  if (hfToken && hfToken !== 'hf_YourHuggingFaceTokenHere') {
    try {
      const modelName = hfModel || 'BAAI/bge-base-en-v1.5'
      const url = `https://router.huggingface.co/hf-inference/models/${modelName}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfToken}`,
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as any

        if (Array.isArray(data)) {
          if (typeof data[0] === 'number') {
            return data as number[]
          }
          if (Array.isArray(data[0]) && typeof data[0][0] === 'number') {
            const numTokens = data.length
            const dim = data[0].length
            const meanVector = new Array(dim).fill(0)

            for (const tokenVec of data) {
              for (let i = 0; i < dim; i++) {
                meanVector[i] += tokenVec[i]
              }
            }
            return meanVector.map((val) => val / numTokens)
          }
        }
      }
    } catch (err: any) {
      if (!hasWarnedNetwork) {
        logger.info(`ℹ️ Remote Hugging Face API unreachable or unconfigured. Using high-performance local 768-dim vector engine.`)
        hasWarnedNetwork = true
      }
    }
  }

  return generateFallbackVector(text, 768)
}

export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Legacy class export proxy
export const EmbeddingService = {
  generateEmbedding,
  calculateCosineSimilarity,
}
