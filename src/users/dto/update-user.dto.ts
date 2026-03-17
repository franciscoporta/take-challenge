import { ApiPropertyOptional } from "@nestjs/swagger";

export class updateUserDto {
  @ApiPropertyOptional({ description: "Nombre del usuario", example: "Juan" })
  name?: string;

  @ApiPropertyOptional({
    description: "Apellido del usuario",
    example: "Pérez",
  })
  surname?: string;

  @ApiPropertyOptional({ description: "Edad del usuario", example: 30 })
  age?: number;

  @ApiPropertyOptional({ description: "Id del pokemon", example: 1 })
  pokemonIds?: number[];
}
