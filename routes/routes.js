import express from 'express';
import path from 'path';
import fs from 'fs';
import { users, excersizes as exercizesCollection, workouts as workoutsCollection } from '../config/mongoCollections.js';
import { registerUser } from '../data/users.js';
import bcrypt from 'bcrypt';
import * as enums from '../data/enums.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/exercises', async (req, res) => {
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
    const collection = await exercizesCollection();
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

router.get('/exercises/:name', async (req, res) => {
    const exerciseName = req.params.name;

    const collection = await exercizesCollection();
    const exercise = await collection.findOne({ name: { $regex: new RegExp(`^${exerciseName}$`, 'i') } });
    res.render('exercise', exercise);
});

//the following generally does not need to be used, but can be useful
router.get('/exercises/:exercise/images/:image', (req, res) => {
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
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', async (req, res) => {
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
router.post('/register', async (req, res) => {
    console.log(req.body);
    const { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, /* roleInput */ } = req.body;

    console.log('Registering user with data:', { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput /*, roleInput*/ });

    // Validate the input fields
    if (!firstNameInput || !lastNameInput || !emailAddressInput || !passwordInput || !confirmPasswordInput /*|| !roleInput*/) {
        return res.status(400).send('Missing required fields');
    }

    // Check if a user with the given email address already exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({ emailAddress: emailAddressInput });

    if (existingUser) {
        return res.render('register', { error: 'A user with this email address already exists' });
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

router.get('/error', (req, res) => {
    res.render('error');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/protected', async (req, res) => {
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

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/create_exercise', (req, res) => {
    const enumsCopy = JSON.parse(JSON.stringify(enums));
    res.render('create_exercise', enumsCopy);
});

router.post('/create_exercise', async (req, res) => {
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

router.post('/create_workout', async (req, res) => {
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

router.get('/create_workout', async (req, res) => {
    const exercizes = await exercizesCollection();
    const allExercizes = await exercizes.find({}).toArray();
    const enumsCopy = JSON.parse(JSON.stringify(enums));
    res.render('create_workout', { allExercizes, ...enumsCopy });
});

router.get('/view_workout_templates', async (req, res) => {
    const workouts = await workoutsCollection();
    const allWorkouts = await workouts.find({}).toArray();
    res.render('view_workout_templates', { workouts: allWorkouts });
});

export default router;