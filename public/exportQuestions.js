const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportQuestions() {
  // Setup your MySQL connection
  const connection = await mysql.createConnection({
    host     : process.env.MYSQL_ADDON_HOST,
    	database : process.env.MYSQL_ADDON_DB,
    	user     : process.env.MYSQL_ADDON_USER,
    	password : process.env.MYSQL_ADDON_PASSWORD
  });

  try {
    // Query all questions
    const [rows] = await connection.execute('SELECT * FROM questions');

    // Convert rows to JSON string (you can customize this)
    const jsonString = JSON.stringify(rows, null, 2);

    // Prepare JavaScript export code
    const jsContent = `const questions = ${jsonString};\n\nexport default questions;`;

    // Write to your target file
    const filePath = '/Users/khrishnavparasuraman/Documents/GitHub/ScienceBowlPro/public/questions.js';
    fs.writeFileSync(filePath, jsContent, 'utf8');

    console.log(`Exported ${rows.length} questions to ${filePath}`);
  } catch (err) {
    console.error('Error exporting questions:', err);
  } finally {
    await connection.end();
  }
}

exportQuestions();