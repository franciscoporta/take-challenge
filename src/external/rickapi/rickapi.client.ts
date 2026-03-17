import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class RickApiClient {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}
  baseUrl = this.config.getOrThrow<string>("POKEMON_API_URL");

  async getRick() {
    try {
      const { data } = await firstValueFrom(this.http.get(this.baseUrl));

      return data.results;
    } catch (error) {
      return error;
    }
  }
  //Observable(es lo que devuelve this.http.get) → firstValueFrom → Promise → await → data
  async getRickById(id: number) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/${id}`),
    );

    return data;
  }

  async getRickDetailsById(ids: number[]) {
    if (!ids?.length) return [];

    const characters = await Promise.all(ids.map((id) => this.getRickById(id)));

    return characters.map((character) => ({
      name: character.name,
      species: character.species,
    }));
  }
}
