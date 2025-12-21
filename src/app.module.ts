import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import { EmailConfirmationModule } from './auth/email-confirmation/email-confirmation.module'
import { ProviderModule } from './auth/provider/provider.module'
import { CategoriesModule } from './categories/categories.module'
import { CounterpartiesModule } from './counterparties/counterparties.module'
import { HealthModule } from './health/health.module'
import { InventoriesModule } from './inventories/inventories.module'
import { IS_DEV_ENV } from './libs/common/utils/is-dev.utils'
import { MailModule } from './libs/mail/mail.module'
import { RbacModule } from './libs/rbac'
import { MaterialItemsModule } from './material-items/material-items.module'
import { MaterialsModule } from './materials/materials.module'
import { MetalBrandsModule } from './metal-brands/metal-brands.module'
import { OrderRequestsModule } from './order-requests/order-requests.module'
import { OrderTypesModule } from './order-types/order-types.module'
import { PlanRecordsModule } from './plan-records/plan-records.module'
import { PriceListsModule } from './price-lists/price-lists.module'
import { PrismaModule } from './prisma/prisma.module'
import { PurchaseItemsModule } from './purchase-items/purchase-items.module'
import { PurchasesModule } from './purchases/purchases.module'
import { RoleModule } from './role/role.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { TaskTypesModule } from './task-types/task-types.module'
import { TasksModule } from './tasks/tasks.module'
import { UserModule } from './user/user.module'
import { WriteOffsModule } from './write-offs/write-offs.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV
    }),
    PrismaModule,
    RbacModule,
    AuthModule,
    UserModule,
    AdminModule,
    CounterpartiesModule,
    RoleModule,
    HealthModule,
    ProviderModule,
    MailModule,
    EmailConfirmationModule,
    // CRM Modules
    OrderTypesModule,
    OrderRequestsModule,
    CategoriesModule,
    MetalBrandsModule,
    PlanRecordsModule,
    TaskTypesModule,
    TasksModule,
    // Materials Management Modules
    MaterialItemsModule,
    MaterialsModule,
    SuppliersModule,
    PurchasesModule,
    PurchaseItemsModule,
    InventoriesModule,
    WriteOffsModule,
    PriceListsModule
  ]
})
export class AppModule {}
