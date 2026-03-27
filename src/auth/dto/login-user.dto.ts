import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class UserLoginDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "pedritoelpistolero@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "pedritoelpistolero",
  })
  @Transform(({ value }) => value.trim()) //Se ejecuta antes de los demas
  @IsString()
  @MinLength(6)
  password: string;
}
