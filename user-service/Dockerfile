# STAGE: build
FROM node:24-alpine3.21 AS builder
WORKDIR /codemaster-user-service
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE: production
FROM node:24-alpine3.21 AS production
WORKDIR /codemaster-user-service
COPY --from=builder /codemaster-user-service/dist ./dist
COPY package*.json ./
RUN apk add --no-cache curl
RUN npm install --only=production
EXPOSE 4005
CMD ["node", "dist/main/nodejs/codemaster/servicies/server.js"]