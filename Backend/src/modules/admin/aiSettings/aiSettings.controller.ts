import { Request, Response } from 'express'
import { prisma } from '@/core/prisma'
import { getAiConfig, testGeminiKeyWithDetails } from '@/services/ai/gemini.service'

async function ensureHfColumnsExist() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "hf_token" TEXT;
      ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "hf_model" VARCHAR(255) DEFAULT 'BAAI/bge-base-en-v1.5';
      ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_enabled" BOOLEAN DEFAULT false;
      ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_api_key" TEXT;
      ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_project" VARCHAR(255) DEFAULT 'wasla-ai-support';
    `)
  } catch (e) {
    // ignore if already exists
  }
}

export async function getAiConfigController(req: Request, res: Response) {
  try {
    await ensureHfColumnsExist()

    const configs: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, ai_enabled, gemini_api_key, hf_token, hf_model, confidence_threshold, langsmith_enabled, langsmith_api_key, langsmith_project
      FROM ai_config
      ORDER BY created_at DESC
      LIMIT 1;
    `)

    const config = configs[0] || null

    const maskedKey = config?.gemini_api_key
      ? `${config.gemini_api_key.substring(0, 6)}••••••••${config.gemini_api_key.slice(-4)}`
      : ''

    const maskedHfToken = config?.hf_token
      ? `${config.hf_token.substring(0, 4)}••••••••${config.hf_token.slice(-4)}`
      : ''

    const maskedLsKey = config?.langsmith_api_key
      ? `${config.langsmith_api_key.substring(0, 5)}••••••••${config.langsmith_api_key.slice(-4)}`
      : ''

    // Apply LangSmith Tracing to Process Environment if enabled
    if (config?.langsmith_enabled && config?.langsmith_api_key) {
      process.env.LANGCHAIN_TRACING_V2 = 'true'
      process.env.LANGCHAIN_API_KEY = config.langsmith_api_key
      process.env.LANGCHAIN_PROJECT = config.langsmith_project || 'wasla-ai-support'
      process.env.LANGCHAIN_ENDPOINT = 'https://api.smith.langchain.com'
    } else {
      process.env.LANGCHAIN_TRACING_V2 = 'false'
    }

    return res.json({
      success: true,
      data: {
        aiEnabled: config?.ai_enabled ?? false,
        geminiApiKey: maskedKey,
        hasKeySet: Boolean(config?.gemini_api_key),
        hfToken: maskedHfToken,
        hasHfTokenSet: Boolean(config?.hf_token),
        hfModel: config?.hf_model || 'BAAI/bge-base-en-v1.5',
        confidenceThreshold: config?.confidence_threshold ?? 0.75,
        langsmithEnabled: config?.langsmith_enabled ?? false,
        langsmithApiKey: maskedLsKey,
        hasLangsmithKeySet: Boolean(config?.langsmith_api_key),
        langsmithProject: config?.langsmith_project || 'wasla-ai-support',
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function updateAiConfigController(req: Request, res: Response) {
  try {
    await ensureHfColumnsExist()

    const { aiEnabled, geminiApiKey, hfToken, hfModel, confidenceThreshold, langsmithEnabled, langsmithApiKey, langsmithProject } = req.body
    const adminId = (req as any).user?.id

    const existingConfigs: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, gemini_api_key, hf_token, hf_model, confidence_threshold, ai_enabled, langsmith_enabled, langsmith_api_key, langsmith_project
      FROM ai_config
      ORDER BY created_at DESC
      LIMIT 1;
    `)

    const existingConfig = existingConfigs[0] || null

    let finalApiKey = existingConfig?.gemini_api_key || null
    let finalHfToken = existingConfig?.hf_token || null
    let finalLsApiKey = existingConfig?.langsmith_api_key || null

    if (geminiApiKey && !geminiApiKey.includes('••••')) {
      finalApiKey = geminiApiKey
    }

    if (hfToken && !hfToken.includes('••••')) {
      finalHfToken = hfToken
    }

    if (langsmithApiKey && !langsmithApiKey.includes('••••')) {
      finalLsApiKey = langsmithApiKey
    }

    const isAiEnabled = aiEnabled !== undefined ? Boolean(aiEnabled) : (existingConfig?.ai_enabled ?? false)
    const isLangsmithEnabled = langsmithEnabled !== undefined ? Boolean(langsmithEnabled) : (existingConfig?.langsmith_enabled ?? false)
    const lsProject = langsmithProject || existingConfig?.langsmith_project || 'wasla-ai-support'
    const model = hfModel || existingConfig?.hf_model || 'BAAI/bge-base-en-v1.5'
    const threshold = confidenceThreshold !== undefined ? parseFloat(confidenceThreshold) : (existingConfig?.confidence_threshold ?? 0.75)

    if (isLangsmithEnabled && finalLsApiKey) {
      process.env.LANGCHAIN_TRACING_V2 = 'true'
      process.env.LANGCHAIN_API_KEY = finalLsApiKey
      process.env.LANGCHAIN_PROJECT = lsProject
      process.env.LANGCHAIN_ENDPOINT = 'https://api.smith.langchain.com'
    } else {
      process.env.LANGCHAIN_TRACING_V2 = 'false'
    }

    if (existingConfig) {
      await prisma.$executeRawUnsafe(`
        UPDATE ai_config
        SET 
          ai_enabled = $1,
          gemini_api_key = $2,
          hf_token = $3,
          hf_model = $4,
          confidence_threshold = $5,
          langsmith_enabled = $6,
          langsmith_api_key = $7,
          langsmith_project = $8,
          updated_by = $9,
          updated_at = NOW()
        WHERE id = $10;
      `, isAiEnabled, finalApiKey, finalHfToken, model, threshold, isLangsmithEnabled, finalLsApiKey, lsProject, adminId || null, existingConfig.id)
    } else {
      await prisma.$executeRawUnsafe(`
        INSERT INTO ai_config (ai_enabled, gemini_api_key, hf_token, hf_model, confidence_threshold, langsmith_enabled, langsmith_api_key, langsmith_project, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `, isAiEnabled, finalApiKey, finalHfToken, model, threshold, isLangsmithEnabled, finalLsApiKey, lsProject, adminId || null)
    }

    return res.json({
      success: true,
      message: 'AI Guidance, Gemini, LangSmith & Hugging Face settings updated successfully',
      data: {
        aiEnabled: isAiEnabled,
        hasKeySet: Boolean(finalApiKey),
        hasHfTokenSet: Boolean(finalHfToken),
        hfModel: model,
        confidenceThreshold: threshold,
        langsmithEnabled: isLangsmithEnabled,
        hasLangsmithKeySet: Boolean(finalLsApiKey),
        langsmithProject: lsProject,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function testGeminiApiKeyController(req: Request, res: Response) {
  try {
    const { geminiApiKey } = req.body
    const keyToTest = geminiApiKey || (await getAiConfig()).geminiApiKey

    if (!keyToTest) {
      return res.status(400).json({ success: false, message: 'No Gemini API Key provided for testing' })
    }

    const testResult = await testGeminiKeyWithDetails(keyToTest)

    if (testResult.success) {
      return res.json({ success: true, message: `Google Gemini API connected successfully!` })
    } else {
      return res.status(400).json({
        success: false,
        message: testResult.error || 'Failed to authenticate Gemini API Key across model endpoints.',
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Connection test failed: ' + err.message })
  }
}
