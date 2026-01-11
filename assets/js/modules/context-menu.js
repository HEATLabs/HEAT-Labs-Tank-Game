// Block right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Block context menu on images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(function(img) {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });
});

// Block common keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Block Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.key === 'I')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 74 || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 67 || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block F12
    if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Ctrl+U
    if (e.ctrlKey && (e.keyCode === 85 || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Ctrl+S
    if (e.ctrlKey && (e.keyCode === 83 || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Cmd+Option+I
    if (e.metaKey && e.altKey && (e.keyCode === 73 || e.key === 'I')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Cmd+Option+J
    if (e.metaKey && e.altKey && (e.keyCode === 74 || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Cmd+Option+C
    if (e.metaKey && e.altKey && (e.keyCode === 67 || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
});

// Disable text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// Prevent drag and drop
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});