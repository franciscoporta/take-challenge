import { INestApplication, VersioningType } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
import { User } from "src/users/user.entity";
import { UsersController } from "src/users/users.controller";
import { UsersService } from "src/users/users.service";
import request from "supertest";

describe("AuthGuard", () => {
  let app: INestApplication;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockRickAndMorty = {
    getRickDetailsById: jest.fn().mockResolvedValue([]),
  };

  let mockJwtService: { verifyAsync: jest.Mock };

  beforeAll(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: mockJwtService,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /v1/users/:id is protected by AuthGuard
  describe("Request sin token", () => {
    it("deberia retornar 401 cuando no hay header Authorization", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, name: "Test", rickIds: [] });

      const response = await request(app.getHttpServer())
        .get("/v1/users/1")
        .expect(401);

      expect(response.body.message).toBe("No estas autorizado");
    });
  });

  describe("Request con token invalido", () => {
    it("deberia retornar 401 cuando el token es invalido", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("invalid token"));

      const response = await request(app.getHttpServer())
        .get("/v1/users/1")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.message).toBe("No estas autorizado");
    });
  });

  describe("Request con token expirado", () => {
    it("deberia retornar 401 cuando el token esta expirado", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("jwt expired"));

      const response = await request(app.getHttpServer())
        .get("/v1/users/1")
        .set("Authorization", "Bearer expired-token")
        .expect(401);

      expect(response.body.message).toBe("No estas autorizado");
    });
  });

  describe("Request con token valido", () => {
    it("deberia permitir el acceso con un token valido", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        email: "test@test.com",
      });

      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        name: "Test",
        rickIds: [1],
      });

      mockRickAndMorty.getRickDetailsById.mockResolvedValue([
        { name: "Rick", species: "Human" },
      ]);

      const response = await request(app.getHttpServer())
        .get("/v1/users/1")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toHaveProperty("name", "Test");
    });
  });

  describe("Request con Authorization header mal formado", () => {
    it("deberia retornar 401 cuando el tipo no es Bearer", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/users/1")
        .set("Authorization", "Basic some-token")
        .expect(401);

      expect(response.body.message).toBe("No estas autorizado");
    });
  });
});
