<?php
// Turn on error reporting for debugging. Remove or turn off on production.
ini_set('display_errors', 1);
error_reporting(E_ALL);

// DB connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mynotesdb";

$mysqli = new mysqli($servername, $username, $password, $dbname);
if ($mysqli->connect_errno) {
    die("Database connection failed: " . $mysqli->connect_error);
}

// Get user id safely
$userId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$userId) {
    // friendly message if id missing or invalid
    http_response_code(400);
    die("Invalid or missing user ID. Open this page with ?id=USER_ID");
}

// Handle delete request (delete user and their notes)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_user']) && $userId) {
    // use prepared statements
    $stmt = $mysqli->prepare("DELETE FROM notes WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    $stmt = $mysqli->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    // redirect back to user list (adjust path if needed)
    header("Location: UserManagement.html?deleted=1");
    exit();
}

// Fetch user info (prepared statement)
$stmt = $mysqli->prepare("SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $userId);
$stmt->execute();
$userResult = $stmt->get_result();
if ($userResult->num_rows === 0) {
    // user not found
    $stmt->close();
    $mysqli->close();
    http_response_code(404);
    die("User not found.");
}
$user = $userResult->fetch_assoc();
$stmt->close();

// Fetch notes for this user
$stmt = $mysqli->prepare("SELECT id, title, content, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$notesResult = $stmt->get_result();
// collect notes if you need to loop after closing connection (we'll use $notesResult directly)
$notesCount = $notesResult->num_rows;

$stmt->close();
$mysqli->close();
?>