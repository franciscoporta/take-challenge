"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class updateUserDto {
}
exports.updateUserDto = updateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nombre del usuario", example: "Juan" }),
    __metadata("design:type", String)
], updateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Apellido del usuario",
        example: "Pérez",
    }),
    __metadata("design:type", String)
], updateUserDto.prototype, "surname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Edad del usuario", example: 30 }),
    __metadata("design:type", Number)
], updateUserDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Id del pokemon", example: 1 }),
    __metadata("design:type", Array)
], updateUserDto.prototype, "pokemonIds", void 0);
//# sourceMappingURL=update-user.dto.js.map