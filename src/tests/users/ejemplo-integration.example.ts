// ============================================
// INTEGRATION TEST - GET /v1/users/:id
// ============================================
//
// DIFERENCIA CON EL TEST DE CONTROLLER (get-user.spec.ts):
//   - En get-user.spec.ts mockeamos el UsersService ENTERO.
//     El service real nunca se ejecuta, solo verificamos que el controller rutea bien.
//
//   - Aca usamos el UsersService REAL. Solo mockeamos lo que esta
//     DEBAJO del service: la base de datos (Repository) y la API externa (RickApiClient).
//     Asi testeamos la logica real del service (los ifs, el spread, etc).
//
// FLUJO:
//   Request HTTP -> Controller REAL -> Service REAL -> Repository MOCK + RickClient MOCK
//

import { getRepositoryToken } from "@nestjs/typeorm";
// getRepositoryToken es una funcion de NestJS/TypeORM.
// Cuando en el service tenes @InjectRepository(User), NestJS internamente
// crea un "token" para identificar ese repository.
// getRepositoryToken(User) te da ese token para que puedas mockearlo.
// Sin esto, no hay forma de decirle a NestJS "reemplaza el repository de User".

import { User } from "src/users/user.entity";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
import { JwtService } from "@nestjs/jwt";
import { UsersController } from "src/users/users.controller";
import { UsersService } from "src/users/users.service";
import { Test } from "@nestjs/testing";
import { INestApplication, VersioningType } from "@nestjs/common";
import request from "supertest";

describe.skip("GET /v1/users/:id - Integration", () => {
  let app: INestApplication;

  // ---- MOCK DE LA BASE DE DATOS ----
  // Este objeto reemplaza al Repository<User> de TypeORM.
  // Tiene los mismos metodos que usa el service internamente:
  //   - this.userRepository.find()     -> mockUserRepository.find
  //   - this.userRepository.findOne()  -> mockUserRepository.findOne
  //   - this.userRepository.findOneBy() -> mockUserRepository.findOneBy
  //
  // Son jest.fn() vacios. En cada test les configuramos que retornar
  // con mockResolvedValue para simular diferentes escenarios de la DB.
  const mockUserRepository = {
    find: jest.fn(), // simula: SELECT * FROM users
    findOne: jest.fn(), // simula: SELECT * FROM users WHERE id = ?
    findOneBy: jest.fn(), // simula: SELECT * FROM users WHERE email = ?
  };

  // ---- MOCK DE LA API EXTERNA (Rick and Morty) ----
  // Este objeto reemplaza al RickApiClient real.
  // Cuando el service haga this.rickClient.getRickDetailsById([1, 2]),
  // en vez de hacer un HTTP a la Rick API, usa esta funcion falsa.
  const mockRickClient = {
    getRickDetailsById: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController], // Controller REAL (lo que testeamos)
      providers: [
        // ---- SERVICE REAL ----
        // ESTA ES LA DIFERENCIA CLAVE CON get-user.spec.ts
        // Aca NO hacemos { provide: UsersService, useValue: mock }
        // Simplemente ponemos UsersService y NestJS crea una instancia REAL.
        // Toda la logica del service (ifs, spreads, llamadas) se ejecuta de verdad.
        UsersService,

        // ---- MOCK DE LA DB ----
        // getRepositoryToken(User) genera el mismo token que usa @InjectRepository(User)
        // en el constructor del service. Asi NestJS le inyecta nuestro mock
        // en vez de una conexion real a MySQL.
        //
        // Es como decir: "cuando el service pida el Repository<User>, dale mockUserRepository"
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },

        // ---- MOCK DE LA API EXTERNA ----
        // Igual que con la DB: reemplazamos el RickApiClient real por nuestro mock.
        // El service va a llamar a this.rickClient.getRickDetailsById()
        // pero va a ejecutar nuestro jest.fn() en vez de hacer HTTP.
        {
          provide: RickApiClient,
          useValue: mockRickClient,
        },

        // ---- MOCK DE AUTH ----
        // El AuthGuard necesita JwtService para validar tokens.
        // Le damos un mock que siempre aprueba (mockResolvedValue = token valido).
        // Asi no nos bloquea el acceso a los endpoints protegidos.
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ sub: 1 }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();
  });

  // ============================================
  // TEST 1: Usuario encontrado con datos de Rick
  // ============================================
  // Simulamos que la DB tiene un usuario y la Rick API responde.
  // Verificamos que el service REAL hace el spread correctamente
  // y agrega la propiedad "rick" al usuario.
  it.skip("retorna el usuario con datos de Rick", async () => {
    // Configuramos el mock de la DB: cuando el service llame a
    // this.userRepository.findOne({ where: { id: 1 } })
    // va a recibir este usuario falso (como si existiera en MySQL).
    mockUserRepository.findOne.mockResolvedValue({
      id: 1,
      name: "Juan",
      rickIds: [1, 2],
    });

    // Configuramos el mock de la Rick API: cuando el service llame a
    // this.rickClient.getRickDetailsById([1, 2])
    // va a recibir estos personajes (sin hacer HTTP real).
    mockRickClient.getRickDetailsById.mockResolvedValue([
      { id: 1, name: "Rick Sanchez" },
    ]);

    // Hacemos el request HTTP. El flujo REAL que ocurre:
    //
    // 1. supertest envia GET /v1/users/1
    // 2. AuthGuard verifica el token -> mock aprueba -> pasa
    // 3. UsersController.findById(1) se ejecuta
    // 4. El controller llama a this.usersService.findById(1)
    // 5. El SERVICE REAL se ejecuta:
    //    a. id = 1, pasa el if (!id)
    //    b. this.userRepository.findOne({where:{id:1}}) -> recibe {id:1, name:"Juan", rickIds:[1,2]} del MOCK
    //    c. findUser no es null, pasa el if (!findUser)
    //    d. this.rickClient.getRickDetailsById([1,2]) -> recibe [{id:1, name:"Rick Sanchez"}] del MOCK
    //    e. retorna { ...findUser, rick: findRickByUser } -> EL SPREAD REAL SE EJECUTA
    // 6. El controller devuelve ese resultado como respuesta HTTP
    const response = await request(app.getHttpServer())
      .get("/v1/users/1")
      .set("Authorization", "Bearer fake-token")
      .expect(200);

    // Verificamos que el service REALMENTE hizo el spread y agrego "rick".
    // Si alguien rompe el spread en el service, este test FALLA.
    // En el test de controller esto NO pasaria porque el mock devuelve
    // lo que vos le configures, sin ejecutar logica real.
    expect(response.body).toEqual({
      id: 1,
      name: "Juan",
      rickIds: [1, 2],
      rick: [{ id: 1, name: "Rick Sanchez" }],
    });
  });

  // ============================================
  // TEST 2: Usuario no existe en la DB
  // ============================================
  // Simulamos que la DB no encuentra el usuario (findOne retorna null).
  // Verificamos que el service REAL retorna el mensaje correcto
  // y que NO llama a la Rick API (porque no tiene sentido buscar
  // personajes de Rick si el usuario no existe).
  it.skip("retorna mensaje cuando el usuario no existe", async () => {
    // Configuramos el mock de la DB: findOne retorna null
    // (como si hicieramos SELECT * FROM users WHERE id = 999 y no existe)
    mockUserRepository.findOne.mockResolvedValue(null);

    // El flujo REAL que ocurre:
    //
    // 1. supertest envia GET /v1/users/999
    // 2. AuthGuard verifica el token -> mock aprueba -> pasa
    // 3. El SERVICE REAL se ejecuta:
    //    a. id = 999, pasa el if (!id)
    //    b. this.userRepository.findOne({where:{id:999}}) -> recibe NULL del mock
    //    c. if (!findUser) -> ES TRUE -> retorna "No se encontro el usuario o no existe"
    //    d. NUNCA LLEGA a this.rickClient.getRickDetailsById()
    const response = await request(app.getHttpServer())
      .get("/v1/users/999")
      .set("Authorization", "Bearer fake-token")
      .expect(200);

    // Verificamos que el service retorna EXACTAMENTE este string.
    // Este es el string real de la linea 24 de users.service.ts.
    // Si alguien cambia ese mensaje, este test falla.
    // En el test de controller esto NO pasaria porque vos pones el mensaje en el mock.
    expect(response.text).toBe("No se encontro el usuario o no existe");

    // Verificamos que NO se llamo a la Rick API.
    // Esto valida la logica del if: si el usuario no existe,
    // el service no deberia gastar un HTTP buscando personajes.
    expect(mockRickClient.getRickDetailsById).not.toHaveBeenCalled();
  });
});
