import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
export declare class PokeApiClient {
    private readonly http;
    private readonly config;
    constructor(http: HttpService, config: ConfigService);
    baseUrl: string;
    getPokemon(): Promise<any>;
    getPokemonById(id: any): Promise<any>;
}
