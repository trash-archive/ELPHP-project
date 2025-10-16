<?php
// Enable error reporting for development (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Include centralized DB connection
require_once 'db_connect.php';

// Helper function for JSON response and exiting
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    global $conn;
    $conn->close();
    exit;
}

// Get user ID from GET
$userId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$userId) {
    respond(['error' => 'Invalid or missing user ID'], 400);
}

// --- DELETE request: delete user and their notes ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || 
    ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'DELETE')) {

    // Delete user's notes first
    $stmt = $conn->prepare("DELETE FROM notes WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    // Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected > 0) {
        respond(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        respond(['error' => 'User not found'], 404);
    }
}

// --- GET request: fetch user and notes ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Fetch user info
    $stmt = $conn->prepare("SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result();

    if ($userResult->num_rows === 0) {
        respond(['error' => 'User not found'], 404);
    }

    $user = $userResult->fetch_assoc();
    $stmt->close();

    // Fetch user's notes
    $stmt = $conn->prepare("SELECT id, title, content, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $notesResult = $stmt->get_result();

    $notes = [];
    while ($note = $notesResult->fetch_assoc()) {
        $notes[] = $note;
    }

    $stmt->close();

    respond([
        'user' => $user,
        'notes' => $notes,
        'notesCount' => count($notes)
    ]);
}

// --- Invalid method ---
respond(['error' => 'Method not allowed'], 405);
?>
