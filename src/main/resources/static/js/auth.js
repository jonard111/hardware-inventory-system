function validateRegisterForm(event) {
    clearMessages();

    const firstName = document.querySelector("[name='firstName']");
    const lastName = document.querySelector("[name='lastName']");
    const email = document.querySelector("[name='email']");
    const password = document.getElementById("regPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    const firstNameVal = firstName ? firstName.value.trim() : "";
    const lastNameVal = lastName ? lastName.value.trim() : "";
    const emailVal = email ? email.value.trim() : "";
    const passwordVal = password ? password.value : "";
    const confirmPasswordVal = confirmPassword ? confirmPassword.value : "";

    // Empty fields
    if (!firstNameVal || !lastNameVal || !emailVal || !passwordVal || !confirmPasswordVal) {
        if (event) event.preventDefault();
        showError("All fields are required.");
        return false;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
        if (event) event.preventDefault();
        showError("Please enter a valid email address.");
        return false;
    }

    // Password length
    if (passwordVal.length < 6) {
        if (event) event.preventDefault();
        showError("Password must be at least 6 characters.");
        return false;
    }

    // Password match
    if (passwordVal !== confirmPasswordVal) {
        if (event) event.preventDefault();
        showError("Passwords do not match.");
        return false;
    }

    return true; // allow submit
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById(`${id}-icon`);

    if (!input || !icon) return;

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    icon.classList.toggle("bi-eye", !isHidden);
    icon.classList.toggle("bi-eye-slash", isHidden);
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", validateRegisterForm);
});

function showError(message) {
    const box = document.getElementById("errorBox");
    if (!box) return;
    
    box.classList.remove("d-none");
    
    const msgSpan = document.getElementById("errorMessage");
    if (msgSpan) {
        msgSpan.innerText = message;
    } else {
        box.innerText = message;
    }
}

function showSuccess(message) {
    const box = document.getElementById("successBox");
    if (!box) return;

    box.classList.remove("d-none");
    box.innerText = message;
}

function clearMessages() {
    const errorBox = document.getElementById("errorBox");
    if (errorBox) {
        errorBox.classList.add("d-none");
    }
    const successBox = document.getElementById("successBox");
    if (successBox) {
        successBox.classList.add("d-none");
    }
}