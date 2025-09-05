<?php
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "mynotesdb"; 

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle login form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Prepare SQL to get user by email
    $stmt = $conn->prepare("SELECT id, password, first_name, last_name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify hashed password
        if (password_verify($password, $user['password'])) {
            // Save user info in session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['first_name'] = $user['first_name'];
            $_SESSION['last_name'] = $user['last_name'];

            // Redirect to dashboard
            echo json_encode(["status" => "success", "message" => "Welcome back " . $user['first_name'] . "!", ""]);
            exit;
        } else {
            echo json_encode (["status" => "error", "message" => "Invalid password!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No account found with that email."]);
    }

    $stmt->close();
}

$conn->close();
?>
