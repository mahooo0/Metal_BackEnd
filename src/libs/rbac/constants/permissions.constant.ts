export const Permission = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_FORCE_PASSWORD_RESET: 'users:force-password-reset',

  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',

  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',

  PRICING_READ: 'pricing:read',
  PRICING_UPDATE: 'pricing:update',
  QUOTE_CREATE: 'quote:create',
  QUOTE_APPROVE: 'quote:approve',
  DISCOUNT_REQUEST: 'discount:request',
  DISCOUNT_APPROVE: 'discount:approve',

  TASKS_READ: 'tasks:read',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_START: 'tasks:start',
  TASKS_COMPLETE: 'tasks:complete',
  TASKS_PAUSE: 'tasks:pause',

  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_RECEIVE: 'inventory:receive',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_WRITEOFF: 'inventory:writeoff',
  INVENTORY_RESERVE: 'inventory:reserve',

  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',

  PRODUCTION_PLAN: 'production:plan',
  PRODUCTION_START: 'production:start',
  PRODUCTION_UPDATE: 'production:update',
  PRODUCTION_SHIP: 'production:ship',

  SHIPMENTS_READ: 'shipments:read',
  SHIPMENTS_UPDATE: 'shipments:update',

  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  INVOICE_CREATE: 'invoice:create',
  PAYMENT_RECORD: 'payment:record',
  REPORTS_READ: 'reports:read',

  ANALYTICS_READ: 'analytics:read',

  CHAT_READ: 'chat:read',
  CHAT_WRITE: 'chat:write',

  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  AUDIT_READ: 'audit:read',

  REQUESTS_READ: 'requests:read',
  REQUESTS_CREATE: 'requests:create',
  REQUESTS_UPDATE: 'requests:update',
  REQUESTS_APPROVE: 'requests:approve',
  REQUESTS_DELETE: 'requests:delete',

  CONTRACTORS_READ: 'contractors:read',
  CONTRACTORS_CREATE: 'contractors:create',
  CONTRACTORS_UPDATE: 'contractors:update',
  CONTRACTORS_DELETE: 'contractors:delete',

  COUNTERPARTIES_READ: 'counterparties:read',
  COUNTERPARTIES_CREATE: 'counterparties:create',
  COUNTERPARTIES_UPDATE: 'counterparties:update',
  COUNTERPARTIES_DELETE: 'counterparties:delete',

  PLANS_READ: 'plans:read',
  PLANS_CREATE: 'plans:create',
  PLANS_UPDATE: 'plans:update',
  PLANS_DELETE: 'plans:delete',

  ORDER_TYPES_READ: 'order-types:read',
  ORDER_TYPES_CREATE: 'order-types:create',
  ORDER_TYPES_UPDATE: 'order-types:update',
  ORDER_TYPES_DELETE: 'order-types:delete',

  ORDER_REQUESTS_READ: 'order-requests:read',
  ORDER_REQUESTS_CREATE: 'order-requests:create',
  ORDER_REQUESTS_UPDATE: 'order-requests:update',
  ORDER_REQUESTS_DELETE: 'order-requests:delete',
  ORDER_REQUESTS_UPDATE_STATUS: 'order-requests:update-status',
  ORDER_REQUESTS_ADD_COMMENT: 'order-requests:add-comment',
  ORDER_REQUESTS_UPLOAD_FILE: 'order-requests:upload-file',

  METAL_BRANDS_READ: 'metal-brands:read',
  METAL_BRANDS_CREATE: 'metal-brands:create',
  METAL_BRANDS_UPDATE: 'metal-brands:update',
  METAL_BRANDS_DELETE: 'metal-brands:delete',

  // Categories
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  TASK_TYPES_READ: 'task-types:read',
  TASK_TYPES_CREATE: 'task-types:create',
  TASK_TYPES_UPDATE: 'task-types:update',
  TASK_TYPES_DELETE: 'task-types:delete',

  PIPELINE_MOVE: 'pipeline:move',
  PIPELINE_COMMENT: 'pipeline:comment',
  PIPELINE_ATTACH: 'pipeline:attach',

  // Material Items
  MATERIAL_ITEMS_READ: 'material-items:read',
  MATERIAL_ITEMS_CREATE: 'material-items:create',
  MATERIAL_ITEMS_UPDATE: 'material-items:update',
  MATERIAL_ITEMS_DELETE: 'material-items:delete',

  // Materials
  MATERIALS_READ: 'materials:read',
  MATERIALS_CREATE: 'materials:create',
  MATERIALS_UPDATE: 'materials:update',
  MATERIALS_DELETE: 'materials:delete',
  MATERIALS_UPDATE_STATUS: 'materials:update-status',

  // Suppliers
  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_UPDATE: 'suppliers:update',
  SUPPLIERS_DELETE: 'suppliers:delete',

  // Purchases
  PURCHASES_READ: 'purchases:read',
  PURCHASES_CREATE: 'purchases:create',
  PURCHASES_UPDATE: 'purchases:update',
  PURCHASES_DELETE: 'purchases:delete',
  PURCHASES_UPDATE_STATUS: 'purchases:update-status',
  PURCHASES_SUBMIT: 'purchases:submit',

  // Purchase Items
  PURCHASE_ITEMS_READ: 'purchase-items:read',
  PURCHASE_ITEMS_CREATE: 'purchase-items:create',
  PURCHASE_ITEMS_UPDATE: 'purchase-items:update',
  PURCHASE_ITEMS_DELETE: 'purchase-items:delete',
  PURCHASE_ITEMS_RECEIVE: 'purchase-items:receive',
  PURCHASE_ITEMS_UPDATE_STATUS: 'purchase-items:update-status',

  // Inventories (Inventory Checks)
  INVENTORIES_READ: 'inventories:read',
  INVENTORIES_CREATE: 'inventories:create',
  INVENTORIES_UPDATE: 'inventories:update',
  INVENTORIES_DELETE: 'inventories:delete',
  INVENTORIES_APPROVE: 'inventories:approve',

  // Write-offs
  WRITE_OFFS_READ: 'write-offs:read',
  WRITE_OFFS_CREATE: 'write-offs:create',
  WRITE_OFFS_UPDATE: 'write-offs:update',
  WRITE_OFFS_DELETE: 'write-offs:delete',
  WRITE_OFFS_APPROVE: 'write-offs:approve',

  // Price Lists
  PRICE_LISTS_READ: 'price-lists:read',
  PRICE_LISTS_CREATE: 'price-lists:create',
  PRICE_LISTS_UPDATE: 'price-lists:update',
  PRICE_LISTS_DELETE: 'price-lists:delete'
} as const

export type PermissionValue = (typeof Permission)[keyof typeof Permission]

export const ALL_PERMISSIONS = Object.values(Permission)
