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

// Modal functionality
const noteModal = document.getElementById('noteModal');
const modalClose = document.getElementById('modalClose');

modalClose.addEventListener('click', () => {
    noteModal.classList.remove('show');
});

noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
        noteModal.classList.remove('show');
    }
});

// Show note detail modal
function showNoteDetail(note) {
    document.getElementById('modalTitle').textContent = note.title;
    document.getElementById('modalContent').textContent = note.content;
    document.getElementById('modalAuthor').textContent = `${note.author_first_name} ${note.author_last_name}`;
    document.getElementById('modalDate').textContent = `Created: ${formatDate(note.created_at)}`;
    noteModal.classList.add('show');
}

// Format date function
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Load notes
function loadNotes(page = 1, search = "", sort = "newest") {
    fetch(`all_notes.php?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`)
        .then(response => response.json())
        .then(data => {
            const notesContainer = document.getElementById('notesContainer');
            const totalNotes = document.getElementById('totalNotes');
            const pagination = document.getElementById('pagination');

            notesContainer.innerHTML = '';
            pagination.innerHTML = '';
            totalNotes.textContent = data.totalNotes || 0;

            if (data.notes && data.notes.length > 0) {
                const notesGrid = document.createElement('div');
                notesGrid.className = 'notes-grid';

                data.notes.forEach(note => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'note-card';
                    noteCard.onclick = () => showNoteDetail(note);

                    noteCard.innerHTML = `
                                <div class="note-card-header">
                                    <div class="note-title">${escapeHtml(note.title)}</div>
                                </div>
                                <div class="note-content-preview">${escapeHtml(truncateText(note.content, 150))}</div>
                                <div class="note-footer">
                                    <div class="note-author">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        ${escapeHtml(note.author_first_name)} ${escapeHtml(note.author_last_name)}
                                    </div>
                                    <div class="note-date">${formatDate(note.created_at)}</div>
                                </div>
                            `;

                    notesGrid.appendChild(noteCard);
                });

                notesContainer.appendChild(notesGrid);

                // Pagination rendering
                if (data.totalPages > 1) {
                    for (let i = 1; i <= data.totalPages; i++) {
                        const pageBtn = document.createElement('a');
                        pageBtn.href = '#';
                        pageBtn.className = `page-btn ${i === data.currentPage ? 'active' : ''}`;
                        pageBtn.textContent = i;
                        pageBtn.onclick = (e) => {
                            e.preventDefault();
                            loadNotes(i, search, sort);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        };
                        pagination.appendChild(pageBtn);
                    }
                }
            } else {
                notesContainer.innerHTML = `
                            <div class="empty-state">
                                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <div class="empty-title">No notes found</div>
                                <div class="empty-text">Try adjusting your search criteria</div>
                            </div>
                        `;
            }
        })
        .catch(error => {
            console.error('Error loading notes:', error);
            document.getElementById('notesContainer').innerHTML = `
                        <div class="empty-state">
                            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #e74c3c;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <div class="empty-title">Error Loading Notes</div>
                            <div class="empty-text">Failed to load notes. Please try again.</div>
                        </div>
                    `;
        });
}

// Search and filter functionality
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();

    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');

    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            const sort = sortFilter.value;
            loadNotes(1, query, sort);
        }, 500);
    });

    // Sort filter
    sortFilter.addEventListener('change', () => {
        const query = searchInput.value.trim();
        const sort = sortFilter.value;
        loadNotes(1, query, sort);
    });
});