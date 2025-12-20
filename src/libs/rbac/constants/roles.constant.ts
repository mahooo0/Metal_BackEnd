import { Permission } from './permissions.constant'

export const SystemRole = {
  DIRECTOR: 'Director',
  ADMIN: 'Admin',
  TECHNICAL: 'Technical Specialist',
  MANAGER: 'Sales Manager',
  STOREKEEPER: 'Storekeeper',
  ACCOUNTANT: 'Accountant'
} as const

export type SystemRoleName = (typeof SystemRole)[keyof typeof SystemRole]

export const ROLE_PERMISSIONS: Record<SystemRoleName, string[]> = {
  [SystemRole.DIRECTOR]: Object.values(Permission),

  [SystemRole.ADMIN]: Object.values(Permission).filter(
    p =>
      p !== Permission.ROLES_UPDATE &&
      p !== Permission.ROLES_DELETE &&
      p !== Permission.ROLES_ASSIGN
  ),

  [SystemRole.TECHNICAL]: [
    Permission.TASKS_READ,
    Permission.TASKS_CREATE,
    Permission.TASKS_UPDATE,
    Permission.TASKS_START,
    Permission.TASKS_COMPLETE,
    Permission.TASKS_PAUSE,
    Permission.PRODUCTION_PLAN,
    Permission.PRODUCTION_START,
    Permission.PRODUCTION_UPDATE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_RESERVE,
    Permission.PRODUCTS_READ,
    Permission.ORDERS_READ,
    Permission.SHIPMENTS_READ,
    Permission.PIPELINE_MOVE,
    Permission.PIPELINE_COMMENT,
    Permission.PIPELINE_ATTACH,
    Permission.REQUESTS_READ,
    Permission.REQUESTS_CREATE,
    Permission.REQUESTS_UPDATE,
    Permission.PLANS_READ,
    Permission.PLANS_CREATE,
    Permission.PLANS_UPDATE,
    Permission.ANALYTICS_READ
  ],

  [SystemRole.MANAGER]: [
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_UPDATE,
    Permission.PRICING_READ,
    Permission.PRICING_UPDATE,
    Permission.QUOTE_CREATE,
    Permission.DISCOUNT_REQUEST,
    Permission.PIPELINE_MOVE,
    Permission.PIPELINE_COMMENT,
    Permission.PIPELINE_ATTACH,
    Permission.TASKS_READ,
    Permission.TASKS_CREATE,
    Permission.REQUESTS_READ,
    Permission.REQUESTS_CREATE,
    Permission.REQUESTS_UPDATE,
    Permission.CONTRACTORS_READ,
    Permission.CONTRACTORS_CREATE,
    Permission.CONTRACTORS_UPDATE,
    Permission.PLANS_READ,
    Permission.ANALYTICS_READ
  ],

  [SystemRole.STOREKEEPER]: [
    Permission.INVENTORY_READ,
    Permission.INVENTORY_RECEIVE,
    Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_WRITEOFF,
    Permission.INVENTORY_RESERVE,
    Permission.PRODUCTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.REQUESTS_READ,
    Permission.REQUESTS_CREATE,
    Permission.REQUESTS_UPDATE,
    Permission.SHIPMENTS_UPDATE,
    Permission.ANALYTICS_READ
  ],

  [SystemRole.ACCOUNTANT]: [
    Permission.FINANCE_READ,
    Permission.FINANCE_WRITE,
    Permission.INVOICE_CREATE,
    Permission.PAYMENT_RECORD,
    Permission.REPORTS_READ,
    Permission.QUOTE_APPROVE,
    Permission.DISCOUNT_APPROVE,
    Permission.ORDERS_READ,
    Permission.REQUESTS_READ,
    Permission.REQUESTS_APPROVE,
    Permission.CONTRACTORS_READ,
    Permission.CONTRACTORS_UPDATE,
    Permission.ANALYTICS_READ
  ]
}
