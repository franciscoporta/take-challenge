import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //Config Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      //TO-DO: ESTO SE PUEDE EXTRAER
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("HOST_DB"),
        port: configService.get<number>("PORT_DB"),
        username: configService.get<string>("USERNAME_DB"),
        password: configService.get<string>("PASSWORD_DB"),
        database: configService.get<string>("NAME_DATABASE"),
        entities: [__dirname + "/**/*.entity.{ts,js}"],
        migrations: [__dirname + "/migrations/*.{ts,js}"],
        migrationsRun: true,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
