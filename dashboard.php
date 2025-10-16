<?php
session_start();
header('Content-Type: application/json');

// Check user authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

// Include database connection
require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // 🟢 GET — Fetch notes or perform search
    case 'GET':
        $archived = isset($_GET['archived']) && $_GET['archived'] == '1' ? 1 : 0;

        if (isset($_GET['search'])) {
            $search = "%" . $_GET['search'] . "%";
            $query = "
                SELECT id, title, content, created_at, updated_at, is_archived
                FROM notes
                WHERE user_id = ? 
                AND is_archived = ?
                AND (title LIKE ? OR content LIKE ?)
                ORDER BY updated_at DESC, created_at DESC
            ";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iiss", $user_id, $archived, $search, $search);
        } elseif (isset($_GET['id'])) {
            $query = "
                SELECT id, title, content, created_at, updated_at, is_archived
                FROM notes
                WHERE user_id = ? AND id = ? AND is_archived = ?
            ";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iii", $user_id, $_GET['id'], $archived);
        } else {
            $query = "
                SELECT id, title, content, created_at, updated_at, is_archived
                FROM notes
                WHERE user_id = ? AND is_archived = ?
                ORDER BY updated_at DESC, created_at DESC
            ";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ii", $user_id, $archived);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $notes = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(["success" => true, "notes" => $notes]);
        break;

    // 🟡 POST — Create a new note
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if (empty($title) || empty($content)) {
            echo json_encode(["success" => false, "message" => "Title and content are required"]);
            break;
        }

        $stmt = $conn->prepare("INSERT INTO notes (user_id, title, content, is_archived) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("iss", $user_id, $title, $content);
        $success = $stmt->execute();

        echo json_encode([
            "success" => $success,
            "message" => $success ? "Note created successfully" : "Failed to create note"
        ]);
        break;

    // 🟠 PUT — Update or restore a note
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['restore'])) {
            // Restore note from archive
            $stmt = $conn->prepare("UPDATE notes SET is_archived = 0 WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $data['id'], $user_id);
            echo json_encode(["success" => $stmt->execute(), "message" => "Note restored"]);
            break;
        }

        // Update existing note
        $note_id = $data['id'] ?? null;
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if (!$note_id || empty($title) || empty($content)) {
            echo json_encode(["success" => false, "message" => "Invalid update data"]);
            break;
        }

        $stmt = $conn->prepare("UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ssii", $title, $content, $note_id, $user_id);
        echo json_encode(["success" => $stmt->execute(), "message" => "Note updated successfully"]);
        break;

    // 🔴 DELETE — Move to archive (soft delete)
    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Note ID required"]);
            break;
        }

        $note_id = $_GET['id'];
        $stmt = $conn->prepare("UPDATE notes SET is_archived = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $note_id, $user_id);
        echo json_encode(["success" => $stmt->execute(), "message" => "Note moved to archive"]);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}

$conn->close();
?>
