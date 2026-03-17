import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PokeApiClient {
  constructor(private readonly http: HttpService) {}

  async getPokemon() {
    const { data } = await firstValueFrom(
      this.http.get(`https://pokeapi.co/api/v2/pokemon`),
    );

    return data;
  }
}
