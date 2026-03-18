import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @ApiProperty({ description: "ID del usuario", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "Nombre del usuario", example: "Juan" })
  @Column()
  name: string;

  @ApiProperty({ description: "Apellido del usuario", example: "Pérez" })
  @Column()
  surname: string;

  @ApiProperty({ description: "Edad del usuario", example: 25 })
  @Column()
  age: number;

  @ApiProperty({ description: "Ids de los rick", example: 1 })
  @Column("json")
  rickIds: number[];
}
