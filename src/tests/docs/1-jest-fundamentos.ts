// ============================================
// JEST - FUNDAMENTOS
// ============================================
// Jest es un framework de testing para JavaScript/TypeScript.
// Tiene todo incluido: test runner, assertions, mocks, coverage.
//
// ¿Que es un test?
// Un test es codigo que verifica que OTRO codigo funciona como esperás.
// En vez de probar manualmente con Postman o el browser, escribis un
// programa que lo prueba por vos. Asi cada vez que cambias algo,
// corres los tests y sabes al instante si rompiste algo.

// ============================================
// 1. ESTRUCTURA BASICA DE UN TEST
// ============================================

// "describe" agrupa tests relacionados. Pensalo como una carpeta.
// El primer argumento es un string descriptivo (lo que se muestra en consola).
// El segundo argumento es una funcion que contiene los tests.
describe("Calculadora", () => {
  // "it" define un CASO DE PRUEBA individual.
  // Cada "it" testea UNA sola cosa especifica.
  // El string deberia leerse como una oracion: "it deberia sumar dos numeros"
  it("deberia sumar dos numeros", () => {
    const resultado = 2 + 3;

    // "expect" es la ASSERTION (afirmacion).
    // Le pasas el valor que obtuviste y le encadenas un "matcher"
    // que dice como deberia ser ese valor.
    // expect(valor_real).matcher(valor_esperado)
    expect(resultado).toBe(5);
    // Esto dice: "espero que resultado SEA 5"
    // Si resultado NO es 5, el test FALLA y Jest te muestra el error.
  });

  // "it" y "test" son EXACTAMENTE lo mismo. Son alias.
  // Usa el que te suene mas natural al leerlo.
  // "it deberia restar" vs "test deberia restar" -> ambos valen
  test("deberia restar dos numeros", () => {
    expect(10 - 3).toBe(7);
  });

  // Podés ANIDAR describes para organizar mejor.
  // Es como tener subcarpetas. Util cuando un grupo tiene muchos tests.
  //
  // En consola se ve asi:
  //   Calculadora
  //     ✓ deberia sumar dos numeros
  //     ✓ deberia restar dos numeros
  //     division
  //       ✓ deberia dividir correctamente
  describe("division", () => {
    it("deberia dividir correctamente", () => {
      expect(10 / 2).toBe(5); // assertion
    });
  });
});

// ============================================
// 2. MATCHERS - Formas de comparar valores
// ============================================
// Los matchers son los metodos que encadenas despues de expect().
// Cada uno compara de forma diferente. Elegir el correcto
// es clave para que tus tests sean claros y no den falsos positivos.

describe("Matchers principales", () => {
  // --- IGUALDAD ---

  it("toBe - compara por referencia (===)", () => {
    // toBe usa igualdad estricta (===).
    // Funciona bien para: numeros, strings, booleans, null, undefined.
    expect(5).toBe(5); // 5 === 5 -> true
    expect("hola").toBe("hola"); // "hola" === "hola" -> true

    // CUIDADO con objetos y arrays:
    // const a = { x: 1 };
    // const b = { x: 1 };
    // expect(a).toBe(b); // FALLA! Son objetos distintos en memoria
    //                     // aunque tengan el mismo contenido.
    // Para objetos usa toEqual (ver abajo).
  });

  it("toEqual - compara por valor (deep equality)", () => {
    // toEqual compara el CONTENIDO, no la referencia.
    // Revisa propiedad por propiedad, recursivamente.
    // SIEMPRE usa toEqual para objetos y arrays.
    const usuario = { nombre: "Juan", edad: 25 };
    expect(usuario).toEqual({ nombre: "Juan", edad: 25 });
    // Compara: usuario.nombre === "Juan" && usuario.edad === 25 -> true

    const numeros = [1, 2, 3];
    expect(numeros).toEqual([1, 2, 3]);
    // Compara: numeros[0] === 1 && numeros[1] === 2 && numeros[2] === 3

    // Tambien funciona con objetos anidados:
    const data = { user: { name: "Juan", address: { city: "BA" } } };
    expect(data).toEqual({ user: { name: "Juan", address: { city: "BA" } } });
  });

  // --- VERDADERO / FALSO ---

  it("truthy y falsy", () => {
    // En JavaScript, algunos valores son "falsy" (se comportan como false):
    //   false, 0, "", null, undefined, NaN
    // Todo lo demas es "truthy" (se comporta como true).

    expect(true).toBeTruthy(); // true es truthy
    expect("hola").toBeTruthy(); // un string no vacio es truthy
    expect(1).toBeTruthy(); // un numero != 0 es truthy

    expect(false).toBeFalsy(); // false es falsy
    expect("").toBeFalsy(); // string vacio es falsy
    expect(0).toBeFalsy(); // 0 es falsy

    // Para null y undefined hay matchers especificos (mas expresivos):
    expect(null).toBeNull(); // es exactamente null
    expect(undefined).toBeUndefined(); // es exactamente undefined
    expect("algo").toBeDefined(); // NO es undefined (existe)
  });

  // --- NUMEROS ---

  it("comparaciones numericas", () => {
    expect(10).toBeGreaterThan(5); // 10 > 5
    expect(10).toBeGreaterThanOrEqual(10); // 10 >= 10
    expect(5).toBeLessThan(10); // 5 < 10
    expect(5).toBeLessThanOrEqual(5); // 5 <= 5

    // Para decimales, usa toBeCloseTo (evita errores de punto flotante):
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    // 0.1 + 0.2 === 0.3 es false en JS por precision de decimales
    // toBeCloseTo compara "suficientemente cerca"
  });

  // --- STRINGS ---

  it("strings", () => {
    // toContain verifica que un substring exista dentro del string
    expect("Hola mundo").toContain("mundo"); // "mundo" esta dentro de "Hola mundo"

    // toMatch acepta un regex (expresion regular) para patrones mas complejos
    expect("Hola mundo").toMatch(/mundo/); // regex: contiene "mundo"
    expect("error-404").toMatch(/error-\d+/); // regex: "error-" seguido de numeros
    expect("juan@test.com").toMatch(/@.*\.com/); // regex: tiene @ algo .com
  });

  // --- ARRAYS ---

  it("arrays", () => {
    const frutas = ["manzana", "banana", "naranja"];

    // toContain busca un elemento dentro del array
    expect(frutas).toContain("banana");

    // toHaveLength verifica la cantidad de elementos
    expect(frutas).toHaveLength(3);

    // toEqual compara el array completo (orden importa)
    expect(frutas).toEqual(["manzana", "banana", "naranja"]);

    // expect.arrayContaining verifica que contenga ALGUNOS elementos (sin importar orden)
    expect(frutas).toEqual(expect.arrayContaining(["naranja", "manzana"]));
  });

  // --- OBJETOS ---

  it("objetos", () => {
    const usuario = { id: 1, name: "Juan", email: "juan@test.com", age: 25 };

    // toHaveProperty verifica que una propiedad exista
    expect(usuario).toHaveProperty("email");

    // toHaveProperty con valor: verifica propiedad Y su valor
    expect(usuario).toHaveProperty("name", "Juan");

    // expect.objectContaining: verifica que tenga ALGUNAS propiedades
    // Util cuando no te importan todas las propiedades del objeto
    expect(usuario).toEqual(
      expect.objectContaining({ name: "Juan", email: "juan@test.com" }),
    );
    // No hace falta poner id ni age, solo verifica las que pasaste
  });

  // --- NEGACION ---

  it("not - niega cualquier matcher", () => {
    // .not invierte cualquier matcher. Se lee: "espero que NO sea..."
    expect(5).not.toBe(10); // 5 no es 10
    expect([1, 2]).not.toContain(3); // el array no contiene 3
    expect("hola").not.toMatch(/xyz/); // "hola" no matchea con "xyz"
    expect(null).not.toBeDefined(); // null no esta definido... espera, null SI esta definido
    // Cuidado: null es un valor definido. undefined es no definido.
  });

  // --- EXCEPCIONES ---

  it("toThrow - verificar que una funcion tire error", () => {
    const funcionQueFalla = () => {
      throw new Error("algo salio mal");
    };

    // IMPORTANTE: pasas la funcion SIN ejecutarla (sin parentesis)
    // Jest la ejecuta internamente y captura el error
    expect(funcionQueFalla).toThrow(); // tira algun error
    expect(funcionQueFalla).toThrow("algo salio mal"); // tira error con este mensaje
    expect(funcionQueFalla).toThrow(Error); // tira un Error
  });
});

// ============================================
// 3. HOOKS - Codigo que se ejecuta antes/despues
// ============================================
// Los hooks son funciones que Jest ejecuta automaticamente
// en momentos especificos. Sirven para PREPARAR el entorno
// antes de los tests y LIMPIAR despues.
//
// Orden de ejecucion:
//   beforeAll    (1 vez)
//   ├── beforeEach  (antes de test 1)
//   │   └── test 1
//   ├── afterEach   (despues de test 1)
//   ├── beforeEach  (antes de test 2)
//   │   └── test 2
//   ├── afterEach   (despues de test 2)
//   afterAll     (1 vez)

describe("Hooks", () => {
  let lista: string[];

  // Se ejecuta UNA VEZ antes de TODOS los tests del describe.
  // Ideal para: levantar la app, conectar a DB, configurar cosas pesadas.
  // En nuestro test real de get-users, aca creamos la app de NestJS.
  beforeAll(() => {
    console.log("Inicio del grupo de tests");
    // Ejemplo real: levantar app NestJS
    // const module = await Test.createTestingModule({...}).compile();
    // app = module.createNestApplication();
    // await app.init();
  });

  // Se ejecuta UNA VEZ despues de TODOS los tests.
  // Ideal para: cerrar la app, desconectar DB, liberar recursos.
  afterAll(() => {
    console.log("Fin del grupo de tests");
    // Ejemplo real: cerrar app NestJS
    // await app.close();
  });

  // Se ejecuta ANTES DE CADA test individual.
  // Ideal para: resetear datos, limpiar estado, preparar mocks.
  // Sirve por si quiero limpiar la base de datos de testing antes de cada test.
  // Asi cada test empieza con un estado "limpio" y predecible.
  beforeEach(() => {
    lista = []; // reseteo la lista antes de cada test
    // Ejemplo real: limpiar tablas de la DB
    // await userRepository.clear();
  });

  // Se ejecuta DESPUES DE CADA test individual.
  // Ideal para: limpiar mocks, resetear estado.
  // Sirve por si quiero limpiar la base de datos de cada test.
  afterEach(() => {
    // Ejemplo real: limpiar mocks
    // jest.clearAllMocks();
  });

  it("test 1 - lista empieza vacia", () => {
    expect(lista).toHaveLength(0); // beforeEach seteo lista = []
    lista.push("item"); // agrego un item
    expect(lista).toHaveLength(1); // ahora tiene 1
  });

  it("test 2 - lista sigue vacia porque beforeEach la resetea", () => {
    // Aunque test 1 hizo push("item"), beforeEach volvio a setear lista = []
    // Esto garantiza que cada test es INDEPENDIENTE del anterior.
    // Si test 1 falla, test 2 no se ve afectado.
    expect(lista).toHaveLength(0);
  });
});

// ============================================
// 4. TESTS ASINCRONOS
// ============================================
// La mayoria de los tests en un backend son asincronos porque
// hacen requests HTTP, consultas a DB, llamadas a APIs, etc.
// Jest soporta async/await de forma nativa.

describe("Tests asincronos", () => {
  // OPCION 1: async/await (LA MAS COMUN - usa esta)
  // Agregás "async" al callback del "it" y "await" a la operacion asincrona.
  // Jest espera a que la promesa se resuelva antes de evaluar los expects.
  it("con async/await", async () => {
    const resultado = await Promise.resolve(42);
    // Promise.resolve(42) simula una operacion async que retorna 42
    // (como si fuera un await userService.findAll())
    expect(resultado).toBe(42);
  });

  // OPCION 2: .resolves / .rejects
  // Forma mas compacta para verificar directamente promesas.
  // Util para tests simples de una sola linea.
  it("con resolves - verifica que la promesa se resuelva con un valor", async () => {
    // "espero que esta promesa se resuelva y el valor sea 42"
    await expect(Promise.resolve(42)).resolves.toBe(42);
  });

  it("con rejects - verifica que la promesa falle", async () => {
    // "espero que esta promesa sea rechazada y tire un error con mensaje 'fallo'"
    await expect(Promise.reject(new Error("fallo"))).rejects.toThrow("fallo");

    // Esto es muy util para testear que tu service lance errores
    // cuando recibe datos invalidos:
    // await expect(usersService.findById(-1)).rejects.toThrow("ID is required");
  });

  // IMPORTANTE: Si olvidás el "async" o el "await", el test puede pasar
  // sin ejecutar realmente las assertions. Jest no espera a la promesa
  // y el test termina antes de que se resuelva.
  //
  // MAL:  it("test", () => { expect(asyncFn()).resolves... })     // falta async/await
  // BIEN: it("test", async () => { await expect(asyncFn()).resolves... })
});

// ============================================
// 5. SKIP Y ONLY - Controlar que tests se corren
// ============================================

describe("Skip y Only", () => {
  // .skip salta un test (no lo ejecuta). Aparece como "skipped" en consola.
  // Util cuando un test esta roto y lo queres ignorar temporalmente.
  it.skip("este test no se ejecuta", () => {
    expect(1).toBe(2); // no falla porque no se corre
  });

  // .only ejecuta SOLO este test (ignora todos los demas del archivo).
  // Util para debugging: cuando queres correr solo un test especifico.
  // CUIDADO: no lo dejes commiteado, sino el CI solo va a correr ese test.
  // it.only("solo se ejecuta este", () => {
  //   expect(1).toBe(1);
  // });

  // Tambien funciona con describe:
  // describe.skip("todo este grupo se salta", () => {...});
  // describe.only("solo se ejecuta este grupo", () => {...});
});
