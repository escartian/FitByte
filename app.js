import { engine } from 'express-handlebars';
import express from 'express';
import { MongoClient } from 'mongodb';
import { connectAndLoadData } from './load_exersize_to_db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Use express.json middleware
app.use(express.json());
let collection;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
// Serve static files from the exercises directory
app.use('/exercises', express.static(path.join(__dirname, 'exercises')));
// Wait for the database connection to be established before starting the server
connectAndLoadData().then((col) => {
    collection = col;

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  });

app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.get('/exercises', async (req, res) => {
    // Get query parameters from the URL
    const search = req.query.search || '';
    const sort = req.query.sort || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const level = req.query.level;
    const force = req.query.force;
    const mechanic = req.query.mechanic;
    const equipment = req.query.equipment;
    const category = req.query.category;
  
    // Create filter object
    const filter = {};
    if (level) {
      filter.level = level;
    }
    if (force) {
      filter.force = force;
    }
    if (mechanic) {
      filter.mechanic = mechanic;
    }
    if (equipment) {
      filter.equipment = equipment;
    }
    if (category) {
      filter.category = category;
    }
  
    // Find exercises that match the search query
    const exercises = await collection.find({
      name: { $regex: new RegExp(search, 'i') }
    }).toArray();
  
    // Sort exercises
    exercises.sort((a, b) => {
      if (sort === 'level') {
        const levelOrder = { beginner: 1, intermediate: 2, expert: 3 };
        return sortOrder === 'asc' ? levelOrder[a.level] - levelOrder[b.level] : levelOrder[b.level] - levelOrder[a.level];
      } else {
        if (a[sort] > b[sort]) {
          return sortOrder === 'asc' ? 1 : -1;
        } else if (a[sort] < b[sort]) {
          return sortOrder === 'asc' ? -1 : 1;
        } else {
          return 0;
        }
      }
    });
  
    // Filter exercises
    const filteredExercises = exercises.filter(exercise => {
      for (let key in filter) {
        if (exercise[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  
    res.render('exercises', { exercises: filteredExercises });
  });

  app.get('/exercises/:name', async (req, res) => {
    const exerciseName = req.params.name;
    const exercise = await collection.findOne({ name: { $regex: new RegExp(`^${exerciseName}$`, 'i') } });
    res.render('exercise', exercise);
  });

//the following generally does not need to be used, but can be useful
app.get('/exercises/:exercise/images/:image', (req, res) => {
  const exercise = req.params.exercise;
  const image = req.params.image;
  const imagePath = path.join(__dirname, 'exercises', exercise, 'images', `${image}.jpg`);
  
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      res.status(404).send('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    }
  });
});