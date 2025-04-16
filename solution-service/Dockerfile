FROM node:18-alpine
RUN apk add --no-cache sudo shadow openjdk21 musl-dev
RUN mkdir /solution-service
WORKDIR /solution-service
COPY package.json .
RUN npm install
COPY . .
RUN useradd -m username && echo 'username:password' | chpasswd
RUN adduser username wheel && echo '%wheel ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
USER username
EXPOSE 8080
CMD npm run dev