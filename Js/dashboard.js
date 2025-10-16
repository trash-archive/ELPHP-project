let currentNoteId = null;

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');

    // Prevent body scroll when sidebar is open
    if (sidebar.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// UI State Management
function showCreateNote() {
    $('#empty-state').addClass('d-none');
    $('#note-viewer').addClass('d-none');
    $('#create-note').removeClass('d-none');

    // Reset form for creating new note
    $('#createNoteTitle').text('Create a New Note');
    $('#createNoteSubtitle').text('Write down your thoughts, ideas, or important information.');
    $('#noteTitle').val('');
    $('#noteContent').val('');
    $('#saveBtn').html('<i class="bi bi-check-lg me-2"></i>Save Note').attr('onclick', 'createNote()');
    currentNoteId = null;

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

function showEmptyState() {
    $('#empty-state').removeClass('d-none');
    $('#note-viewer').addClass('d-none');
    $('#create-note').addClass('d-none');
    currentNoteId = null;

    // Remove active state from all notes
    $('.note-item').removeClass('active');
}

function showNoteViewer() {
    $('#empty-state').addClass('d-none');
    $('#create-note').addClass('d-none');
    $('#note-viewer').removeClass('d-none');

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

// Load all notes
function loadNotes() {
    $.get('dashboard.php', function (response) {
        if (response.success) {
            const notesList = $('#notesList');
            notesList.empty();

            if (response.notes.length === 0) {
                notesList.append(`
              <div class="text-center text-muted p-3">
                No notes found. Create your first note!
              </div>
            `);
                return;
            }

            response.notes.forEach(note => {
                const date = new Date(note.updated_at || note.created_at);
                const previewText = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');

                notesList.append(`
              <button class="note-item" onclick="openNote(${note.id})">
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-preview">${escapeHtml(previewText)}</div>
                <div class="note-date">
                  <i class="bi bi-calendar3"></i>
                  <span>${formatDate(date)}</span>
                </div>
              </button>
            `);
            });
        }
    }).fail(function () {
        alert('Failed to load notes. Please refresh the page.');
    });
}

// Create note
function createNote() {
    const title = $('#noteTitle').val().trim();
    const content = $('#noteContent').val().trim();

    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }

    $.ajax({
        url: 'dashboard.php',
        type: 'POST',
        data: JSON.stringify({ title, content }),
        contentType: 'application/json',
        success: function (response) {
            if (response.success) {
                alert('Note created successfully!');
                loadNotes();
                showEmptyState();
            } else {
                alert(response.message || 'Failed to create note');
            }
        },
        error: function () {
            alert('Failed to create note');
        }
    });
}

// Open note
function openNote(noteId) {
    $.get(`dashboard.php?id=${noteId}`, function (response) {
        if (response.success && response.notes[0]) {
            const note = response.notes[0];
            const date = new Date(note.created_at);

            $('#noteViewerTitle').text(note.title);
            $('#noteViewerContent').html(escapeHtml(note.content).replace(/\n/g, '<br>'));
            $('#noteMeta span').text(formatDateTime(date));
            $('#note-viewer').attr('data-note-id', note.id);
            currentNoteId = note.id;

            // Add active state to selected note
            $('.note-item').removeClass('active');
            $(`.note-item[onclick="openNote(${noteId})"]`).addClass('active');

            showNoteViewer();
        }
    }).fail(function () {
        alert('Failed to load note');
    });
}

// Show edit note
function showEditNote() {
    if (!currentNoteId) return;

    const title = $('#noteViewerTitle').text();
    const content = $('#noteViewerContent').text();

    $('#createNoteTitle').text('Edit Note');
    $('#createNoteSubtitle').text('Update your note with new information.');
    $('#noteTitle').val(title);
    $('#noteContent').val(content);
    $('#saveBtn').html('<i class="bi bi-check-lg me-2"></i>Update Note').attr('onclick', `updateNote(${currentNoteId})`);

    $('#note-viewer').addClass('d-none');
    $('#create-note').removeClass('d-none');
}

// Update note
function updateNote(noteId) {
    const title = $('#noteTitle').val().trim();
    const content = $('#noteContent').val().trim();

    if (!title || !content) {
        alert('Title and content cannot be empty');
        return;
    }

    $.ajax({
        url: 'dashboard.php',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ id: noteId, title, content }),
        success: function (response) {
            if (response.success) {
                alert('Note updated successfully!');
                loadNotes();
                showEmptyState();
            } else {
                alert(response.message || 'Failed to update note');
            }
        },
        error: function () {
            alert('Failed to update note');
        }
    });
}

// Delete note (move to archive)
function deleteCurrentNote() {
    if (!currentNoteId) return;

    if (!confirm('Move this note to archive?')) return;

    $.ajax({
        url: `dashboard.php?id=${currentNoteId}`,
        type: 'DELETE',
        success: function (response) {
            if (response.success) {
                alert('Note moved to archive');
                loadNotes();
                showEmptyState();
            } else {
                alert(response.message || 'Failed to archive note');
            }
        },
        error: function () {
            alert('Failed to archive note');
        }
    });
}

// Search functionality
let searchTimeout;
$('#searchInput').on('input', function () {
    const searchTerm = $(this).val().trim().toLowerCase();

    clearTimeout(searchTimeout);

    if (searchTerm === '') {
        loadNotes();
        return;
    }

    searchTimeout = setTimeout(() => {
        $.ajax({
            url: `dashboard.php?search=${encodeURIComponent(searchTerm)}`,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const notesList = $('#notesList');
                    notesList.empty();

                    if (response.notes.length === 0) {
                        notesList.append(`
                  <div class="text-center text-muted p-3">
                    No notes found matching "${escapeHtml(searchTerm)}"
                  </div>
                `);
                        return;
                    }

                    response.notes.forEach(note => {
                        const date = new Date(note.updated_at || note.created_at);
                        const previewText = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');

                        notesList.append(`
                  <button class="note-item" onclick="openNote(${note.id})">
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-preview">${escapeHtml(previewText)}</div>
                    <div class="note-date">
                      <i class="bi bi-calendar3"></i>
                      <span>${formatDate(date)}</span>
                    </div>
                  </button>
                `);
                    });
                }
            },
            error: function () {
                alert('Failed to search notes');
            }
        });
    }, 500);
});

// Utility functions
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

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Initialize
$(document).ready(function () {
    loadNotes();
});