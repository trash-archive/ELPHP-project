let originalValues = {};

document.addEventListener("DOMContentLoaded", loadUserProfile);

async function loadUserProfile() {
    try {
        const res = await fetch("update_profile.php");
        const data = await res.json();

        if (!data.success) throw new Error(data.error || "Failed to load user");

        document.getElementById("display-name").textContent = `${data.first_name} ${data.last_name}`;
        document.getElementById("display-email").textContent = data.email;

        document.getElementById("firstName").value = data.first_name;
        document.getElementById("lastName").value = data.last_name;
        document.getElementById("email").value = data.email;

        originalValues = { ...data };
    } catch (err) {
        console.error(err);
        document.getElementById("display-name").textContent = "Error loading user";
    }
}

function toggleEditMode(section, event) {
    if (section === "personal") {
        const form = document.getElementById("personal-info-form");
        form.querySelectorAll("input").forEach(i => (i.disabled = false));
        document.getElementById("personal-actions").classList.remove("d-none");
        event.target.closest("button").style.display = "none";
    } else if (section === "password") {
        document.getElementById("password-form").classList.remove("d-none");
        document.getElementById("password-placeholder").classList.add("d-none");
        event.target.closest("button").style.display = "none";
    }
}

function cancelEdit(section) {
    if (section === "personal") {
        for (const key in originalValues) {
            if (document.getElementById(key)) {
                document.getElementById(key).value = originalValues[key];
            }
        }
        document.querySelectorAll("#personal-info-form input").forEach(i => (i.disabled = true));
        document.getElementById("personal-actions").classList.add("d-none");

        // 🔧 More reliable selector:
        const personalEditBtn = document.querySelector(".profile-card button.btn-edit");
        if (personalEditBtn) personalEditBtn.style.display = "block";

    } else if (section === "password") {
        document.getElementById("password-form").classList.add("d-none");
        document.getElementById("password-placeholder").classList.remove("d-none");

        const passwordEditBtn = document.querySelector(".profile-card:last-child button.btn-edit");
        if (passwordEditBtn) passwordEditBtn.style.display = "block";

        ["currentPassword", "newPassword", "confirmPassword"].forEach(id => (document.getElementById(id).value = ""));
    }
}

document.getElementById("personal-info-form").addEventListener("submit", async e => {
    e.preventDefault();

    const body = {
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim()
    };

    // Basic frontend validation
    if (!body.first_name || !body.last_name || !body.email) {
        alert("All fields are required.");
        return;
    }

    try {
        const res = await fetch("update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.success) {
            showSuccess("Profile updated successfully!");
            await loadUserProfile(); // reload data
            cancelEdit("personal");  // only exit edit mode if successful
        } else {
            alert(data.error || "Failed to update profile");
            // ✅ Keep edit mode active when validation fails
        }

    } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again.");
    }
});

document.getElementById("password-form").addEventListener("submit", async e => {
    e.preventDefault();

    const current = document.getElementById("currentPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();

    if (!current || !newPass || !confirm) {
        alert("Please fill out all fields.");
        return;
    }

    if (newPass !== confirm) {
        alert("New passwords do not match.");
        return;
    }

    const body = {
        first_name: document.getElementById("firstName").value,
        last_name: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        current_password: current,
        new_password: newPass
    };

    try {
        const res = await fetch("update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (data.success) {
            showSuccess("Password updated successfully!");
            cancelEdit("password");
        } else {
            alert(data.error || "Failed to update password.");
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});


function showSuccess(msg) {
    const el = document.getElementById("success-message");
    document.getElementById("success-text").textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 3000);
}

function logout(e) {
    e.preventDefault();
    fetch("logout.php").then(() => (window.location.href = "landing_page.html"));
}

