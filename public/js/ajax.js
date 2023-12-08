
$(document).ready(function () {
    //login navbar form
    $('#login-nav-btn').on('click', function (event) {
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
            beforeSend: function () {
                if (typeof emailAddressInput !== 'string' || !emailRegex.test(emailAddressInput)) {
                    $emailAddressErrorNav.html('Email address must be a valid email');
                    return false;
                }

                if (typeof passwordInput !== 'string' || !passwordRegex.test(passwordInput)) {
                    $passwordErrorNav.html('Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character');
                    $emailAddressErrorNav.hide()
                    return false;
                }

            },
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

    //age calculation for form registration
    $('#dobInput').datepicker({
        onSelect: function(value, ui) {
            var today = new Date(),
                dob = new Date(value),
                age = new Date(today - dob).getFullYear() - 1970;
            $('#ageInput').val(age);
        },
        maxDate: '+0d',
        yearRange: '1920:2050',
        changeMonth: true,
        changeYear: true
    });

});







