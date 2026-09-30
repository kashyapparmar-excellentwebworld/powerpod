import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Translator } from '@/types/translator.types'
import { StatusCode } from '@/constants/statusCodes'

type SchemaFactory = (tr: Translator) => z.ZodTypeAny

export function validate(factory: SchemaFactory) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = factory(req.translator)
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(StatusCode.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: req.translator.t('validation.validation_failed'),
        errors: z.flattenError(result.error).fieldErrors,
      })
      return
    }
    req.body = result.data
    next()
  }
}
