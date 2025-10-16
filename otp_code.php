<?php
session_start();
header('Content-Type: application/json');

// Include database connection
require_once 'db_connect.php';

if($_SERVER["REQUEST_METHOD"]==="POST"){
    $email = trim($_POST['email']);
    $otpInput = trim($_POST['otp']);

    $stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmt->bind_param("s",$email);
    $stmt->execute(); $stmt->store_result();
    if($stmt->num_rows===0){ echo json_encode(["success"=>false,"message"=>"Email not found"]); exit; }
    $stmt->bind_result($userId); $stmt->fetch(); $stmt->close();

    $stmt = $conn->prepare("SELECT id, otp, expires_at FROM otp_codes WHERE user_id=? ORDER BY id DESC LIMIT 1");
    $stmt->bind_param("i",$userId);
    $stmt->execute(); $stmt->bind_result($otpId,$otpDb,$expires);
    if(!$stmt->fetch()){ echo json_encode(["success"=>false,"message"=>"OTP not found"]); exit; }
    $stmt->close();

    if(date("Y-m-d H:i:s") > $expires){ echo json_encode(["success"=>false,"message"=>"OTP expired"]); exit; }

    if($otpInput==$otpDb){
        $_SESSION['verified_user_id']=$userId;
        echo json_encode(["success"=>true,"message"=>"OTP verified","user_id"=>$userId]);
    } else echo json_encode(["success"=>false,"message"=>"Incorrect OTP"]);
}
$conn->close();
?>
