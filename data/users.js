//import mongo collections, bcrypt and implement the following data functions
import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export const registerUser = async (
  firstName,
  lastName,
  emailAddress,
  password,
  dob,
  age,
  gender,
) => {

  const userCollection = await users();
  //dob and age are readonly on the registration form
  //valid strings, fields supplied, character count
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.length < 2 || firstName.length > 25) {
    throw new Error('Invalid firstname');
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0 || lastName.length < 2 || lastName.length > 25) {
    throw new Error('Invalid lastname');
  }
  if (!emailAddress || typeof emailAddress !== 'string' || emailAddress.trim().length === 0) {
    throw new Error('Invalid emailAddress');
  }
  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(emailAddress)) {
    throw new Error('Invalid email address format for emailAddress');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Invalid password');
  }
  validatePassword(password);
  
  if(!age){
    throw new Error('Invalid age');
  }
  if(!dob){
    throw new Error('Invalid Date of Birth');
  }
  if(!gender || typeof gender !=='string'){
    throw new Error('Error with gender input');
  }

  //trimming, email address case insenstive
  firstName = firstName.trim();
  lastName = lastName.trim();
  emailAddress = emailAddress.trim().toLowerCase();
  
  //should not contain numbers
  if (/\d/.test(firstName)) {
    throw new Error('First name should not contain numbers');
  }

  if (/\d/.test(lastName)) {
    throw new Error('Last name should not contain numbers');
  }

  //Duplicate email in database
  const email = await userCollection.findOne({ emailAddress: emailAddress })
  if (email != null){
    throw new Error('Email Address supplied is already in use');
  }

  //gender validation
  if (gender !== "male" && gender !== "female") {
    throw new Error('Invalid gender')
  }

  const newPass = await bcrypt.hash(password, 10);

  const creationDate = Date();

  const customWorkouts =[];

  const newUser = {
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    password: newPass,
    DateOfBirth: dob,
    age: age,
    gender: gender,
    registerDate : creationDate,
    customWorkouts : customWorkouts,
  };
  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('Could not add user');
  }

  const insertedUser = await userCollection.findOne({
    _id: insertInfo.insertedId,
  });

  return { insertedUser: insertedUser, inserted: true };
};

export const loginUser = async (emailAddress, password) => {
  //all fields must supplied
  if (!emailAddress || !password) {
    throw new Error('Email or password missing');
  }
  if (password.trim() === '') {
    throw new Error('Password is not supplied or is an empty string')
  } 
  if (!emailAddress || typeof emailAddress !== 'string' || emailAddress.trim() === '') {
    throw new Error('Invalid emailAddress');
  }

  //email validation
  emailAddress = emailAddress.trim().toLowerCase()

  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(emailAddress)) {
    throw new Error('Invalid email address format for emailAddress');
  }
  validatePassword(password);

  const userCollection = await users();

  const userFound = await userCollection.findOne({
    'emailAddress': emailAddress
  });

  if (!userFound) {
    throw new Error('No user found with that email address');
  }
  const passwordMatch = await bcrypt.compare(password, userFound.password);

  if (!passwordMatch) {
    throw new Error('Incorrect Password');
  }

  const userInfo = {
    firstName: userFound.firstName,
    lastName: userFound.lastName,
    emailAddress: userFound.emailAddress,
    dob: userFound.dob,
    age: userFound.age,
    gender: userFound.gender,
    customWorkouts : userFound.customWorkouts,

  };
  return userInfo;

};

export const removeUser = async (userId) => {
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


  const userCollection = await users();
  const objectId = new ObjectId(userId);
  const user = await userCollection.findOne({_id: objectId});

  if (!user) {
    throw new Error('User not found');
  }

  const deleteInfo = await userCollection.deleteOne({_id: objectId});

  if(deleteInfo.deletedCount === 1){
    return { success: true, message: 'User successfully removed', user };
  } else {
    // If deletion was not successful
    return { success: false, message: 'User could not be removed', user };
  }
};

//helper

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be a valid string with a minimum length of 8 characters');
  }
  if (password.includes(' ')){
    throw new Error('Password cannot contain spaces');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase character');
  }
  if (password.search(/[a-z]/)<0){
    throw new Error('Password must contain at least one lower case character');
  }
  if (!/\d/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+{}[\]:;<>,.?~\\-]/.test(password)) {
    throw new Error('Password must contain at least one special character');
  }
  console.log('Password is valid:', password);
}
// function validateDOB(input){
//   const dateOBRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

//   return dateOBRegex.text(input);

// }