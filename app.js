import express from 'express';
import { MongoClient } from 'mongodb';
import { connectAndLoadData } from './load_exersize_to_db.js';

const app = express();
const port = 3000;

// Use express.json middleware
app.use(express.json());

let collection;

// Wait for the database connection to be established before starting the server
connectAndLoadData().then((client) => {
  const db = client.db('FiteByte');
  collection = db.collection('exercizes');

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

// rest of the code