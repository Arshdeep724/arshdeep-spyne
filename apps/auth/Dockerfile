FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma

RUN npm run build

CMD ["node", "dist/apps/auth/main.js"]
