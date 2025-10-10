<?php
// Turn on error reporting for debugging. Remove or turn off on production.
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set JSON header
header('Content-Type: application/json');

// DB connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mynotesdb";

$mysqli = new mysqli($servername, $username, $password, $dbname);
if ($mysqli->connect_errno) {
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Handle DELETE request (delete user and their notes)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'DELETE')) {
    $userId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid user ID']);
        exit();
    }

    // Delete user's notes first
    $stmt = $mysqli->prepare("DELETE FROM notes WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    // Delete user
    $stmt = $mysqli->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $mysqli->close();

    if ($affected > 0) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
    exit();
}

// Handle GET request (fetch user details and notes)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing user ID']);
        exit();
    }

    // Fetch user info
    $stmt = $mysqli->prepare("SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result();
    
    if ($userResult->num_rows === 0) {
        $stmt->close();
        $mysqli->close();
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit();
    }
    
    $user = $userResult->fetch_assoc();
    $stmt->close();

    // Fetch notes for this user
    $stmt = $mysqli->prepare("SELECT id, title, content, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $notesResult = $stmt->get_result();
    
    $notes = [];
    while ($note = $notesResult->fetch_assoc()) {
        $notes[] = [
            'id' => $note['id'],
            'title' => $note['title'],
            'content' => $note['content'],
            'created_at' => $note['created_at']
        ];
    }
    
    $stmt->close();
    $mysqli->close();

    // Return user data with notes
    echo json_encode([
        'user' => [
            'id' => $user['id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'created_at' => $user['created_at']
        ],
        'notes' => $notes,
        'notesCount' => count($notes)
    ]);
    exit();
}

// Invalid request method
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
$mysqli->close();
?>