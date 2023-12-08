document.addEventListener('DOMContentLoaded', () => {
    // Define error messages
    const errorMessages = {
        login: {
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character',
        },
        registration: {
            firstName: 'First name must be a string, at least 2 characters long, and no more than 25 characters long',
            lastName: 'Last name must be a string, at least 2 characters long, and no more than 25 characters long',
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character',
            confirmPassword: 'Confirm password must match password',
            ageUnderLimit: 'User must be 13 or older',
            ageOverLimit: 'User must be under 120 or younger',
            dob: 'Date of birth must be in mm/dd/yyyy format',
            gender: 'Must select gender',
        },
        loginNav: {
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character',
        },
    };


    /**
     * Returns an object containing the form inputs based on the form ID.
     *
     * @param {HTMLElement} form - The form element.
     * @return {Object} An object containing the form inputs.
     */
    function getFormInputs(form) {
        const formId = form.id
        if (formId === 'login-form') {
            return {
                emailAddress: form.elements.emailAddressInput.value,
                password: form.elements.passwordInput.value,
            };
        } else if (formId === 'registration-form') {
            return {
                firstName: form.elements.firstNameInput.value,
                lastName: form.elements.lastNameInput.value,
                emailAddress: form.elements.emailAddressInput.value,
                password: form.elements.passwordInput.value,
                confirmPassword: form.elements.confirmPasswordInput.value,
                age: form.elements.ageInput.value,
                dob: form.elements.dobInput.value,
                gender: form.elements.genderInput.value,
            };
        } else if (formId === 'login-nav-form') {
            return {
                emailAddress: form.elements.emailAddressInput.value,
                password: form.elements.passwordInput.value,
            };
        }
    }


    /**
     * Validates the form inputs based on the specified form type.
     *
     * @param {object} inputs - The input values for the form.
     * @param {string} formType - The type of form being validated.
     * @return {object} errors - An object containing any validation errors found.
     */
    function validateFormInputs(inputs, formType) {
        const errors = {};

        // Validate emailAddress
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (typeof inputs.emailAddress !== 'string' || !emailRegex.test(inputs.emailAddress)) {
            errors.emailAddress = errorMessages[formType].emailAddress;
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
        if (typeof inputs.password !== 'string' || !passwordRegex.test(inputs.password)) {
            errors.password = errorMessages[formType].password;
        }

        // Validate firstName, lastName, confirmPassword, and gender for registration form
        if (formType === 'registration') {
            if (typeof inputs.firstName !== 'string' || inputs.firstName.length < 2 || inputs.firstName.length > 25) {
                errors.firstName = errorMessages.registration.firstName;
            }

            if (typeof inputs.lastName !== 'string' || inputs.lastName.length < 2 || inputs.lastName.length > 25) {
                errors.lastName = errorMessages.registration.lastName;
            }

            if (inputs.confirmPassword !== inputs.password) {
                errors.confirmPassword = errorMessages.registration.confirmPassword;
            }

            if (!inputs.dob) {
                errors.dob = errorMessages[formType].dob;
            }

            // Validate Age
            const age = parseInt(inputs.age);

            if (isNaN(age) || age < 13 || age > 100) {
                if (age < 13) {
                    errors.age = errorMessages.registration.ageUnderLimit;
                } else if (age > 120) {
                    errors.age = errorMessages.registration.ageOverLimit;
                }
            }


            if (typeof inputs.gender !== 'string' || (inputs.gender !== 'male' && inputs.gender !== 'female' && inputs.gender !== 'other')) {
                errors.gender = errorMessages.registration.gender;
            }

        }
        if (formType === 'loginNav') {
            // Validate emailAddress
            const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
            if (typeof inputs.emailAddress !== 'string' || !emailRegex.test(inputs.emailAddress)) {
                errors.emailAddress = errorMessages[formType].emailAddress;
            }

            // Validate password
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
            if (typeof inputs.password !== 'string' || !passwordRegex.test(inputs.password)) {
                errors.password = errorMessages[formType].password;
            }
        }

        return errors;
    }


    /**
     * Display error messages for a given form.
     *
     * @param {Object} errors - An object containing error messages for each field in the form.
     * @param {string} formId - The ID of the form element.
     */
    function displayErrors(errors, formId) {
        const form = document.querySelector(`#${formId}`);
        if (form) {
            // Clear previous error messages
            const errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach((element) => {
                element.textContent = '';
            });

            // Display new error messages
            for (const field in errors) {

                const formTypeSuffix = formId === 'login-nav-form' ? 'Nav' : '';
                const errorElement = form.querySelector(`#${field}Error${formTypeSuffix}`);

                if (errorElement) {
                    errorElement.textContent = errors[field];
                }
            }
        }
    }

    // Add event listener for form submit
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const inputs = getFormInputs(this);
            const errors = validateFormInputs(inputs, 'login');

            displayErrors(errors, 'login-form');

            if (Object.keys(errors).length === 0) {
                this.submit();
            }
        });
    }

    // Add event listener for registration form submit
    const registrationForm = document.querySelector('#registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const inputs = getFormInputs(this);
            console.log('inputs:', inputs);

            const errors = validateFormInputs(inputs, 'registration');
            console.log('errors:', errors);

            displayErrors(errors, 'registration-form');

            if (Object.keys(errors).length === 0) {
                this.submit();
            }
        });
    }

    // Add event listener for nav form submit
    const loginNavForm = document.querySelector('#login-nav-form');
    if (loginNavForm) {
        loginNavForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const inputs = getFormInputs(this);
            const errors = validateFormInputs(inputs, 'loginNav');

            displayErrors(errors, 'login-nav-form');

            if (Object.keys(errors).length === 0) {
                this.submit();
            }
        });
    }
});