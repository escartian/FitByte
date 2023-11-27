import {dbConnection} from './mongoConnection.js';

/* This will allow you to have one reference to each collection per app */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// Now, you can list your collections here: 

export const users = getCollectionFn('users');
export const workouts = getCollectionFn('workouts');
export const templates = getCollectionFn('templates'); //probably don't need. similar to event attendees
export const excersizes = getCollectionFn('exercizes');

