import { Test, TestingModule } from "@nestjs/testing";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { AxiosResponse, AxiosHeaders } from "axios";

describe("RickApiClient", () => {
  let rickApiClient: RickApiClient;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue("https://rickandmortyapi.com/api/character"),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RickApiClient,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    rickApiClient = module.get<RickApiClient>(RickApiClient);
    httpService = module.get<HttpService>(HttpService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  describe("getRick", () => {
    it("deberia retornar los resultados de la API", async () => {
      const mockResults = [
        { id: 1, name: "Rick Sanchez" },
        { id: 2, name: "Morty Smith" },
      ];

      mockHttpService.get.mockReturnValue(
        of(createAxiosResponse({ results: mockResults })),
      );

      const result = await rickApiClient.getRick();

      expect(result).toEqual(mockResults);
    });

    it("deberia retornar el error cuando la API falla", async () => {
      const error = new Error("API Error");
      mockHttpService.get.mockReturnValue(throwError(() => error));

      const result = await rickApiClient.getRick();

      expect(result).toEqual(error);
    });
  });

  describe("getRickById", () => {
    it("deberia retornar un personaje por id", async () => {
      const mockCharacter = { id: 1, name: "Rick Sanchez", species: "Human" };

      mockHttpService.get.mockReturnValue(
        of(createAxiosResponse(mockCharacter)),
      );

      const result = await rickApiClient.getRickById(1);

      expect(result).toEqual(mockCharacter);
    });

    it("deberia propagar el error cuando la API falla", async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error("Not found")),
      );

      await expect(rickApiClient.getRickById(999)).rejects.toThrow("Not found");
    });
  });

  describe("getRickDetailsById", () => {
    it("deberia retornar array vacio cuando no hay ids", async () => {
      const result = await rickApiClient.getRickDetailsById([]);
      expect(result).toEqual([]);
    });

    it("deberia retornar array vacio cuando ids es undefined", async () => {
      const result = await rickApiClient.getRickDetailsById(
        undefined as unknown as number[],
      );
      expect(result).toEqual([]);
    });

    it("deberia retornar name y species de cada personaje", async () => {
      const char1 = { id: 1, name: "Rick Sanchez", species: "Human", status: "Alive" };
      const char2 = { id: 2, name: "Morty Smith", species: "Human", status: "Alive" };

      mockHttpService.get
        .mockReturnValueOnce(of(createAxiosResponse(char1)))
        .mockReturnValueOnce(of(createAxiosResponse(char2)));

      const result = await rickApiClient.getRickDetailsById([1, 2]);

      expect(result).toEqual([
        { name: "Rick Sanchez", species: "Human" },
        { name: "Morty Smith", species: "Human" },
      ]);
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
