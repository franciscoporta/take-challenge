import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";
import { UsersService } from "src/users/users.service";
import * as bcryptjs from "bcryptjs";
import { UserLoginDto } from "./dto/login-user.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userRegister: RegisterUserDto) {
    const findUserByEmail = await this.userService.findOneByEmail(
      userRegister.email,
    );

    if (findUserByEmail) throw new BadRequestException("User already exists");

    const hashedPassword = await bcryptjs.hash(userRegister.password, 10);

    const userToCreate = {
      ...userRegister,
      password: hashedPassword,
    };

    return await this.userService.create(userToCreate);
  }

  async login({ email, password }: UserLoginDto) {
    const findUserByEmail = await this.userService.findOneByEmail(email);

    if (!findUserByEmail)
      throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await bcryptjs.compare(
      password,
      findUserByEmail.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    //Se crea el JWT -> Token
    //Que datos van a viajar en el token
    const payload = { email: findUserByEmail.email };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
