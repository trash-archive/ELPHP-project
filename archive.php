<?php
session_start();
header("Content-Type: application/json");

// 🛑 Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

// Include database connection
require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];
$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    // 🟢 GET — Fetch archived notes
    case "GET":
        $stmt = $conn->prepare("
            SELECT id, title, content, DATE_FORMAT(created_at, '%b %d, %Y') AS date
            FROM notes 
            WHERE user_id = ? AND is_archived = 1
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $notes = [];
        while ($row = $result->fetch_assoc()) {
            $notes[] = $row;
        }

        echo json_encode(["success" => true, "notes" => $notes]);
        $stmt->close();
        break;

    // 🔄 POST — Restore (unarchive) a note
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data["note_id"])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Note ID missing"]);
            exit;
        }

        $note_id = $data["note_id"];
        $stmt = $conn->prepare("UPDATE notes SET is_archived = 0 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $note_id, $user_id);
        $stmt->execute();

        echo json_encode([
            "success" => $stmt->affected_rows > 0,
            "message" => $stmt->affected_rows > 0 ? "Note restored successfully" : "Note not found"
        ]);
        $stmt->close();
        break;

    // ❌ DELETE — Permanently delete archived note
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data["note_id"])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Note ID missing"]);
            exit;
        }

        $note_id = $data["note_id"];
        $stmt = $conn->prepare("DELETE FROM notes WHERE id = ? AND user_id = ? AND is_archived = 1");
        $stmt->bind_param("ii", $note_id, $user_id);
        $stmt->execute();

        echo json_encode([
            "success" => $stmt->affected_rows > 0,
            "message" => $stmt->affected_rows > 0 ? "Note permanently deleted" : "Note not found or not archived"
        ]);
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed"]);
        break;
}

$conn->close();
?>
