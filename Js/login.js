function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let formData = new FormData(this);

    fetch("login.php", {
        method: "POST",
        body: formData
    })

        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert(data.message);
                window.location = "dashboard.html";
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            alert("Something went wrong. Try again!");
            console.error(error);
        });
});