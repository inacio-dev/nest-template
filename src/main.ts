import compression from '@fastify/compress'
import fastifyCsrf from '@fastify/csrf-protection'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const configService = app.get(ConfigService)
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS').split(',')

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  await app.register(compression as any, { encodings: ['gzip', 'deflate'] })
  await app.register(fastifyCsrf as any)
  await app.listen(3000)
}
bootstrap()
