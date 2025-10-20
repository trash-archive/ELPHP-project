<?php
// all_notes.php

header('Content-Type: application/json');

// Include database connection
require_once 'db_connect.php';

// Pagination and filtering
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';
$limit = 6; // number of notes per page
$offset = ($page - 1) * $limit;

// Sorting logic
$orderBy = 'created_at DESC';
if ($sort === 'oldest') $orderBy = 'created_at ASC';
if ($sort === 'title') $orderBy = 'title ASC';

// Count total notes
$countQuery = "SELECT COUNT(*) AS total FROM notes WHERE title LIKE '%$search%' OR content LIKE '%$search%'";
$countResult = $conn->query($countQuery);
$totalNotes = $countResult->fetch_assoc()['total'];

// Fetch notes
$query = "
    SELECT n.id, n.title, n.content, n.created_at,
           u.first_name AS author_first_name, u.last_name AS author_last_name
    FROM notes n
    LEFT JOIN users u ON n.user_id = u.id
    WHERE n.title LIKE '%$search%' OR n.content LIKE '%$search%'
    ORDER BY $orderBy
    LIMIT $limit OFFSET $offset
";
$result = $conn->query($query);

$notes = [];
while ($row = $result->fetch_assoc()) {
    $notes[] = $row;
}

// Calculate total pages
$totalPages = ceil($totalNotes / $limit);

echo json_encode([
    'notes' => $notes,
    'totalNotes' => $totalNotes,
    'totalPages' => $totalPages,
    'currentPage' => $page
]);

$conn->close();
?>
