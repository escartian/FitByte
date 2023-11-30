import { create } from 'express-handlebars';
import express from 'express';
import { connectAndLoadData } from './load_exersize_to_db.js';
import { fileURLToPath } from 'url';
import path from 'path';
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
  /**
  * Encodes a given string using the encodeURI function.
  *
  * @param {string} str - The string to be encoded.
  * @return {string} The encoded string with '/' replaced by '%2F'.
  */
    encodeURI: function (str) {
      const encodedStr = encodeURI(str);
      const replacedStr = encodedStr.split('/').join('%2F');
      return replacedStr;
    },
    /**
     * Converts the given context object to a JSON string.
     *
     * @param {Object} context - The context object to be converted.
     * @return {string} The JSON string representation of the context object.
     */
    json: function (context) {
      return JSON.stringify(context);
    }
  },
  partialsDir: path.join(__dirname, 'views/partials'),
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/', routes);

// Wait for the database connection to be established before starting the server
connectAndLoadData().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});