        // Sidebar toggle for mobile
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.getElementById('sidebar');
        mobileToggle.addEventListener('click', () => sidebar.classList.toggle('show'));

        document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', () => {
            const noteCard = button.closest('.note-card');
            const body = noteCard.querySelector('.note-body');
            const meta = noteCard.querySelector('.note-meta');
            const icon = button.querySelector('i');

            body.classList.toggle('collapse');
            meta.classList.toggle('collapse');

            // Rotate chevron icon
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });