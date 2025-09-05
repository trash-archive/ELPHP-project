<?php
session_start();
header('Content-Type: application/json');

require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// DB connection
$conn = new mysqli("localhost","root","","mynotesdb");
if($conn->connect_error){
    echo json_encode(["success"=>false,"message"=>"DB connection failed"]);
    exit;
}

if($_SERVER["REQUEST_METHOD"]==="POST"){
    $email = trim($_POST['email']);

    // Check email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmt->bind_param("s",$email);
    $stmt->execute();
    $stmt->store_result();
    if($stmt->num_rows===0){
        echo json_encode(["success"=>false,"message"=>"Email not registered"]);
        exit;
    }
    $stmt->bind_result($userId);
    $stmt->fetch();
    $stmt->close();

    // Prevent multiple OTPs within 10 mins
    $stmt = $conn->prepare("SELECT * FROM otp_codes WHERE user_id=? AND expires_at>NOW()");
    $stmt->bind_param("i",$userId);
    $stmt->execute();
    $stmt->store_result();
    if($stmt->num_rows>0){
        echo json_encode(["success"=>false,"message"=>"An OTP was already sent. Check your email."]);
        exit;
    }
    $stmt->close();

    // Generate 4-digit OTP
    $otp = rand(1000,9999);
    $expiry = date("Y-m-d H:i:s", strtotime("+10 minutes"));

    // Store OTP
    $insert = $conn->prepare("INSERT INTO otp_codes(user_id,otp,expires_at) VALUES(?,?,?)");
    $insert->bind_param("iss",$userId,$otp,$expiry);
    $insert->execute();
    $otpId = $insert->insert_id;
    $insert->close();

    // Send email
    $mail = new PHPMailer(true);
    try{
        $mail->isSMTP();
        $mail->Host='smtp.gmail.com';
        $mail->SMTPAuth=true;
        $mail->Username = 'panimdimjhonmark@gmail.com'; // <-- set your Gmail
        $mail->Password = 'vwnj vrhw nhya jiny';    // <-- set your app password
        $mail->SMTPSecure='tls';
        $mail->Port=587;

        $mail->setFrom('mynotes@gmail.com','MyNotes');
        $mail->addAddress($email); 
        $mail->isHTML(true);
        $mail->Subject='MyNotes OTP Code';
        $mail->Body="Your OTP code is: <b>$otp</b>. It expires in 10 minutes.";
        $mail->AltBody="Your OTP code is: $otp. It expires in 10 minutes.";

        $mail->send();
        $_SESSION['otp_id'] = $otpId;
        echo json_encode(["success"=>true,"message"=>"OTP sent to your email"]);
    } catch(Exception $e){
        $_SESSION['otp_id'] = $otpId;
        echo json_encode(["success"=>true,"message"=>"OTP (local dev): $otp","otp"=>$otp]);
    }
}
$conn->close();
?>
