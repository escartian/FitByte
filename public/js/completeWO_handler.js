document.addEventListener("DOMContentLoaded", function () {
    // Find all elements with the class "complete-button"
    var completeButtons = document.querySelectorAll(".complete-button");

    // Iterate over each button and add a click event listener
    completeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Retrieve data attributes from the button
            var userId = button.dataset.userId;
            var workoutName = button.dataset.workoutName;
            var workoutId = button.dataset.workoutId;

            // Make an asynchronous POST request to update user customWorkouts
            fetch('/completed_workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    workoutName: workoutName,
                    workoutId: workoutId,
                }),
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response if needed
                console.log(data);
                // Optionally, you can disable the button to prevent further clicks
                button.textContent = "Completed!";
                button.disabled = true;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});