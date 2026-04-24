import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1774000000000 implements MigrationInterface {
    name = 'CreateUserTable1774000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "surname",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "age",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "rickIds",
                        type: "json",
                        isNullable: false,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }
}
