import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';


/**
 * Creates a new workout for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} workoutName - The name of the workout.
 * @throws {Error} If userId is missing, not a string, an empty string or just spaces, or an invalid object ID.
 * @throws {Error} If the user is not found.
 * @return {Object} The updated user object including the workoutName.
 */
export const createWorkout = async (userId, workoutName) => {
  if (!userId) {
    throw new Error('Missing userID');
  }
  if (typeof userId !== 'string') {
    throw new Error('Id must be a string');
  }

  if (userId.trim().length === 0) {
    throw new Error('Id cannot be an empty string or just spaces');
  }

  userId = userId.trim();

  const objectId = new ObjectId(userId);
  if (!ObjectId.isValid(objectId)) {
    throw new Error('Invalid object ID');
  }
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: objectId });

  if (!user) {
    throw new Error('Event not found');
  }

  const newWorkout = {
    _id: new ObjectId(),
    workoutName,
    exercises: [],

  };

  user.customWorkouts.push(newWorkout);


  await userCollection.updateOne(
    { _id: objectId },
    {
      $set: {
        customWorkouts: user.customWorkouts,
      },
    }
  );

  return user;
};

//adding function to edit excersize array within customworkouts

/**
 * Adds sets to an exercise in a workout for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} workoutId - The ID of the workout.
 * @param {string} exerciseName - The name of the exercise.
 * @param {number} totalSets - The total number of sets to add.
 * @param {array} setsDetails - An array of objects containing details of each set.
 * @return {object} The updated user object.
 */
export const addSetsToExercise = async (userId, workoutId, exerciseName, totalSets, setsDetails) => {
  const userCollection = await users();

  const user = await userCollection.findOne({ _id: new ObjectId(userId) });

  const workout = user.customWorkouts.find(workout => workout._id.toString() === workoutId);

  if (!workout) {
    throw new Error('Workout not found');
  }

  const exercise = workout.exercises.find(ex => ex.exerciseName === exerciseName);

  if (!exercise) {
    throw new Error('exercise not found');
  }

  for (let i = 1; i <= totalSets; i++) {
    const setsDetails = setsDetails[i - 1];
    exercise.sets.push({
      setNumber: i,
      reps: setsDetails.reps,
      weight: setsDetails.weight,
    });
  }

  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        customWorkouts: user.customWorkout,
      },
    }
  );

  return user;

};

//the above is set to use a workout id so I figuered we may need a function to find id by workout name

/**
 * Finds the workout ID by workout name for a given user.
 * 
 * @param {string} userId - The ID of the user.
 * @param {string} workoutName - The name of the workout.
 * @return {string|null} The ID of the workout if found, otherwise null.
 */
export const findWorkoutIdByName = async (userId, workoutName) => {
  const userCollection = await users();

  const user = await userCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }
  const workout = user.customWorkout.find(workout => workout.name === workoutName);
  return workout ? workout.id_toString() : null;
}

/**
 * Retrieves all workouts for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @throws {Error} Throws an error if the user ID is missing, not a string, an empty string, or just spaces.
 * @throws {Error} Throws an error if the user with the provided ID is not found.
 * @throws {Error} Throws an error if the object ID is invalid.
 * @return {array} An array of custom workouts for the user.
 */
export const getAllWorkouts = async (userId) => {
  //Implement Code here
  if (!userId) {
    throw new Error('You must provide an id to search for');
  }

  if (typeof userId !== 'string') {
    throw new Error('Id must be a string');
  }

  if (userId.trim().length === 0) {
    throw new Error('Id cannot be an empty string or just spaces');
  }

  userId = userId.trim();

  const objectId = new ObjectId(userId);

  if (!ObjectId.isValid(objectId)) {
    throw new Error('Invalid object ID');
  }


  const userCollection = await users();
  const user = await userCollection.findOne({ _id: objectId });

  if (!user) {
    throw new Error('user not found');
  }

  return user.customWorkouts;

};

/**
 * Retrieves a custom workout based on the provided user workout ID.
 *
 * @param {string} userWorkoutId - The ID of the user workout to retrieve.
 * @throws {Error} Throws an error if userWorkoutId is falsy.
 * @throws {Error} Throws an error if userWorkoutId is not a string.
 * @throws {Error} Throws an error if userWorkoutId is an empty string or just spaces.
 * @return {Object} Returns the custom workout object.
 */
export const getWorkout = async (userWorkoutId) => {
  //Implement Code here
  if (!userWorkoutId) {
    throw new Error('You must provide an id to search for');
  }

  if (typeof userWorkoutId !== 'string') {
    throw new Error('Id must be a string');
  }

  if (userWorkoutId.trim().length === 0) {
    throw new Error('Id cannot be an empty string or just spaces');
  }

  userWorkoutId = userWorkoutId.trim();

  const userCollection = await users();
  const objectId = new ObjectId(userWorkoutId);

  const user = await userCollection.findOne({
    'customWorkouts._id': objectId,
  });

  if (!user) {
    throw new Error('User not found for customWorkoutID');
  }

  const customWorkout = user.customWorkouts.find((a) => a._id.equals(objectId));
  if (!customWorkout) {
    throw new Error('customWorkout not found');
  }

  return customWorkout;
};

/**
 * Removes a workout from the user's customWorkouts array.
 *
 * @param {string} customWorkoutId - The ID of the workout to be removed.
 * @throws {Error} If customWorkoutId is not provided, or is not a string, or is an empty string or just spaces.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the workout is not found.
 * @return {Object} The updated user object.
 */
export const removeWorkout = async (customWorkoutId) => {
  //Implement Code here

  if (customWorkoutId) {
    throw new Error('You must provide an id to search for');
  }

  if (typeof customWorkoutId !== 'string') {
    throw new Error('Id must be a string');
  }

  if (customWorkoutId.trim().length === 0) {
    throw new Error('Id cannot be an empty string or just spaces');
  }

  customWorkoutId = customWorkoutId.trim();


  const userCollection = await users();
  const objectId = new ObjectId(customWorkoutId);
  const user = await userCollection.findOne({
    'customWorkouts._id': objectId,
  });

  if (!user) {
    throw new Error('User not found');
  }

  const workoutIndex = user.customWorkouts.findIndex((a) => a._id.equals(objectId));

  if (workoutIndex === -1) {
    throw new Error('Workout not found');
  }

  user.customWorkouts.splice(workoutIndex, 1);

  await userCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        customWorkouts: user.customWorkouts,
      },
    }
  );

  return user;
};



