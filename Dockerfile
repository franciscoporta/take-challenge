# =============================================================
# DOCKERFILE - Instrucciones para construir la "imagen" de tu app
# =============================================================
# Pensalo como una receta de cocina: Docker lee esto paso a paso
# y crea un "paquete" que contiene tu app lista para correr
# en cualquier computadora.
# =============================================================

# --- ETAPA 1: BUILD (compilar tu codigo TypeScript a JavaScript) ---
# "FROM" indica la imagen base, osea el "sistema operativo" que usamos.
# node:20-alpine es una version liviana de Linux que ya tiene Node.js 20 instalado.
# "AS build" le pone un nombre a esta etapa para referenciarla despues.
FROM node:20-alpine AS build

# "WORKDIR" es como hacer "cd /app". Crea la carpeta /app dentro del
# contenedor y se posiciona ahi. Todo lo que sigue se ejecuta desde /app.
WORKDIR /app

# "COPY" copia archivos desde tu maquina al contenedor.
# Primero copiamos SOLO package.json y package-lock.json.
# Por que no todo junto? Porque Docker "cachea" cada paso.
# Si tus dependencias no cambiaron, Docker no vuelve a instalarlas,
# lo cual hace que las siguientes builds sean mucho mas rapidas.
# y el . final es para copiarlo todo en la raiz del container
COPY package.json package-lock.json ./

# "RUN" ejecuta un comando dentro del contenedor.
# "npm ci" instala las dependencias de forma limpia y reproducible
# (es como npm install pero mas estricto y rapido en CI/CD).
RUN npm ci

# Ahora si copiamos TODO el codigo fuente al contenedor.
COPY . .

# Compilamos TypeScript a JavaScript. El resultado queda en /app/dist
RUN npm run build

# --- ETAPA 2: PRODUCCION (imagen final, lo mas liviana posible) ---
# Arrancamos de nuevo desde una imagen limpia de Node.
# Esto se llama "multi-stage build" y sirve para que la imagen final
# NO incluya cosas que solo necesitabas para compilar (como devDependencies).
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos solo package.json y lock para instalar dependencias de produccion
COPY package.json package-lock.json ./

# "--omit=dev" instala SOLO las dependencias de produccion (no jest, typescript, etc).
# Esto hace la imagen final mucho mas chica.
RUN npm ci --omit=dev

# "COPY --from=build" copia archivos DESDE la etapa anterior (la que llamamos "build").
# Solo traemos la carpeta dist/ que es el JavaScript ya compilado.
COPY --from=build /app/dist ./dist

# "EXPOSE" documenta que el contenedor escucha en el puerto 3010.
# OJO: esto no abre el puerto, es solo informativo. El puerto real
# se mapea en docker-compose con "ports".
EXPOSE 3010

# "CMD" es el comando que se ejecuta cuando el contenedor arranca.
# Es como si vos hicieras "node dist/main" en tu terminal.
# CMD ["node", "dist/main"]
