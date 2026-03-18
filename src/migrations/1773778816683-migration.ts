import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773778816683 implements MigrationInterface {
    name = 'Migration1773778816683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`rickIds\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`rickIds\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`rickIds\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`rickIds\` text NOT NULL`);
    }

}
