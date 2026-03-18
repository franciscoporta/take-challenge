import { ApiProperty } from "@nestjs/swagger";

export class createUserDto {
  @ApiProperty({ description: "Nombre del usuario", example: "Juan" })
  name: string;

  @ApiProperty({ description: "Apellido del usuario", example: "Pérez" })
  surname: string;

  @ApiProperty({ description: "Edad del usuario", example: 25 })
  age: number;

  @ApiProperty({ description: "Ids de rick", example: 1 })
  rickIds: number[];
}
