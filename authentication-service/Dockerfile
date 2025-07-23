# STAGE: build
FROM node:alpine AS builder
WORKDIR /codemaster-authentication-service
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE: production
FROM node:alpine AS production
WORKDIR /codemaster-authentication-service
COPY --from=builder /codemaster-authentication-service/dist ./dist
COPY package*.json ./
RUN apk add --no-cache curl
RUN npm install --only=production
EXPOSE 4004
CMD ["node", "dist/main/nodejs/codemaster/servicies/authentication/server.js"]