import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserLoginDto } from "./dto/login-user.dto";

@Controller({ path: "auth" })
export class AuthController {
  //Injecto el servicio en el controllador para utilizarlo
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Registrar un usuario" })
  @ApiResponse({ status: 201, description: "Usuario registrado" })
  register(@Body() userRegister: RegisterUserDto) {
    return this.authService.register(userRegister);
  }

  @Post("login")
  @ApiOperation({ summary: "Logear un usuario" })
  @ApiResponse({ status: 201, description: "Usuario logeado" })
  login(@Body() userLogin: UserLoginDto) {
    return this.authService.login(userLogin);
  }
}
