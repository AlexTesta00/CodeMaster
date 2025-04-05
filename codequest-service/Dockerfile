FROM node:alpine
RUN mkdir /codequest-service
WORKDIR /codequest-service
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD npm run dev