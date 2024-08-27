
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

# ensures that the same version of npm packages as the one in the package.lock file is installed , not newer version
RUN npm ci

COPY . .

RUN  npm run build

#second step 

FROM node:18-alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm ci  --ignore-scripts --only=production

COPY --from=builder /app/dist .

EXPOSE 3000

CMD ["node", "src/server.js"]