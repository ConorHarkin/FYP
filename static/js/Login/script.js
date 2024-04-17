document.addEventListener('DOMContentLoaded', function () {
    // Debugging: Log to ensure script started
    console.log("Script loaded");

    // Select switcher buttons
    const switcherLogin = document.querySelector('.switcher-login');
    const switcherSignup = document.querySelector('.switcher-signup');

    // Debugging: Log to see if elements are selected
    console.log("Login switcher:", switcherLogin);
    console.log("Signup switcher:", switcherSignup);

    // Toggle function to switch forms
    function toggleForms() {
        const formWrapperLogin = document.querySelector('.form-wrapper.is-active');
        const formWrapperSignup = document.querySelector('.form-wrapper:not(.is-active)');

        // Debugging: Log to see if forms are selected
        console.log("Active form wrapper:", formWrapperLogin);
        console.log("Inactive form wrapper:", formWrapperSignup);

        formWrapperLogin.classList.remove('is-active');
        formWrapperSignup.classList.add('is-active');
    }

    // Attach event listeners to switcher buttons
    if (switcherLogin && switcherSignup) {
        switcherLogin.addEventListener('click', toggleForms);
        switcherSignup.addEventListener('click', toggleForms);
    } else {
        console.error("Switcher elements not found");
    }
});
