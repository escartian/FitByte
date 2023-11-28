import { engine, create } from 'express-handlebars';
import { users } from './config/mongoCollections.js';
import { registerUser } from './data/users.js';
import express from 'express';
import { connectAndLoadData } from './load_exersize_to_db.js';
import session from 'express-session';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import * as enums from './data/enums.js';
import { excersizes as exercizesCollection } from './config/mongoCollections.js';
import { workouts as workoutsCollection } from './config/mongoCollections.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Use express.json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let collection;

const hbs = create({
  helpers: {
    encodeURI: function (str) {
      //console.log("Encoding URI from exersize name");
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
app.use(express.static('public'));

// Serve static files from the exercises directory
app.use('/exercises', express.static(path.join(__dirname, 'exercises')));
app.use((req, res, next) => {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now();
  // Convert the timestamp to a date and time string
  const datetime = new Date(timestamp).toLocaleString();
  // Print the request method, URL, and timestamp
  console.log(`Received ${req.method} request to ${req.originalUrl} at ${datetime}`);
  next();
});
app.use(session({
  name: 'AuthState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
// Wait for the database connection to be established before starting the server
connectAndLoadData().then((col) => {
  collection = col;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

app.get('/', (req, res) => {
  res.render('home');
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

// Login page route
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  const { emailAddressInput, passwordInput } = req.body;

  // Validate the input fields
  if (!emailAddressInput || !passwordInput) {
    return res.status(400).send('Missing required fields');
  }

  // Retrieve the user from the database
  const userCollection = await users();
  const user = await userCollection.findOne({ emailAddress: emailAddressInput });

  // If the user does not exist, render the login form again with an error message
  if (!user) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  // Compare the provided password with the stored password
  const isPasswordCorrect = await bcrypt.compare(passwordInput, user.password);

  // If the password is incorrect, render the login form again with an error message
  if (!isPasswordCorrect) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  // If the email and password are correct, create a session for the user
  req.session.user = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
    /* role: user.role */
  };

  return res.redirect('/protected');

});
app.post('/register', async (req, res) => {
  console.log(req.body);
  const { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, /* roleInput */ } = req.body;

  console.log('Registering user with data:', { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput /*, roleInput*/ });

  // Validate the input fields
  if (!firstNameInput || !lastNameInput || !emailAddressInput || !passwordInput || !confirmPasswordInput /*|| !roleInput*/) {
    return res.status(400).send('Missing required fields');
  }

  // Call the registerUser db function
  const result = await registerUser(firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, /* roleInput */);

  console.log('registerUser result:', result);

  // Handle the response from the db function
  if (result.insertedUser) {
    console.log('Redirecting to /login');
    return res.redirect('/login');
  } else {
    return res.status(500).render('error', { error: 'Error registering user' });
  }
});

app.get('/error', (req, res) => {
  res.render('error');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/protected', async (req, res) => {
  if (req.session.user) {
    // Get the user's email from the session
    console.log(req.session.user);
    const userEmail = req.session.user.emailAddress;
    // Query the database for the user
    const userCollection = await users();
    const user = await userCollection.findOne({ emailAddress: userEmail });
    console.log("User is ,", user);

    // Render the view with the user's details
    if (user) {
      res.render('protected', {
        firstName: user.firstName,
        lastName: user.lastName,
        currentTime: new Date().toLocaleTimeString()
      });
    } else {
      // Handle the case where the user is not found
      console.log(`No user found with email address: ${userEmail}`);
      res.redirect('/login');
    }
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/create_exercise', (req, res) => {
  const enumsCopy = JSON.parse(JSON.stringify(enums));
  res.render('create_exercise', enumsCopy);
});

app.post('/create_exercise', async (req, res) => {
  // Access the data from the form submission
  const { name, force, level, mechanic, equipment } = req.body;

  // Get the 'exercizes' collection
  const exercizes = await exercizesCollection();

  // Create a new exercise document
  const newExercise = {
    name,
    force,
    level,
    mechanic,
    equipment
  };

  // Insert the new exercise into the 'exercizes' collection
  const insertInfo = await exercizes.insertOne(newExercise);
  if (insertInfo.insertedCount === 0) throw 'Could not add exercise';


  // Send a response
  res.send('Exercise created successfully');
});

app.post('/create_workout', async (req, res) => {
  // Access the data from the form submission
  const { exerciseName, category, muscleGroups, sets, reps, weight, weightUnit } = req.body;

  // Get the 'workouts' collection
  const workouts = await workoutsCollection();

  // Create a new workout document
  const newWorkout = {
    exerciseName,
    category,
    muscleGroups: Array.isArray(muscleGroups) ? muscleGroups.map(group => group.trim()) : [muscleGroups], // Ensure muscleGroups is an array
    sets: parseInt(sets),
    reps: parseInt(reps),
    weight,
    weightUnit,
    date: new Date() // Set the current date and time
  };

  // If a user is in the session, set the user ID from the session
  if (req.session.user) {
    newWorkout.userId = req.session.user._id;
  }

  // Insert the new workout into the 'workouts' collection
  const insertInfo = await workouts.insertOne(newWorkout);
  if (insertInfo.insertedCount === 0) throw 'Could not add workout';

  // Send a response
  res.send('Workout created successfully');
});

app.get('/create_workout', async (req, res) => {
  const exercizes = await exercizesCollection();
  const allExercizes = await exercizes.find({}).toArray();
  const enumsCopy = JSON.parse(JSON.stringify(enums));
  res.render('create_workout', { allExercizes, ...enumsCopy });
});

app.get('/view_workout_templates', async (req, res) => {
  const workouts = await workoutsCollection();
  const allWorkouts = await workouts.find({}).toArray();
  res.render('view_workout_templates', { workouts: allWorkouts });
});