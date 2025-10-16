document.getElementById("forgotForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch("forgot.php", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                sessionStorage.setItem("email", document.getElementById("email").value);
                window.location.href = "otp_code.html";
            } else {
                alert(data.message);
            }
        })
        .catch(() => alert("Something went wrong."));
});