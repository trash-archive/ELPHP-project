let currentNoteId = null;
let restoreModalInstance = null;
let deleteModalInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    restoreModalInstance = new bootstrap.Modal(document.getElementById('restoreModal'));
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));
    loadArchivedNotes();
});

// 🟢 Load archived notes
function loadArchivedNotes() {
    fetch('archive.php', { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('archive-grid');
            const emptyState = document.getElementById('empty-state');
            grid.innerHTML = '';

            if (!data.success || data.notes.length === 0) {
                grid.classList.add('d-none');
                emptyState.classList.remove('d-none');
                return;
            }

            data.notes.forEach(note => {
                grid.insertAdjacentHTML('beforeend', `
          <div class="archive-note" data-note-id="${note.id}">
            <div class="archive-note-header">
              <h5>${note.title}</h5>
              <div class="archive-actions">
                <button class="restore" onclick="restoreNote(event, ${note.id})" title="Restore">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button class="delete" onclick="deleteNote(event, ${note.id})" title="Delete Permanently">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <div class="archive-note-content">${note.content}</div>
            <div class="archive-note-meta">
              <span><i class="bi bi-calendar"></i> ${note.date}</span>
            </div>
          </div>
        `);
            });
        })
        .catch(() => showToast('Error loading archived notes', 'danger'));
}

// 🔄 Restore
function restoreNote(e, id) {
    e.stopPropagation();
    currentNoteId = id;
    restoreModalInstance.show();
}

function confirmRestore() {
    fetch('archive.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: currentNoteId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`[data-note-id="${currentNoteId}"]`)?.remove();
                checkEmpty();
                showToast('Note restored successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to restore note', 'danger');
            }
        })
        .finally(() => restoreModalInstance.hide());
}

// ❌ Delete
function deleteNote(e, id) {
    e.stopPropagation();
    currentNoteId = id;
    deleteModalInstance.show();
}

function confirmDelete() {
    fetch('archive.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: currentNoteId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`[data-note-id="${currentNoteId}"]`)?.remove();
                checkEmpty();
                showToast('Note permanently deleted!', 'danger');
            } else {
                showToast(data.error || 'Failed to delete note', 'danger');
            }
        })
        .finally(() => deleteModalInstance.hide());
}

// 🧾 Check if empty
function checkEmpty() {
    const notes = document.querySelectorAll('.archive-note');
    const empty = document.getElementById('empty-state');
    const grid = document.getElementById('archive-grid');
    if (notes.length === 0) {
        grid.classList.add('d-none');
        empty.classList.remove('d-none');
    }
}

// 🔔 Toast notification
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#dc3545,#b02a37)'};
    color: white; padding: 1rem 1.5rem;
    border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.2);
    z-index: 9999; animation: fadeIn .3s ease;
  `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}