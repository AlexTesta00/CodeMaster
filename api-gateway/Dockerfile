FROM node:alpine
WORKDIR /codemaster-api-gateway
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD npm run dev