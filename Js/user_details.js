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

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (!userId) {
    alert('No user ID provided!');
    window.location.href = 'Usermanagement.html';
}

// Format date function
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Toggle note content
function toggleNote(button) {
    const noteItem = button.closest('.note-item');
    const content = noteItem.querySelector('.note-content');
    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        content.classList.remove('expanded');
        button.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        button.classList.add('expanded');
    }
}

// Load user details and notes
function loadUserDetails() {
    fetch(`UserDetails.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                window.location.href = 'Usermanagement.html';
                return;
            }

            // Update user information
            document.getElementById('userName').textContent =
                `${data.user.first_name} ${data.user.last_name}`;
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userJoined').textContent = formatDate(data.user.created_at);
            document.getElementById('notesCount').textContent = data.notesCount;

            // Display notes
            const notesContainer = document.getElementById('notesContainer');
            notesContainer.innerHTML = '';

            if (data.notes.length === 0) {
                notesContainer.innerHTML = `
                            <div class="empty-state">
                                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <div class="empty-title">No notes found</div>
                                <div class="empty-text">This user hasn't created any notes yet</div>
                            </div>
                        `;
            } else {
                data.notes.forEach((note, index) => {
                    const noteCard = `
                                <div class="note-item">
                                    <div class="note-header" onclick="toggleNote(this.querySelector('.note-toggle'))">
                                        <div class="note-title">${escapeHtml(note.title)}</div>
                                        <button class="note-toggle" onclick="event.stopPropagation(); toggleNote(this);">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="note-content">
                                        <div class="note-body">
                                            <div class="note-text">${escapeHtml(note.content)}</div>
                                            <div class="note-date">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                Created: ${formatDate(note.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                    notesContainer.innerHTML += noteCard;
                });
            }
        })
        .catch(error => {
            console.error('Error loading user details:', error);
            document.getElementById('notesContainer').innerHTML = `
                        <div class="empty-state">
                            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #e74c3c;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <div class="empty-title">Error Loading Details</div>
                            <div class="empty-text">Failed to load user details. Please try again.</div>
                        </div>
                    `;
        });
}

// Delete user functionality
const deleteUserBtn = document.getElementById('deleteUserBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

deleteUserBtn.addEventListener('click', () => {
    deleteModal.classList.add('show');
});

cancelDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
});

confirmDelete.addEventListener('click', () => {
    // Disable button and show loading
    const originalHTML = confirmDelete.innerHTML;
    confirmDelete.disabled = true;
    confirmDelete.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></div>Deleting...';

    fetch(`UserDetails.php?id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: '_method=DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User deleted successfully!');
                window.location.href = 'Usermanagement.html';
            } else {
                alert('Error: ' + (data.error || 'Failed to delete user'));
                confirmDelete.disabled = false;
                confirmDelete.innerHTML = originalHTML;
                deleteModal.classList.remove('show');
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
            confirmDelete.disabled = false;
            confirmDelete.innerHTML = originalHTML;
            deleteModal.classList.remove('show');
        });
});

// Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteModal.classList.remove('show');
    }
});

// Load user details on page load
document.addEventListener('DOMContentLoaded', loadUserDetails);