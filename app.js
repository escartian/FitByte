import { engine , create} from 'express-handlebars';
import express from 'express';
import { connectAndLoadData } from './load_exersize_to_db.js';
import { requireAuth, requireAdmin} from './middleware.js';
import session from 'express-session';
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

const hbs = create({
  helpers: {
    encodeURI: function(str) {
      console.log("Encoding URI from exersize name");
      const encodedStr = encodeURI(str);
      const replacedStr = encodedStr.split('/').join('%2F');
      return replacedStr;
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
// Wait for the database connection to be established before starting the server
connectAndLoadData().then((col) => {
    collection = col;

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  });

  app.get('/', (req, res) => {
    res.render('layouts/main');
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
  const userCollection = await posts();
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
      role: user.role
  };

  // Redirect to the appropriate page based on the user's role
  console.log("User role is" , user.role);
  if (user.role === 'admin') {
      return res.redirect('/admin');
  } else {
      return res.redirect('/protected');
  }
});
app.post('/register', async (req, res) => {
  const { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, roleInput } = req.body;

  // Validate the input fields
  if (!firstNameInput || !lastNameInput || !emailAddressInput || !passwordInput || !confirmPasswordInput || !roleInput) {
      return res.status(400).send('Missing required fields');
  }

  // Call the registerUser db function
  const result = await registerUser(firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, roleInput);
  
  console.log('registerUser result:', result);

  // Handle the response from the db function
  if (result.insertedUser) {
      console.log('Redirecting to /login');
      return res.redirect('/login');
  } else {
      return res.status(500).render('error', { error: 'Error registering user' });
  }
});
app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.render('admin');
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
      const userEmail = req.session.user.emailAddress;

      // Query the database for the user
      const userCollection = await posts();
      const user = await userCollection.findOne({ emailAddress: userEmail });
      console.log("User is ,", user);

      // Render the view with the user's details
      res.render('protected', {
          firstName: user.firstName,
          lastName: user.lastName,
          currentTime: new Date().toLocaleTimeString(),
          role: user.role
      });
  } else {
      res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});
