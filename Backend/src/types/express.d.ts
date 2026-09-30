import { Translator } from './translator.types'

declare global {
  namespace Express {
    interface User {
      id: string
      roleId: string
      roleName: string
      isSuperAdmin: boolean
      platform: 'admin' | 'supplier' | 'buyer'
    }

    interface Request {
      user?: User
      language: string
      translator: Translator
    }
  }
}
