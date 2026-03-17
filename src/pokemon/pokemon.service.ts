import { Injectable } from "@nestjs/common";
import { PokeApiClient } from "src/external/pokeapi/pokeapi.client";

@Injectable()
export class PokemonService {
  constructor(private readonly pokeApi: PokeApiClient) {}

  async findAll() {
    const pokemon = await this.pokeApi.getPokemon();
    return pokemon;
  }
}
