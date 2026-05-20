function validateRegisterForm(event) {
    const password = document.getElementById("regPassword")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    if (!password || !confirmPassword) {
        return true;
    }

    if (password !== confirmPassword) {
        event.preventDefault();
        alert("Passwords do not match.");
        return false;
    }

    return true;
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById(`${id}-icon`);

    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", validateRegisterForm);
    }
});
