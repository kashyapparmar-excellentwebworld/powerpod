import { Request, Response, NextFunction } from 'express'
import i18next from 'i18next'

export function translatorMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.translator = {
    t: (key: string, options?: object) => i18next.t(key, { lng: req.language, ...options }),
  }
  next()
}
