# FitByte

FitByte is a fitness application built with Node.js, Express.js, MongoDB, and Handlebars. It allows users to view exercises, start workouts, and view previous workouts.
## About
This website was created as a final project
for Stevens Institute of Technology class CS 546
Web Programming. Fall 2023
## DataSet
The initial list of exersize data was obtained from https://github.com/wrkout/exercises.json
## Features
CORE FEATURES
1. Application has a list of default exercises, with the photos included.
2. Users have the ability to custom create workouts for an individual day, and then update the workout as they are completed (i.e. enter the sets and reps done for each exercise)
3. Users can also create workout templates, which they should be able to re-use and apply to multiple days.
4. Default exercises can be filtered by muscle group, category, etc.
5. User profiles, and a user profile page where users can view their workout history and track their progress

## Installation
Via command line interface using git bash:
1. Clone the repository:

git clone [https://github.com/escartian/fitbyte.git](https://github.com/escartian/FitByte)

2. Change to the repository directory:

cd fitbyte 

3. Install the dependencies:
Note: you need to have node.js installed to use npm.
Node.js version used for this app is currently at : Node.js v20.10.0. Once you have this version installed proceed.

npm install

4. Start the server:

npm start

The application will be running at `http://localhost:3000`.
## Usage

Go to your prefered browser and enter http://localhost:3000 into the url input field to access the website after successfully starting the server. This will take you to the home page.

To use FitByte, register an account, log in, and start a workout. You can also look at the exersizes and start an empty workout (manually add each exersize) or repeat a workout from the workout templates.
## Contributing
Please contact the owner of this repository if you wish to contribute

## License

[MIT](https://choosealicense.com/licenses/mit/)
