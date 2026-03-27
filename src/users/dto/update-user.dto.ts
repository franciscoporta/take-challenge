import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class updateUserDto {
  @ApiPropertyOptional({ description: "Nombre del usuario", example: "Juan" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "Apellido del usuario",
    example: "Pérez",
  })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiPropertyOptional({ description: "Edad del usuario", example: 30 })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ description: "Id del rick", example: 1 })
  @IsNumber()
  @IsOptional()
  rickIds?: number[];
}
