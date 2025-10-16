<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Include database connection
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Get user by email with role = 'user'
    $stmt = $conn->prepare("SELECT id, password, first_name, last_name, role FROM users WHERE email = ? AND role = 'user'");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $user['password'])) {
            // Save to session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['first_name'] = $user['first_name'];
            $_SESSION['last_name'] = $user['last_name'];
            $_SESSION['role'] = $user['role'];

            echo json_encode([
                "status" => "success",
                "message" => "Welcome back " . $user['first_name'] . "!",
                "redirect" => "dashboard.php"
            ]);
            exit;
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid password!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No user account found with that email."]);
    }

    $stmt->close();
}

$conn->close();
?>
