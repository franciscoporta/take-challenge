// ============================================
// SUPERTEST - FUNDAMENTOS
// ============================================
//
// ¿Que es Supertest?
// Es una libreria que hace requests HTTP contra tu app en el test.
// Es como Postman pero automatizado y dentro del codigo.
//
// ¿Por que no usar fetch o axios?
// Porque supertest se conecta DIRECTO al servidor HTTP de tu app
// sin necesidad de levantar un puerto real. No necesitas hacer
// "npm start" antes de correr los tests. Es mas rapido y aislado.
//
// Flujo de un request con supertest:
//   1. supertest se conecta a app.getHttpServer()
//   2. Envia un request HTTP (GET, POST, etc.)
//   3. El request pasa por el middleware de NestJS, llega al controller
//   4. El controller ejecuta la logica (o el mock)
//   5. Supertest recibe la response y te la devuelve
//
// Es como si un usuario hiciera click en el browser,
// pero automatizado desde el test.

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, VersioningType } from "@nestjs/common";
import request from "supertest";

describe("Supertest - Ejemplos", () => {
  let app!: INestApplication;

  // NOTA: En estos ejemplos asumo que "app" ya esta inicializada.
  // Ver el test real (get-users.test.ts) para el setup completo.

  // ============================================
  // 1. METODOS HTTP
  // ============================================
  // Supertest tiene un metodo para cada verbo HTTP.
  // El argumento es la RUTA del endpoint.

  it("GET request - obtener datos", async () => {
    // GET se usa para LEER datos. No envia body.
    const response = await request(app.getHttpServer())
      .get("/v1/users");

    // request(app.getHttpServer()) -> crea la conexion con tu app
    // .get("/v1/users")            -> hace un GET a esa ruta
    // await                        -> espera a que llegue la respuesta
    // response                     -> contiene toda la respuesta HTTP
  });

  it("POST request - crear datos", async () => {
    // POST se usa para CREAR. Normalmente envia datos en el body.
    const response = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({                        // .send() envia el body del request
        email: "test@test.com",      // como JSON automaticamente
        password: "123456",
        name: "Juan",
      });

    // .send() hace dos cosas:
    // 1. Serializa el objeto a JSON
    // 2. Agrega el header Content-Type: application/json
    // Equivale a hacer esto en Postman:
    //   Body -> raw -> JSON -> { "email": "test@test.com", ... }
  });

  it("PATCH request - actualizar datos parcialmente", async () => {
    // PATCH se usa para ACTUALIZAR parcialmente. Solo envias los campos que cambian.
    const response = await request(app.getHttpServer())
      .patch("/v1/users/1")          // /1 es el id del usuario
      .send({ name: "Pedro" });      // solo actualizo el nombre
  });

  it("PUT request - reemplazar datos completos", async () => {
    // PUT se usa para REEMPLAZAR completamente un recurso.
    // A diferencia de PATCH, envias TODOS los campos.
    const response = await request(app.getHttpServer())
      .put("/v1/users/1")
      .send({
        email: "nuevo@test.com",
        password: "nueva123",
        name: "Pedro",
        surname: "Lopez",
        age: 30,
        rickIds: [1],
      });
  });

  it("DELETE request - eliminar datos", async () => {
    // DELETE se usa para ELIMINAR. Normalmente no envia body.
    const response = await request(app.getHttpServer())
      .delete("/v1/users/1");
  });

  // ============================================
  // 2. HEADERS
  // ============================================
  // .set() agrega headers al request. Los headers son metadatos
  // que van junto con el request (autenticacion, formato, etc).

  it("enviar un header de autorizacion", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/users/1")
      .set("Authorization", "Bearer mi-jwt-token");
    // .set("NombreHeader", "valor")

    // El header Authorization es el que usa tu AuthGuard.
    // Formato: "Bearer <token-jwt>"
    // En tests con mocks, el token puede ser cualquier string
    // porque el JwtService esta mockeado y no lo valida realmente.
  });

  it("enviar multiples headers", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/users/1")
      .set("Authorization", "Bearer mi-jwt-token")
      .set("Accept", "application/json")
      .set("X-Custom-Header", "valor-personalizado");

    // Podes encadenar varios .set() uno tras otro.
    // Cada uno agrega un header al request.
  });

  // ============================================
  // 3. VERIFICAR LA RESPUESTA
  // ============================================
  // Despues de hacer el request, verificas que la respuesta
  // sea la esperada. Hay dos formas de verificar.

  it("verificar status code con .expect() de supertest", async () => {
    // OPCION 1: .expect() de SUPERTEST (encadenado al request)
    // Si el status no matchea, supertest tira un error y el test falla.
    await request(app.getHttpServer())
      .get("/v1/users")
      .expect(200);
    //  .expect(200) verifica que el status sea 200 (OK)

    // Podes verificar otros status codes:
    //  .expect(201) -> Created (despues de un POST exitoso)
    //  .expect(400) -> Bad Request (datos invalidos)
    //  .expect(401) -> Unauthorized (sin token o token invalido)
    //  .expect(404) -> Not Found (recurso no existe)
    //  .expect(500) -> Internal Server Error (error del servidor)
  });

  it("verificar status code con expect() de jest", async () => {
    // OPCION 2: guardas la response y usas expect de JEST
    // Mas flexible, te permite verificar mas cosas.
    const response = await request(app.getHttpServer())
      .get("/v1/users");

    expect(response.status).toBe(200);
    // Ambas opciones hacen lo mismo. Usa la que te resulte mas clara.
  });

  it("verificar el body de la respuesta", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/users")
      .expect(200);

    // response.body contiene el JSON de la respuesta, ya parseado.
    // Supertest hace JSON.parse automaticamente.
    // Si el endpoint devuelve: [{"id":1, "name":"Juan"}]
    // Entonces response.body es: [{id: 1, name: "Juan"}]

    // Verificar que sea un array vacio:
    expect(response.body).toEqual([]);

    // Verificar la longitud del array:
    expect(response.body).toHaveLength(0);

    // Verificar una propiedad especifica de un elemento:
    // expect(response.body[0].email).toBe("test@test.com");

    // Verificar la estructura parcial (sin importar todos los campos):
    // expect(response.body[0]).toEqual(
    //   expect.objectContaining({ email: "test@test.com", name: "Juan" })
    // );
  });

  it("verificar headers de la respuesta", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/users");

    // response.headers contiene los headers que devolvio el servidor
    // Los nombres de headers siempre son en minuscula
    expect(response.headers["content-type"]).toMatch(/json/);
    // Verifica que el Content-Type incluya "json"
  });

  // ============================================
  // 4. PATRON COMUN: request completo
  // ============================================

  it("ejemplo completo paso a paso", async () => {
    const response = await request(app.getHttpServer()) // 1. Conectar a la app
      .post("/v1/auth/login")                           // 2. Metodo HTTP + ruta
      .send({ email: "a@b.com", password: "123" })      // 3. Body (para POST/PATCH/PUT)
      .set("Content-Type", "application/json")           // 4. Headers (si necesitas)
      .expect(200);                                      // 5. Verificar status code

    // 6. Verificar body con matchers de jest
    expect(response.body).toHaveProperty("token");       // tiene la propiedad "token"
    expect(response.body.token).toBeDefined();           // y no es undefined
  });

  // ============================================
  // 5. RESUMEN VISUAL
  // ============================================

  // CONSTRUIR EL REQUEST:
  //   request(app.getHttpServer())  --> Conecta supertest a tu app NestJS
  //     .get("/ruta")               --> Metodo HTTP (get/post/patch/put/delete) + ruta
  //     .send({ ... })              --> Body del request (solo POST, PATCH, PUT)
  //     .set("Header", "valor")     --> Headers personalizados (auth, content-type, etc)
  //     .expect(200)                --> Verificar status code de la respuesta
  //
  // LEER LA RESPUESTA:
  //   response.body                 --> El JSON de la respuesta (ya parseado)
  //   response.status               --> El status code numerico (200, 404, etc)
  //   response.headers              --> Los headers de la respuesta (en minuscula)
  //   response.text                 --> El body como string (sin parsear)
  //
  // COMPARACION CON POSTMAN:
  //   Postman                        Supertest
  //   ──────────                     ─────────
  //   URL bar: GET /v1/users    -->  .get("/v1/users")
  //   Body tab -> JSON          -->  .send({ ... })
  //   Headers tab               -->  .set("Header", "valor")
  //   Status: 200 OK            -->  .expect(200) o response.status
  //   Response body             -->  response.body
});
