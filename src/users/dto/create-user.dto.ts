import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class createUserDto {
  @ApiProperty({ description: "Nombre del usuario", example: "Juan" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Email del usuario", example: "email@gmail.com" })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Password del usuario", example: "password" })
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message:
      "La contraseña debe tener al menos una mayúscula, una minúscula y un número",
  })
  password: string;

  @ApiProperty({ description: "Apellido del usuario", example: "Pérez" })
  @IsString()
  surname: string;

  @ApiProperty({ description: "Edad del usuario", example: 25 })
  @IsNumber()
  age: number;

  @ApiProperty({ description: "Ids de rick", example: 1 })
  @IsNumber({}, { each: true })
  rickIds: number[];
}
