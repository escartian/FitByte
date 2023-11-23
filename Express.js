import express from 'express';
import { MongoClient } from 'mongodb';
import { connectAndLoadData } from './load_exersize_to_db.js';

const app = express();
const port = 3000;

let collection;

connectAndLoadData().then((col) => {
  collection = col;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

// Read all exercises
app.get('/exercises', async (req, res) => {
  const exercises = await collection.find().toArray();
  res.json(exercises);
});

// Create a new exercise
app.post('/exercises', async (req, res) => {
  const newExercise = req.body;
  const result = await collection.insertOne(newExercise);
  res.json(result);
});

// Update an exercise
app.put('/exercises/:id', async (req, res) => {
  const updatedExercise = req.body;
  const result = await collection.updateOne({ _id: req.params.id }, { $set: updatedExercise });
  res.json(result);
});

// Delete an exercise
app.delete('/exercises/:id', async (req, res) => {
  const result = await collection.deleteOne({ _id: req.params.id });
  res.json(result);
});