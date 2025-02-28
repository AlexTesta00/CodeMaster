FROM node:alpine
WORKDIR /Users/riccardorambaldi/Desktop/Magistrale/secondo_anno/primo_semestre/SPE/CodeMaster/codequest-services
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD npm run dev