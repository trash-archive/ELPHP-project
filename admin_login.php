<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// --- Database config ---
$servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "mynotesdb";

// Create connection
$conn = new mysqli($servername, $db_username, $db_password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    $conn->close();
    exit;
}

// Retrieve and validate input
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    $conn->close();
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format"]);
    $conn->close();
    exit;
}

// Prepare statement: only admins allowed
$stmt = $conn->prepare("SELECT id, password, first_name, last_name, role FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Failed to prepare statement"]);
    $conn->close();
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify hashed password
    if (password_verify($password, $user['password'])) {
        // Regenerate session id to prevent fixation
        session_regenerate_id(true);

        // Save user info in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['role'] = $user['role'];

        echo json_encode([
            "status" => "success",
            "message" => "Welcome back, " . ($user['first_name'] ?: 'Admin') . "!",
            // match whatever your frontend expects (change to .php if needed)
            "redirect" => "UserManagement.html"
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No admin account found with that email"]);
}

$stmt->close();
$conn->close();
exit;
?>
