
// Get the 'Add Exercise' button, the exercise name dropdown, the sets, reps, and weight fields, and the current workout list
const addExerciseButton = document.getElementById('addExercise');
const exerciseNameDropdown = document.getElementById('exerciseName');
const setsField = document.getElementById('sets');
const repsField = document.getElementById('reps');
const weightField = document.getElementById('weight');
const currentWorkoutList = document.getElementById('currentWorkout');

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

    // Add a list item for each exercise in the current workout
    for (let i = 0; i < currentWorkout.length; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = `${currentWorkout[i].name}: ${currentWorkout[i].sets} sets of ${currentWorkout[i].reps} reps at ${currentWorkout[i].weight} lbs`;

        // Add a 'Remove' button to the list item
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger'; // Bootstrap class for a red button
        removeButton.addEventListener('click', function () {
            // Remove the corresponding exercise from the current workout
            currentWorkout.splice(i, 1);

            // Update the display of the current workout
            updateCurrentWorkoutDisplay();
        });
        listItem.appendChild(removeButton);

        currentWorkoutList.appendChild(listItem);
    }
}

// Listen for the 'click' event on the 'Add Exercise' button
addExerciseButton.addEventListener('click', function () {
    // Add the currently selected exercise to the current workout
    const selectedExercise = {
        name: exerciseNameDropdown.value,
        sets: setsField.value,
        reps: repsField.value,
        weight: weightField.value
    };
    currentWorkout.push(selectedExercise);

    // Update the display of the current workout
    updateCurrentWorkoutDisplay();
});

// Listen for the 'change' event on the exercise name dropdown
exerciseNameDropdown.addEventListener('change', async function() {
    // Get the selected exercise
    const selectedExercise = exerciseNameDropdown.value;


    // Encode the selected exercise
    const encodedExercise = encodeURIComponent(selectedExercise);

    // Fetch the exercise data from the server
    const response = await fetch(`/api/exercises/${selectedExercise}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const exerciseData = await response.json();
  
    // Get the primary muscle group
    const primaryMuscleGroup = exerciseData.primaryMuscles[0]; // adjust this line as needed based on your data structure
  
    // Select the primary muscle group in the muscleGroups dropdown
    const muscleGroupsDropdown = document.getElementById('muscleGroups');
    for (let i = 0; i < muscleGroupsDropdown.options.length; i++) {
      if (muscleGroupsDropdown.options[i].value === primaryMuscleGroup) {
        muscleGroupsDropdown.options[i].selected = true;
        break;
      }
    }
  });