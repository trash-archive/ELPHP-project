<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mynotesdb";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user_id'];

$firstName = $data['first_name'];
$lastName = $data['last_name'];
$email = $data['email'];

// Optional: password update
if (!empty($data['password'])) {
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE id=?");
    $stmt->bind_param("ssssi", $firstName, $lastName, $email, $hashedPassword, $user_id);
} else {
    $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?");
    $stmt->bind_param("sssi", $firstName, $lastName, $email, $user_id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
$stmt->close();
$conn->close();
?>