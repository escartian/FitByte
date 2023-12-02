// Get the 'Add Exercise' button, the exercise name dropdown, the sets, reps, and weight fields, and the current workout list
const addExerciseButton = document.getElementById('addExercise');
const exerciseNameDropdown = document.getElementById('exerciseName');
const setsField = document.getElementById('sets');
const repsField = document.getElementById('reps');
const weightField = document.getElementById('weight');
const currentWorkoutList = document.getElementById('currentWorkout');
const exercisesField = document.getElementById('exercises');
const workoutForm = document.getElementById('workout-form');

// Initialize an array to store the exercises in the current workout
let currentWorkout = [];
/**
* Updates the display of the current workout.
*
* This function clears the current workout list and then adds a list item for each exercise in the current workout.
* Each list item displays the exercise name, number of sets, number of reps, and weight.
* The function also adds a 'Remove' button to each list item, which allows the user to remove the exercise from the current workout.
* When a 'Remove' button is clicked, the corresponding exercise is removed from the current workout and the display is updated.
*
* @param {HTMLElement} currentWorkoutList - The HTML element representing the current workout list.
* @param {Array} currentWorkout - An array containing the exercises in the current workout.
* @return {undefined} This function does not return a value.
*/
function updateCurrentWorkoutDisplay() {
    // Clear the current workout list
    currentWorkoutList.innerHTML = '';

// Create and append headers
const headers = ['Exercise Name', 'Sets', 'Reps', 'Weight', 'Actions'];
const headerRow = document.createElement('div');
headerRow.style.display = 'flex';
headerRow.style.justifyContent = 'space-between';
headers.forEach((header, index) => {
    const headerElement = document.createElement('div');
    headerElement.textContent = header;
    // Adjust the width of the 'Exercise Name' column
    if (index === 0) {
        headerElement.style.width = '50%';
    } else {
        headerElement.style.width = '10%';
    }
    headerRow.appendChild(headerElement);
});
currentWorkoutList.appendChild(headerRow);

    // Loop through the exercises in the current workout
    currentWorkout.forEach((exercise, index) => {
        // Create a container for the exercise
        const exerciseContainer = document.createElement('div');
        exerciseContainer.style.display = 'flex';
        exerciseContainer.style.justifyContent = 'space-between';

// Create a container for each field
const nameContainer = document.createElement('div');
nameContainer.style.display = 'flex';
nameContainer.style.flexDirection = 'column';
nameContainer.style.width = '50%'; // Adjust the width of the 'Exercise Name' column
const nameField = document.createElement('input');
nameField.type = 'text';
nameField.value = exercise.name;
nameContainer.appendChild(nameField);


        // Create a container for the 'sets' field
        const setsContainer = document.createElement('div');
        setsContainer.style.display = 'flex';
        setsContainer.style.flexDirection = 'column';
        const setsField = document.createElement('input');
        setsField.type = 'text';
        setsField.value = exercise.sets;
        setsContainer.appendChild(setsField);

        // Create a container for the 'reps' field
        const repsContainer = document.createElement('div');
        repsContainer.style.display = 'flex';
        repsContainer.style.flexDirection = 'column';
        const repsField = document.createElement('input');
        repsField.type = 'text';
        repsField.value = exercise.reps;
        repsContainer.appendChild(repsField);

        // Create a container for the 'weight' field
        const weightContainer = document.createElement('div');
        weightContainer.style.display = 'flex';
        weightContainer.style.flexDirection = 'column';
        const weightField = document.createElement('input');
        weightField.type = 'text';
        weightField.value = exercise.weight;
        weightContainer.appendChild(weightField);

        // Append the fields to the exercise container
        exerciseContainer.appendChild(nameContainer);
        exerciseContainer.appendChild(setsContainer);
        exerciseContainer.appendChild(repsContainer);
        exerciseContainer.appendChild(weightContainer);
        // Create a 'Remove' button for each exercise
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger'; // Bootstrap class for a red button
        removeButton.style.marginRight = '10px';

        // Add a click event listener to the 'Remove' button
        removeButton.addEventListener('click', () => {
            // Remove the corresponding exercise from the current workout
            currentWorkout.splice(index, 1);

            // Update the display of the current workout
            updateCurrentWorkoutDisplay();
        });

        // Append the fields and button to the exercise container
        //exerciseContainer.appendChild(nameContainer);
        exerciseContainer.appendChild(removeButton);

        // Append the exercise container to the current workout list
        currentWorkoutList.appendChild(exerciseContainer);
    });
}
// Listen for the 'click' event on the 'Add Exercise' button
addExerciseButton.addEventListener('click', function () {
    // Add the currently selected exercise to the current workout
    const selectedExercise = {
        name: exerciseNameDropdown.options[exerciseNameDropdown.selectedIndex].text,
        sets: setsField.value,
        reps: repsField.value,
        weight: weightField.value
    };
    currentWorkout.push(selectedExercise);

    // Update the display of the current workout
    updateCurrentWorkoutDisplay();
});

// Listen for the 'change' event on the exercise name dropdown
exerciseNameDropdown.addEventListener('change', async function () {
    // Get the selected exercise
    const selectedExercise = exerciseNameDropdown.options[exerciseNameDropdown.selectedIndex].text;

    // Encode the selected exercise
    const encodedExercise = encodeURIComponent(selectedExercise);

    // Fetch the exercise data from the server
    const response = await fetch(`/exercises/${encodedExercise}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const exerciseData = await response.json();

    // Get the primary muscle group
    const primaryMuscleGroup = exerciseData.primaryMuscles[0];

    // Select the primary muscle group in the muscleGroups dropdown
    const muscleGroupsDropdown = document.getElementById('muscleGroups');
    for (let i = 0; i < muscleGroupsDropdown.options.length; i++) {
        if (muscleGroupsDropdown.options[i].value === primaryMuscleGroup) {
            muscleGroupsDropdown.options[i].selected = true;
            break;
        }
    }
});
// Listen for the 'submit' event on the workout form
workoutForm.addEventListener('submit', function () {
    // Update the exercises field with the current workout data
    exercisesField.value = JSON.stringify(currentWorkout);
});