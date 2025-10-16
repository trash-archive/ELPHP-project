<?php
session_start();
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

// Include database connection
require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];

// GET request — Fetch profile info
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $conn->prepare("SELECT first_name, last_name, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "success" => true,
            "first_name" => $row['first_name'],
            "last_name" => $row['last_name'],
            "email" => $row['email']
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "User not found"]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// POST request — Update profile info (with optional password change)
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $firstName = trim($data['first_name'] ?? '');
    $lastName  = trim($data['last_name'] ?? '');
    $email     = trim($data['email'] ?? '');
    $currentPw = trim($data['current_password'] ?? '');
    $newPw     = trim($data['new_password'] ?? '');

    // Basic validation
    if (empty($firstName) || empty($lastName) || empty($email)) {
        echo json_encode(["success" => false, "error" => "All fields are required."]);
        $conn->close();
        exit;
    }

    // If changing password
    if (!empty($currentPw) || !empty($newPw)) {

        // Both fields must be filled
        if (empty($currentPw) || empty($newPw)) {
            echo json_encode(["success" => false, "error" => "Please fill in both current and new password."]);
            $conn->close();
            exit;
        }

        // Fetch current password from DB
        $stmt = $conn->prepare("SELECT password FROM users WHERE id=?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($hashedPw);
        $stmt->fetch();
        $stmt->close();

        if (!$hashedPw) {
            echo json_encode(["success" => false, "error" => "User not found."]);
            $conn->close();
            exit;
        }

        // Verify current password
        if (!password_verify($currentPw, $hashedPw)) {
            echo json_encode(["success" => false, "error" => "Current password is incorrect."]);
            $conn->close();
            exit;
        }

        // Hash new password
        $newHashed = password_hash($newPw, PASSWORD_DEFAULT);

        // Update profile with password
        $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE id=?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $email, $newHashed, $user_id);

    } else {
        // Update profile without password change
        $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?");
        $stmt->bind_param("sssi", $firstName, $lastName, $email, $user_id);
    }

    // Execute update query
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully."]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to update profile."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// Invalid method
http_response_code(405);
echo json_encode(["success" => false, "error" => "Invalid request method"]);
exit;
?>
