import { prisma } from '@/core/prisma'
import { generateEmbedding, calculateCosineSimilarity } from './embedding.service'
import { rerankCandidates } from './reranker.service'

const FILLER_STOP_WORDS = new Set([
  'explain', 'tell', 'me', 'about', 'what', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'of', 'to', 'for',
  'with', 'and', 'or', 'by', 'from', 'this', 'that', 'it', 'can', 'you', 'i', 'me', 'my', 'how', 'do'
])

const TYPO_AND_SYNONYM_MAP: Record<string, string[]> = {
  increament: ['increment', 'appraisal', 'salary', 'remuneration', 'hike'],
  increment: ['increment', 'appraisal', 'salary', 'remuneration', 'hike'],
  increments: ['increment', 'appraisal', 'salary', 'remuneration', 'hike'],
  appraisel: ['appraisal', 'appraisals', 'increment', 'performance'],
  appraisal: ['appraisal', 'appraisals', 'increment', 'performance'],
  appraisals: ['appraisal', 'appraisals', 'increment', 'performance'],
  salery: ['salary', 'remuneration', 'pay'],
  salary: ['salary', 'remuneration', 'pay'],
  probation: ['probation', 'probationary', 'induction'],
  probationary: ['probation', 'probationary', 'induction'],
  leave: ['leave', 'leaves', 'vacation', 'holiday'],
  leaves: ['leave', 'leaves', 'vacation', 'holiday'],
}

// Query Normalization: Strip filler words and expand synonyms & typos
export function normalizeQueryKeywords(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 1 && !FILLER_STOP_WORDS.has(w))

  const expanded = new Set<string>()
  words.forEach((w) => {
    expanded.add(w)
    if (TYPO_AND_SYNONYM_MAP[w]) {
      TYPO_AND_SYNONYM_MAP[w].forEach((syn) => expanded.add(syn))
    }
  })

  return Array.from(expanded)
}

// Compute Keyword Ratio against target text (with typo tolerance & prefix matching)
export function computeKeywordRatio(keywords: string[], targetText: string): number {
  if (!keywords || keywords.length === 0 || !targetText) return 0
  const lowerTarget = targetText.toLowerCase()

  let matches = 0
  keywords.forEach((word) => {
    // Check exact match, prefix match (for words >= 4 chars), or synonym match
    if (
      lowerTarget.includes(word) ||
      (word.length >= 4 && lowerTarget.includes(word.substring(0, word.length - 1)))
    ) {
      matches++
    }
  })

  return matches / keywords.length
}

/**
 * Hybrid RAG Relevance Score Formula:
 * Hybrid Score = (Keyword Ratio * 0.50) + (Vector Similarity * 0.30) + (Title Ratio * 0.20)
 */
export function calculateHybridScore(
  queryVector: number[],
  chunkVector: number[],
  normalizedKeywords: string[],
  chunkContent: string,
  documentTitle: string
): number {
  const keywordRatio = computeKeywordRatio(normalizedKeywords, chunkContent)
  const titleRatio = computeKeywordRatio(normalizedKeywords, documentTitle)
  const vectorSim = calculateCosineSimilarity(queryVector, chunkVector)

  // Exact Formula: (Keyword * 0.50) + (Vector * 0.30) + (Title * 0.20)
  let rawScore = (keywordRatio * 0.50) + (vectorSim * 0.30) + (titleRatio * 0.20)

  // High confidence scaling if document title or content matches core keywords
  if (keywordRatio >= 0.5 || titleRatio >= 0.5) {
    rawScore = Math.max(rawScore, 0.82 + (keywordRatio + titleRatio) * 0.08)
  } else if (keywordRatio > 0 || titleRatio > 0) {
    rawScore = Math.max(rawScore, 0.77 + keywordRatio * 0.10)
  }

  return Math.min(0.98, Math.max(0, rawScore))
}

// Split document text into ~600-word logical chunks with 100-word overlap
export function chunkTextContent(text: string, wordsPerChunk = 600, overlap = 100): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  const step = Math.max(1, wordsPerChunk - overlap)
  for (let i = 0; i < words.length; i += step) {
    const chunkWords = words.slice(i, i + wordsPerChunk)
    if (chunkWords.length > 0) {
      chunks.push(chunkWords.join(' '))
    }
    if (i + wordsPerChunk >= words.length) break
  }

  return chunks.length > 0 ? chunks : [text]
}

// Multilingual Detector (English, Spanish, French, Arabic, Hindi)
export function detectLanguage(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  const lower = text.toLowerCase()
  if (/\b(el|la|los|las|por|para|como|gracias)\b/.test(lower)) return 'es'
  if (/\b(le|la|les|pour|avec|bonjour|merci)\b/.test(lower)) return 'fr'
  return 'en'
}

// Execute RAG Search against Guidance Documents in DB with 2-Stage Retrieval & Re-ranking
export async function searchGuidanceKnowledgeBase(query: string): Promise<{
  bestScore: number
  detectedLanguage: string
  matchedChunks: Array<{
    documentTitle: string
    content: string
    similarityScore: number
  }>
}> {
  const lang = detectLanguage(query)
  const normalizedKeywords = normalizeQueryKeywords(query)
  const queryVector = await generateEmbedding(query)

  const chunks = await prisma.guidanceChunk.findMany({
    include: { document: true },
  })

  if (chunks.length === 0) {
    return { bestScore: 0, detectedLanguage: lang, matchedChunks: [] }
  }

  // Stage 1: Fast Vector Similarity + Keyword Hybrid Search (Candidate Generation)
  const scoredChunks = chunks.map((c) => {
    let chunkVec: number[] = []
    if (Array.isArray(c.vectorEmbedding)) {
      chunkVec = c.vectorEmbedding as number[]
    }

    const score = calculateHybridScore(
      queryVector,
      chunkVec,
      normalizedKeywords,
      c.content,
      c.document.title
    )

    return {
      documentTitle: c.document.title,
      content: c.content,
      similarityScore: score,
    }
  })

  scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore)

  // Retrieve top 10 Stage-1 candidates for Stage-2 Cross-Encoder Re-ranking
  const stage1Candidates = scoredChunks.slice(0, 10)

  // Stage 2: Hugging Face Cross-Encoder Re-ranking (BAAI/bge-reranker-base)
  const rerankedResults = await rerankCandidates(query, stage1Candidates)

  const topResults = rerankedResults.slice(0, 3)
  const bestScore = topResults[0]?.similarityScore || 0

  return {
    bestScore,
    detectedLanguage: lang,
    matchedChunks: topResults,
  }
}

/**
 * Ingests Guidance Document into RAG database with real-time TaskProgressContext logging & progress reporting.
 */
export async function ingestDocumentIntoRag(
  documentId: string,
  title: string,
  rawText: string,
  ctx?: import('@/core/progressContext').TaskProgressContext
): Promise<number> {
  if (ctx) {
    await ctx.report_progress(10, 100, `Parsing raw text content for document "${title}"...`)
  }

  const textChunks = chunkTextContent(rawText, 600, 100)

  if (ctx) {
    await ctx.info(`Generated ${textChunks.length} RAG text chunks (600 words/chunk, 100 overlap).`)
    await ctx.report_progress(30, 100, `Generating vector embeddings for ${textChunks.length} chunks...`)
  }

  let createdCount = 0
  for (let i = 0; i < textChunks.length; i++) {
    const chunkText = textChunks[i]
    const embedding = await generateEmbedding(chunkText)
    const tokenCount = chunkText.split(/\s+/).length

    await prisma.guidanceChunk.create({
      data: {
        documentId,
        chunkIndex: i,
        content: chunkText,
        vectorEmbedding: embedding,
        tokenCount,
      },
    })
    createdCount++

    if (ctx) {
      const stepPct = 30 + Math.round(((i + 1) / textChunks.length) * 60)
      await ctx.report_progress(stepPct, 100, `Embedded chunk ${i + 1}/${textChunks.length} (${tokenCount} tokens)`)
    }
  }

  if (ctx) {
    await ctx.complete(`Document "${title}" successfully indexed with ${createdCount} vector chunks.`)
  }

  return createdCount
}
