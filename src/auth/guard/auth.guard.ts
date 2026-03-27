import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "../constants/jwt.constants";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  //canActive es lo que se va a ejecutar antes de las rutas que esten protegidas
  //Se ejecuta antes de una peticion
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException("No estas autorizado");

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      //Estoy agregandole a la request, algo
      //En esta ocacion, le agrego la key user con el value que viene en payload(el email del usuario logeado)
      //Y es utilizado en el controller con el decorador @Request() req
      request["user"] = payload;
    } catch (error) {
      throw new UnauthorizedException("No estas autorizado");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
