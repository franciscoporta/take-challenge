import { Controller, Get } from "@nestjs/common";
import { PokemonService } from "./pokemon.service";

@Controller({ path: "pokemon" })
export class PokemonController {
  xg;
  constructor(private pokemonService: PokemonService) {}
  @Get("")
  findAll() {
    return this.pokemonService.findAll();
  }
}
