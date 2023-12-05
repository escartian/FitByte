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
            age: 'User must be 18 or older',
            dob: 'Date of birth must be in mm/dd/yyyy format',
            gender: 'Must select gender',
        },
        loginNav: {
            emailAddress: 'Email address must be a valid email',
            password: 'Password must be at least 8 characters long, contain at least one uppercase character, one number, and one special character',
        },
    };

    // Function to get form inputs
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

    // Function to validate form inputs
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

            //Validate Age
            const ageRegex = /^(1[8-9]|[2-9][0-9]|100)$/;
            
            if (!ageRegex.test(inputs.age)) {
                errors.age = errorMessages[formType].age;
            }

            if (typeof inputs.gender !== 'string' || (inputs.gender !== 'male' && inputs.gender !== 'female')) {
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

    // Function to display errors
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