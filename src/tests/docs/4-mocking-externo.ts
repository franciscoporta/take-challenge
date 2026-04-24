// ============================================
// MOCKING - Como mockear informacion externa al backend
// ============================================
//
// ¿Que es un mock?
// Un mock es un REEMPLAZO FALSO de una dependencia real.
// En vez de que tu test llame a la base de datos real o a la
// Rick and Morty API real, le das datos inventados que vos controlas.
//
// ¿Por que mockear?
// 1. VELOCIDAD: No esperas a que una API externa responda
// 2. INDEPENDENCIA: No necesitas MySQL corriendo, ni internet
// 3. CONTROL: Podés simular errores (API caida, timeout, etc.)
// 4. PREDECIBILIDAD: Los datos siempre son los mismos, no cambian
//
// ¿Que se mockea?
// Todo lo que esta AFUERA de lo que estás testeando:
//   - Testeas el controller? -> Mockeas el service
//   - Testeas el service?    -> Mockeas el repository (DB) y API clients
//   - Testeas el API client? -> Mockeas HttpService (las llamadas HTTP)
//
// La regla es: mockea la capa INMEDIATAMENTE debajo.

// ============================================
// 1. MOCKEAR UN SERVICE COMPLETO
// ============================================
// Esto es lo que hicimos en get-users.test.ts.
// El controller depende de UsersService, asi que lo reemplazamos
// por un objeto falso con jest.fn().

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, VersioningType } from "@nestjs/common";
import request from "supertest";
import { UsersController } from "../../users/users.controller";
import { UsersService } from "../../users/users.service";
import { JwtService } from "@nestjs/jwt";

describe("Ejemplo 1: Mock de un service", () => {
  let app: INestApplication; //app es tu backend levantado en memoria para que supertest pueda enviarle requests HTTP reales sin necesitar un servidor corriendo en un puerto. Es el puente entre tus tests y tus controllers/routes.

  // PASO 1: Crear el objeto mock.
  // Tiene las MISMAS funciones que UsersService pero son jest.fn().
  // jest.fn() es una funcion "vacia" que registra como fue llamada
  // y retorna lo que vos le configures.
  const mockUsersService = {
    findAll: jest.fn(), // reemplaza a usersService.findAll()
    findById: jest.fn(), // reemplaza a usersService.findById()
    create: jest.fn(), // reemplaza a usersService.create()
    update: jest.fn(), // reemplaza a usersService.update()
    delete: jest.fn(), // reemplaza a usersService.delete()
  };

  // PASO 2: Crear el modulo de test con el mock inyectado.
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Registramos el controller REAL (es lo que estamos testeando)
      controllers: [UsersController],
      providers: [
        // AQUI ESTA LA MAGIA DEL MOCK:
        // En NestJS normal, cuando el controller pide "UsersService",
        // Nest le da una instancia del service real (con DB, etc).
        //
        // Con provide/useValue le decimos:
        // "Cuando alguien pida UsersService, dale mockUsersService"
        //
        // Asi el controller recibe nuestro objeto falso en vez del real.
        // El controller no sabe la diferencia porque tiene los mismos metodos.
        {
          provide: UsersService, // la "etiqueta" que busca NestJS
          useValue: mockUsersService, // el objeto que le damos en su lugar
        },
        // El AuthGuard necesita JwtService (para validar tokens).
        // Como no estamos testeando auth, le damos un mock vacio.
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
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
  // clearAllMocks borra el historial de llamadas (cuantas veces se llamo, con que args).
  // Asi cada test empieza con un mock "fresco".
  // Sin esto, si test 1 llama findAll una vez, en test 2 toHaveBeenCalledTimes
  // diria 2 en vez de 1.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // PASO 4: En cada test, configurar que retorna el mock y verificar.
  it("mock retornando datos exitosos", async () => {
    // mockResolvedValue dice: "cuando llamen a findAll(), retorna esta promesa resuelta"
    // Es como si la base de datos tuviera este usuario.
    mockUsersService.findAll.mockResolvedValue([
      { id: 1, name: "Juan", email: "juan@test.com" },
    ]);

    // Hacemos el request HTTP real contra la app
    const response = await request(app.getHttpServer())
      .get("/v1/users")
      .expect(200);

    // Verificamos que la respuesta sea la correcta
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Juan");

    // Verificamos que el controller llamo al service
    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
  });

  it("mock retornando un array vacio", async () => {
    // Cada test configura su propio mockResolvedValue.
    // Este simula que no hay usuarios en la DB.
    mockUsersService.findAll.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get("/v1/users")
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it("mock simulando un error del service", async () => {
    // mockRejectedValue simula que la promesa FALLO.
    // Es como si la base de datos se hubiera caido.
    mockUsersService.findAll.mockRejectedValue(new Error("DB connection lost"));

    // Cuando el service falla, NestJS devuelve 500 (Internal Server Error)
    const response = await request(app.getHttpServer())
      .get("/v1/users")
      .expect(500);

    // Esto te permite testear: "¿que pasa si la DB se cae?"
    // Sin mockear, tendrias que desconectar MySQL para probar esto.
  });

  // FLUJO COMPLETO DE LO QUE PASA:
  //
  //  1. supertest envia GET /v1/users
  //  2. NestJS recibe el request y lo rutea a UsersController.findAll()
  //  3. El controller llama a this.usersService.findAll()
  //  4. PERO usersService es nuestro MOCK, no el service real
  //  5. El mock retorna lo que configuramos con mockResolvedValue
  //  6. El controller devuelve eso como respuesta HTTP
  //  7. supertest recibe la respuesta
  //  8. Verificamos con expect()
  //
  // En ningun momento se toco la base de datos ni se hizo un HTTP real.
});

// ============================================
// 2. MOCKEAR UNA API EXTERNA (ej: Rick and Morty API)
// ============================================
// Tu backend llama a la Rick and Morty API a traves de RickApiClient.
// Si no lo mockeas, tus tests van a:
//   - Fallar si no tenés internet
//   - Ser lentos (esperar la respuesta HTTP)
//   - Dar resultados diferentes si la API cambia sus datos
//
// Tenés DOS opciones para mockearlo:

// ---- OPCION A: Mockear el client entero (RECOMENDADA) ----
// Igual que con el service: reemplazas RickApiClient por un mock.
// Es lo mas simple y directo.

import { RickApiClient } from "../../external/rickapi/rickapi.client";

describe("Ejemplo 2A: Mock del API client entero", () => {
  // Creamos un mock con los mismos metodos que RickApiClient
  const mockRickClient = {
    getRick: jest.fn(),
    getRickById: jest.fn(),
    getRickDetailsById: jest.fn(),
  };

  // En el modulo de test lo registras asi:
  // providers: [
  //   UsersService,  // el service REAL (es lo que queres testear)
  //   { provide: RickApiClient, useValue: mockRickClient },  // el client FALSO
  //   { provide: getRepositoryToken(User), useValue: mockUserRepo }, // la DB FALSA
  // ]

  it("simular respuesta exitosa de la API externa", () => {
    // Configuramos que retorna cuando el service llama a getRickDetailsById
    mockRickClient.getRickDetailsById.mockResolvedValue([
      { id: 1, name: "Rick Sanchez", status: "Alive" },
      { id: 2, name: "Morty Smith", status: "Alive" },
    ]);

    // Ahora cuando UsersService.findById() llame a:
    //   this.rickClient.getRickDetailsById([1, 2])
    // Va a recibir estos datos falsos en vez de hacer un HTTP a la API.
  });

  it("simular que la API externa esta caida", () => {
    mockRickClient.getRickDetailsById.mockRejectedValue(
      new Error("API timeout"),
    );

    // Esto te permite testear:
    // "¿Que hace mi backend si la Rick and Morty API no responde?"
    // ¿Retorna un error 500? ¿Retorna el usuario sin los datos de Rick?
    // Sin mockear, tendrias que esperar que la API se caiga de verdad.
  });

  it("simular respuesta vacia", () => {
    mockRickClient.getRickDetailsById.mockResolvedValue([]);
    // Testeas: ¿que pasa si el usuario tiene rickIds pero la API no devuelve nada?
  });

  it("verificar que se llamo con los IDs correctos", () => {
    // Despues de hacer el request, podes verificar que el service
    // le paso los IDs correctos al client:
    // expect(mockRickClient.getRickDetailsById).toHaveBeenCalledWith([1, 2, 3]);
    //
    // Esto verifica la INTEGRACION entre el service y el client:
    // "El service lee user.rickIds y se los pasa al client correctamente"
  });
});

// ---- OPCION B: Mockear HttpService (nivel HTTP) ----
// Mas granular: usas el RickApiClient REAL pero mockeas las llamadas HTTP.
// Util si queres verificar que el client construye bien las URLs,
// parsea la respuesta correctamente, etc.

import { HttpService } from "@nestjs/axios";
import { of, throwError } from "rxjs";

describe("Ejemplo 2B: Mock de HttpService", () => {
  const mockHttpService = {
    get: jest.fn(), // mockea http.get()
    post: jest.fn(), // mockea http.post()
  };

  // En el modulo de test:
  // providers: [
  //   RickApiClient,  // el client REAL
  //   { provide: HttpService, useValue: mockHttpService },  // HTTP FALSO
  // ]
  //
  // Asi RickApiClient es real, pero cuando hace http.get("url"),
  // en vez de hacer un request HTTP verdadero, usa nuestro mock.

  it("simular una respuesta HTTP exitosa", () => {
    // HttpService de NestJS usa OBSERVABLES (de rxjs), no Promises.
    // Observable es como una Promise pero puede emitir multiples valores.
    // En la practica, para HTTP, emite un solo valor (la respuesta).
    //
    // Por eso usamos:
    //   of(valor)  -> crea un Observable que emite ese valor (equivale a Promise.resolve)
    //   throwError -> crea un Observable que falla (equivale a Promise.reject)
    //
    // En vez de mockResolvedValue usamos mockReturnValue + of()
    mockHttpService.get.mockReturnValue(
      of({
        data: { id: 1, name: "Rick Sanchez", status: "Alive" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      }),
    );

    // El objeto simula una respuesta HTTP de Axios:
    //   data       -> el body de la respuesta (lo que devuelve la API)
    //   status     -> el status code (200, 404, etc)
    //   statusText -> "OK", "Not Found", etc
    //   headers    -> los headers de la respuesta
    //   config     -> la config del request original
  });

  it("simular un error HTTP", () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => new Error("Network Error")),
    );
    // Simula que la llamada HTTP fallo (sin internet, timeout, etc)
  });

  it("simular un 404", () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => ({
        response: { status: 404, data: "Not Found" },
      })),
    );
    // Simula que la API devolvio 404 (recurso no existe)
  });
});

// ---- ¿Cual opcion elegir? ----
//
// OPCION A (mockear client entero):
//   ✓ Mas simple
//   ✓ Menos codigo
//   ✓ Ideal para testear el SERVICE (no te importa como el client hace el HTTP)
//
// OPCION B (mockear HttpService):
//   ✓ Mas granular
//   ✓ Testeas que el client construye bien URLs y parsea respuestas
//   ✓ Ideal para testear el CLIENT en si
//
// En la mayoria de los casos, la OPCION A es suficiente.

// ============================================
// 3. MOCKEAR JWT / AUTENTICACION
// ============================================
// Tu endpoint GET /v1/users/:id tiene @UseGuards(AuthGuard).
// El AuthGuard lee el header Authorization, extrae el token JWT,
// y llama a jwtService.verifyAsync(token) para validarlo.
//
// En tests, no queres generar tokens JWT reales.
// Mockeas JwtService para controlar si el token es "valido" o no.

describe("Ejemplo 3: Mock de autenticacion", () => {
  const mockJwtService = {
    // verifyAsync es el metodo que usa tu AuthGuard para validar tokens.
    // Si retorna un objeto -> token valido -> el request pasa.
    // Si tira error -> token invalido -> el request es rechazado con 401.
    verifyAsync: jest.fn(),
  };

  // En el modulo de test:
  // providers: [
  //   { provide: JwtService, useValue: mockJwtService },
  // ]

  it("simular un usuario autenticado (token valido)", async () => {
    // Cuando el guard llame a jwtService.verifyAsync(token),
    // le devolvemos los datos del usuario como si el token fuera real.
    // Estos son los datos que tu AuthGuard guarda en el request.
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 1, // el ID del usuario (subject del JWT)
      email: "juan@test.com", // el email del usuario
    });

    // Ahora podemos hacer requests a endpoints protegidos.
    // El token puede ser cualquier string porque el mock no lo valida:
    // await request(app.getHttpServer())
    //   .get("/v1/users/1")
    //   .set("Authorization", "Bearer cualquier-string-sirve")
    //   .expect(200);

    // IMPORTANTE: aunque el token es falso, TENES que mandarlo
    // en el header. Si no mandas el header Authorization,
    // el guard ni siquiera intenta verificar y rechaza directo.
  });

  it("simular token invalido (usuario no autenticado)", async () => {
    // Si verifyAsync tira un error, el guard lo interpreta como
    // "token invalido" y responde con 401 Unauthorized.
    mockJwtService.verifyAsync.mockRejectedValue(new Error("Invalid token"));

    // El request va a ser rechazado:
    // await request(app.getHttpServer())
    //   .get("/v1/users/1")
    //   .set("Authorization", "Bearer token-invalido")
    //   .expect(401);

    // Esto te permite testear: "¿Mi endpoint rechaza correctamente
    // a usuarios no autenticados?"
  });

  it("simular request sin token", async () => {
    // Si no mandas el header Authorization, el guard no encuentra token.
    // Dependiendo de como esta implementado, puede:
    //   - Tirar 401 directamente (sin llamar a verifyAsync)
    //   - Tirar un error al intentar extraer el token del header
    // await request(app.getHttpServer())
    //   .get("/v1/users/1")
    //   // NO seteamos Authorization
    //   .expect(401);
  });
});

// ============================================
// 4. MOCKEAR EL REPOSITORY (TypeORM / Base de datos)
// ============================================
// Si queres testear el SERVICE (no el controller), necesitas
// mockear el Repository de TypeORM. Asi no tocas la DB.

// import { getRepositoryToken } from "@nestjs/typeorm";
// import { User } from "../../users/user.entity";

describe("Ejemplo 4: Mock del Repository (DB)", () => {
  // Creamos un mock con los mismos metodos que Repository<User>
  const mockUserRepository = {
    find: jest.fn(), // SELECT * FROM users
    findOne: jest.fn(), // SELECT * FROM users WHERE ...
    findOneBy: jest.fn(), // SELECT * FROM users WHERE ...
    save: jest.fn(), // INSERT INTO users ...
    create: jest.fn(), // Crea la instancia (sin guardar)
    update: jest.fn(), // UPDATE users SET ... WHERE ...
    delete: jest.fn(), // DELETE FROM users WHERE ...
  };

  // En el modulo de test:
  // providers: [
  //   UsersService,  // el service REAL
  //   {
  //     provide: getRepositoryToken(User),   // <-- el token del repository
  //     useValue: mockUserRepository,
  //   },
  //   { provide: RickApiClient, useValue: mockRickClient },
  // ]
  //
  // getRepositoryToken(User) es la forma de NestJS/TypeORM de decir
  // "el repository de la entidad User". Es lo que @InjectRepository(User) usa.

  it("simular find() - buscar todos los usuarios", () => {
    mockUserRepository.find.mockResolvedValue([
      {
        id: 1,
        email: "juan@test.com",
        name: "Juan",
        surname: "Perez",
        age: 25,
        rickIds: [1],
      },
      {
        id: 2,
        email: "ana@test.com",
        name: "Ana",
        surname: "Lopez",
        age: 30,
        rickIds: [2, 3],
      },
    ]);
    // Cuando el service llame a this.userRepository.find(),
    // recibe estos usuarios falsos.
  });

  it("simular findOne() - buscar un usuario por ID", () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: 1,
      email: "juan@test.com",
      name: "Juan",
      surname: "Perez",
      age: 25,
      rickIds: [1],
    });
    // Simula: SELECT * FROM users WHERE id = 1
  });

  it("simular findOne() que no encuentra nada", () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    // Simula: SELECT * FROM users WHERE id = 999 -> no existe
    // Asi testeas: "¿Que pasa si busco un usuario que no existe?"
  });

  it("simular save() - crear un usuario", () => {
    // save() retorna el usuario guardado (con el id generado por la DB)
    mockUserRepository.create.mockReturnValue({
      email: "nuevo@test.com",
      name: "Nuevo",
    });
    mockUserRepository.save.mockResolvedValue({
      id: 3,
      email: "nuevo@test.com",
      name: "Nuevo",
    });
    // create() crea el objeto, save() lo persiste y retorna con id
  });

  it("simular delete()", () => {
    // delete() retorna info sobre la operacion
    mockUserRepository.delete.mockResolvedValue({ affected: 1 });
    // affected: 1 = se borro 1 registro
    // affected: 0 = no se borro nada (no existia)
  });
});

// ============================================
// RESUMEN FINAL
// ============================================
//
// ¿QUE ESTOY TESTEANDO?  ¿QUE MOCKEO?                 ¿COMO?
// ────────────────────    ─────────────                 ──────
// Controller              UsersService                  provide/useValue + jest.fn()
// Controller + Auth       UsersService + JwtService     provide/useValue + jest.fn()
// Service                 Repository + RickApiClient    provide/useValue + jest.fn()
// RickApiClient           HttpService                   provide/useValue + of()/throwError()
//
// PATRON PROVIDE/USEVALUE:
//   {
//     provide: ClaseReal,     // "cuando alguien pida esto..."
//     useValue: objetoMock,   // "...dale esto en su lugar"
//   }
//
// CONFIGURAR EL MOCK EN CADA TEST:
//   mockObj.metodo.mockResolvedValue(datos)   -> simula exito (async)
//   mockObj.metodo.mockRejectedValue(error)   -> simula error (async)
//   mockObj.metodo.mockReturnValue(datos)     -> simula exito (sync)
//
// VERIFICAR EL MOCK:
//   expect(mockObj.metodo).toHaveBeenCalled()              -> fue llamado
//   expect(mockObj.metodo).toHaveBeenCalledTimes(1)        -> fue llamado 1 vez
//   expect(mockObj.metodo).toHaveBeenCalledWith(arg1, arg2) -> fue llamado con estos args
//
// LIMPIAR ENTRE TESTS:
//   afterEach(() => { jest.clearAllMocks(); })
