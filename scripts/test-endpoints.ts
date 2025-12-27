#!/usr/bin/env ts-node
/**
 * Endpoint Testing CLI Utility - Full CRUD Testing
 *
 * Usage:
 *   pnpm test:api [module]
 *
 * Examples:
 *   pnpm test:api                    # Test all modules
 *   pnpm test:api suppliers          # Test specific module
 *
 * Test user: director@metalcompany.ua (has all permissions)
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import * as https from 'https'

// ==================== Configuration ====================

const CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:4000',
  testUser: {
    email: 'director@metalcompany.ua',
    password: 'Director123!'
  },
  timeout: 10000
}

// ==================== Types ====================

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  message?: string
  duration?: number
}

interface CrudTestConfig {
  name: string
  basePath: string
  createData: object
  updateData: object
  listPath?: string
  idField?: string
  nestedPath?: string // For nested resources like /suppliers/:id/contacts
  parentIdField?: string
}

// ==================== CRUD Test Configs ====================

const CRUD_MODULES: Record<string, CrudTestConfig> = {
  suppliers: {
    name: 'Suppliers',
    basePath: '/suppliers',
    createData: {
      name: 'Test Supplier ' + Date.now(),
      legalAddress: 'Test Legal Address 123',
      actualAddress: 'Test Actual Address 456',
      edrpou: '12345678',
      contacts: [
        {
          name: 'Test Contact',
          phone: '+380501234567',
          email: 'test@supplier.com'
        }
      ]
    },
    updateData: {
      name: 'Updated Supplier ' + Date.now(),
      legalAddress: 'Updated Address'
    }
  },
  'metal-brands': {
    name: 'Metal Brands',
    basePath: '/metal-brands',
    createData: {
      name: 'Test Brand ' + Date.now()
    },
    updateData: {
      name: 'Updated Brand ' + Date.now()
    }
  },
  'order-types': {
    name: 'Order Types',
    basePath: '/order-types',
    createData: {
      name: 'Test Order Type ' + Date.now()
    },
    updateData: {
      name: 'Updated Order Type ' + Date.now()
    }
  },
  'task-types': {
    name: 'Task Types',
    basePath: '/task-types',
    createData: {
      name: 'Test Task Type ' + Date.now()
    },
    updateData: {
      name: 'Updated Task Type ' + Date.now()
    }
  },
  counterparties: {
    name: 'Counterparties',
    basePath: '/counterparties',
    createData: {
      name: 'Test Counterparty ' + Date.now(),
      comment: 'Test comment for counterparty',
      legalAddress: 'Test Legal Address',
      actualAddress: 'Test Actual Address'
    },
    updateData: {
      name: 'Updated Counterparty ' + Date.now(),
      comment: 'Updated comment'
    }
  },
  categories: {
    name: 'Categories',
    basePath: '/categories',
    createData: {
      name: 'Test Category ' + Date.now()
    },
    updateData: {
      name: 'Updated Category ' + Date.now()
    }
  },
  'bending-prices': {
    name: 'Bending Prices',
    basePath: '/price-lists/bending',
    createData: {
      thickness: 2.0,
      coefficient: 1.5,
      basePrice: 100,
      minPrice: 50,
      description: 'Test bending price'
    },
    updateData: {
      basePrice: 120,
      coefficient: 1.6
    }
  },
  'cutting-prices': {
    name: 'Cutting Prices',
    basePath: '/price-lists/cutting',
    createData: {
      thickness: 2.0,
      pricePerMeter: 50,
      pricePerHour: 1000,
      setupPrice: 200,
      minPrice: 30,
      description: 'Test cutting price'
    },
    updateData: {
      pricePerMeter: 55,
      pricePerHour: 1100
    }
  }
}

// ==================== Utility Functions ====================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
}

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : ''
  console.log(`${colorCode}${message}${colors.reset}`)
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// ==================== API Client ====================

async function createApiClient(): Promise<AxiosInstance> {
  const api = axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: CONFIG.timeout,
    withCredentials: true,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  })

  let cookies: string[] = []

  api.interceptors.response.use(
    response => {
      const setCookie = response.headers['set-cookie']
      if (setCookie) {
        cookies = setCookie
      }
      return response
    },
    error => Promise.reject(error)
  )

  api.interceptors.request.use(config => {
    if (cookies.length > 0) {
      config.headers.Cookie = cookies.map(c => c.split(';')[0]).join('; ')
    }
    return config
  })

  return api
}

async function login(api: AxiosInstance): Promise<boolean> {
  try {
    log('\n🔐 Logging in...', 'cyan')
    const response = await api.post('/auth/login', {
      email: CONFIG.testUser.email,
      password: CONFIG.testUser.password
    })

    if (response.status === 200 || response.status === 201) {
      log(`   ✅ Logged in as ${CONFIG.testUser.email}`, 'green')
      return true
    }

    log(`   ❌ Login failed: ${response.status}`, 'red')
    return false
  } catch (error) {
    const axiosError = error as AxiosError
    log(`   ❌ Login error: ${axiosError.message}`, 'red')
    return false
  }
}

// ==================== CRUD Test Runner ====================

async function runCrudTest(
  api: AxiosInstance,
  config: CrudTestConfig
): Promise<TestResult[]> {
  const results: TestResult[] = []
  let createdId: string | null = null

  log(`\n📦 CRUD Testing: ${config.name}`, 'blue')
  log('─'.repeat(60), 'dim')

  // 1. LIST - Get all (before create)
  {
    const start = Date.now()
    try {
      const response = await api.get(config.basePath)
      const duration = Date.now() - start
      const count = response.data?.data?.length ?? response.data?.length ?? 0

      results.push({
        test: 'LIST (GET all)',
        status: 'PASS',
        statusCode: response.status,
        duration
      })
      log(`   ✅ LIST    ${config.basePath} → ${count} items ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
    } catch (error) {
      const axiosError = error as AxiosError
      results.push({
        test: 'LIST (GET all)',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ LIST    ${config.basePath} → ${axiosError.message}`, 'red')
    }
  }

  // 2. CREATE - Create new entity
  {
    const start = Date.now()
    try {
      const response = await api.post(config.basePath, config.createData)
      const duration = Date.now() - start
      createdId = response.data?.id || response.data?.data?.id

      if (createdId) {
        results.push({
          test: 'CREATE (POST)',
          status: 'PASS',
          statusCode: response.status,
          duration
        })
        log(`   ✅ CREATE  ${config.basePath} → id: ${createdId} ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
      } else {
        results.push({
          test: 'CREATE (POST)',
          status: 'FAIL',
          statusCode: response.status,
          message: 'No ID returned',
          duration
        })
        log(`   ❌ CREATE  ${config.basePath} → No ID in response`, 'red')
      }
    } catch (error) {
      const axiosError = error as AxiosError
      const responseData = axiosError.response?.data as any
      results.push({
        test: 'CREATE (POST)',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: responseData?.message || axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ CREATE  ${config.basePath} → ${responseData?.message || axiosError.message}`, 'red')
    }
  }

  // 3. GET ONE - Get created entity
  if (createdId) {
    const start = Date.now()
    try {
      const response = await api.get(`${config.basePath}/${createdId}`)
      const duration = Date.now() - start

      results.push({
        test: 'GET ONE',
        status: 'PASS',
        statusCode: response.status,
        duration
      })
      log(`   ✅ GET     ${config.basePath}/${createdId} ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
    } catch (error) {
      const axiosError = error as AxiosError
      results.push({
        test: 'GET ONE',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ GET     ${config.basePath}/${createdId} → ${axiosError.message}`, 'red')
    }
  } else {
    results.push({
      test: 'GET ONE',
      status: 'SKIP',
      message: 'No ID from CREATE'
    })
    log(`   ⏭️  GET     Skipped (no ID)`, 'yellow')
  }

  // 4. UPDATE - Update created entity
  if (createdId) {
    const start = Date.now()
    try {
      const response = await api.put(`${config.basePath}/${createdId}`, config.updateData)
      const duration = Date.now() - start

      results.push({
        test: 'UPDATE (PUT)',
        status: 'PASS',
        statusCode: response.status,
        duration
      })
      log(`   ✅ UPDATE  ${config.basePath}/${createdId} ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
    } catch (error) {
      const axiosError = error as AxiosError
      const responseData = axiosError.response?.data as any
      results.push({
        test: 'UPDATE (PUT)',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: responseData?.message || axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ UPDATE  ${config.basePath}/${createdId} → ${responseData?.message || axiosError.message}`, 'red')
    }
  } else {
    results.push({
      test: 'UPDATE (PUT)',
      status: 'SKIP',
      message: 'No ID from CREATE'
    })
    log(`   ⏭️  UPDATE  Skipped (no ID)`, 'yellow')
  }

  // 5. VERIFY UPDATE - Get entity to verify update
  if (createdId) {
    const start = Date.now()
    try {
      const response = await api.get(`${config.basePath}/${createdId}`)
      const duration = Date.now() - start
      const entity = response.data?.data || response.data

      // Check if update was applied
      const updateKey = Object.keys(config.updateData)[0]
      const expectedValue = (config.updateData as any)[updateKey]
      const actualValue = entity[updateKey]

      if (actualValue === expectedValue) {
        results.push({
          test: 'VERIFY UPDATE',
          status: 'PASS',
          statusCode: response.status,
          duration
        })
        log(`   ✅ VERIFY  ${updateKey}: "${actualValue}" ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
      } else {
        results.push({
          test: 'VERIFY UPDATE',
          status: 'FAIL',
          message: `Expected ${updateKey}="${expectedValue}", got "${actualValue}"`,
          duration
        })
        log(`   ❌ VERIFY  Expected ${updateKey}="${expectedValue}", got "${actualValue}"`, 'red')
      }
    } catch (error) {
      const axiosError = error as AxiosError
      results.push({
        test: 'VERIFY UPDATE',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ VERIFY  ${axiosError.message}`, 'red')
    }
  }

  // 6. DELETE - Delete created entity
  if (createdId) {
    const start = Date.now()
    try {
      const response = await api.delete(`${config.basePath}/${createdId}`)
      const duration = Date.now() - start

      results.push({
        test: 'DELETE',
        status: 'PASS',
        statusCode: response.status,
        duration
      })
      log(`   ✅ DELETE  ${config.basePath}/${createdId} ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
    } catch (error) {
      const axiosError = error as AxiosError
      results.push({
        test: 'DELETE',
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ DELETE  ${config.basePath}/${createdId} → ${axiosError.message}`, 'red')
    }
  } else {
    results.push({
      test: 'DELETE',
      status: 'SKIP',
      message: 'No ID from CREATE'
    })
    log(`   ⏭️  DELETE  Skipped (no ID)`, 'yellow')
  }

  // 7. VERIFY DELETE - Ensure entity is deleted
  if (createdId) {
    const start = Date.now()
    try {
      await api.get(`${config.basePath}/${createdId}`)
      // If we get here, the entity still exists
      results.push({
        test: 'VERIFY DELETE',
        status: 'FAIL',
        message: 'Entity still exists after DELETE',
        duration: Date.now() - start
      })
      log(`   ❌ VERIFY  Entity still exists after DELETE`, 'red')
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        results.push({
          test: 'VERIFY DELETE',
          status: 'PASS',
          statusCode: 404,
          duration: Date.now() - start
        })
        log(`   ✅ VERIFY  Entity properly deleted (404) ${colors.dim}(${formatDuration(Date.now() - start)})${colors.reset}`, 'green')
      } else {
        results.push({
          test: 'VERIFY DELETE',
          status: 'FAIL',
          statusCode: axiosError.response?.status,
          message: `Expected 404, got ${axiosError.response?.status}`,
          duration: Date.now() - start
        })
        log(`   ❌ VERIFY  Expected 404, got ${axiosError.response?.status}`, 'red')
      }
    }
  }

  return results
}

// ==================== Simple Read Tests ====================

async function runReadTests(api: AxiosInstance): Promise<TestResult[]> {
  const results: TestResult[] = []

  const readEndpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/auth/me', name: 'Current User' },
    { path: '/materials', name: 'Materials' },
    { path: '/material-items', name: 'Material Items' },
    { path: '/purchases', name: 'Purchases' },
    { path: '/order-requests', name: 'Order Requests' },
    { path: '/tasks', name: 'Tasks' },
    { path: '/plan-records', name: 'Plan Records' },
    { path: '/inventories', name: 'Inventories' },
    { path: '/write-offs', name: 'Write-offs' },
    { path: '/categories', name: 'Categories' },
    { path: '/price-lists/bending', name: 'Bending Prices' },
    { path: '/price-lists/cutting', name: 'Cutting Prices' }
  ]

  log('\n📋 Read-Only Tests', 'blue')
  log('─'.repeat(60), 'dim')

  for (const endpoint of readEndpoints) {
    const start = Date.now()
    try {
      const response = await api.get(endpoint.path)
      const duration = Date.now() - start
      results.push({
        test: `GET ${endpoint.name}`,
        status: 'PASS',
        statusCode: response.status,
        duration
      })
      log(`   ✅ GET ${endpoint.path.padEnd(20)} ${colors.dim}(${formatDuration(duration)})${colors.reset}`, 'green')
    } catch (error) {
      const axiosError = error as AxiosError
      results.push({
        test: `GET ${endpoint.name}`,
        status: 'FAIL',
        statusCode: axiosError.response?.status,
        message: axiosError.message,
        duration: Date.now() - start
      })
      log(`   ❌ GET ${endpoint.path.padEnd(20)} → ${axiosError.message}`, 'red')
    }
  }

  return results
}

// ==================== Main ====================

async function main() {
  const args = process.argv.slice(2)
  const targetModule = args[0]

  log('\n🚀 Endpoint Testing CLI - Full CRUD', 'bold')
  log(`   Base URL: ${CONFIG.baseUrl}`, 'dim')
  log(`   Test User: ${CONFIG.testUser.email}`, 'dim')

  const api = await createApiClient()

  // Check if server is running
  try {
    await api.get('/health')
  } catch {
    log('\n❌ Server is not running!', 'red')
    log('   Start the server with: pnpm start:dev', 'dim')
    process.exit(1)
  }

  // Login
  const loggedIn = await login(api)
  if (!loggedIn) {
    log('\n❌ Cannot continue without authentication', 'red')
    process.exit(1)
  }

  const allResults: TestResult[] = []

  // Determine which modules to test
  if (targetModule) {
    if (!CRUD_MODULES[targetModule]) {
      log(`\n❌ Unknown module: ${targetModule}`, 'red')
      log(`   Available CRUD modules: ${Object.keys(CRUD_MODULES).join(', ')}`, 'dim')
      log(`   Or run without arguments to test all`, 'dim')
      process.exit(1)
    }
    const results = await runCrudTest(api, CRUD_MODULES[targetModule])
    allResults.push(...results)
  } else {
    // Run CRUD tests for all modules
    for (const [, config] of Object.entries(CRUD_MODULES)) {
      const results = await runCrudTest(api, config)
      allResults.push(...results)
    }

    // Run read-only tests
    const readResults = await runReadTests(api)
    allResults.push(...readResults)
  }

  // Summary
  const passed = allResults.filter(r => r.status === 'PASS').length
  const failed = allResults.filter(r => r.status === 'FAIL').length
  const skipped = allResults.filter(r => r.status === 'SKIP').length
  const total = allResults.length

  log('\n' + '═'.repeat(60), 'dim')
  log('📊 Summary', 'bold')
  log(`   Total:   ${total}`)
  log(`   Passed:  ${passed}`, 'green')
  if (failed > 0) log(`   Failed:  ${failed}`, 'red')
  if (skipped > 0) log(`   Skipped: ${skipped}`, 'yellow')

  const passRate = ((passed / (total - skipped)) * 100).toFixed(1)
  log(`\n   Pass Rate: ${passRate}%`, passed === total - skipped ? 'green' : 'yellow')

  if (failed > 0) {
    log('\n📝 Failed Tests:', 'red')
    allResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        log(`   • ${r.test}: ${r.message || `HTTP ${r.statusCode}`}`, 'dim')
      })
    process.exit(1)
  }

  log('\n✨ All tests passed!\n', 'green')
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red')
  process.exit(1)
})
