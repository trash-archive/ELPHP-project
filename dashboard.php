<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "mynotesdb");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

$user_id = $_SESSION['user_id'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Fetch notes
        $query = "SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ?";
        
        if (isset($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $query .= " AND title LIKE ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("is", $user_id, $search);
        } else if (isset($_GET['id'])) {
            $query .= " AND id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ii", $user_id, $_GET['id']);
        } else {
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $user_id);
        }
        
        $query .= " ORDER BY updated_at DESC, created_at DESC";
        $stmt->execute();
        $result = $stmt->get_result();
        $notes = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(["success" => true, "notes" => $notes]);
        break;
    case 'POST':
        // Create note
        $data = json_decode(file_get_contents("php://input"), true);
        $title = trim($data['title']);
        $content = trim($data['content']);
        
        if (empty($title) || empty($content)) {
            echo json_encode(["success" => false, "message" => "Title and content are required"]);
            break;
        }
        
        $stmt = $conn->prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user_id, $title, $content);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Note created successfully",
                "note_id" => $conn->insert_id
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to create note"]);
        }
        break;

    case 'PUT':
        // Update note
        $data = json_decode(file_get_contents("php://input"), true);
        $note_id = $data['id'];
        $title = trim($data['title']);
        $content = trim($data['content']);
        
        if (empty($title) || empty($content)) {
            echo json_encode(["success" => false, "message" => "Title and content are required"]);
            break;
        }
        
        $stmt = $conn->prepare("UPDATE notes SET title=?, content=? WHERE id=? AND user_id=?");
        $stmt->bind_param("ssii", $title, $content, $note_id, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Note updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update note"]);
        }
        break;

    case 'DELETE':
        // Delete note
        if (!isset($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Note ID is required"]);
            break;
        }
        
        $note_id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM notes WHERE id=? AND user_id=?");
        $stmt->bind_param("ii", $note_id, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Note deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete note"]);
        }
        break;
}

$conn->close();
?>