# STAGE: build
FROM node:alpine AS builder
WORKDIR /codemaster-user-service
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE: production
FROM node:alpine AS production
WORKDIR /codemaster-user-service
COPY --from=builder /codemaster-user-service/dist ./dist
COPY package*.json ./
RUN apk add --no-cache curl
RUN npm install --only=production
EXPOSE 4005
CMD ["node", "dist/main/nodejs/codemaster/servicies/server.js"]