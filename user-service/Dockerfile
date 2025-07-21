FROM node:alpine
WORKDIR /codemaster-user-service
COPY package*.json ./
RUN apk add --no-cache curl
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]