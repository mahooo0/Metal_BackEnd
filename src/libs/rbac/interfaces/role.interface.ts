export interface IRole {
  id: string
  name: string
  system: boolean
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ICreateRoleDto {
  name: string
  permissions: string[]
}

export interface IUpdateRoleDto {
  name?: string
  permissions?: string[]
}
