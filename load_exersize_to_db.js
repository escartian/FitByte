import fs from 'fs';
import { MongoClient } from 'mongodb';

const parentDirectory = 'exercises';

const getSubfolders = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
};
const loadJSONFiles = async (subfolderPath, collection) => {
  const jsonFiles = fs.readdirSync(subfolderPath)
    .filter(file => file.endsWith('.json'));

  for (const jsonFile of jsonFiles) {
    const filePath = `${subfolderPath}/${jsonFile}`;
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    // Add image paths to JSON data
    jsonData.imagePaths = [`${subfolderPath}/images/0`, `${subfolderPath}/images/1`];

    // Check if a document with the same name already exists
    const existingDocument = await collection.findOne({ name: jsonData.name });

    if (!existingDocument) {
      // If the document does not exist, insert it
      collection.insertOne(jsonData)
        .then(result => {
          console.log(`Inserted document with _id: ${result.insertedId}`);
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      console.log(`A document with the name ${jsonData.name} already exists`);
    }
  }
};

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

    subfolders.forEach(subfolder => {
      const subfolderPath = `${parentDirectory}/${subfolder}`;
      loadJSONFiles(subfolderPath, collection);
    });

    // Return the collection
    return collection;
  } catch (err) {
    console.error(err);
  }
};
