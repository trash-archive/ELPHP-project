<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

// Include database connection
require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT first_name, last_name, email FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

header('Content-Type: application/json');
echo json_encode($user);
