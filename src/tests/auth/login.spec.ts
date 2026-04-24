import { INestApplication, VersioningType } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AuthController } from "src/auth/auth.controller";
import { AuthService } from "src/auth/auth.service";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import request from "supertest";
import * as bcryptjs from "bcryptjs";

describe("POST /auth/login", () => {
  let app: INestApplication;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRickAndMorty = {
    getRickDetailsById: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("fake-jwt-token"),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 1 }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RickApiClient,
          useValue: mockRickAndMorty,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
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

  describe("Login exitoso", () => {
    it("deberia retornar un token con credenciales validas", async () => {
      const hashedPassword = await bcryptjs.hash("validpassword", 10);

      mockUserRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: hashedPassword,
        name: "Test",
      });

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "test@test.com", password: "validpassword" })
        .expect(201);

      expect(response.body).toHaveProperty("token", "fake-jwt-token");
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        email: "test@test.com",
      });
    });
  });

  describe("Login fallido", () => {
    it("deberia retornar 401 con email inexistente", async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "noexiste@test.com", password: "validpassword" })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
    });

    it("deberia retornar 401 con password incorrecta", async () => {
      const hashedPassword = await bcryptjs.hash("correctpassword", 10);

      mockUserRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: hashedPassword,
      });

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "test@test.com", password: "wrongpassword" })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
