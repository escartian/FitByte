// Get the 'Add Exercise' button, the exercise name dropdown, the sets, reps, and weight fields, and the current workout list
const addExerciseButton = document.getElementById('addExercise');
const exerciseNameDropdown = document.getElementById('exerciseName');
const setsField = document.getElementById('sets');
const repsField = document.getElementById('reps');
const weightField = document.getElementById('weight');
const currentWorkoutList = document.getElementById('currentWorkout');
const exercisesField = document.getElementById('exercises');
const workoutForm = document.getElementById('workout-form');

// Get the workout data from the hidden field
const workoutDataElement = document.getElementById('workoutData');
const workoutData = JSON.parse(workoutDataElement.value);


// Update the current workout with the workout data from the server
currentWorkout = workoutData.exercises.map(exercise => {
    //console.log(exercise);
    return {
        exerciseName: exercise.exerciseName,
        sets: exercise.sets.map(set => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight
        }))
    };
}).filter(Boolean); // filter out null values

// Update the display of the current workout
updateCurrentWorkoutDisplay();

/**
 * Updates the display of the current workout.
 *
 * This function clears the current workout list and then adds a card for each exercise in the current workout.
 * Each card displays the exercise name, and a row for each set in the exercise.
 * Each row displays the set number, an editable field for the number of reps, and an editable field for the weight.
 * An 'Add Set' button is added to each exercise card, which allows the user to add a new set to the exercise.
 * When a 'Remove Exercise', 'Remove Set', or 'Add Set' button is clicked, the corresponding action is performed and the display is updated.
 *
 * @return {undefined} This function does not return a value.
 */
function updateCurrentWorkoutDisplay() {
    // Clear the current workout list
    currentWorkoutList.innerHTML = '';

    // Loop through the exercises in the current workout
    currentWorkout.forEach((exercise, index) => {
        // Create a container for the exercise
        const exerciseContainer = document.createElement('div');
        exerciseContainer.className = 'card my-3 exercise-container';

        // Create a container for the exercise name and 'Remove Exercise' button
        const nameContainer = document.createElement('div');
        nameContainer.className = 'card-header d-flex justify-content-between align-items-center';

        // Create a container for the exercise name
        const exerciseNameContainer = document.createElement('div');
        exerciseNameContainer.textContent = exercise.exerciseName;
        nameContainer.appendChild(exerciseNameContainer);

        // Create a 'Remove Exercise' button for each exercise
        const removeExerciseButton = document.createElement('button');
        removeExerciseButton.className = 'btn btn-danger remove-exercise-button';
        removeExerciseButton.textContent = 'Remove Exercise';
        removeExerciseButton.addEventListener('click', () => {
            // Remove the corresponding exercise from the current workout
            currentWorkout.splice(index, 1);

            // Update the display of the current workout
            updateCurrentWorkoutDisplay();
        });
        nameContainer.appendChild(removeExerciseButton);

        exerciseContainer.appendChild(nameContainer);

        // Loop through the sets of the exercise
        exercise.sets.forEach((set, setIndex) => {
            // Update the set number
            set.setNumber = setIndex + 1;

            // Create a container for the set
            const setContainer = document.createElement('div');
            setContainer.className = 'card-body d-flex justify-content-between align-items-center set-container';

            // Create a label for the set number
            const setNumberLabel = document.createElement('span');
            setNumberLabel.className = 'set-number-label';
            setNumberLabel.textContent = `Set ${set.setNumber}:`;
            setContainer.appendChild(setNumberLabel);

            // Create editable fields for reps and weight
            const repsLabel = document.createElement('label');
            repsLabel.textContent = 'Repetitions:';
            setContainer.appendChild(repsLabel);

            const repsInput = document.createElement('input');
            repsInput.className = 'form-control mx-1 reps-input';
            repsInput.type = 'number';
            repsInput.value = set.reps;
            repsInput.addEventListener('change', () => {
                set.reps = parseInt(repsInput.value);
            });
            setContainer.appendChild(repsInput);
            const weightLabel = document.createElement('label');
            weightLabel.textContent = 'Weight:';
            setContainer.appendChild(weightLabel);
            const weightInput = document.createElement('input');
            weightInput.className = 'form-control mx-1 weight-input';
            weightInput.type = 'number';
            weightInput.value = set.weight;
            weightInput.addEventListener('change', () => {
                set.weight = parseInt(weightInput.value);
            });
            setContainer.appendChild(weightInput);

            // Create a 'Remove Set' button for each set
            const removeSetButton = document.createElement('button');
            removeSetButton.className = 'btn btn-danger remove-set-button';
            removeSetButton.textContent = 'Remove Set';
            removeSetButton.addEventListener('click', () => {
                // Remove the corresponding set from the current exercise
                exercise.sets.splice(setIndex, 1);

                // Update the display of the current workout
                updateCurrentWorkoutDisplay();
            });
            setContainer.appendChild(removeSetButton);

            exerciseContainer.appendChild(setContainer);
        });

        // Create an 'Add Set' button for each exercise
        const addSetButton = document.createElement('button');
        addSetButton.className = 'btn btn-primary m-3 add-set-button';
        addSetButton.textContent = 'Add Set';
        addSetButton.addEventListener('click', () => {
            // Add a new set with default values to the current exercise
            exercise.sets.push({
                setNumber: exercise.sets.length + 1,
                reps: 0,
                weight: 0
            });

            // Update the display of the current workout
            updateCurrentWorkoutDisplay();
        });
        exerciseContainer.appendChild(addSetButton);

        // Append the exercise container to the current workout list
        currentWorkoutList.appendChild(exerciseContainer);
    });
}
// Listen for the 'click' event on the 'Add Exercise' button
addExerciseButton.addEventListener('click', function () {
    // Get the number of sets
    const numSets = parseInt(setsField.value);
    // Get the reps and weight
    const reps = parseInt(repsField.value);
    const weight = parseInt(weightField.value);
    // Create an array of sets with the specified number of sets
    const sets = Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1,
        reps: reps,
        weight: weight
    }));

    // Add the currently selected exercise to the current workout
    const selectedExercise = {
        exerciseName: exerciseNameDropdown.options[exerciseNameDropdown.selectedIndex].text,
        sets: sets
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