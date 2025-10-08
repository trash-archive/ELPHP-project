// Sidebar toggle for mobile
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
mobileToggle.addEventListener('click', () => sidebar.classList.toggle('show'));

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
                            <td class="p-2 p-lg-3 border-0 border-bottom small">
                                <div>${user.first_name}</div>
                                <div class="text-muted d-sm-none small">${user.last_name}</div>
                            </td>
                            <td class="p-2 p-lg-3 border-0 border-bottom small d-none d-sm-table-cell">${user.last_name}</td>
                            <td class="p-2 p-lg-3 border-0 border-bottom">
                                <div class="text-truncate small" style="max-width: 150px;" title="${user.email}">
                                    ${user.email}
                                </div>
                            </td>
                            <td class="p-2 p-lg-3 border-0 border-bottom">
                                <a href="UserDetails.html?id=${user.id}" class="btn btn-primary btn-sm">
                                    <span class="d-none d-lg-inline">View</span>
                                    <i class="fas fa-eye d-lg-none"></i>
                                </a>
                            </td>
                        </tr>
                    `;
                    usersBody.innerHTML += row;
                });

                // Pagination rendering
                for (let i = 1; i <= data.totalPages; i++) {
                    pagination.innerHTML += `
                        <li class="page-item ${i === data.currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" onclick="loadUsers(${i}, '${search}')">${i}</a>
                        </li>`;
                }
            } else {
                usersBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-danger fw-bold">
                            Users not found
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => console.error("Error loading users:", error));
}

// 🔍 Search functionality
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();

    let searchInput = document.getElementById("searchInput");
    let searchBtn = searchInput.nextElementSibling;

    // Search on button click
    searchBtn.addEventListener("click", () => {
        let query = searchInput.value.trim();
        loadUsers(1, query);
    });

    // Search on Enter key press
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            let query = searchInput.value.trim();
            loadUsers(1, query);
        }
    });
});
