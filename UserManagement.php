<?php
header('Content-Type: application/json');

// Include database connection
require_once 'db_connect.php';

// Get search and pagination parameters
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
$page   = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit  = 5; 
$offset = ($page - 1) * $limit;

// Count total users (with search filter & role filter)
$countQuery = "SELECT COUNT(*) as total FROM users 
               WHERE role = 'user'
               AND (first_name LIKE '%$search%' 
               OR last_name LIKE '%$search%')";
$countResult = $conn->query($countQuery);
$totalUsers = $countResult->fetch_assoc()['total'];

// Fetch paginated users (only role = user)
$sql = "SELECT id, first_name, last_name, email 
        FROM users 
        WHERE role = 'user'
        AND (first_name LIKE '%$search%' 
        OR last_name LIKE '%$search%') 
        ORDER BY id DESC 
        LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);

$users = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

// Calculate total pages safely
$totalPages = $totalUsers > 0 ? ceil($totalUsers / $limit) : 1;

echo json_encode([
    "users" => $users,
    "totalUsers" => $totalUsers,
    "totalPages" => $totalPages,
    "currentPage" => $page
]);

$conn->close();
