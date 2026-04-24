import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI, // 👈 tipo de versionado
  });
  app.enableCors();
  //START CLASS-VALIDATOR
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  //END CLASS-VALIDATOR
  //START SWAGGER
  const config = new DocumentBuilder()
    .setTitle("Users Api")
    .setDescription("The users API description")
    .setVersion("1.0")
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);
  //END SWAGGER

  await app.listen(process.env.PORT ?? 3010);
}
void bootstrap();
