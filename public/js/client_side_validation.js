document.addEventListener('DOMContentLoaded', () => {
    // Define error messages
    const errorMessages = {
        login: {
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character, and must not include spaces',
        },
        registration: {
            firstName: 'First name must be a string, at least 2 characters long, no more than 25 characters long, and must not contain numbers',
            lastName: 'Last name must be a string, at least 2 characters long, no more than 25 characters long, and must not contain numbers',
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, one special character, and must not include spaces',
            confirmPassword: 'Confirm password must match password',
            ageUnderLimit: 'User must be 13 or older',
            ageOverLimit: 'User must be under 120 or younger',
            dob: 'Date of birth must be in mm/dd/yyyy format',
            gender: 'Must select gender',
        },
        loginNav: {
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character, and must not include spaces',
        },
        addExerciseForm: {
            sets: 'Set number must be greater than 0',
            reps: 'Rep number must be greater than 0',
            weight: 'Weight cannot be a negative number',
            emptyInput: 'Field cannot be empty'
        }
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
        } else if (formId === 'add-exercise-form') {
            return {
                sets: form.elements.sets.value,
                reps: form.elements.reps.value,
                weight: form.elements.weight.value
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
        if (!inputs.emailAddress || inputs.emailAddress.trim() === '' || typeof inputs.emailAddress !== 'string' || !emailRegex.test(inputs.emailAddress)) {
            errors.emailAddress = errorMessages[formType].emailAddress;
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
        if (!inputs.password || 
            inputs.password.trim() === '' || 
            typeof inputs.password !== 'string' || 
            inputs.password.includes(' ') ||
            !passwordRegex.test(inputs.password)) {
            errors.password = errorMessages[formType].password;
        }

        // Validate firstName, lastName, confirmPassword, and gender for registration form
        if (formType === 'registration') {
            if (!inputs.firstName || 
                inputs.firstName.trim() === '' || 
                typeof inputs.firstName !== 'string' ||
                /\d/.test(inputs.firstName) ||
                inputs.firstName.length < 2 || 
                inputs.firstName.length > 25) {
                errors.firstName = errorMessages.registration.firstName;
            }

            if (!inputs.lastName || 
                inputs.lastName.trim() === '' || 
                typeof inputs.lastName !== 'string' || 
                /\d/.test(inputs.lastName) ||
                inputs.lastName.length < 2 || 
                inputs.lastName.length > 25) {
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
        if (!inputs.emailAddress || inputs.emailAddress.trim() === '' || typeof inputs.emailAddress !== 'string' || !emailRegex.test(inputs.emailAddress)) {
            errors.emailAddress = errorMessages[formType].emailAddress;
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
        if (!inputs.password || 
            inputs.password.trim() === '' || 
            typeof inputs.password !== 'string' || 
            inputs.password.includes(' ') ||
            !passwordRegex.test(inputs.password)) {
            errors.password = errorMessages[formType].password;
        }
        }

        if (formType === 'addExerciseForm') {
            //Validate sets
         if (!inputs.sets || inputs.sets.trim() === '') {
             errors.sets = errorMessages[formType].emptyInput;
         } else if (inputs.sets <= 0) {
            errors.sets = errorMessages[formType].sets;
         }
 
         //Validate reps
         if (!inputs.reps || inputs.reps.trim() === '') {
            errors.reps = errorMessages[formType].emptyInput;
        } else if (inputs.reps <= 0) {
            errors.reps = errorMessages[formType].reps;
        }

         //Validate weight
         if (!inputs.weight || inputs.weight.trim() === '') {
            errors.weight = errorMessages[formType].emptyInput;
        } else if (inputs.weight < 0) {
            errors.weight = errorMessages[formType].weight;
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

    // Add event listener for login form submit
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

     // Add event listener for add exercise form button
     const addExerciseForm = document.querySelector('#add-exercise-form');
     if (addExerciseForm) {
        addExerciseForm.addEventListener('click', function (event) {
             event.preventDefault();
 
             const inputs = getFormInputs(this);
             const errors = validateFormInputs(inputs, 'addExerciseForm');
 
             displayErrors(errors, 'add-exercise-form');
 
             if (Object.keys(errors).length === 0) {
                 this.click();
             }
         });
     }
});