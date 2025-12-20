import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { RedisStore } from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import IORedis from 'ioredis'

import { AppModule } from '@/app.module'
import { ms, StringValue } from '@/libs/common/utils/ms.util'
import { parseBoolean } from '@/libs/common/utils/parse-boolean.util'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = app.get(ConfigService)
  const redis = new IORedis(config.getOrThrow('REDIS_URI'))

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax'
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER')
      })
    })
  )

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Metal Backend API')
    .setDescription(
      'Enterprise NestJS backend with RBAC, session-based authentication, and comprehensive user management'
    )
    .setVersion('1.0')
    .addCookieAuth('session')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('roles', 'Role-based access control endpoints')
    .addTag(
      'counterparties',
      'Counterparties (Kontrahenty) management endpoints'
    )
    .addTag('health', 'Health check endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
