// UI State Management
    function showCreateNote() {
        $('#empty-state').addClass('d-none');
        $('#note-viewer').addClass('d-none');
        $('#create-note').removeClass('d-none');
    }

    function showEmptyState() {
        $('#empty-state').removeClass('d-none');
        $('#note-viewer').addClass('d-none');
        $('#create-note').addClass('d-none');
    }

    function showNoteViewer() {
        $('#empty-state').addClass('d-none');
        $('#create-note').addClass('d-none');
        $('#note-viewer').removeClass('d-none');
    }

    // Load all notes
    function loadNotes() {
        $.get('dashboard.php', function(response) {
            if (response.success) {
                const notesList = $('.list-group');
                notesList.empty();
                
                if (response.notes.length === 0) {
                    showEmptyState();
                    return;
                }
                
                response.notes.forEach(note => {
                    const date = new Date(note.updated_at || note.created_at);
                    notesList.append(`
                        <button class="list-group-item list-group-item-action" onclick="openNote(${note.id})">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${note.title}</h6>
                            </div>
                            <p class="mb-1 text-truncate text-secondary">${note.content}</p>
                            <small class="d-flex justify-content-end text-secondary">
                                ${date.toLocaleDateString()}
                            </small>
                        </button>
                    `);
                });
            }
        });
    }
    function toggleEdit(button) {
        const noteViewer = $('#note-viewer');
        const noteId = noteViewer.attr('data-note-id');
        const currentTitle = noteViewer.find('h4').text().trim();
        const currentContent = noteViewer.find('.note-content').text().trim();

        // Show create note form with updated UI
        $('#create-note h2').text('Update Note');
        $('#create-note p.text-muted').text('Edit your note below.');
        $('#create-note input').val(currentTitle);
        $('#create-note textarea').val(currentContent);
        $('#create-note button.btn-primary')
            .text('Update Note')
            .attr('onclick', `updateNote(${noteId})`);
        
        showCreateNote();
    }
    // Create new note
    function createNote() {
        const title = $('#create-note input').val().trim();
        const content = $('#create-note textarea').val().trim();
        
        if (!title || !content) {
            alert('Please enter both title and content');
            return;
        }
        
        $.ajax({
            url: 'dashboard.php',
            type: 'POST',
            data: JSON.stringify({ title, content }),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    loadNotes();
                    showEmptyState();
                    $('#create-note input, #create-note textarea').val('');
                } else {
                    alert(response.message || 'Failed to create note');
                }
            },
            error: function() {
                alert('Failed to create note');
            }
        });
    }

    // Open note
    function openNote(noteId) {
        $.get(`dashboard.php?id=${noteId}`, function(response) {
            if (response.success && response.notes[0]) {
                const note = response.notes[0];
                $('#note-viewer h4').text(note.title);
                $('#note-viewer p:not(.text-muted)').text(note.content);
                $('#note-viewer').attr('data-note-id', note.id);
                showNoteViewer();
            }
        });
    }

    // Delete note
    function deleteCurrentNote() {
        const noteId = $('#note-viewer').attr('data-note-id');
        if (noteId && confirm('Are you sure you want to delete this note?')) {
            $.ajax({
                url: `dashboard.php?id=${noteId}`,
                type: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        loadNotes();
                        showEmptyState();
                    } else {
                        alert(response.message || 'Failed to delete note');
                    }
                },
                error: function() {
                    alert('Failed to delete note');
                }
            });
        }
    }

    // Update note
    function updateNote(noteId) {
        const title = $('#create-note input').val().trim();
        const content = $('#create-note textarea').val().trim();
        
        if (!title || !content) {
            alert('Title and content cannot be empty');
            return;
        }
        
        $.ajax({
            url: 'dashboard.php',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ id: noteId, title, content }),
            success: function(response) {
                if (response.success) {
                    loadNotes();
                    // Reset form to create mode
                    $('#create-note h2').text('Create a New Note');
                    $('#create-note p.text-muted').text('Write down your thoughts, ideas, or important information.');
                    $('#create-note button.btn-primary')
                        .text('Save Note')
                        .attr('onclick', 'createNote()');
                    showEmptyState();
                } else {
                    alert(response.message || 'Failed to update note');
                }
            },
            error: function() {
                alert('Failed to update note');
            }
        });
    }

    // Search functionality
    let searchTimeout;
    $('input[type="text"][placeholder="Search notes..."]').on('input', function() {
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
                success: function(response) {
                    if (response.success) {
                        const notesList = $('.list-group');
                        notesList.empty();

                        if (response.notes.length === 0) {
                            // Show a friendly inline message instead of alert
                            notesList.append(`
                                <div class="list-group-item text-center text-muted">
                                    No notes found matching "${searchTerm}"
                                </div>
                            `);
                            return;
                        }

                        response.notes.forEach(note => {
                            const date = new Date(note.updated_at || note.created_at);
                            notesList.append(`
                                <button class="list-group-item list-group-item-action" onclick="openNote(${note.id})">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${note.title}</h6>
                                    </div>
                                    <p class="mb-1 text-truncate text-secondary">${note.content}</p>
                                    <small class="d-flex justify-content-end text-secondary">
                                        ${date.toLocaleDateString()}
                                    </small>
                                </button>
                            `);
                        });
                    }
                },
                error: function() {
                    alert('Failed to search notes');
                }
            });
        }, 500);
    });

    // Initialize
    $(document).ready(function() {
        loadNotes();
    });