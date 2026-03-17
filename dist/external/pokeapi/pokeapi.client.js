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
exports.PokeApiClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PokeApiClient = class PokeApiClient {
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl = this.config.getOrThrow("POKEMON_API_URL");
    }
    async getPokemon() {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(this.baseUrl));
            return data.results;
        }
        catch (error) {
            return error;
        }
    }
    async getPokemonById(id) {
        console.log("id:", id);
        try {
            const data = this.http.get(this.config.getOrThrow(`https://pokeapi.co/api/v2/pokemon-form/${id}`));
            return data;
        }
        catch (error) {
            return error;
        }
    }
};
exports.PokeApiClient = PokeApiClient;
exports.PokeApiClient = PokeApiClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], PokeApiClient);
//# sourceMappingURL=pokeapi.client.js.map