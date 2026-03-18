"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1773778816683 = void 0;
class Migration1773778816683 {
    constructor() {
        this.name = 'Migration1773778816683';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`rickIds\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`rickIds\` json NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`rickIds\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`rickIds\` text NOT NULL`);
    }
}
exports.Migration1773778816683 = Migration1773778816683;
//# sourceMappingURL=1773778816683-migration.js.map