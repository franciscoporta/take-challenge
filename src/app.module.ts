import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonModule } from "./pokemon/pokemon.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "",
      database: "take_challenge",
      entities: [__dirname + "/**/*.entity.{ts,js}"],
      migrations: [__dirname + "/migrations/*.{ts,js}"],
      migrationsRun: true,
    }),
    UsersModule,
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
