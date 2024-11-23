<?php
header('Content-Type: application/json');
include 'config.php';  // Ensure you have a config file to connect to the database

$sql = "SELECT * FROM questions";
$result = $conn->query($sql);

$questions = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $questions[] = array(
            'text' => $row['question_text'],
            'options' => array($row['option1'], $row['option2'], $row['option3'], $row['option4']),
            'correct' => $row['correct_option']
        );
    }
}

echo json_encode($questions);

$conn->close();
?>