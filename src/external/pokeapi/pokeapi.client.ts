import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PokeApiClient {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}
  baseUrl = this.config.getOrThrow<string>("POKEMON_API_URL");
  // const data = this.http.get(`${baseUrl}/${id}`);
  async getPokemon() {
    try {
      const { data } = await firstValueFrom(this.http.get(this.baseUrl));

      return { data };
    } catch (error) {
      return error;
    }
  }

  async getPokemonById(id) {
    console.log("id:", id);
    try {
      const data = this.http.get(
        this.config.getOrThrow<string>(
          `https://pokeapi.co/api/v2/pokemon-form/${id}`,
        ),
      );
      return data;
    } catch (error) {
      return error;
    }
  }
}
