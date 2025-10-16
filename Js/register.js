function togglePassword(fieldId, button) {
    const passwordInput = document.getElementById(fieldId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        button.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        button.textContent = 'Show';
    }
}

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("register.php", {
        method: "POST",
        body: formData
    });

    try {
        const data = await response.json();

        if (data.status === "success") {
            alert(data.message);
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Error: Could not connect to the server.");
        console.error(err);
    }
});