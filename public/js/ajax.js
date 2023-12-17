/* global $ */
$(document).ready(function () {
    //login navbar form
    $('#login-nav-btn').on('click', async function (event) {
        event.preventDefault();

        const emailAddressInput = $('#emailAddressInput').val().trim();
        const passwordInput = $('#passwordInput').val().trim();

        var $emailAddressErrorNav = $('#emailAddressErrorNav');
        var $passwordErrorNav = $('#passwordErrorNav');
        var $loginNavError = $('#loginNavError');


        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

        $.ajax({
            url: '/login',
            type: 'POST',
            data: { emailAddressInput, passwordInput },
            /**
             * This function is called before sending the data.
             * It validates the email address and password inputs.
             *
             * @return {boolean} Returns false if the email address or password input is invalid.
             */
            beforeSend: function () {  
                if (!emailAddressInput || emailAddressInput.trim() === '' || typeof emailAddressInput !== 'string' || !emailRegex.test(emailAddressInput)) {
                    $emailAddressErrorNav.html('Email address must be a valid email');
                    return false;
                }

                if (typeof passwordInput !== 'string' || !passwordRegex.test(passwordInput)) {
                    $passwordErrorNav.html('Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character');
                    $emailAddressErrorNav.hide()
                    return false;
                }
            },
            /**
             * Executes the success callback function with the response object.
             *
             * @param {object} response - The response object from the API call.
             */
            success: function (response) {
                if (response.success) {
                    console.log('login successful')
                    window.location.reload();
                } else {
                    $emailAddressErrorNav.hide()

                    $loginNavError.text('Login failed');
                }
            }
        });
    });

    //remove Info Alert when add exercise is clicked
    $("#addExercise").click(function(){
        $("#alertInfo").remove();
      });

    //age calculation for form registration
    $('#dobInput').datepicker({
        /**
         * Handles the event when a value is selected.
         *
         * @param {type} value - The selected value.
         * @param {type} ui - The user interface object. - not used
         * @return {type} The updated value of the age input field.
         */
        onSelect: function(value, ui) {
            var today = new Date(),
                dob = new Date(value),
                age = new Date(today - dob).getFullYear() - 1970;
            $('#ageInput').val(age);
        },
        maxDate: '+0d',
        yearRange: '1900:2050',
        changeMonth: true,
        changeYear: true
    });

});







