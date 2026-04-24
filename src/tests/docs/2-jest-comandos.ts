// ============================================
// JEST - COMANDOS DE TERMINAL
// ============================================
// Todos estos se corren desde la terminal en la raiz del proyecto.

// -------------------------------------------
// COMANDOS BASICOS
// -------------------------------------------

// Correr TODOS los tests del proyecto:
//   npx jest
//
// "npx" ejecuta jest desde node_modules (no necesitas instalarlo global).
// Jest busca archivos que matcheen el testRegex de package.json.
// En tu proyecto: cualquier archivo que termine en .spec.ts o .test.ts

// Correr tests de un archivo especifico:
//   npx jest --testPathPatterns="get-users"
//
// Filtra por el nombre/ruta del archivo. No necesitas poner la ruta completa,
// con un pedazo del nombre alcanza. Ejemplos:
//   npx jest --testPathPatterns="get-users"     -> corre get-users.test.ts
//   npx jest --testPathPatterns="auth"           -> corre todos los tests que tengan "auth" en el path
//   npx jest --testPathPatterns="tests/users"    -> corre todos los tests en la carpeta users

// Correr tests que matcheen un nombre de test (el string del "describe" o "it"):
//   npx jest -t "deberia retornar un array"
//
// Esto filtra por el NOMBRE del test, no por el archivo.
// Busca en los strings de describe() e it(). Ejemplo:
//   it("deberia retornar un array vacio", ...)
//   -> matchea con: npx jest -t "array vacio"
//   -> matchea con: npx jest -t "deberia retornar"
//   -> NO matchea con: npx jest -t "get-users" (eso es nombre de archivo, no de test)

// Combinar ambos filtros:
//   npx jest --testPathPatterns="get-users" -t "array vacio"
// Esto corre solo el test "array vacio" dentro del archivo get-users.

// -------------------------------------------
// MODO WATCH (re-corre tests al guardar)
// -------------------------------------------

// Watch mode - re-corre tests cuando guardas un archivo:
//   npx jest --watch
//
// Solo re-corre los tests relacionados con los archivos que cambiaste
// (usa git para detectar cambios). Muy util mientras desarrollas.
// Presiona 'q' para salir, 'a' para correr todos, 'f' para los que fallaron.

// Watch all - re-corre TODOS los tests al guardar:
//   npx jest --watchAll
//
// Diferencia con --watch: este corre TODOS, no solo los relacionados.
// Usa --watch cuando tengas muchos tests, --watchAll cuando sean pocos.

// -------------------------------------------
// COVERAGE (cobertura de codigo)
// -------------------------------------------

// Ver que porcentaje de tu codigo esta cubierto por tests:
//   npx jest --coverage
//
// Muestra una tabla en consola:
//   File          | % Stmts | % Branch | % Funcs | % Lines
//   users.service |   80%   |   60%    |  100%   |   80%
//
// - % Stmts (Statements): porcentaje de lineas de codigo ejecutadas
// - % Branch: porcentaje de if/else/switch que fueron testeados (ambas ramas)
// - % Funcs: porcentaje de funciones que fueron llamadas
// - % Lines: similar a Stmts pero por lineas fisicas
//
// Ademas genera un reporte HTML en /coverage/lcov-report/index.html
// que podés abrir en el browser para ver exactamente que lineas no estan cubiertas
// (las lineas no testeadas aparecen en rojo).

// -------------------------------------------
// OTROS FLAGS UTILES
// -------------------------------------------

// Verbose - muestra el nombre de CADA test individual:
//   npx jest --verbose
//
// Sin verbose:
//   PASS src/tests/users/get-users.test.ts
// Con verbose:
//   PASS src/tests/users/get-users.test.ts
//     GET /v1/users
//       Successful get users
//         ✓ deberia retornar un array vacio (15ms)
//         ✓ deberia retornar los usuarios (8ms)

// Run in band - corre tests SECUENCIALMENTE (uno a la vez):
//   npx jest --runInBand
//
// Por defecto Jest corre tests en PARALELO (varios archivos a la vez).
// --runInBand los corre uno por uno. Util para:
// - Debugging (el output es mas claro)
// - Tests que comparten estado (ej: misma base de datos)
// - CI/CD con poca memoria

// Bail - PARA al primer test que falle:
//   npx jest --bail
//
// Por defecto Jest corre TODOS los tests aunque algunos fallen.
// Con --bail, se detiene inmediatamente al primer fallo.
// Util cuando queres arreglar errores de a uno.

// Silent - NO muestra console.log:
//   npx jest --silent
//
// Si tu codigo tiene console.log, aparecen mezclados con el output de Jest.
// --silent los oculta para que el output sea mas limpio.

// -------------------------------------------
// USANDO SCRIPTS DE PACKAGE.JSON
// -------------------------------------------

// Tu package.json tiene estos scripts ya configurados:
//   npm test              -> ejecuta: jest
//   npm run test:watch    -> ejecuta: jest --watch
//   npm run test:cov      -> ejecuta: jest --coverage
//
// "npm test" es un shortcut de "npm run test". Es el unico script
// que no necesita "run" en el medio.

// Podés COMBINAR scripts con flags adicionales:
//   npm test -- --verbose --bail
//   npm test -- --testPathPatterns="get-users"
//
// El "--" (doble guion solo) le dice a npm:
// "todo lo que viene despues pasaselo a jest como argumentos".
// Sin el "--", npm se confunde y piensa que los flags son para npm.
//
// Ejemplo completo:
//   npm test -- --testPathPatterns="get-users" --verbose
// Es equivalente a:
//   npx jest --testPathPatterns="get-users" --verbose

// -------------------------------------------
// JEST.FN() - FUNCIONES MOCK (dentro del codigo)
// -------------------------------------------
// Estos NO son comandos de terminal. Son metodos de jest que
// usas DENTRO del codigo del test para crear y controlar mocks.

const ejemplo = () => {
  // ---- CREAR UN MOCK ----

  // jest.fn() crea una funcion "espia" que registra todas sus llamadas.
  // No hace nada por defecto (retorna undefined), pero podés configurarla.
  const mockFn = jest.fn();
  mockFn("hola"); // la llamas normalmente
  // Ahora jest sabe: fue llamada 1 vez, con argumento "hola"

  // ---- CONFIGURAR QUE RETORNA ----

  // mockReturnValue: siempre retorna este valor (sincrono)
  mockFn.mockReturnValue(42);
  // mockFn() -> 42
  // mockFn("cualquier cosa") -> 42

  // mockResolvedValue: retorna una Promise resuelta (asincrono exitoso)
  // Equivale a: mockFn.mockReturnValue(Promise.resolve(...))
  mockFn.mockResolvedValue({ id: 1, name: "Juan" });
  // await mockFn() -> { id: 1, name: "Juan" }
  //
  // ES EL QUE MAS VAS A USAR porque casi todo en NestJS es async.
  // Ejemplo real: mockUsersService.findAll.mockResolvedValue([...users])

  // mockRejectedValue: retorna una Promise rechazada (asincrono con error)
  // Equivale a: mockFn.mockReturnValue(Promise.reject(...))
  mockFn.mockRejectedValue(new Error("fallo"));
  // await mockFn() -> THROWS Error("fallo")
  //
  // Util para simular errores: DB caida, API timeout, token invalido, etc.

  // mockReturnValueOnce: retorna un valor solo la PRIMERA vez
  mockFn.mockReturnValueOnce("primera").mockReturnValueOnce("segunda");
  // mockFn() -> "primera"
  // mockFn() -> "segunda"
  // mockFn() -> undefined (ya no hay mas valores configurados)
  //
  // Util cuando queres que la funcion se comporte diferente en cada llamada.

  // mockImplementation: define una logica personalizada
  mockFn.mockImplementation((x: number) => x * 2);
  // mockFn(5) -> 10
  // mockFn(3) -> 6
  //
  // Util cuando necesitas algo mas que un valor fijo.

  // ---- VERIFICAR COMO FUE LLAMADO ----

  // ¿Fue llamado?
  expect(mockFn).toHaveBeenCalled();
  // Falla si NUNCA fue llamado.

  // ¿Cuantas veces?
  expect(mockFn).toHaveBeenCalledTimes(1);
  // Falla si fue llamado mas o menos de 1 vez.
  // Muy util para verificar que un endpoint no llame al service de mas.

  // ¿Con que argumentos?
  expect(mockFn).toHaveBeenCalledWith("argumento1", "argumento2");
  // Falla si los argumentos no matchean.
  // Ejemplo real: expect(mockUsersService.findById).toHaveBeenCalledWith(1);
  // -> verifica que el controller le paso el id correcto al service.

  // ¿No fue llamado?
  expect(mockFn).not.toHaveBeenCalled();
  // Util para verificar que NO se llamo a algo que no deberia.

  // ---- LIMPIAR MOCKS ----
  // Importantisimo hacerlo entre tests para que no se contaminen.

  // clearAllMocks: borra el HISTORIAL de llamadas.
  // Despues de esto, toHaveBeenCalledTimes vuelve a 0.
  // PERO los mockResolvedValue/mockReturnValue siguen configurados.
  jest.clearAllMocks();

  // resetAllMocks: clear + borra la CONFIGURACION.
  // Despues de esto, el mock vuelve a retornar undefined.
  // Tenes que volver a hacer mockResolvedValue en el proximo test.
  jest.resetAllMocks();

  // restoreAllMocks: reset + RESTAURA la funcion original.
  // Solo aplica si usaste jest.spyOn() (ver abajo).
  // Si usaste jest.fn(), es igual que resetAllMocks.
  jest.restoreAllMocks();

  // ¿Cual usar? En la mayoria de los casos: jest.clearAllMocks() en afterEach.
  // Esto limpia el historial pero mantiene la configuracion,
  // asi no tenes que re-configurar los mocks en cada test.
  //
  // Si queres re-configurar los mocks diferente en cada test,
  // usa jest.resetAllMocks().

  // ---- JEST.SPYON ----
  // Espia una funcion existente sin reemplazarla.

  const objeto = {
    sumar: (a: number, b: number) => a + b,
  };

  // Espia sumar: registra llamadas pero SIGUE ejecutando la funcion real
  const spy = jest.spyOn(objeto, "sumar");
  objeto.sumar(2, 3); // retorna 5 (la funcion real se ejecuta)
  expect(spy).toHaveBeenCalledWith(2, 3); // pero tambien podemos verificar

  // Podes hacer que retorne algo diferente:
  spy.mockReturnValue(999);
  objeto.sumar(2, 3); // ahora retorna 999 en vez de 5

  // Y despues restaurar la funcion original:
  spy.mockRestore();
  objeto.sumar(2, 3); // vuelve a retornar 5
};
