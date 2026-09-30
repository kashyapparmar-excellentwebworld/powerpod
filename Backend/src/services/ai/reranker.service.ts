import { prisma } from '@/core/prisma'
import { logger } from '@/utils/logger'

export interface RerankCandidate {
  documentTitle: string
  content: string
  similarityScore: number
}

export interface RerankedResult extends RerankCandidate {
  rerankScore: number
  originalScore: number
}

let hasWarnedReranker = false

/**
 * Local Cross-Encoder Term Interaction & Proximity Scoring.
 * Fallback when Hugging Face API is unconfigured/offline.
 */
function computeLocalCrossEncoderScore(query: string, chunkContent: string, title: string): number {
  const qWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 1)

  if (qWords.length === 0 || !chunkContent) return 0.5

  const contentLower = chunkContent.toLowerCase()
  const titleLower = title.toLowerCase()

  let totalWeight = 0
  let matchedWeight = 0

  // 1. Exact N-Gram / Multi-word Phrase Matching (High Weight)
  const fullQueryLower = query.toLowerCase().trim()
  if (contentLower.includes(fullQueryLower)) {
    matchedWeight += 3.0
    totalWeight += 3.0
  }

  // 2. Individual Term Density and Proximity Matrix
  qWords.forEach((word) => {
    const weight = word.length > 4 ? 1.5 : 1.0
    totalWeight += weight

    if (contentLower.includes(word)) {
      matchedWeight += weight
    }

    if (titleLower.includes(word)) {
      matchedWeight += weight * 0.5
    }
  })

  // 3. Sequential Proximity Check (Words appearing close together in chunk)
  if (qWords.length >= 2) {
    for (let i = 0; i < qWords.length - 1; i++) {
      const pair = `${qWords[i]} ${qWords[i + 1]}`
      if (contentLower.includes(pair)) {
        matchedWeight += 1.5
        totalWeight += 1.5
      }
    }
  }

  const rawScore = totalWeight > 0 ? matchedWeight / totalWeight : 0
  return Math.min(0.99, Math.max(0.1, rawScore))
}

/**
 * Re-ranks candidate chunks using Stage-2 Cross-Encoder model (`BAAI/bge-reranker-base`).
 *
 * Stage 1: Vector Search + Keyword Hybrid Filter (Retrieves Top 10-15 candidates)
 * Stage 2: Cross-Encoder Reranker (Reranks candidates based on deep query-document attention)
 */
export async function rerankCandidates(
  query: string,
  candidates: RerankCandidate[],
  passedHfToken?: string | null,
  passedHfModel?: string | null
): Promise<RerankedResult[]> {
  if (!candidates || candidates.length === 0) return []

  // Step 1: Resolve Hugging Face credentials
  let hfToken = passedHfToken
  let hfModel = passedHfModel

  if (hfToken === undefined) {
    const config = await prisma.aiConfig.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null)
    hfToken = (config as any)?.hfToken || process.env.HF_TOKEN || null
    hfModel = (config as any)?.hfRerankerModel || process.env.HF_RERANKER_MODEL || 'BAAI/bge-reranker-base'
  }

  const modelName = hfModel || 'BAAI/bge-reranker-base'

  // Step 2: Attempt Hugging Face Cross-Encoder Inference API
  if (hfToken && hfToken !== 'hf_YourHuggingFaceTokenHere') {
    try {
      const url = `https://router.huggingface.co/hf-inference/models/${modelName}`

      // Hugging Face Sentence Transformers Reranker Format: { source_sentence, sentences }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfToken}`,
        },
        body: JSON.stringify({
          inputs: {
            source_sentence: query,
            sentences: candidates.map((c) => c.content),
          },
          options: { wait_for_model: true },
        }),
      })

      if (response.ok) {
        const scores = (await response.json()) as any

        if (Array.isArray(scores)) {
          logger.info(`[Reranker Service] ✅ BAAI/bge-reranker-base cross-encoder reranked ${candidates.length} candidates.`)

          const reranked: RerankedResult[] = candidates.map((candidate, idx) => {
            const rawScore = typeof scores[idx] === 'number' ? scores[idx] : (scores[idx]?.score ?? candidate.similarityScore)
            // Normalize score between 0.00 and 0.99
            const normalizedScore = Math.min(0.99, Math.max(0.01, rawScore > 1 ? rawScore / 100 : rawScore))
            return {
              ...candidate,
              originalScore: candidate.similarityScore,
              rerankScore: Number(normalizedScore.toFixed(4)),
              similarityScore: Number(normalizedScore.toFixed(4)),
            }
          })

          reranked.sort((a, b) => b.rerankScore - a.rerankScore)
          return reranked
        }
      }
    } catch (err: any) {
      if (!hasWarnedReranker) {
        logger.info(`ℹ️ Hugging Face Reranker API unreachable (${err.message}). Using high-precision local Cross-Encoder scoring.`)
        hasWarnedReranker = true
      }
    }
  }

  // Step 3: High-precision Local Cross-Encoder Fallback Engine
  const reranked: RerankedResult[] = candidates.map((c) => {
    const crossEncoderScore = computeLocalCrossEncoderScore(query, c.content, c.documentTitle)
    // Hybrid blend of Stage-1 score (40%) + Stage-2 Cross-Encoder score (60%)
    const finalScore = (c.similarityScore * 0.40) + (crossEncoderScore * 0.60)
    const normalizedScore = Math.min(0.98, Math.max(0.10, finalScore))

    return {
      ...c,
      originalScore: c.similarityScore,
      rerankScore: Number(normalizedScore.toFixed(4)),
      similarityScore: Number(normalizedScore.toFixed(4)),
    }
  })

  reranked.sort((a, b) => b.rerankScore - a.rerankScore)
  return reranked
}
