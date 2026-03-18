"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1773778003370 = void 0;
class Migration1773778003370 {
    constructor() {
        this.name = 'Migration1773778003370';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`pokemonIds\` \`rickIds\` text NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`rickIds\` \`pokemonIds\` text NOT NULL`);
    }
}
exports.Migration1773778003370 = Migration1773778003370;
//# sourceMappingURL=1773778003370-migration.js.map