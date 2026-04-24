import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../users/user.entity";

@Module({
  imports: [
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
        entities: [User],
        migrations: [__dirname + "/migrations/*.{ts,js}"],
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
