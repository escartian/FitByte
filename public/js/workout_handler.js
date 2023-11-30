
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

    // Create a document fragment to hold the list items
    const fragment = document.createDocumentFragment();

    // Loop through the exercises in the current workout
    currentWorkout.forEach((exercise, index) => {
        // Create a list item for each exercise
        const listItem = document.createElement('li');
        listItem.textContent = `${exercise.name}: ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} lbs`;

        // Create a 'Remove' button for each exercise
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger'; // Bootstrap class for a red button

        // Add a click event listener to the 'Remove' button
        removeButton.addEventListener('click', () => {
            // Remove the corresponding exercise from the current workout
            currentWorkout.splice(index, 1);

            // Update the display of the current workout
            updateCurrentWorkoutDisplay();
        });

        // Append the 'Remove' button to the list item
        listItem.appendChild(removeButton);

        // Append the list item to the document fragment
        fragment.appendChild(listItem);
    });

    // Append the document fragment to the current workout list
    currentWorkoutList.appendChild(fragment);
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