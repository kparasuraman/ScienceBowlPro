<?php
$servername = "localhost";  // Your database server, usually 'localhost'
$username = "root";  // Your MySQL username
$password = "qqhDgjv6ukMu7a_i-zcv";  // Your MySQL password
$dbname = "science_bowl_pro";  // The database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
