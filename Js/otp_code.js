const otpInputs = document.querySelectorAll('.otp-input');
const form = document.getElementById('verifyForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const resendLink = document.getElementById('resendLink');
const timerDisplay = document.getElementById('timer');
const emailDisplay = document.querySelector('.verify-email');

// Get saved email from previous step
const email = sessionStorage.getItem("email");
if (email) {
    emailDisplay.textContent = email;
} else {
    emailDisplay.textContent = "your email"; // fallback
}

let countdown;
let timeLeft = 60;

// Auto-focus and move to next input
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }

        if (value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

        errorMessage.classList.remove('show');
        otpInputs.forEach(input => input.classList.remove('error'));
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            pastedData.split('').forEach((char, i) => {
                if (otpInputs[i]) otpInputs[i].value = char;
            });
            otpInputs[Math.min(pastedData.length, 5)].focus();
        }
    });
});

otpInputs[0].focus();

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (otp.length < 4) {
        showError("Please enter the full verification code.");
        return;
    }

    try {
        const response = await fetch("otp_code.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                email: email,
                otp: otp
            })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "newpassword.html";
        } else {
            showError(data.message || "Invalid verification code.");
        }

    } catch (error) {
        showError("Something went wrong. Try again.");
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    otpInputs.forEach(input => {
        input.classList.add('error');
        input.value = '';
    });
    otpInputs[0].focus();
}

function resendCode() {
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();
    startCountdown();
}

function startCountdown() {
    timeLeft = 60;
    resendLink.classList.add('disabled');
    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Resend available in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerDisplay.textContent = '';
            resendLink.classList.remove('disabled');
        }
    }, 1000);
}

startCountdown();