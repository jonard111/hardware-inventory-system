function validateRegisterForm(event) {

    const password = document.getElementById("regPassword")?.value.trim();
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

    // If fields are missing, let backend handle it
    if (!password || !confirmPassword) return true;

    if (password !== confirmPassword) {
        event.preventDefault();
        showAlert("Passwords do not match.", "danger");
        return false;
    }

    return true;
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

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.add("is-invalid");

    let feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.innerText = message;
    }
}

function showError(message) {
    const box = document.getElementById("errorBox");
    box.classList.remove("d-none");
    box.innerText = message;
}

function showSuccess(message) {
    const box = document.getElementById("successBox");
    box.classList.remove("d-none");
    box.innerText = message;
}

function clearMessages() {
    document.getElementById("errorBox").classList.add("d-none");
    document.getElementById("successBox").classList.add("d-none");
}

// MAIN VALIDATION
function validateRegisterForm() {
    clearMessages();

    const firstName = document.querySelector("[name='firstName']").value.trim();
    const lastName = document.querySelector("[name='lastName']").value.trim();
    const email = document.querySelector("[name='email']").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Empty fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showError("All fields are required.");
        return false;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Please enter a valid email address.");
        return false;
    }

    // Password length
    if (password.length < 6) {
        showError("Password must be at least 6 characters.");
        return false;
    }

    // Password match
    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return false;
    }

    return true; // allow submit
}