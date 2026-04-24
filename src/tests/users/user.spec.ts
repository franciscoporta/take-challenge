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
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

  describe("GET - Forma correcta de traer un usuario", () => {
    it("debería retornar un array vacío cuando no hay usuarios", async () => {
      mockUserRepository.find.mockResolvedValue([]);

      return await request(app.getHttpServer())
        .get("/v1/users")
        .expect(200)
        .expect([]);
    });

    it("Tiene que retornar todos los usuarios creados", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "test@test.com",
          name: "Juan",
          surname: "Perez",
          age: 25,
          rickIds: [1, 2],
        },
        {
          id: 2,
          email: "test2@test.com",
          name: "Juan",
          surname: "Perez",
          age: 25,
          rickIds: [1, 2],
        },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      return await request(app.getHttpServer())
        .get("/v1/users")
        .expect(200)
        .expect(mockUsers);
    });

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

  describe("PATCH - Actualizar un usuario", () => {
    it("Deberia actualizar al usuario", async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      const response = await request(app.getHttpServer())
        .patch("/v1/users/1")
        .send({ name: "Francisco" })
        .expect(200);

      expect(response.body).toEqual({ affected: 1 });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        name: "Francisco",
      });
    });

    it("Deberia actualizar con body vacio", async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });
      const response = await request(app.getHttpServer())
        .patch("/v1/users/1")
        .send({})
        .expect(200);

      expect(response.body).toEqual({ affected: 0 });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {});
    });

    it("Deberia manejar un id invalido en patch", async () => {
      const response = await request(app.getHttpServer())
        .patch("/v1/users/asd")
        .send({ name: "Francisco" })
        .expect(200);

      expect(mockUserRepository.update).toHaveBeenCalledWith(NaN, {
        name: "Francisco",
      });
    });

    it("Deberia retornarme affected 0 cuando no existe ninguno", async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });
      const response = await request(app.getHttpServer())
        .patch("/v1/users/1")
        .send({ name: "Francisco" })
        .expect(200);

      expect(response.body).toEqual({ affected: 0 });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        name: "Francisco",
      });
    });
  });

  describe("Delete - Eliminar un usuario", () => {
    it("Deberia retornar affected 0 cuando no existe el usuario", async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      const response = await request(app.getHttpServer())
        .delete("/v1/users/12")
        .expect(200);

      expect(response.body).toEqual({ affected: 0 });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(12);
    });

    it("Deberia eliminar un usuario existente", async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const response = await request(app.getHttpServer())
        .delete("/v1/users/1")
        .expect(200);

      expect(response.body).toEqual({ affected: 1 });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it("Deberia manejar un id invalido", async () => {
      const response = await request(app.getHttpServer())
        .delete("/v1/users/asd")
        .expect(200);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(NaN);
    });
  });
});
