
function togglePassword(inputId, iconId) {
    var input = document.getElementById(inputId);
    var icon = document.getElementById(iconId);
        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = "password";
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }
document.getElementById("loginForm").addEventListener("submit", function(e) {
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