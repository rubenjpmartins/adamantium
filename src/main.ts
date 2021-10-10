import { NestFactory } from "@nestjs/core"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { join } from "path"
import "source-map-support/register"
import { ValidationPipe } from "@nestjs/common"
import { LoggingInterceptor } from "./logging.interceptor"
import { NestExpressApplication } from "@nestjs/platform-express"
import { AppModule } from "./app.module"
import { SignerModule } from "./signer/signer.module"
import { EthereumModule } from "./ethereum/ethereum.module"
import { readFileSync } from 'fs'
import * as util from 'util'
import { read } from "fs/promises"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"]
  })

  // app.useGlobalFilters(new ExceptionsFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.setGlobalPrefix("v1")
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  const options = new DocumentBuilder()
    .setTitle("Crypto API")
    .setVersion("0.0.1")
    .addTag("Signer")
    .addTag("Ethereum")
    .setVersion("v1")
    .build()

  const swaggerDocs = SwaggerModule.createDocument(app, options, {
    include: [SignerModule, EthereumModule]
  })

  const themeFile: Buffer = readFileSync('/app/node_modules/swagger-ui-themes/themes/3.x/theme-newspaper.css')
  SwaggerModule.setup("docs", app, swaggerDocs, {
    customCss: themeFile.toString()
  })

  if (process.env.NODE_ENV === "development") {
    app.useStaticAssets(join(__dirname, "..", "documentation"))
  }

  await app.listen(8080)
}
bootstrap()
