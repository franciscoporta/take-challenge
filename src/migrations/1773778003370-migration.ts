import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773778003370 implements MigrationInterface {
    name = 'Migration1773778003370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`pokemonIds\` \`rickIds\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`rickIds\` \`pokemonIds\` text NOT NULL`);
    }

}
