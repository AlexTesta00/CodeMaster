FROM node:alpine
WORKDIR /codemaster-codequest-service
COPY package*.json ./
RUN npm install && npm install -g nodemon
COPY . .
RUN npm run build
EXPOSE 3000
CMD npm run dev