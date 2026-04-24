import { INestApplication, VersioningType } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
import { User } from "src/users/user.entity";
import { UsersController } from "src/users/users.controller";
import { UsersService } from "src/users/users.service";
import request from "supertest";

describe("GET /v1/users/id", () => {
  //1er paso del mocking
  let app: INestApplication; //Creo mi backend en memoria para que supertest pueda enviar request http

  //PASO 2 -> Mockeo todo lo que sea externo a mi backend(base de datos(Repository), rickAndMorty)
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRickAndMorty = {
    getRickDetailsById: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({
              sub: 1,
              email: "test@test.com",
            }),
          },
        },
        {
          provide: RickApiClient,
          useValue: mockRickAndMorty,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // PASO 3: Limpiar mocks despues de cada test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Forma correcta de traer un usuario", () => {
    it("Traigo un usuario con un rick", async () => {
      
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        name: "Juan",
        rickIds: [1, 2],
      });

      mockRickAndMorty.getRickDetailsById.mockResolvedValue([
        { id: 1, name: "Rick Sanchez" },
      ]);

      const response = await request(app.getHttpServer())
        .get("/v1/users/3")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        name: "Juan",
        rickIds: [1, 2],
        rick: [{ id: 1, name: "Rick Sanchez" }],
      });
    });
  });

  describe("Errores al traer un usuario", () => {
    it("Intento buscar un usuario con un id erroneo", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/users/asd")
        .set("Authorization", "Bearer fake-token")
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Validation failed (numeric string is expected)",
      );
    });
  });
});
