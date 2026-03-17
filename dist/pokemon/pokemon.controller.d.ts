import { PokemonService } from "./pokemon.service";
export declare class PokemonController {
    private pokemonService;
    xg: any;
    constructor(pokemonService: PokemonService);
    findAll(): Promise<any>;
}
