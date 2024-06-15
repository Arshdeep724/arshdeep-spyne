## Running the App

To run the app, you need to create an `.env` file in the root of the application with the following values:

AUTH_DATABASE_URL=
POST_DATABASE_URL=
JWT_SECRET=

### Pushing Prisma Schema

After setting up the environment variables, you need to push the Prisma schema to the respective databases using the following commands:

npx prisma db push --schema=apps/auth/prisma/schema.prisma
npx prisma db push --schema=apps/post/prisma/schema.prisma

### Running the Services

Once the schema is pushed, you can run both services using the following commands:

npm run start:dev auth
npm run start:dev post

These commands will start the development servers for the authentication and post services.
