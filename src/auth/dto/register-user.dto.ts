import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
  @ApiProperty({ description: "Nombre del usuario", example: "Francisco" })
  @Transform(({ value }) => value.trim()) //Se ejecuta antes de los demas
  @IsString()
  @MinLength(3)
  name: string;
  
  @ApiProperty({ description: "Apellido del usuario", example: "Porta" })
  @IsString()
  @MinLength(3)
  surname: string;

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

  @ApiProperty({ description: "Edad del usuario", example: 0 })
  @IsNumber()
  age: number;

  @ApiProperty({ description: "Ids de rick", example: [1] })
  @IsNumber({}, { each: true })
  rickIds: number[];
}
