import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";

import { HttpModule } from "@nestjs/axios";
import { RickApiClient } from "src/external/rickapi/rickapi.client";

@Module({
  //Esto se envia la entidad de USER creada con TypeOrm
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  controllers: [UsersController],
  providers: [UsersService, RickApiClient],
  exports: [UsersService],
})
export class UsersModule {}
