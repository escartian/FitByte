import express from 'express';
import path from 'path';
import fs from 'fs';
import { users, excersizes as exercizesCollection, workouts as workoutsCollection } from '../config/mongoCollections.js';
import { registerUser, updateUserCustomWorkouts } from '../data/users.js';
import bcrypt from 'bcrypt';
import * as enums from '../data/enums.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ObjectId } from 'mongodb';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/', (req, res) => {
    res.render('home');
        
});
router.get('/exercises', async (req, res) => {
    // Get query parameters from the URL
    const search = req.query.search || '';
    const sort = req.query.sort || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const level = req.query.Level;
    const force = req.query.Force;
    const mechanic = req.query.Mechanic;
    const equipment = req.query.Equipment;
    const category = req.query.Category;
    const muscle = req.query.Muscle;

    // Create filter object
    const filter = createFilter(level, force, mechanic, equipment, category, muscle);

    // Find exercises that match the search query
    const collection = await exercizesCollection();
    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }
    
    let exercises = await collection.find(query).toArray();
    
    // Sort exercises
    exercises = sortExercises(exercises, sort, sortOrder);

    // Filter exercises
    const filteredExercises = filterExercises(exercises, filter);

    res.render('exercises', { exercises: filteredExercises , 
        Category: enums.Category,
        Level: enums.Level,
        Force: enums.Force,
        Mechanic: enums.Mechanic,
        Equipment: enums.Equipment,
        Muscle: enums.Muscle,
        });
});

router.get('/exercises/:name', async (req, res) => {
    const exerciseName = req.params.name;

    const collection = await exercizesCollection();
    const exercise = await collection.findOne({ name: { $regex: new RegExp(`^${exerciseName}$`, 'i') } });
    res.render('exercise', exercise);
});

router.get('/exercises/:exercise/images/:image', (req, res) => {
    const exercise = req.params.exercise.replace(/ /g, '_').replace(/\//g, '_');
    const image = req.params.image;
    const imagePath = path.resolve(__dirname, '..', 'data', 'exercises', exercise, 'images', `${image}`);

    console.log("imagePath: " + imagePath);

    fs.readFile(imagePath, (err, data) => {
        if (err) {
            res.status(404).send('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        }
    });
});

router.get('/api/exercises/:name', async (req, res) => {
    const exerciseName = req.params.name;

    const collection = await exercizesCollection();
    const exercise = await collection.findOne({ name: { $regex: new RegExp(`^${exerciseName}$`, 'i') } });
    res.json(exercise);
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
    const user = await userCollection.findOne({ emailAddress: emailAddressInput.toLowerCase() });

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

    // return res.redirect('/profile');

    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({ success: true });
    } else {
        return res.redirect('/profile')
    }

});
router.post('/register', async (req, res) => {
    console.log(req.body);
    const { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, ageInput, dobInput, genderInput } = req.body;

    console.log('Registering user with data:', { firstNameInput, lastNameInput, emailAddressInput, passwordInput, confirmPasswordInput, ageInput, dobInput, genderInput  });

    // Validate the input fields
    if (!firstNameInput || !lastNameInput || !emailAddressInput || !passwordInput || !confirmPasswordInput || !ageInput || !dobInput || !genderInput) {
        return res.status(400).send('Missing required fields');
    }

    // Check if a user with the given email address already exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({ emailAddress: emailAddressInput });

    if (existingUser) {
        return res.render('register', { error: 'A user with this email address already exists' });
    }

    // Call the registerUser db function
    const result = await registerUser(firstNameInput, lastNameInput, emailAddressInput, passwordInput, dobInput, ageInput, genderInput);

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
    const errorMessage = req.session.error;
    req.session.error = null; // Clear the error message so it's not displayed again
    res.render('error', { error: errorMessage });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/profile', async (req, res) => {
    
    if (req.session.user) {
        // Get the user's email from the session
        console.log(req.session.user);
        const userEmail = req.session.user.emailAddress;
        const userId = req.session.user._id
        // Query the database for the user
        const userCollection = await users();
        const user = await userCollection.findOne({ emailAddress: userEmail });
        console.log("User is ,", user);

        res.redirect('/profile/'+userId)
    
} else {
    // Handle the case where the user is not found
    console.log(`No user session`);
    res.redirect('/login');
}
});

router.get('/profile/:id', async (req, res) => {
    const userEmail = req.session.user.emailAddress;
    const userCollection = await users();
    const user = await userCollection.findOne({ emailAddress: userEmail });
    const userId = req.session.user._id
        // Render the view with the user's details
    if (req.session.user._id === req.params.id) {
        if (user) {
            res.render('profile', {
                firstName: user.firstName,
                lastName: user.lastName,
                emailAddress: user.emailAddress,
                age: user.age,
                DateOfBirth: user.DateOfBirth,
                gender: user.gender,
                registerDate: user.registerDate,
                currentTime: new Date().toLocaleTimeString()
            });
        }
        } else {
            // Handle the case where the :id does not match session user id
            console.log(`Cannot view other user profiles`);
            return res.status(403).render('error', { error: 'Not authorized to view other user profiles' })
            //res.redirect('/profile/'+userId);
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
    const { workoutName, exercises } = req.body;

    // Check if exercises is not empty or undefined
    if (!exercises) {
        req.session.error = 'No exercises provided for workout template';
        res.redirect('/error');
        //throw new Error('No exercises provided');
    }
    // Parse the exercises field into an array
    const exercisesArray = JSON.parse(exercises);

    // Get the 'workouts' collection
    const workouts = await workoutsCollection();

    // Create a new workout document
    const newWorkout = {
        isTemplate: "1",
        name: workoutName,
        exercises: exercisesArray,
        date: new Date()
    };

    // If a user is in the session, set the user ID from the session
    if (req.session.user) {
        newWorkout.userId = req.session.user._id;
    }else{
        req.session.error = 'No user in session';
        return res.redirect('/error');
    }
    // Insert the new workout into the 'workouts' collection
    const insertInfo = await workouts.insertOne(newWorkout);
    if (insertInfo.insertedCount === 0) throw 'Could not add workout';

    // Store the success message in the session
    req.session.message = 'Workout created successfully';
    // Redirect
    res.redirect('/create_workout');
});

router.get('/create_workout', async (req, res) => {
    const message = req.session.message;
    req.session.message = null; // Clear the message so it's not displayed again
    const exercizes = await exercizesCollection();
    const allExercizes = await exercizes.find({}).toArray();
    const enumsCopy = JSON.parse(JSON.stringify(enums));
    res.render('create_workout', { allExercizes, ...enumsCopy, message , user: req.session.user});
  });

  router.get('/workout_templates', async (req, res) => {
    const workouts = await workoutsCollection();

    const userId = req.session.user ? req.session.user._id : null;
    // const allWorkouts = await workouts.find({ 
    //   isTemplate: "1",
    //   $or: [
    //     { userId: userId },
    //     { userId: { $exists: false } }
    //   ]
    // }).toArray();

    // console.log(allWorkouts);
    // console.log("Break");
    const everyWorkout = await workouts.find({}).toArray();
    // console.log(everyWorkout);

    everyWorkout.forEach(workout => {
        if (!workout.userId) {
            workout.isTemplate = "1";
        }
    });

    const allWorkouts = everyWorkout.filter(workout => workout.userId === userId || workout.isTemplate === "1");

    res.render('workout_templates', { workouts: allWorkouts, user: req.session.user , isWorkoutTemplatesPage: true});
});

router.get('/workout', async (req, res) => {
    const templateName = req.query.template;
    console.log(templateName);
    const workouts = await workoutsCollection();
    let workout;
    if (templateName) {
        workout = await workouts.findOne({ name: templateName });
        //console.log(workout);
        //console.log(workout.exercises[0].sets); // Log the sets array of the first exercise
    }
    const exercizes = await exercizesCollection();
    const allExercizes = await exercizes.find({}).toArray();
    //const enumsCopy = JSON.parse(JSON.stringify(enums));
    const enumsCopy = { ...enums };
    res.render('workout', { allExercizes, ...enumsCopy, workoutData: JSON.stringify(workout), user: req.session.user });
});
// router.get('/workout/:workoutName', async (req, res) => {
    router.get('/workout/:workoutId', async (req, res) => {

    const workoutName = req.params.workoutId;
    const objectId = new ObjectId(workoutName);

    const workouts = await workoutsCollection();
    const workout = await workouts.findOne({ _id: objectId });

    if (!workout) {
        res.status(404).send('Workout not found');
        return;
    }

    const exercizes = await exercizesCollection();
    const allExercizes = await exercizes.find({}).toArray();
    const enumsCopy = JSON.parse(JSON.stringify(enums));
    // res.render('workout', { allExercizes, ...enumsCopy, currentWorkout: workout });
    res.render('current_workout', { allExercizes, ...enumsCopy, currentWorkout: workout });
});
router.post('/finish_workout', async (req, res) => {
    // Access the data from the form submission
    let { workoutName, exercises, saveAsTemplate } = req.body;

    // Convert 'on' to 1 and undefined to 0
    saveAsTemplate = saveAsTemplate === 'on' ? "1" : "0";

    // Check if exercises is not empty or undefined
    if (!exercises) {
        req.session.error = 'No exersizes provided in workout session';
        res.redirect('/error');
    }
    // Parse the exercises field into an array
    const exercisesArray = JSON.parse(exercises);

    // Get the 'workouts' collection
    const workouts = await workoutsCollection();

    // Create a new workout document
    const newWorkout = {
        name: workoutName,
        exercises: JSON.parse(exercises),
        date: new Date(),
        isTemplate: saveAsTemplate
      };

    // If a user is in the session, set the user ID from the session
    if (req.session.user) {
        newWorkout.userId = req.session.user._id;
    }else{
        req.session.error = 'No user in session';
        res.redirect('/error');
    }

    // Insert the new workout into the 'workouts' collection
    const insertInfo = await workouts.insertOne(newWorkout);
    if (insertInfo.insertedCount === 0) throw 'Could not add workout';

    // Redirect the user to a success page
    res.redirect('/finish_workout');
});
router.get('/finish_workout', (req, res) => {
    res.render('finish_workout');
});

router.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'favicon.png'));
});

router.post('/completed_workout', async (req, res) => {
    try {
        const { workoutName, workoutId } = req.body;

        const userId = req.session.user._id;

        // Call the function to update user customWorkouts
        const updatedUser = await updateUserCustomWorkouts(userId, workoutName, workoutId);

        // Render the 'completed_workout' page and pass the user's customWorkouts
        res.render('completed_workout', { customWorkouts: updatedUser.customWorkouts });
    } catch (error) {
        console.error('Error updating user customWorkouts:', error);
        res.status(500).json({ success: false, message: 'Failed to update user customWorkouts' });
    }
});

router.get('/completed_workout', (req,res)=>{
    res.render('completed_workout', {customWorkouts: req.session.user.customWorkouts});
});

//helper functions

/**
 * Creates a filter object based on the provided parameters.
 *
 * @param {number} level - The level value for filtering. Optional.
 * @param {boolean} force - The force value for filtering. Optional.
 * @param {string} mechanic - The mechanic value for filtering. Optional.
 * @param {string} equipment - The equipment value for filtering. Optional.
 * @param {string} category - The category value for filtering. Optional.
 * @return {object} - The filter object with the specified properties.
 */
const createFilter = (level, force, mechanic, equipment, category, muscle) => {
    const filter = {};
    if (level && level !== 'all') {
        filter.level = level.toLowerCase();
    }
    if (force && force !== 'all') {
        filter.force = force.toLowerCase();
    }
    if (mechanic && mechanic !== 'all') {
        filter.mechanic = mechanic.toLowerCase();
    }
    if (equipment && equipment !== 'all') {
        filter.equipment = equipment.toLowerCase();
    }
    if (category && category !== 'all') {
        filter.category = category.toLowerCase();
    }
    if (muscle && muscle !== 'all') {
        filter.muscle = muscle.toLowerCase();
    }
    return filter;
};

/**
 * Sorts the given exercises array based on the specified sort and sortOrder parameters.
 *
 * @param {Array} exercises - The array of exercises to be sorted.
 * @param {string} sort - The property to sort the exercises by. Can be 'level'. Defaults to property name.
 * @param {string} sortOrder - The order in which to sort the exercises. Can be 'asc' for ascending or 'desc' for descending.
 * @return {Array} - The sorted array of exercises.
 */
const sortExercises = (exercises, sort, sortOrder) => {
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
    return exercises;
};

/**
 * Filters an array of exercises based on a given filter object.
 *
 * @param {Array} exercises - The array of exercises to filter.
 * @param {Object} filter - The filter object containing key-value pairs to match against exercises.
 * @return {Array} - The filtered array of exercises.
 */
const filterExercises = (exercises, filter) => {
    return exercises.filter(exercise => {
        for (let key in filter) {
            if (key === 'muscle') {
                // If the filter key is 'muscle', check both primary and secondary muscles
                const muscles = exercise.primaryMuscles.concat(exercise.secondaryMuscles);
                if (!muscles.includes(filter[key])) {
                    return false;
                }
            }
            else if (Array.isArray(exercise[key])) {
                // If the exercise property is an array, check if it contains the filter value
                if (!exercise[key].includes(filter[key])) {
                    return false;
                }
            } else {
                // If the exercise property is not an array, check if it's equal to the filter value
                if (exercise[key] !== filter[key]) {
                    return false;
                }
            }
        }
        return true;
    });
};
export default router;