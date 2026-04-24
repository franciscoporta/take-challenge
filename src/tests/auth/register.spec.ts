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

describe("Integration test register", () => {
  //Paso 1: mockear el backend con el app
  let app: INestApplication;

  //Paso 2: mockear todo lo que sea externo
  //Arranco a verificar todo lo que voy a necesitar de las funciones creadas hacia mi base de datos y lugares externos
  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRickAndMorty = {
    getRickDetailsById: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("fake-token"),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 1 }),
  };
  //SETUP DE TESTING 
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
  
  describe("Me registro bien", () => {
    it("Register Succesfull", async () => {
      const userRegister = {
        name: "Francisco",
        surname: "Porta",
        email: "pedritoelpistolero@gmail.com",
        password: "pedritoelpistolero",
        rickIds: [1],
        age: 0,
      };

      // 1. Simulo que el email NO existe en la DB
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // 2. Simulo que repository.create() devuelve el objeto
      //    (create es sync — solo arma el objeto, no toca la DB)
      mockUserRepository.create.mockReturnValue(userRegister);

      // 3. Simulo que repository.save() guarda y devuelve el usuario con un id
      mockUserRepository.save.mockResolvedValue({ id: 1, ...userRegister });

      // 4. Hago el POST real con supertest
      const response = await request(app.getHttpServer())
        .post("/auth/register") // <-- la ruta de tu controller
        .send(userRegister) // <-- el body del POST (como si fuera Postman)
        .expect(201); // <-- espero status 201

      // 5. Verifico que la respuesta tenga el usuario creado
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body.email).toBe("pedritoelpistolero@gmail.com");
    });
  });

  describe("Error al registrarse", () => {
    it("Registro de un email ya usado", async () => {
      const userRegister = {
        name: "Francisco",
        surname: "Porta",
        email: "pedritoelpistolero@gmail.com",
        password: "pedritoelpistolero",
        rickIds: [1],
        age: 10,
      };

      mockUserRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: "pedritoelpistolero@gmail.com",
      });

      // 4. Hago el POST real con supertest
      const response = await request(app.getHttpServer())
        .post("/auth/register") // <-- la ruta de tu controller
        .send(userRegister) // <-- el body del POST (como si fuera Postman)
        .expect(400); // <-- espero status 400

      expect(response.body.message).toBe("User already exists");
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
