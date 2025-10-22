<?php
// db_connect.php

// $servername = "sql105.infinityfree.com";
// $db_username = "if0_40210466";
// $db_password = "0Omqb54l4Wgdxm";
// $dbname = "if0_40210466_mynotesdb";

$servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "mynotesdb";

$conn = new mysqli($servername, $db_username, $db_password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
?>
