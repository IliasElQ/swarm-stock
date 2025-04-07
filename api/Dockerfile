FROM node:16-alpine

WORKDIR /app

COPY server.js .

RUN npm init -y && \
    npm install express cors

CMD ["node", "server.js"]
