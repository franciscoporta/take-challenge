import { HttpService } from "@nestjs/axios";
export declare class PokeApiClient {
    private readonly http;
    constructor(http: HttpService);
    getPokemon(): Promise<any>;
}
