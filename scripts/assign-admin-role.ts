import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 👇 PASTE USER ID HERE
const USER_ID = '9e13499e-8296-46b7-9268-a9bd66978c7e'

const SystemRole = {
  DIRECTOR: 'Director',
  ADMIN: 'Admin'
}

// 👇 CHOOSE ROLE: 'Director' (FULL ADMIN - all permissions) or 'Admin' (cannot manage roles)
const ROLE_TO_ASSIGN = SystemRole.DIRECTOR

async function assignAdminRole() {
  try {
    console.log('🔍 Checking user...')

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: USER_ID },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      console.error('❌ User not found with ID:', USER_ID)
      process.exit(1)
    }

    console.log(`✅ User found: ${user.email}`)

    // Find the role to assign
    console.log(`🔍 Finding ${ROLE_TO_ASSIGN} role...`)
    const roleToAssign = await prisma.role.findUnique({
      where: { name: ROLE_TO_ASSIGN },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    if (!roleToAssign) {
      console.error(
        `❌ ${ROLE_TO_ASSIGN} role not found. Please run seed first: npm run db:seed`
      )
      process.exit(1)
    }

    console.log(`✅ ${ROLE_TO_ASSIGN} role found`)
    console.log(`   Permissions count: ${roleToAssign.permissions.length}`)
    console.log(`   Current users with this role: ${roleToAssign._count.users}`)

    // Check if user already has this role
    const hasRole = user.roles.some(ur => ur.roleId === roleToAssign.id)

    if (hasRole) {
      console.log(`ℹ️  User already has ${ROLE_TO_ASSIGN} role`)
      console.log('\n📊 Current user roles:')
      user.roles.forEach(ur => {
        console.log(`  - ${ur.role.name}`)
      })
      return
    }

    // Assign the role
    console.log(`➕ Assigning ${ROLE_TO_ASSIGN} role...`)
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleToAssign.id
      }
    })

    console.log(`✅ ${ROLE_TO_ASSIGN} role assigned successfully!`)

    // Show current user roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: USER_ID },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: true
              }
            }
          }
        }
      }
    })

    console.log('\n📊 User roles after assignment:')
    updatedUser?.roles.forEach(ur => {
      console.log(`  - ${ur.role.name} (${ur.role.permissions.length} permissions)`)
    })

    // Show permissions info
    if (ROLE_TO_ASSIGN === SystemRole.DIRECTOR) {
      console.log('\n🎉 Done! User now has FULL ADMIN access:')
      console.log('  ✅ All user management (create, read, update, delete)')
      console.log('  ✅ All role management (create, update, delete, assign)')
      console.log('  ✅ All system permissions')
      console.log(`  ✅ Total: ${roleToAssign.permissions.length} permissions`)
    } else if (ROLE_TO_ASSIGN === SystemRole.ADMIN) {
      console.log('\n🎉 Done! User now has Admin access:')
      console.log('  ✅ Most user management (read, update)')
      console.log('  ⚠️  Cannot manage roles (create, update, delete, assign)')
      console.log('  ✅ Most system features')
      console.log(`  ✅ Total: ${roleToAssign.permissions.length} permissions`)
      console.log('\n💡 Tip: To grant FULL admin access, change ROLE_TO_ASSIGN to SystemRole.DIRECTOR')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

assignAdminRole().finally(() => {
  prisma.$disconnect()
})
