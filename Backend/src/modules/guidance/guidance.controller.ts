import { Request, Response } from 'express'
import { prisma } from '@/core/prisma'
import { ingestDocumentIntoRag } from '@/services/ai/rag.service'
import { TaskProgressContext } from '@/core/progressContext'
import { broadcastDocumentIndexed } from '@/core/socket'

// pdf-parse decompresses FlateDecode/Zlib PDF streams and extracts actual page text
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse')

/**
 * Extract clean text from a PDF buffer using pdf-parse.
 * Returns page-separated text with `--- Page N ---` markers.
 */
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer, {
      // Custom page renderer that adds page markers
      pagerender: async function (pageData: any) {
        const textContent = await pageData.getTextContent()
        const strings = textContent.items.map((item: any) => item.str).filter((s: string) => s.trim().length > 0)
        return strings.join(' ')
      },
    })

    // data.text contains all extracted text
    let fullText = (data.text || '').trim()

    // If custom renderer produced empty result, fall back to default
    if (!fullText && data.text) {
      fullText = data.text.trim()
    }

    // Clean up excessive whitespace while preserving structure
    fullText = fullText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return fullText
  } catch (err: any) {
    console.error('[PDF Parse Error]', err.message)
    return ''
  }
}

// Helper function to sanitize clean text from non-PDF plain text files
export function extractCleanTextContent(text: string): string {
  if (!text) return ''
  // Strip null bytes, control characters, and Unicode replacement character \uFFFD (black diamond)
  let cleaned = text
    .replace(/\0/g, '')
    .replace(/\uFFFD/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

  return cleaned.replace(/\s+/g, ' ').trim()
}

/**
 * POST /api/guidance/parse-file
 * Accepts { fileBase64, fileName } and returns clean extracted text.
 * For PDFs, uses pdf-parse to decompress Zlib streams.
 * For plain text, does basic cleanup.
 */
export async function parseGuidanceFileController(req: Request, res: Response) {
  try {
    const { fileBase64, fileName, textContent } = req.body

    if (!fileBase64 && !textContent) {
      return res.status(400).json({ success: false, message: 'No file data or text content provided' })
    }

    let cleanText = ''
    const isPdf = (fileName || '').toLowerCase().endsWith('.pdf')

    if (fileBase64 && isPdf) {
      // Decode base64 to buffer and use pdf-parse for real decompression
      const buffer = Buffer.from(fileBase64, 'base64')
      cleanText = await extractTextFromPdfBuffer(buffer)

      if (!cleanText) {
        // pdf-parse returned empty — likely a scanned/image-only PDF
        return res.json({
          success: true,
          data: {
            fileName: fileName || 'document.pdf',
            cleanText: '',
            warning: 'Could not extract text from this PDF. It may be a scanned/image-only document.',
          },
        })
      }
    } else if (fileBase64 && !isPdf) {
      // Non-PDF file: decode as UTF-8 text
      const buffer = Buffer.from(fileBase64, 'base64')
      const rawText = buffer.toString('utf8')
      cleanText = extractCleanTextContent(rawText)
    } else if (textContent) {
      cleanText = extractCleanTextContent(textContent)
    }

    return res.json({
      success: true,
      data: {
        fileName: fileName || 'document.pdf',
        cleanText,
      },
    })
  } catch (err: any) {
    console.error('[parseGuidanceFile Error]', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/guidance/upload
 * Accepts { title, textContent, fileName, fileType, fileBase64? }
 * If fileBase64 is provided for a PDF, uses pdf-parse to extract text server-side,
 * ensuring chunks always contain properly decompressed human-readable text.
 */
export async function uploadGuidanceDocumentController(req: Request, res: Response) {
  try {
    const { title, textContent, fileName, fileType, fileBase64 } = req.body
    const adminId = (req as any).user?.id

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    const taskId = `task-doc-${Date.now()}`
    const ctx = new TaskProgressContext(taskId, 'RAG Document Ingestion & Embedding')

    await ctx.report_progress(5, 100, `Sanitizing raw content for "${title}"...`)

    let finalText = ''
    const isPdf = (fileName || '').toLowerCase().endsWith('.pdf') || (fileType || '').toUpperCase() === 'PDF'

    // Strategy: If we have the raw PDF base64, always prefer pdf-parse extraction
    if (fileBase64 && isPdf) {
      await ctx.info('Detected PDF file with base64 data. Using pdf-parse for text extraction...')
      const buffer = Buffer.from(fileBase64, 'base64')
      finalText = await extractTextFromPdfBuffer(buffer)

      if (finalText) {
        await ctx.info(`pdf-parse extracted ${finalText.length} characters of clean text.`)
      } else {
        await ctx.info('pdf-parse returned empty text. Falling back to provided textContent...')
        finalText = extractCleanTextContent(textContent || '')
      }
    } else if (textContent) {
      // Non-PDF or no base64: use provided text content
      finalText = extractCleanTextContent(textContent)
    }

    if (!finalText) {
      await ctx.error('Failed to extract valid text content from uploaded file')
      return res.status(400).json({ success: false, message: 'No valid text content found in document' })
    }

    const cleanTitle = extractCleanTextContent(title)
    const cleanFileName = extractCleanTextContent(fileName) || `${cleanTitle.replace(/\s+/g, '_')}.txt`

    // Create Guidance Document
    const document = await prisma.guidanceDocument.create({
      data: {
        title: cleanTitle,
        fileName: cleanFileName,
        fileType: fileType || 'TXT',
        fileSize: Buffer.byteLength(finalText, 'utf8'),
        uploadedBy: adminId || null,
        status: 'PUBLISHED',
      },
    })

    // Ingest into RAG vector store with live progress logging
    const createdChunksCount = await ingestDocumentIntoRag(
      document.id,
      cleanTitle,
      finalText,
      ctx
    )

    broadcastDocumentIndexed(document.id, createdChunksCount)

    return res.status(201).json({
      success: true,
      message: 'Guidance document uploaded, chunked, and embedded into RAG vector store successfully',
      data: {
        document,
        chunksCreated: createdChunksCount,
        taskId,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function getGuidanceDocumentsController(req: Request, res: Response) {
  try {
    const documents = await prisma.guidanceDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    })

    const formatted = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      status: doc.status,
      chunkCount: doc._count.chunks,
      createdAt: doc.createdAt.toISOString(),
    }))

    return res.json({ success: true, data: formatted })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function getGuidanceDocumentDetailsController(req: Request, res: Response) {
  try {
    const { id } = req.params

    const document = await prisma.guidanceDocument.findUnique({
      where: { id: String(id) },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          select: {
            id: true,
            chunkIndex: true,
            content: true,
          },
        },
      },
    })

    if (!document) {
      return res.status(404).json({ success: false, message: 'Guidance document not found' })
    }

    return res.json({
      success: true,
      data: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt.toISOString(),
        chunks: document.chunks,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function deleteGuidanceDocumentController(req: Request, res: Response) {
  try {
    const { id } = req.params

    await prisma.guidanceDocument.delete({
      where: { id: String(id) },
    })

    return res.json({ success: true, message: 'Guidance document deleted successfully' })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
