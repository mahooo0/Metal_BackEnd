import { AuthMethod, PrismaClient, TokenType, UserStatus } from '@prisma/client'
import * as argon2 from 'argon2'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// ==================== Constants ====================

const SystemRole = {
  DIRECTOR: 'Director',
  ADMIN: 'Admin',
  TECHNICAL: 'Technical Specialist',
  MANAGER: 'Sales Manager',
  STOREKEEPER: 'Storekeeper',
  ACCOUNTANT: 'Accountant'
}

const Permission = {
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
  PIPELINE_MOVE: 'pipeline:move',
  PIPELINE_COMMENT: 'pipeline:comment',
  PIPELINE_ATTACH: 'pipeline:attach',
  // Order Types
  ORDER_TYPES_READ: 'order-types:read',
  ORDER_TYPES_CREATE: 'order-types:create',
  ORDER_TYPES_UPDATE: 'order-types:update',
  ORDER_TYPES_DELETE: 'order-types:delete',
  // Order Requests
  ORDER_REQUESTS_READ: 'order-requests:read',
  ORDER_REQUESTS_CREATE: 'order-requests:create',
  ORDER_REQUESTS_UPDATE: 'order-requests:update',
  ORDER_REQUESTS_DELETE: 'order-requests:delete',
  ORDER_REQUESTS_UPDATE_STATUS: 'order-requests:update-status',
  ORDER_REQUESTS_ADD_COMMENT: 'order-requests:add-comment',
  ORDER_REQUESTS_UPLOAD_FILE: 'order-requests:upload-file',
  // Metal Brands
  METAL_BRANDS_READ: 'metal-brands:read',
  METAL_BRANDS_CREATE: 'metal-brands:create',
  METAL_BRANDS_UPDATE: 'metal-brands:update',
  METAL_BRANDS_DELETE: 'metal-brands:delete',
  // Task Types
  TASK_TYPES_READ: 'task-types:read',
  TASK_TYPES_CREATE: 'task-types:create',
  TASK_TYPES_UPDATE: 'task-types:update',
  TASK_TYPES_DELETE: 'task-types:delete',
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
  PURCHASE_ITEMS_UPDATE_STATUS: 'purchase-items:update-status'
}

const ALL_PERMISSIONS = Object.values(Permission)

const ROLE_PERMISSIONS: Record<string, string[]> = {
  [SystemRole.DIRECTOR]: ALL_PERMISSIONS,

  [SystemRole.ADMIN]: ALL_PERMISSIONS.filter(
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
    Permission.ANALYTICS_READ,
    Permission.COUNTERPARTIES_READ
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
    Permission.COUNTERPARTIES_READ,
    Permission.COUNTERPARTIES_CREATE,
    Permission.COUNTERPARTIES_UPDATE,
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
    Permission.ANALYTICS_READ,
    Permission.COUNTERPARTIES_READ
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
    Permission.COUNTERPARTIES_READ,
    Permission.COUNTERPARTIES_UPDATE,
    Permission.ANALYTICS_READ
  ]
}

// ==================== Helper Functions ====================

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date
}

function futureDate(daysAhead: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  return date
}

function generateToken(): string {
  return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')
}

// ==================== Seed Data ====================

const USERS_DATA = [
  // ACTIVE users with different roles
  {
    email: 'director@metalcompany.ua',
    password: 'Director123!',
    firstName: 'Олександр',
    lastName: 'Петренко',
    phone: '+380501234567',
    position: 'Генеральний директор',
    role: SystemRole.DIRECTOR,
    status: UserStatus.ACTIVE,
    isVerified: true,
    isTwoFactorEnabled: true,
    picture: 'https://i.pravatar.cc/150?u=director',
    extraPhones: ['+380671234567', '+380631234567'],
    lastLoginAt: randomDate(1),
    lastIp: '192.168.1.100',
    lastUa: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0'
  },
  {
    email: 'admin@metalcompany.ua',
    password: 'Admin123!',
    firstName: 'Марія',
    lastName: 'Коваленко',
    phone: '+380502345678',
    position: 'Системний адміністратор',
    role: SystemRole.ADMIN,
    status: UserStatus.ACTIVE,
    isVerified: true,
    isTwoFactorEnabled: true,
    picture: 'https://i.pravatar.cc/150?u=admin',
    lastLoginAt: randomDate(0),
    lastIp: '192.168.1.101',
    lastUa: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0'
  },
  {
    email: 'tech@metalcompany.ua',
    password: 'Tech123!',
    firstName: 'Андрій',
    lastName: 'Шевченко',
    phone: '+380503456789',
    position: 'Технічний спеціаліст',
    role: SystemRole.TECHNICAL,
    status: UserStatus.ACTIVE,
    isVerified: true,
    picture: 'https://i.pravatar.cc/150?u=tech',
    lastLoginAt: randomDate(2),
    lastIp: '192.168.1.102'
  },
  {
    email: 'tech2@metalcompany.ua',
    password: 'Tech123!',
    firstName: 'Дмитро',
    lastName: 'Козак',
    phone: '+380509876543',
    position: 'Інженер-технолог',
    role: SystemRole.TECHNICAL,
    status: UserStatus.ACTIVE,
    isVerified: true,
    lastLoginAt: randomDate(5)
  },
  {
    email: 'manager1@metalcompany.ua',
    password: 'Manager123!',
    firstName: 'Ірина',
    lastName: 'Бондаренко',
    phone: '+380504567890',
    position: 'Менеджер з продажу',
    role: SystemRole.MANAGER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    picture: 'https://i.pravatar.cc/150?u=manager1',
    extraPhones: ['+380674567890'],
    lastLoginAt: randomDate(0),
    lastIp: '192.168.1.103'
  },
  {
    email: 'manager2@metalcompany.ua',
    password: 'Manager123!',
    firstName: 'Віктор',
    lastName: 'Мельник',
    phone: '+380505678901',
    position: 'Старший менеджер',
    role: SystemRole.MANAGER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    isTwoFactorEnabled: true,
    picture: 'https://i.pravatar.cc/150?u=manager2',
    permissionsOverride: [Permission.COUNTERPARTIES_DELETE], // Extra permission
    lastLoginAt: randomDate(1)
  },
  {
    email: 'manager3@metalcompany.ua',
    password: 'Manager123!',
    firstName: 'Олена',
    lastName: 'Савченко',
    phone: '+380506789012',
    position: 'Менеджер по роботі з клієнтами',
    role: SystemRole.MANAGER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    lastLoginAt: randomDate(3)
  },
  {
    email: 'store@metalcompany.ua',
    password: 'Store123!',
    firstName: 'Сергій',
    lastName: 'Ткаченко',
    phone: '+380507890123',
    position: 'Завідувач складу',
    role: SystemRole.STOREKEEPER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    picture: 'https://i.pravatar.cc/150?u=store',
    lastLoginAt: randomDate(0),
    lastIp: '192.168.1.150'
  },
  {
    email: 'store2@metalcompany.ua',
    password: 'Store123!',
    firstName: 'Павло',
    lastName: 'Гончар',
    phone: '+380508901234',
    position: 'Комірник',
    role: SystemRole.STOREKEEPER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    lastLoginAt: randomDate(1)
  },
  {
    email: 'accountant@metalcompany.ua',
    password: 'Account123!',
    firstName: 'Наталія',
    lastName: 'Кравченко',
    phone: '+380509012345',
    position: 'Головний бухгалтер',
    role: SystemRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    isVerified: true,
    isTwoFactorEnabled: true,
    picture: 'https://i.pravatar.cc/150?u=accountant',
    lastLoginAt: randomDate(0),
    lastIp: '192.168.1.200'
  },
  {
    email: 'accountant2@metalcompany.ua',
    password: 'Account123!',
    firstName: 'Тетяна',
    lastName: 'Литвин',
    phone: '+380500123456',
    position: 'Бухгалтер',
    role: SystemRole.ACCOUNTANT,
    status: UserStatus.ACTIVE,
    isVerified: true,
    lastLoginAt: randomDate(2)
  },

  // INVITED user (waiting for email confirmation)
  {
    email: 'invited@metalcompany.ua',
    password: 'Invited123!',
    firstName: 'Петро',
    lastName: 'Новак',
    phone: '+380501112233',
    position: 'Новий співробітник',
    role: SystemRole.MANAGER,
    status: UserStatus.INVITED,
    isVerified: false
  },
  {
    email: 'invited2@metalcompany.ua',
    password: 'Invited123!',
    firstName: 'Анна',
    lastName: 'Сорока',
    phone: '+380502223344',
    position: 'Стажер',
    role: SystemRole.TECHNICAL,
    status: UserStatus.INVITED,
    isVerified: false
  },

  // BLOCKED user
  {
    email: 'blocked@metalcompany.ua',
    password: 'Blocked123!',
    firstName: 'Микола',
    lastName: 'Заблокований',
    phone: '+380503334455',
    position: 'Колишній менеджер',
    role: SystemRole.MANAGER,
    status: UserStatus.BLOCKED,
    isVerified: true,
    lastLoginAt: randomDate(30)
  },

  // DELETED user (soft deleted)
  {
    email: 'deleted@metalcompany.ua',
    password: 'Deleted123!',
    firstName: 'Василь',
    lastName: 'Видалений',
    phone: '+380504445566',
    position: 'Звільнений співробітник',
    role: SystemRole.STOREKEEPER,
    status: UserStatus.DELETED,
    isVerified: true,
    lastLoginAt: randomDate(60)
  },

  // Google OAuth user
  {
    email: 'google.user@gmail.com',
    password: 'GoogleUser123!', // Not used for OAuth
    firstName: 'Іван',
    lastName: 'Гуглович',
    phone: '+380505556677',
    position: 'Зовнішній консультант',
    role: SystemRole.MANAGER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    method: AuthMethod.GOOGLE,
    picture: 'https://lh3.googleusercontent.com/a/default-user',
    lastLoginAt: randomDate(7)
  },

  // User requiring password change
  {
    email: 'newpassword@metalcompany.ua',
    password: 'TempPass123!',
    firstName: 'Оксана',
    lastName: 'Паролева',
    phone: '+380506667788',
    position: 'Новий менеджер',
    role: SystemRole.MANAGER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    requirePasswordChange: true,
    lastLoginAt: randomDate(0)
  }
]

const COUNTERPARTIES_DATA = [
  {
    name: 'ТОВ "Металпром"',
    comment:
      'Основний постачальник металопрокату. Працюємо з 2018 року. Надійний партнер.',
    legalAddress: 'м. Київ, вул. Промислова, 15',
    actualAddress: 'м. Київ, вул. Промислова, 15, офіс 301',
    bankDetails:
      'IBAN UA213223130000026007233566001, АТ КБ "ПриватБанк", МФО 305299',
    edrpou: '12345678',
    ipn: '123456789012',
    vatCertificate: '200012345678',
    contacts: [
      { phone: '+380441234567', email: 'office@metalprom.ua' },
      { phone: '+380501112233', email: 'sales@metalprom.ua' },
      { phone: '+380672223344', email: 'logistics@metalprom.ua' }
    ],
    documents: [
      {
        name: 'Договір поставки 2024',
        type: 'pdf',
        path: '/docs/metalprom/contract_2024.pdf'
      },
      {
        name: 'Прайс-лист Q1 2024',
        type: 'xlsx',
        path: '/docs/metalprom/pricelist_q1.xlsx'
      },
      {
        name: 'Прайс-лист Q2 2024',
        type: 'xlsx',
        path: '/docs/metalprom/pricelist_q2.xlsx'
      },
      {
        name: 'Сертифікат якості ISO 9001',
        type: 'pdf',
        path: '/docs/metalprom/iso_certificate.pdf'
      },
      {
        name: 'Виписка з реєстру',
        type: 'pdf',
        path: '/docs/metalprom/registry_extract.pdf'
      }
    ]
  },
  {
    name: 'ПП "Будівельні матеріали Київ"',
    comment:
      'Постачальник будматеріалів. Швидка доставка по Києву та області. Знижки від 5%.',
    legalAddress: 'м. Київ, вул. Будівельників, 42',
    actualAddress: 'м. Київ, вул. Будівельників, 42',
    bankDetails:
      'IBAN UA713052990000026001234567890, АТ "Ощадбанк", МФО 300465',
    edrpou: '23456789',
    ipn: '234567890123',
    vatCertificate: '200023456789',
    contacts: [
      { phone: '+380442345678', email: 'info@budmat.ua' },
      { phone: '+380939998877', email: 'manager@budmat.ua' }
    ],
    documents: [
      {
        name: 'Рамковий договір 2024',
        type: 'pdf',
        path: '/docs/budmat/framework_2024.pdf'
      },
      {
        name: 'Специфікація товарів',
        type: 'docx',
        path: '/docs/budmat/specification.docx'
      },
      {
        name: 'Акт звірки 01.2024',
        type: 'pdf',
        path: '/docs/budmat/reconciliation_01_2024.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "АвтоЛогістик Україна"',
    comment:
      'Транспортна компанія. Доставка по всій Україні. Власний автопарк 50+ машин.',
    legalAddress: 'м. Дніпро, пр. Слобожанський, 100',
    actualAddress: 'м. Дніпро, пр. Слобожанський, 100, склад 5',
    bankDetails:
      'IBAN UA513052990000026009876543210, АТ "Укрсиббанк", МФО 351005',
    edrpou: '34567890',
    ipn: '345678901234',
    vatCertificate: '200034567890',
    contacts: [
      { phone: '+380563456789', email: 'dispatch@autolog.ua' },
      { phone: '+380677776655', email: 'cargo@autolog.ua' },
      { phone: '+380997775544', email: 'vip@autolog.ua' },
      { phone: '+380800500100', email: 'hotline@autolog.ua' }
    ],
    documents: [
      {
        name: 'Договір перевезення',
        type: 'pdf',
        path: '/docs/autolog/transport_contract.pdf'
      },
      {
        name: 'Тарифи 2024',
        type: 'pdf',
        path: '/docs/autolog/tariffs_2024.pdf'
      },
      {
        name: 'Страховий поліс',
        type: 'pdf',
        path: '/docs/autolog/insurance.pdf'
      },
      {
        name: 'Ліцензія перевізника',
        type: 'pdf',
        path: '/docs/autolog/license.pdf'
      },
      {
        name: 'Сертифікат ISO 14001',
        type: 'pdf',
        path: '/docs/autolog/iso_14001.pdf'
      }
    ]
  },
  {
    name: 'ФОП Іваненко Василь Михайлович',
    comment:
      'Субпідрядник по зварювальним роботам. Якісна робота, досвід 15+ років.',
    legalAddress: 'м. Харків, вул. Сумська, 77, кв. 12',
    actualAddress: 'м. Харків, вул. Сумська, 77, кв. 12',
    bankDetails: 'IBAN UA913052990000026005544332211, АТ "Монобанк"',
    edrpou: '1234567890',
    ipn: '1234567890',
    contacts: [{ phone: '+380577654321', email: 'ivanenko.vm@gmail.com' }],
    documents: [
      {
        name: 'Договір підряду 2024',
        type: 'pdf',
        path: '/docs/ivanenko/subcontract_2024.pdf'
      },
      {
        name: 'Сертифікат зварника',
        type: 'pdf',
        path: '/docs/ivanenko/welder_cert.pdf'
      },
      {
        name: 'Посвідчення з ОП',
        type: 'pdf',
        path: '/docs/ivanenko/safety_cert.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "СтальКонструкція"',
    comment:
      'Великий замовник. Виробництво металоконструкцій. Обсяг замовлень 500K+ грн/міс.',
    legalAddress: 'м. Одеса, вул. Портова, 33',
    actualAddress: 'м. Одеса, вул. Портова, 33, корпус А',
    bankDetails: 'IBAN UA113052990000026001122334455, АТ "ПУМБ", МФО 334851',
    edrpou: '45678901',
    ipn: '456789012345',
    vatCertificate: '200045678901',
    contacts: [
      { phone: '+380484567890', email: 'office@steelcon.ua' },
      { phone: '+380935554433', email: 'procurement@steelcon.ua' },
      { phone: '+380505554433', email: 'ceo@steelcon.ua' },
      { phone: '+380675554433', email: 'quality@steelcon.ua' },
      { phone: '+380955554433', email: 'logistics@steelcon.ua' }
    ],
    documents: [
      {
        name: 'Генеральний договір',
        type: 'pdf',
        path: '/docs/steelcon/general_agreement.pdf'
      },
      {
        name: 'Технічне завдання проект А',
        type: 'docx',
        path: '/docs/steelcon/tech_spec_a.docx'
      },
      {
        name: 'Технічне завдання проект Б',
        type: 'docx',
        path: '/docs/steelcon/tech_spec_b.docx'
      },
      {
        name: 'Акт звірки Q1 2024',
        type: 'pdf',
        path: '/docs/steelcon/reconciliation_q1.pdf'
      },
      {
        name: 'Акт звірки Q2 2024',
        type: 'pdf',
        path: '/docs/steelcon/reconciliation_q2.pdf'
      },
      {
        name: 'Гарантійний лист',
        type: 'pdf',
        path: '/docs/steelcon/warranty_letter.pdf'
      }
    ]
  },
  {
    name: 'ПАТ "Енергопостач"',
    comment:
      'Постачальник електроенергії. Договір до 31.12.2026. Тариф: 4.20 грн/кВт.',
    legalAddress: 'м. Київ, бул. Лесі Українки, 26',
    actualAddress: 'м. Київ, бул. Лесі Українки, 26',
    bankDetails:
      'IBAN UA813052990000026006677889900, АТ "Укргазбанк", МФО 320478',
    edrpou: '56789012',
    ipn: '567890123456',
    vatCertificate: '200056789012',
    contacts: [
      { phone: '+380445678901', email: 'clients@energo.ua' },
      { phone: '+380800500123', email: 'support@energo.ua' }
    ],
    documents: [
      {
        name: 'Договір енергопостачання',
        type: 'pdf',
        path: '/docs/energo/supply_contract.pdf'
      },
      {
        name: 'Тарифи 2024',
        type: 'pdf',
        path: '/docs/energo/tariffs_2024.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "ПромТехСервіс"',
    comment: 'Обслуговування промислового обладнання. Графік ТО: щоквартально.',
    legalAddress: 'м. Запоріжжя, пр. Соборний, 150',
    actualAddress: 'м. Запоріжжя, пр. Соборний, 150',
    bankDetails:
      'IBAN UA613052990000026003344556677, АТ "Райффайзен Банк", МФО 300335',
    edrpou: '67890123',
    ipn: '678901234567',
    vatCertificate: '200067890123',
    contacts: [
      { phone: '+380616789012', email: 'service@promtech.ua' },
      { phone: '+380939887766', email: 'emergency@promtech.ua' }
    ],
    documents: [
      {
        name: 'Сервісний договір 2024',
        type: 'pdf',
        path: '/docs/promtech/service_2024.pdf'
      },
      {
        name: 'Графік ТО 2024',
        type: 'xlsx',
        path: '/docs/promtech/maintenance_schedule.xlsx'
      },
      {
        name: 'Прайс на запчастини',
        type: 'xlsx',
        path: '/docs/promtech/parts_pricelist.xlsx'
      }
    ]
  },
  {
    name: 'ФОП Сидоренко Катерина Андріївна',
    comment: 'Консультант з охорони праці. Проводить навчання та атестацію.',
    legalAddress: 'м. Львів, вул. Шевченка, 15, кв. 8',
    actualAddress: 'м. Львів, вул. Шевченка, 15, кв. 8',
    edrpou: '2345678901',
    ipn: '2345678901',
    contacts: [
      { phone: '+380677890123', email: 'sidorenko.ka@ukr.net' },
      { phone: '+380937890123', email: 'safety.consult@gmail.com' }
    ],
    documents: [
      {
        name: 'Договір консультацій',
        type: 'pdf',
        path: '/docs/sidorenko/consulting.pdf'
      },
      {
        name: 'Сертифікат спеціаліста ОП',
        type: 'pdf',
        path: '/docs/sidorenko/safety_specialist.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "КомпʼютерСервіс Плюс"',
    comment:
      'IT підтримка та обслуговування техніки. SLA: відповідь до 2 годин.',
    legalAddress: 'м. Київ, вул. Хрещатик, 22',
    actualAddress: 'м. Київ, вул. Хрещатик, 22, офіс 505',
    bankDetails: 'IBAN UA413052990000026007788990011, АТ "А-Банк", МФО 307770',
    edrpou: '78901234',
    ipn: '789012345678',
    contacts: [
      { phone: '+380447890123', email: 'help@compservice.ua' },
      { phone: '+380501234567', email: 'admin@compservice.ua' },
      { phone: '+380800123321', email: 'support@compservice.ua' }
    ],
    documents: [
      {
        name: 'Договір IT підтримки',
        type: 'pdf',
        path: '/docs/compservice/it_support.pdf'
      },
      { name: 'SLA', type: 'pdf', path: '/docs/compservice/sla.pdf' },
      {
        name: 'Інвентаризація обладнання',
        type: 'xlsx',
        path: '/docs/compservice/inventory.xlsx'
      }
    ]
  },
  {
    name: 'ТОВ "Чисте Місто Еко"',
    comment: 'Вивіз та утилізація відходів. Має всі необхідні ліцензії.',
    legalAddress: 'м. Київ, вул. Екологічна, 5',
    actualAddress: 'м. Київ, вул. Екологічна, 5',
    bankDetails: 'IBAN UA213052990000026004455667788, АТ "Креді Агріколь Банк"',
    edrpou: '89012345',
    ipn: '890123456789',
    vatCertificate: '200089012345',
    contacts: [{ phone: '+380448901234', email: 'orders@cleantown.ua' }],
    documents: [
      {
        name: 'Договір на вивіз',
        type: 'pdf',
        path: '/docs/cleantown/waste_contract.pdf'
      },
      {
        name: 'Ліцензія Мінекології',
        type: 'pdf',
        path: '/docs/cleantown/ecology_license.pdf'
      },
      {
        name: 'Графік вивозу',
        type: 'pdf',
        path: '/docs/cleantown/schedule.pdf'
      }
    ]
  },
  {
    name: 'ПП "Охорона Плюс"',
    comment:
      "Охоронна компанія. Цілодобова охорона об'єктів. Група швидкого реагування.",
    legalAddress: 'м. Київ, вул. Безпечна, 10',
    actualAddress: 'м. Київ, вул. Безпечна, 10',
    bankDetails: 'IBAN UA113052990000026002233445566, ПАТ "Альфа-Банк"',
    edrpou: '90123456',
    ipn: '901234567890',
    contacts: [
      { phone: '+380449012345', email: 'security@ohoronaplus.ua' },
      { phone: '+380800123456', email: 'alarm@ohoronaplus.ua' },
      { phone: '+380679012345', email: 'director@ohoronaplus.ua' }
    ],
    documents: [
      {
        name: 'Договір охорони',
        type: 'pdf',
        path: '/docs/security/guard_contract.pdf'
      },
      {
        name: 'Ліцензія МВС',
        type: 'pdf',
        path: '/docs/security/mvs_license.pdf'
      },
      {
        name: 'Страховий поліс відповідальності',
        type: 'pdf',
        path: '/docs/security/liability_insurance.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "МеталТрейд Україна"',
    comment: 'Покупець металопрокату. Регулярні замовлення 2-3 рази на місяць.',
    legalAddress: 'м. Полтава, вул. Соборності, 55',
    actualAddress: 'м. Полтава, вул. Соборності, 55',
    bankDetails: 'IBAN UA913052990000026008899001122, АТ "Індустріалбанк"',
    edrpou: '01234567',
    ipn: '012345678901',
    vatCertificate: '200001234567',
    contacts: [
      { phone: '+380530123456', email: 'purchase@metaltrade.ua' },
      { phone: '+380661234567', email: 'director@metaltrade.ua' }
    ],
    documents: [
      {
        name: 'Договір купівлі-продажу',
        type: 'pdf',
        path: '/docs/metaltrade/sales_contract.pdf'
      },
      {
        name: 'Заявка шаблон',
        type: 'docx',
        path: '/docs/metaltrade/order_template.docx'
      }
    ]
  },
  {
    name: 'ТОВ "Газпостач Регіон"',
    comment: 'Постачальник природного газу. Договір діє до 2025 року.',
    legalAddress: 'м. Київ, вул. Газова, 1',
    actualAddress: 'м. Київ, вул. Газова, 1',
    bankDetails: 'IBAN UA713052990000026001122334466, АТ "Укргазбанк"',
    edrpou: '11223344',
    ipn: '112233445566',
    vatCertificate: '200011223344',
    contacts: [{ phone: '+380441122334', email: 'clients@gazpostach.ua' }],
    documents: [
      {
        name: 'Договір газопостачання',
        type: 'pdf',
        path: '/docs/gazpostach/gas_contract.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "Водоканал Сервіс"',
    comment: 'Водопостачання та водовідведення.',
    legalAddress: 'м. Київ, вул. Водна, 25',
    actualAddress: 'м. Київ, вул. Водна, 25',
    bankDetails: 'IBAN UA513052990000026005566778899, АТ "Ощадбанк"',
    edrpou: '22334455',
    ipn: '223344556677',
    contacts: [{ phone: '+380442233445', email: 'info@vodokanal.ua' }],
    documents: [
      {
        name: 'Договір водопостачання',
        type: 'pdf',
        path: '/docs/vodokanal/water_contract.pdf'
      }
    ]
  },
  {
    name: 'ФОП Ковальчук Олег Петрович',
    comment: 'Електрик. Обслуговування електромереж. Виклик: 500 грн/год.',
    legalAddress: 'м. Київ, вул. Електриків, 10, кв. 5',
    actualAddress: 'м. Київ, вул. Електриків, 10, кв. 5',
    edrpou: '3456789012',
    ipn: '3456789012',
    contacts: [
      { phone: '+380673344556', email: 'kovalchuk.electric@gmail.com' }
    ],
    documents: [
      {
        name: 'Договір обслуговування',
        type: 'pdf',
        path: '/docs/kovalchuk/electric_service.pdf'
      },
      {
        name: 'Допуск електрика',
        type: 'pdf',
        path: '/docs/kovalchuk/electrician_permit.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "Страхова компанія Надія"',
    comment:
      'Страхування майна та відповідальності. Поліс оновлюється щорічно.',
    legalAddress: 'м. Київ, бул. Шевченка, 50',
    actualAddress: 'м. Київ, бул. Шевченка, 50, офіс 100',
    bankDetails: 'IBAN UA313052990000026003344556688, АТ "ПриватБанк"',
    edrpou: '33445566',
    ipn: '334455667788',
    vatCertificate: '200033445566',
    contacts: [
      { phone: '+380443344556', email: 'corporate@nadiya-insurance.ua' },
      { phone: '+380673344557', email: 'agent@nadiya-insurance.ua' }
    ],
    documents: [
      {
        name: 'Поліс страхування майна',
        type: 'pdf',
        path: '/docs/nadiya/property_policy.pdf'
      },
      {
        name: 'Поліс відповідальності',
        type: 'pdf',
        path: '/docs/nadiya/liability_policy.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "Аудит Консалтинг Груп"',
    comment: 'Аудиторські послуги. Річний аудит.',
    legalAddress: 'м. Київ, вул. Фінансова, 15',
    actualAddress: 'м. Київ, вул. Фінансова, 15, офіс 301',
    bankDetails: 'IBAN UA113052990000026007788990022, АТ "ПУМБ"',
    edrpou: '44556677',
    ipn: '445566778899',
    contacts: [{ phone: '+380444455667', email: 'audit@acg.ua' }],
    documents: [
      {
        name: 'Договір аудиту 2024',
        type: 'pdf',
        path: '/docs/acg/audit_contract_2024.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "Юридична фірма Право"',
    comment: 'Юридичний супровід. Абонплата 15000 грн/міс.',
    legalAddress: 'м. Київ, вул. Юридична, 7',
    actualAddress: 'м. Київ, вул. Юридична, 7, офіс 200',
    bankDetails: 'IBAN UA213052990000026009900112233, АТ "Укрсиббанк"',
    edrpou: '55667788',
    ipn: '556677889900',
    contacts: [
      { phone: '+380445566778', email: 'office@pravo-law.ua' },
      { phone: '+380675566779', email: 'lawyer@pravo-law.ua' }
    ],
    documents: [
      {
        name: 'Договір юридичного обслуговування',
        type: 'pdf',
        path: '/docs/pravo/legal_service.pdf'
      }
    ]
  },
  {
    name: 'ТОВ "Рекламне агентство Креатив"',
    comment: 'Маркетинг та реклама. Ведуть соцмережі та сайт.',
    legalAddress: 'м. Київ, вул. Креативна, 33',
    actualAddress: 'м. Київ, вул. Креативна, 33',
    bankDetails: 'IBAN UA413052990000026001122334477, АТ "Монобанк"',
    edrpou: '66778899',
    ipn: '667788990011',
    contacts: [
      { phone: '+380446677889', email: 'hello@creative-agency.ua' },
      { phone: '+380956677889', email: 'manager@creative-agency.ua' }
    ],
    documents: [
      {
        name: 'Договір маркетингових послуг',
        type: 'pdf',
        path: '/docs/creative/marketing_contract.pdf'
      },
      {
        name: 'Медіаплан 2024',
        type: 'xlsx',
        path: '/docs/creative/mediaplan_2024.xlsx'
      }
    ]
  },
  {
    name: 'ТОВ "Кур\'єрська служба Експрес"',
    comment: 'Доставка документів та дрібних вантажів. Доставка день-в-день.',
    legalAddress: 'м. Київ, вул. Поштова, 5',
    actualAddress: 'м. Київ, вул. Поштова, 5',
    bankDetails: 'IBAN UA513052990000026002233445588, АТ "А-Банк"',
    edrpou: '77889900',
    ipn: '778899001122',
    contacts: [
      { phone: '+380447788990', email: 'orders@express-courier.ua' },
      { phone: '+380800777888', email: 'support@express-courier.ua' }
    ],
    documents: [
      {
        name: "Договір кур'єрських послуг",
        type: 'pdf',
        path: '/docs/express/courier_contract.pdf'
      },
      { name: 'Тарифи', type: 'pdf', path: '/docs/express/tariffs.pdf' }
    ]
  }
]

const AUDIT_ACTIONS = [
  { action: 'user.login', targetType: null },
  { action: 'user.logout', targetType: null },
  {
    action: 'user.login.failed',
    targetType: null,
    success: false,
    errorCode: 'INVALID_CREDENTIALS'
  },
  { action: 'user.login.2fa', targetType: null },
  { action: 'user.profile.update', targetType: 'User' },
  { action: 'user.password.change', targetType: 'User' },
  { action: 'user.password.reset.request', targetType: null },
  { action: 'user.password.reset.complete', targetType: 'User' },
  { action: 'user.2fa.enable', targetType: 'User' },
  { action: 'user.2fa.disable', targetType: 'User' },
  { action: 'user.create', targetType: 'User' },
  { action: 'user.delete', targetType: 'User' },
  { action: 'user.block', targetType: 'User' },
  { action: 'user.unblock', targetType: 'User' },
  { action: 'role.assign', targetType: 'User' },
  { action: 'role.revoke', targetType: 'User' },
  { action: 'counterparty.create', targetType: 'Counterparty' },
  { action: 'counterparty.update', targetType: 'Counterparty' },
  { action: 'counterparty.delete', targetType: 'Counterparty' },
  { action: 'counterparty.view', targetType: 'Counterparty' },
  { action: 'contact.add', targetType: 'Counterparty' },
  { action: 'contact.update', targetType: 'Counterparty' },
  { action: 'contact.delete', targetType: 'Counterparty' },
  { action: 'document.upload', targetType: 'Counterparty' },
  { action: 'document.download', targetType: 'Counterparty' },
  { action: 'document.delete', targetType: 'Counterparty' },
  { action: 'settings.update', targetType: null },
  { action: 'export.users', targetType: null },
  { action: 'export.counterparties', targetType: null }
]

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.2',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
]

// ==================== Seed Functions ====================

async function seedRoles() {
  console.log('📋 Creating system roles...')
  const roles = await Promise.all(
    Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) =>
      prisma.role.upsert({
        where: { name },
        update: { permissions },
        create: {
          name,
          permissions,
          system: true
        }
      })
    )
  )
  console.log(`   ✅ Created ${roles.length} system roles`)
  return roles
}

async function seedUsers(roles: Awaited<ReturnType<typeof seedRoles>>) {
  console.log('👥 Creating users...')
  const users = []

  for (const userData of USERS_DATA) {
    const passwordHash = await argon2.hash(userData.password)
    const role = roles.find(r => r.name === userData.role)

    if (!role) {
      console.log(
        `   ⚠️ Role ${userData.role} not found, skipping user ${userData.email}`
      )
      continue
    }

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        position: userData.position,
        picture: userData.picture,
        status: userData.status || UserStatus.ACTIVE,
        isVerified: userData.isVerified ?? true,
        isTwoFactorEnabled: userData.isTwoFactorEnabled ?? false,
        method: userData.method || AuthMethod.CREDENTIALS,
        requirePasswordChange: userData.requirePasswordChange ?? false,
        passwordChangedAt: userData.requirePasswordChange
          ? null
          : randomDate(90),
        permissionsOverride: userData.permissionsOverride || [],
        extraPhones: userData.extraPhones || [],
        lastLoginAt: userData.lastLoginAt,
        lastIp: userData.lastIp,
        lastUa: userData.lastUa
      }
    })

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id
      }
    })

    users.push({ ...user, role: role.name, passwordPlain: userData.password })
  }

  console.log(`   ✅ Created ${users.length} users`)
  return users
}

async function seedAccounts(users: Awaited<ReturnType<typeof seedUsers>>) {
  console.log('🔗 Creating OAuth accounts...')

  const googleUser = users.find(u => u.method === AuthMethod.GOOGLE)
  const accounts = []

  if (googleUser) {
    const account = await prisma.account.create({
      data: {
        type: 'oauth',
        provider: 'google',
        userId: googleUser.id,
        accessToken: 'ya29.mock_access_token_' + generateToken().slice(0, 32),
        refreshToken: '1//mock_refresh_token_' + generateToken().slice(0, 32),
        expiresAt: BigInt(Date.now() + 3600000) // 1 hour from now
      }
    })
    accounts.push(account)
  }

  // Add some more mock OAuth accounts for variety
  const adminUser = users.find(u => u.role === SystemRole.ADMIN)
  if (adminUser) {
    const account = await prisma.account.create({
      data: {
        type: 'oauth',
        provider: 'google',
        userId: adminUser.id,
        accessToken:
          'ya29.mock_access_token_admin_' + generateToken().slice(0, 32),
        refreshToken:
          '1//mock_refresh_token_admin_' + generateToken().slice(0, 32),
        expiresAt: BigInt(Date.now() + 3600000)
      }
    })
    accounts.push(account)
  }

  console.log(`   ✅ Created ${accounts.length} OAuth accounts`)
  return accounts
}

async function seedTokens(users: Awaited<ReturnType<typeof seedUsers>>) {
  console.log('🎫 Creating tokens...')

  const tokens = []

  // Verification tokens for invited users
  const invitedUsers = users.filter(u => u.status === UserStatus.INVITED)
  for (const user of invitedUsers) {
    const token = await prisma.token.create({
      data: {
        email: user.email,
        token: generateToken(),
        type: TokenType.VERIFICATION,
        expiresIn: futureDate(7) // 7 days
      }
    })
    tokens.push(token)
  }

  // Invitation tokens
  for (const user of invitedUsers) {
    const token = await prisma.token.create({
      data: {
        email: user.email,
        token: generateToken(),
        type: TokenType.INVITATION,
        expiresIn: futureDate(14) // 14 days
      }
    })
    tokens.push(token)
  }

  // 2FA tokens for users with 2FA enabled (simulating active sessions)
  const twoFactorUsers = users.filter(u => u.isTwoFactorEnabled)
  for (const user of twoFactorUsers) {
    const token = await prisma.token.create({
      data: {
        email: user.email,
        token: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
        type: TokenType.TWO_FACTOR,
        expiresIn: futureDate(0.007) // ~10 minutes
      }
    })
    tokens.push(token)
  }

  // Password reset token (simulating someone requested password reset)
  const randomUser = users[Math.floor(Math.random() * users.length)]
  const passwordResetToken = await prisma.token.create({
    data: {
      email: randomUser.email,
      token: generateToken(),
      type: TokenType.PASSWORD_RESET,
      expiresIn: futureDate(1) // 24 hours
    }
  })
  tokens.push(passwordResetToken)

  // Expired tokens (for testing cleanup)
  const expiredToken = await prisma.token.create({
    data: {
      email: 'expired@example.com',
      token: generateToken(),
      type: TokenType.VERIFICATION,
      expiresIn: new Date(Date.now() - 86400000) // Yesterday
    }
  })
  tokens.push(expiredToken)

  console.log(`   ✅ Created ${tokens.length} tokens`)
  console.log(`      - ${invitedUsers.length} verification tokens`)
  console.log(`      - ${invitedUsers.length} invitation tokens`)
  console.log(`      - ${twoFactorUsers.length} 2FA tokens`)
  console.log(`      - 1 password reset token`)
  console.log(`      - 1 expired token`)

  return tokens
}

async function seedPasswordHistory(
  users: Awaited<ReturnType<typeof seedUsers>>
) {
  console.log('🔐 Creating password history...')

  const historyRecords = []

  // Add password history for active users (simulating password changes)
  const activeUsers = users.filter(
    u => u.status === UserStatus.ACTIVE && u.method === AuthMethod.CREDENTIALS
  )

  for (const user of activeUsers) {
    // Generate 1-5 old passwords per user
    const historyCount = Math.floor(Math.random() * 5) + 1

    for (let i = 0; i < historyCount; i++) {
      const oldPassword = `OldPassword${i + 1}!${user.firstName}`
      const passwordHash = await argon2.hash(oldPassword)

      const record = await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash,
          createdAt: randomDate(365 - i * 60) // Spread over the past year
        }
      })
      historyRecords.push(record)
    }
  }

  console.log(`   ✅ Created ${historyRecords.length} password history records`)
  return historyRecords
}

async function seedUserComments(users: Awaited<ReturnType<typeof seedUsers>>) {
  console.log('💬 Creating user comments...')

  const admin = users.find(u => u.role === SystemRole.ADMIN)
  const director = users.find(u => u.role === SystemRole.DIRECTOR)

  if (!admin || !director) {
    console.log('   ⚠️ Admin or Director not found, skipping comments')
    return []
  }

  const commentsData = [
    // Technical user comments
    {
      userId: users.find(u => u.role === SystemRole.TECHNICAL)?.id,
      text: 'Пройшов атестацію з охорони праці. Термін дії до 15.06.2025',
      createdById: admin.id,
      createdAt: randomDate(30)
    },
    {
      userId: users.find(u => u.role === SystemRole.TECHNICAL)?.id,
      text: 'Отримав допуск до роботи з електрообладнанням до 1000В',
      createdById: director.id,
      createdAt: randomDate(60)
    },
    // Manager comments
    {
      userId: users.find(u => u.role === SystemRole.MANAGER)?.id,
      text: 'Найкращі показники продажів за Q1 2024. Бонус нарахований.',
      createdById: director.id,
      createdAt: randomDate(45)
    },
    {
      userId: users.find(u => u.role === SystemRole.MANAGER)?.id,
      text: 'Відпустка запланована на серпень 2024 (01.08 - 14.08)',
      createdById: admin.id,
      createdAt: randomDate(20)
    },
    {
      userId: users.find(u => u.email === 'manager2@metalcompany.ua')?.id,
      text: 'Призначений відповідальним за VIP клієнтів',
      createdById: director.id,
      createdAt: randomDate(90)
    },
    {
      userId: users.find(u => u.email === 'manager3@metalcompany.ua')?.id,
      text: 'Пройшла тренінг з продажів. Сертифікат в особовій справі.',
      createdById: admin.id,
      createdAt: randomDate(15)
    },
    // Storekeeper comments
    {
      userId: users.find(u => u.role === SystemRole.STOREKEEPER)?.id,
      text: 'Відповідальний за інвентаризацію Q2 2024',
      createdById: admin.id,
      createdAt: randomDate(10)
    },
    {
      userId: users.find(u => u.email === 'store2@metalcompany.ua')?.id,
      text: 'Працює у нічну зміну (22:00 - 06:00)',
      createdById: admin.id,
      createdAt: randomDate(5)
    },
    // Accountant comments
    {
      userId: users.find(u => u.role === SystemRole.ACCOUNTANT)?.id,
      text: 'Курси підвищення кваліфікації - березень 2024. Оплачено компанією.',
      createdById: director.id,
      createdAt: randomDate(80)
    },
    {
      userId: users.find(u => u.email === 'accountant2@metalcompany.ua')?.id,
      text: 'Доступ до банк-клієнту надано 15.01.2024',
      createdById: admin.id,
      createdAt: randomDate(120)
    },
    // Invited users
    {
      userId: users.find(u => u.status === UserStatus.INVITED)?.id,
      text: 'Запрошення надіслано 01.03.2024. Очікуємо підтвердження.',
      createdById: admin.id,
      createdAt: randomDate(7)
    },
    {
      userId: users.find(u => u.email === 'invited2@metalcompany.ua')?.id,
      text: 'Стажер з КПІ. Випробувальний термін 3 місяці.',
      createdById: director.id,
      createdAt: randomDate(3)
    },
    // Blocked user
    {
      userId: users.find(u => u.status === UserStatus.BLOCKED)?.id,
      text: 'Заблоковано через порушення політики безпеки. Справа #2024-001.',
      createdById: admin.id,
      createdAt: randomDate(25)
    },
    {
      userId: users.find(u => u.status === UserStatus.BLOCKED)?.id,
      text: 'Неодноразові спроби входу з невідомих IP.',
      createdById: admin.id,
      createdAt: randomDate(26)
    },
    // Deleted user
    {
      userId: users.find(u => u.status === UserStatus.DELETED)?.id,
      text: 'Звільнений за власним бажанням 01.02.2024',
      createdById: admin.id,
      createdAt: randomDate(60)
    },
    // Password change required
    {
      userId: users.find(u => u.requirePasswordChange)?.id,
      text: 'Новий співробітник. Потрібно змінити тимчасовий пароль.',
      createdById: admin.id,
      createdAt: randomDate(1)
    },
    // General comments
    {
      userId: admin?.id,
      text: 'Відповідальний за технічну підтримку всіх користувачів',
      createdById: director.id,
      createdAt: randomDate(180)
    },
    {
      userId: director?.id,
      text: 'Контактна особа для екстрених питань: +380501234567',
      createdById: admin.id,
      createdAt: randomDate(200)
    }
  ]

  const comments = []
  for (const comment of commentsData) {
    if (!comment.userId) continue

    const created = await prisma.userComment.create({
      data: {
        userId: comment.userId,
        text: comment.text,
        createdById: comment.createdById,
        createdAt: comment.createdAt
      }
    })
    comments.push(created)
  }

  console.log(`   ✅ Created ${comments.length} user comments`)
  return comments
}

async function seedCounterparties() {
  console.log('🏢 Creating counterparties...')

  const counterparties = []

  for (const cpData of COUNTERPARTIES_DATA) {
    const { contacts, documents, ...data } = cpData

    const counterparty = await prisma.counterparty.create({
      data: {
        ...data,
        createdAt: randomDate(365), // Random date within past year
        contacts: {
          create: contacts
        },
        documents: {
          create: documents
        }
      },
      include: {
        contacts: true,
        documents: true
      }
    })

    counterparties.push(counterparty)
  }

  const totalContacts = counterparties.reduce(
    (acc, cp) => acc + cp.contacts.length,
    0
  )
  const totalDocuments = counterparties.reduce(
    (acc, cp) => acc + cp.documents.length,
    0
  )

  console.log(`   ✅ Created ${counterparties.length} counterparties`)
  console.log(`   ✅ Created ${totalContacts} contacts`)
  console.log(`   ✅ Created ${totalDocuments} documents`)

  return counterparties
}

async function seedAuditLogs(
  users: Awaited<ReturnType<typeof seedUsers>>,
  counterparties: Awaited<ReturnType<typeof seedCounterparties>>
) {
  console.log('📝 Creating audit logs...')

  const logsData = []
  const now = new Date()
  const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE)

  // Generate realistic audit logs for the past 90 days
  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    // More events on weekdays
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseEvents = isWeekend ? 3 : 12
    const eventsCount =
      Math.floor(Math.random() * baseEvents) + (isWeekend ? 1 : 5)

    for (let i = 0; i < eventsCount; i++) {
      const randomUser =
        activeUsers[Math.floor(Math.random() * activeUsers.length)]
      const randomActionData =
        AUDIT_ACTIONS[Math.floor(Math.random() * AUDIT_ACTIONS.length)]

      const logData: {
        actorId: string
        action: string
        targetType?: string
        targetId?: string
        meta?: object
        ip: string
        ua: string
        success: boolean
        errorCode?: string
        createdAt: Date
      } = {
        actorId: randomUser.id,
        action: randomActionData.action,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        ua: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        success: randomActionData.success !== false,
        errorCode: randomActionData.errorCode,
        createdAt: new Date(date.getTime() + Math.random() * 86400000)
      }

      // Add target info for specific actions
      // Note: targetId has FK to User table only, so for Counterparty actions we only use meta
      if (
        randomActionData.targetType === 'Counterparty' &&
        counterparties.length > 0
      ) {
        const randomCp =
          counterparties[Math.floor(Math.random() * counterparties.length)]
        logData.targetType = 'Counterparty'
        // Don't set targetId for Counterparty - it has FK constraint to User table
        logData.meta = {
          counterpartyId: randomCp.id,
          counterpartyName: randomCp.name
        }
      } else if (randomActionData.targetType === 'User') {
        const targetUser = users[Math.floor(Math.random() * users.length)]
        logData.targetType = 'User'
        logData.targetId = targetUser.id
        logData.meta = { targetEmail: targetUser.email }
      }

      logsData.push(logData)
    }
  }

  // Add some specific important events
  const director = users.find(u => u.role === SystemRole.DIRECTOR)
  const admin = users.find(u => u.role === SystemRole.ADMIN)

  if (director && admin) {
    // Director login today
    logsData.push({
      actorId: director.id,
      action: 'user.login',
      ip: '192.168.1.100',
      ua: USER_AGENTS[0],
      success: true,
      createdAt: new Date()
    })

    // Admin created a user
    logsData.push({
      actorId: admin.id,
      action: 'user.create',
      targetType: 'User',
      targetId: users.find(u => u.status === UserStatus.INVITED)?.id,
      meta: { targetEmail: 'invited@metalcompany.ua' },
      ip: '192.168.1.101',
      ua: USER_AGENTS[1],
      success: true,
      createdAt: randomDate(7)
    })

    // Someone blocked a user
    logsData.push({
      actorId: admin.id,
      action: 'user.block',
      targetType: 'User',
      targetId: users.find(u => u.status === UserStatus.BLOCKED)?.id,
      meta: { reason: 'Security policy violation' },
      ip: '192.168.1.101',
      ua: USER_AGENTS[1],
      success: true,
      createdAt: randomDate(25)
    })
  }

  await prisma.auditLog.createMany({
    data: logsData
  })

  const successCount = logsData.filter(l => l.success).length
  const failedCount = logsData.filter(l => !l.success).length

  console.log(`   ✅ Created ${logsData.length} audit log entries`)
  console.log(`      - ${successCount} successful actions`)
  console.log(`      - ${failedCount} failed actions`)

  return logsData
}

// ==================== Main ====================

async function main() {
  console.log('')
  console.log('🌱 ═══════════════════════════════════════════════════════════')
  console.log('🌱 METAL BACKEND - COMPREHENSIVE DATABASE SEED')
  console.log('🌱 ═══════════════════════════════════════════════════════════')
  console.log('')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')

  // CRM modules - must be deleted before users due to foreign key constraints
  await prisma.taskTimelineItem.deleteMany()
  await prisma.taskFile.deleteMany()
  await prisma.taskComment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.taskType.deleteMany()
  await prisma.planRecordFile.deleteMany()
  await prisma.planRecord.deleteMany()
  await prisma.metalBrand.deleteMany()
  await prisma.orderRequestFile.deleteMany()
  await prisma.orderRequestComment.deleteMany()
  await prisma.orderRequest.deleteMany()
  await prisma.orderType.deleteMany()

  // Core tables
  await prisma.auditLog.deleteMany()
  await prisma.userComment.deleteMany()
  await prisma.passwordHistory.deleteMany()
  await prisma.token.deleteMany()
  await prisma.account.deleteMany()
  await prisma.document.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  console.log('   ✅ Database cleaned')
  console.log('')

  // Seed in order
  const roles = await seedRoles()
  console.log('')

  const users = await seedUsers(roles)
  console.log('')

  await seedAccounts(users)
  console.log('')

  await seedTokens(users)
  console.log('')

  await seedPasswordHistory(users)
  console.log('')

  await seedUserComments(users)
  console.log('')

  const counterparties = await seedCounterparties()
  console.log('')

  await seedAuditLogs(users, counterparties)
  console.log('')

  // Summary
  const stats = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
    accounts: await prisma.account.count(),
    tokens: await prisma.token.count(),
    passwordHistory: await prisma.passwordHistory.count(),
    userComments: await prisma.userComment.count(),
    counterparties: await prisma.counterparty.count(),
    contacts: await prisma.contact.count(),
    documents: await prisma.document.count(),
    auditLogs: await prisma.auditLog.count()
  }

  console.log('🎉 ═══════════════════════════════════════════════════════════')
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!')
  console.log('🎉 ═══════════════════════════════════════════════════════════')
  console.log('')
  console.log('📊 DATABASE STATISTICS:')
  console.log('   ┌────────────────────────┬──────────┐')
  console.log('   │ Table                  │ Records  │')
  console.log('   ├────────────────────────┼──────────┤')
  console.log(
    `   │ Roles                  │ ${String(stats.roles).padStart(8)} │`
  )
  console.log(
    `   │ Users                  │ ${String(stats.users).padStart(8)} │`
  )
  console.log(
    `   │ OAuth Accounts         │ ${String(stats.accounts).padStart(8)} │`
  )
  console.log(
    `   │ Tokens                 │ ${String(stats.tokens).padStart(8)} │`
  )
  console.log(
    `   │ Password History       │ ${String(stats.passwordHistory).padStart(8)} │`
  )
  console.log(
    `   │ User Comments          │ ${String(stats.userComments).padStart(8)} │`
  )
  console.log(
    `   │ Counterparties         │ ${String(stats.counterparties).padStart(8)} │`
  )
  console.log(
    `   │ Contacts               │ ${String(stats.contacts).padStart(8)} │`
  )
  console.log(
    `   │ Documents              │ ${String(stats.documents).padStart(8)} │`
  )
  console.log(
    `   │ Audit Logs             │ ${String(stats.auditLogs).padStart(8)} │`
  )
  console.log('   └────────────────────────┴──────────┘')
  console.log('')
  console.log('🔑 TEST ACCOUNTS:')
  console.log(
    '   ┌─────────────────────────────────┬────────────────┬──────────────────────┬──────────┐'
  )
  console.log(
    '   │ Email                           │ Password       │ Role                 │ Status   │'
  )
  console.log(
    '   ├─────────────────────────────────┼────────────────┼──────────────────────┼──────────┤'
  )

  const displayUsers = USERS_DATA.slice(0, 12)
  for (const user of displayUsers) {
    const email = user.email.padEnd(31)
    const pass = user.password.padEnd(14)
    const role = user.role.padEnd(20)
    const status = (user.status || 'ACTIVE').padEnd(8)
    console.log(`   │ ${email} │ ${pass} │ ${role} │ ${status} │`)
  }
  console.log(
    '   └─────────────────────────────────┴────────────────┴──────────────────────┴──────────┘'
  )
  console.log('')
  console.log('📌 SPECIAL ACCOUNTS:')
  console.log('   • director@metalcompany.ua - Has 2FA enabled, extra phones')
  console.log('   • google.user@gmail.com - OAuth (Google) user')
  console.log('   • newpassword@metalcompany.ua - Requires password change')
  console.log('   • blocked@metalcompany.ua - Blocked user')
  console.log('   • deleted@metalcompany.ua - Soft-deleted user')
  console.log('')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
