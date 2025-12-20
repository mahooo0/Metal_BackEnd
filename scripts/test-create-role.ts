import axios from 'axios'

const BASE_URL = process.env.API_URL || 'http://localhost:3000'

async function testCreateRole() {
  console.log('\n🧪 Testing role creation endpoint...\n')

  const payload = {
    name: 'Custom_Role1',
    permissions: ['orders:read']
  }

  console.log('📤 Request payload:')
  console.log(JSON.stringify(payload, null, 2))
  console.log('')

  try {
    const response = await axios.post(`${BASE_URL}/api/roles`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on any status code
    })

    console.log(`📥 Response status: ${response.status}`)
    console.log('📥 Response data:')
    console.log(JSON.stringify(response.data, null, 2))
    console.log('')

    if (response.status === 201) {
      console.log('✅ Role created successfully!')
    } else if (response.status === 409) {
      console.log('⚠️  Conflict - role already exists')
    } else if (response.status === 401) {
      console.log('❌ Not authenticated - please provide auth cookies/token')
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`)
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Request failed:', error.message)
      if (error.response) {
        console.error('Response:', error.response.data)
      }
    } else {
      console.error('❌ Unexpected error:', error)
    }
  }
}

testCreateRole()
