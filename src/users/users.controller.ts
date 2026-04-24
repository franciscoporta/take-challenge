import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { updateUserDto } from "./dto/update-user.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { User } from "./user.entity";
import { AuthGuard } from "src/auth/guard/auth.guard";

@ApiTags("Users")
@Controller({ path: "users", version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Obtener todos los usuarios" })
  @ApiResponse({ status: 200, description: "Lista de usuarios", type: [User] })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Obtener un usuario por ID" })
  @ApiParam({ name: "id", description: "ID del usuario", example: 1 })
  @ApiResponse({ status: 200, description: "Usuario encontrado", type: User })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un usuario" })
  @ApiParam({ name: "id", description: "ID del usuario", example: 15 })
  @ApiResponse({ status: 200, description: "Usuario actualizado" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  update(@Param("id") id: string, @Body() user: updateUserDto) {
    return this.usersService.update(parseInt(id), user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un usuario" })
  @ApiParam({ name: "id", description: "ID del usuario", example: 1 })
  @ApiResponse({ status: 200, description: "Usuario eliminado" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  delete(@Param("id") id: string) {
    return this.usersService.delete(parseInt(id));
  }
}
