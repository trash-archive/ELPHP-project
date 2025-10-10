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
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        // Check if user wants archived notes
        $archived = isset($_GET['archived']) && $_GET['archived'] == '1' ? 1 : 0;

        $query = "SELECT id, title, content, created_at, updated_at, is_archived 
                  FROM notes WHERE user_id = ? AND is_archived = ?";
        
        if (isset($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $query .= " AND title LIKE ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iis", $user_id, $archived, $search);
        } else if (isset($_GET['id'])) {
            $query .= " AND id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iii", $user_id, $archived, $_GET['id']);
        } else {
            $stmt = $conn->prepare($query . " ORDER BY updated_at DESC, created_at DESC");
            $stmt->bind_param("ii", $user_id, $archived);
        }

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

        $stmt = $conn->prepare("INSERT INTO notes (user_id, title, content, is_archived) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("iss", $user_id, $title, $content);
 
        $success = $stmt->execute();
        echo json_encode([
            "success" => $success,
            "message" => $success? "Note created successfully" : "Failed to create note"
        ]);
        break;

    case 'PUT':
        // Update or restore
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['restore'])) {
            // Restore note from archive
            $stmt = $conn->prepare("UPDATE notes SET is_archived=0 WHERE id=? AND user_id=?");
            $stmt->bind_param("ii", $data['id'], $user_id);
            echo json_encode(["success" => $stmt->execute(), "message" => "Note restored"]);
            break;
        }

        // Update existing note
        $note_id = $data['id'];
        $title = trim($data['title']);
        $content = trim($data['content']);
        $stmt = $conn->prepare("UPDATE notes SET title=?, content=? WHERE id=? AND user_id=?");
        $stmt->bind_param("ssii", $title, $content, $note_id, $user_id);

        echo json_encode(["success" => $stmt->execute(), "message" => "Note updated successfully"]);
        break;

    case 'DELETE':
        // Move to archive instead of deleting
        if (!isset($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Note ID is required"]);
            break;
        }

        $note_id = $_GET['id'];
        $stmt = $conn->prepare("UPDATE notes SET is_archived=1 WHERE id=? AND user_id=?");
        $stmt->bind_param("ii", $note_id, $user_id);

        echo json_encode(["success" => $stmt->execute(), "message" => "Note moved to archive"]);
        break;
}

$conn->close();
?>
