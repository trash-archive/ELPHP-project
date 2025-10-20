// Mobile sidebar toggle
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

logoutBtn.addEventListener('click', () => {
    logoutModal.classList.add('show');
});

cancelLogout.addEventListener('click', () => {
    logoutModal.classList.remove('show');
});

confirmLogout.addEventListener('click', () => {
    // Add your logout logic here
    // For example: clear session, redirect to login
    window.location.href = 'admin_login.html';
});

// Close modal when clicking outside
logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        logoutModal.classList.remove('show');
    }
});

function loadUsers(page = 1, search = "") {
    fetch(`UserManagement.php?page=${page}&search=${encodeURIComponent(search)}`)
        .then(response => response.json())
        .then(data => {
            let usersBody = document.getElementById("usersBody");
            let totalUsers = document.getElementById("totalUsers");
            let pagination = document.getElementById("pagination");

            usersBody.innerHTML = "";
            pagination.innerHTML = "";
            totalUsers.textContent = data.totalUsers;

            if (data.users && data.users.length > 0) {
                data.users.forEach(user => {
                    let row = `
                                <tr>
                                    <td><div class="user-name">${user.first_name}</div></td>
                                    <td><div class="user-name">${user.last_name}</div></td>
                                    <td><div class="user-email">${user.email}</div></td>
                                    <td>
                                        <a href="UserDetails.html?id=${user.id}" class="btn-view">
                                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                            View
                                        </a>
                                    </td>
                                </tr>
                            `;
                    usersBody.innerHTML += row;
                });

                // Pagination rendering
                for (let i = 1; i <= data.totalPages; i++) {
                    pagination.innerHTML += `
                                <a href="#" class="page-btn ${i === data.currentPage ? 'active' : ''}" 
                                   onclick="loadUsers(${i}, '${search}'); return false;">${i}</a>
                            `;
                }
            } else {
                usersBody.innerHTML = `
                            <tr>
                                <td colspan="4">
                                    <div class="empty-state">
                                        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        <div class="empty-title">No users found</div>
                                        <div class="empty-text">Try adjusting your search criteria</div>
                                    </div>
                                </td>
                            </tr>
                        `;
            }
        })
        .catch(error => console.error("Error loading users:", error));
}

// Search functionality
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();

    let searchInput = document.getElementById("searchInput");

    // Search on Enter key press
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            let query = searchInput.value.trim();
            loadUsers(1, query);
        }
    });

    // Real-time search with debounce
    let searchTimeout;
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            let query = searchInput.value.trim();
            loadUsers(1, query);
        }, 500);
    });
});