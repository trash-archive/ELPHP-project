<?php
session_start();
header('Content-Type: application/json');

// Database connection
$conn = new mysqli("localhost", "root", "", "mynotesdb");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Validate inputs
    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Update the password
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $hashedPassword, $email);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Password updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "User not found"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update password"
        ]);
    }

    $stmt->close();
}

$conn->close();
?>