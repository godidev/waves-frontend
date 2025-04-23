# Etapa 1: Construir el frontend
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con `serve`
FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]