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
$lastName  = $data['last_name'];
$email     = $data['email'];

// If password change is requested
if (!empty($data['current_password']) && !empty($data['new_password'])) {
    // Fetch current password from DB
    $stmt = $conn->prepare("SELECT password FROM users WHERE id=?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($hashedPasswordFromDB);
    $stmt->fetch();
    $stmt->close();

    // Verify current password
    if (!password_verify($data['current_password'], $hashedPasswordFromDB)) {
        echo json_encode(["success" => false, "error" => "Current password is incorrect"]);
        $conn->close();
        exit;
    }

    // Hash new password
    $newHashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

    // Update profile with new password
    $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE id=?");
    $stmt->bind_param("ssssi", $firstName, $lastName, $email, $newHashedPassword, $user_id);
} else {
    // Update profile without changing password
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