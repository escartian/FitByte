import { users } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

//based similar to attendees from lab 6
const createWorkout = async (userId, workoutName) =>{
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
        _id : new ObjectId(),
        workoutName,
        exercises : [],
        
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

    export const addSetsToExercise = async (userId, workoutId, exerciseName, totalSets, setsDetails) =>{
      const userCollection = await users();

      const user = await userCollection.findOne({_id: new ObjectId(userId)});

      const workout = user.customWorkouts.find(workout => workout._id.toString() === workoutId);

      if(!workout){
        throw new Error('Workout not found');
      }

      const exercise = workout.exercises.find(ex=> ex.exerciseName === exerciseName);

      if(!exercise){
        throw new Error('exercise not found');
      }

      for(let i=1; i<=totalSets; i++){
        const setsDetails = setsDetails[i-1];
        exercise.sets.push({
          setNumber: i,
          reps: setsDetails.reps,
          weight: setsDetails.weight,
        });
      }

      await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {
          $set:{
            customWorkouts: user.customWorkout,
          },
        }
      );

      return user;

    };

    //the above is set to use a workout id so I figuered we may need a function to find id by workout name
    export const findWorkoutIdByName = async(userId, workoutName)=>{
      const userCollection = await users();

      const user = await userCollection.findOne({_id: new ObjectId(userId)});

      if(!user){
        throw new Error('User not found');
      }
      const workout = user.customWorkout.find(workout => workout.name=== workoutName);
      return workout ? workout.id_toString() : null;
    }

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
        const user = await userCollection.findOne({_id: objectId});
      
        if(!user){
          throw new Error('user not found');
        }
      
        return user.customWorkouts;
      
      };
      
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
      
      export const removeWorkout = async (customWorkoutId) => {
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
        
        
    
