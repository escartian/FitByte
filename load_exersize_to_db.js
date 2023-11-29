import fs from 'fs';
import { MongoClient } from 'mongodb';

const parentDirectory = 'exercises';
/**
 * Retrieves the subfolders within a given directory.
 *
 * @param {string} directory - The directory to retrieve subfolders from.
 * @return {Array} An array containing the names of the subfolders.
 */
const getSubfolders = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
};
/**
 * Loads JSON files from a specified subfolder path and inserts their data into a collection.
 *
 * @param {string} subfolderPath - The path to the subfolder containing the JSON files.
 * @param {Object} collection - The collection where the JSON data will be inserted.
 * @return {boolean} Returns true if a document with the same name already exists in the collection, otherwise false.
 */
const loadJSONFiles = async (subfolderPath, collection) => {
  const jsonFiles = fs.readdirSync(subfolderPath)
    .filter(file => file.endsWith('.json'));

  for (let i = 0; i < jsonFiles.length; i++) {
    const jsonFile = jsonFiles[i];
    const filePath = `${subfolderPath}/${jsonFile}`;
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    // Add image paths to JSON data
    jsonData.imagePaths = [`${subfolderPath}/images/0`, `${subfolderPath}/images/1`];

    // Check if a document with the same name already exists
    const existingDocument = await collection.findOne({ name: jsonData.name });

    if (existingDocument) {
      console.log("Existing database object found. Skipping insertions.");
      //console.log(`A document with the name ${jsonData.name} already exists`);
      return true;
    }

    // If the document does not exist, insert it
    try {
      const result = await collection.insertOne(jsonData);
      console.log(`Inserted document with _id: ${result.insertedId}`);
    } catch (err) {
      console.error(err);
    }
  }

  return false;
};
/**
 * Connects to a MongoDB database, loads data from JSON files into a collection,
 * and returns the collection.
 *
 * @return {Collection} The MongoDB collection with loaded data.
 */
export const connectAndLoadData = async () => {
  try {
    const url = 'mongodb://localhost:27017'; // replace with your MongoDB connection string
    const dbName = 'FitByte'; // replace with your database name
    const collectionName = 'exercizes'; // replace with your collection name

    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Create a unique index on the 'name' field
    await collection.createIndex({ name: 1 }, { unique: true });

    const subfolders = getSubfolders(parentDirectory);

    for (const subfolder of subfolders) {
      const subfolderPath = `${parentDirectory}/${subfolder}`;
      const duplicateFound = await loadJSONFiles(subfolderPath, collection);
      if (duplicateFound) {
        break;
      }
    }
    client.close();
  } catch (err) {
    console.error(err);
  }
};