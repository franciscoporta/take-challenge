import { Module } from "@nestjs/common";
import { PokemonController } from "./pokemon.controller";
import { PokemonService } from "./pokemon.service";
import { HttpModule } from "@nestjs/axios";
import { PokeApiClient } from "src/external/pokeapi/pokeapi.client";

@Module({
  imports: [HttpModule],
  controllers: [PokemonController],
  providers: [PokemonService, PokeApiClient],
})
export class PokemonModule {}
