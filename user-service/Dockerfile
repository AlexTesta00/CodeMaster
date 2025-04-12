FROM node:alpine
WORKDIR /codemaster-user-service
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD npm run dev