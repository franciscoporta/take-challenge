import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, VersioningType } from "@nestjs/common";
import request from "supertest";
import { UsersController } from "../../users/users.controller";
import { UsersService } from "../../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/users/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("GET /v1/users", () => {
  let app: INestApplication;

  // Mock del UsersService — no toca la DB
  const mockUsersService = {
    findAll: jest.fn(),
  };

  const mockUserRepository = {
    save: jest.fn(),
  };

  //Se ejecuta una vez antes de todos los test del describe
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService, // inyectamos el mock en vez del service real
        },
        {
          provide: JwtService,
          useValue: {}, // mock vacío, el GET /v1/users no usa auth
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();
  });

  //Se ejecuta UNA VEZ despues de todos los test
  afterAll(async () => {
    await app.close();
  });

  //Se ejecuta despues de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful get users", () => {
    it("debería retornar un array vacío cuando no hay usuarios", async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      return await request(app.getHttpServer())
        .get("/v1/users")
        .expect(200)
        .expect([]);
    });

    it("debería retornar los usuarios", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "test@test.com",
          name: "Juan",
          surname: "Perez",
          age: 25,
          rickIds: [1, 2],
        },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const response = await request(app.getHttpServer())
        .get("/v1/users")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
