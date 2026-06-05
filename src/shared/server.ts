export type AuthType = 'password' | 'private_key'

export interface ServerRecord {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: AuthType
  isFavorite: boolean
  createdAt: string
}

export interface ServerFormInput {
  name: string
  host: string
  port: number
  username: string
  authType: AuthType
  password?: string
  privateKey?: string
}
