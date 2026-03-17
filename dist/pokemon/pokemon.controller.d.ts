import { PokemonService } from "./pokemon.service";
export declare class PokemonController {
    private pokemonService;
    constructor(pokemonService: PokemonService);
    findAll(): Promise<any>;
}
