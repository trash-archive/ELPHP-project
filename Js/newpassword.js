const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleBtn = passwordInput.parentElement.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

function savepassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPasswordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();
    const email = sessionStorage.getItem('email');

    if (!email) {
        alert('Session expired. Please restart the reset process.');
        window.location.href = 'forgot.html';
        return false;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters.');
        return false;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    $.ajax({
        url: 'newpassword.php',
        type: 'POST',
        data: {
            email: email,
            password: newPassword
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                alert('Password updated successfully!');
                sessionStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert(response.message || 'Failed to update password');
            }
        },
        error: function () {
            alert('Something went wrong. Please try again.');
        }
    });

    return false;
}