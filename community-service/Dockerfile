FROM node:24-alpine3.21
WORKDIR /codemaster-community-service
COPY package*.json ./
RUN npm install && npm install -g nodemon
RUN apk add --no-cache curl
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]