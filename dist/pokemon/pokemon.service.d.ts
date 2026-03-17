import { PokeApiClient } from "src/external/pokeapi/pokeapi.client";
export declare class PokemonService {
    private readonly pokeApi;
    constructor(pokeApi: PokeApiClient);
    findAll(): Promise<any>;
}
