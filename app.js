import { engine, create } from 'express-handlebars';
import { users } from './config/mongoCollections.js';
import { registerUser } from './data/users.js';
import express from 'express';
import { connectAndLoadData } from './load_exersize_to_db.js';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import * as enums from './data/enums.js';
import { excersizes as exercizesCollection } from './config/mongoCollections.js';
import { workouts as workoutsCollection } from './config/mongoCollections.js';
import routes from './routes/routes.js';
import { jsonMiddleware, urlEncodedMiddleware, staticMiddleware, exercisesMiddleware, sessionMiddleware, requestLoggerMiddleware, userSessionMiddleware } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(jsonMiddleware);
app.use(urlEncodedMiddleware);
app.use(staticMiddleware);
app.use('/exercises', exercisesMiddleware);
app.use(requestLoggerMiddleware);
app.use(sessionMiddleware);
app.use(userSessionMiddleware);

let collection;

const hbs = create({
  helpers: {
    encodeURI: function (str) {
      const encodedStr = encodeURI(str);
      const replacedStr = encodedStr.split('/').join('%2F');
      return replacedStr;
    },
    json: function (context) {
      return JSON.stringify(context);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/', routes);

// Wait for the database connection to be established before starting the server
connectAndLoadData().then((col) => {
  collection = col;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});