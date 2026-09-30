import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

export function randomToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex')
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
