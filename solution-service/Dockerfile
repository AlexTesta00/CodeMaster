FROM node:alpine
RUN mkdir /solution-service
WORKDIR /solution-service
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD npm run dev