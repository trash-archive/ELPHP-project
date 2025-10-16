<?php
// db_connect.php

$servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "mynotesdb";

/* $servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "mynotesdb"; */

$conn = new mysqli($servername, $db_username, $db_password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
?>
