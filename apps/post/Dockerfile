FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./apps/post/prisma/schema.prisma

RUN npm run build

CMD ["node", "dist/apps/post/main.js"]
