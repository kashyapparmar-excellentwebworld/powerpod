import { Request, Response, NextFunction } from 'express'

const SUPPORTED_LANGUAGES = ['en', 'ar']

export function languageMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = (req.headers['accept-language'] as string) || 'en'
  const base = header.split(',')[0].trim().split('-')[0].toLowerCase()
  req.language = SUPPORTED_LANGUAGES.includes(base) ? base : 'en'
  next()
}
