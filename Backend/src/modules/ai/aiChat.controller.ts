import { Request, Response } from 'express'
import { getAiConfig, generateGroundedAiResponse } from '@/services/ai/gemini.service'
import { searchGuidanceKnowledgeBase } from '@/services/ai/rag.service'
import { TaskProgressContext } from '@/core/progressContext'

/**
 * AI Support Chat Controller with real-time TaskProgressContext logging & WebSocket progress streaming.
 */
export async function aiSupportChatController(req: Request, res: Response) {
  try {
    const { query, history } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query string is required' })
    }

    const taskId = `task-chat-${Date.now()}`
    const ctx = new TaskProgressContext(taskId, 'AI Multilingual RAG Support Query')

    await ctx.report_progress(15, 100, `Analyzing query: "${query.substring(0, 40)}..."`)

    // Check if AI flow is enabled by client
    const config = await getAiConfig()

    if (!config.aiEnabled || !config.geminiApiKey) {
      await ctx.warn('AI Guidance is currently disabled by administrator or API key is missing.')
      await ctx.complete('Switched to Manual Support Ticket mode.')
      return res.json({
        success: true,
        aiEnabled: false,
        taskId,
        message: 'AI Guidance is currently disabled by administrator or API key is missing.',
        data: {
          confidenceScore: 0,
          requiresTicketCreation: true,
          answer: 'AI Guidance Support is currently in Manual Mode. Please click below to create a support ticket directly.',
        },
      })
    }

    // Search knowledge base for hybrid similarity matches
    await ctx.report_progress(40, 100, 'Searching RAG Guidance Knowledgebase (Cosine + Hybrid formula)...')
    const searchResult = await searchGuidanceKnowledgeBase(query)
    const threshold = config.confidenceThreshold || 0.75
    const displayScore = parseFloat((searchResult.bestScore * 100).toFixed(1))

    await ctx.info(`RAG Search Completed: Language='${searchResult.detectedLanguage}', Best Hybrid Match Score=${displayScore}%`)

    // If similarity >= threshold (e.g. 75%)
    if (searchResult.matchedChunks.length > 0 && searchResult.bestScore >= (threshold * 0.95)) {
      await ctx.report_progress(75, 100, 'Invoking Gemini LLM with grounded RAG context & LangChain memory...')

      const contextChunks = searchResult.matchedChunks.map((c) => ({
        title: c.documentTitle,
        content: c.content,
      }))

      const grounded = await generateGroundedAiResponse(query, contextChunks, config.geminiApiKey, history)

      await ctx.complete(`AI Answer generated successfully with ${displayScore}% confidence!`)

      return res.json({
        success: true,
        aiEnabled: true,
        taskId,
        confidenceScore: displayScore,
        data: {
          answer: grounded.answer,
          sources: searchResult.matchedChunks.map((c) => c.documentTitle),
          canAutoAssignTicket: false,
        },
      })
    } else {
      await ctx.warn(`Confidence score ${displayScore}% below threshold (${Math.round(threshold * 100)}%). Recommending Ticket Escalation.`)
      await ctx.complete('Recommended Specialist Ticket Escalation.')

      return res.json({
        success: true,
        aiEnabled: true,
        taskId,
        confidenceScore: displayScore,
        data: {
          answer:
            'I could not find a high-confidence answer in our official guidance documentation. Would you like to automatically create and assign a support ticket to a specialist?',
          canAutoAssignTicket: true,
          suggestedQuery: query,
        },
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
