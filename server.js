const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const path = require('path');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qqhDgjv6ukMu7a_i-zcv',
    database: 'quizdb'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Track user data
let userScores = {};
let userCredentials = {};
let userSessionStart = {}; // Tracks session start times

// Handle socket connection
io.on('connection', (socket) => {
    console.log('User connected');

    // Register or Login User
    socket.on('register', ({ username, password }) => {
        console.log('User registration attempt:', username);
    
        if (!userCredentials[username]) {
            // New user registration
            userCredentials[username] = password;
            userScores[username] = 0;
            userSessionStart[username] = Date.now(); // Record session start time
            console.log('New user registered:', username);
            socket.emit('registrationSuccess', {
                message: 'User registered successfully.',
                sessionStartTime: userSessionStart[username]
            });
        } else {
            // Existing user login
            if (userCredentials[username] === password) {
                const elapsedTime = (Date.now() - userSessionStart[username]) / 1000; // in seconds
                if (elapsedTime > 300) { // 5 minutes
                    socket.emit('accessDenied', 'Your session has expired. Create a new account to continue.');
                    return;
                }
    
                console.log('User logged in:', username);
                socket.emit('registrationSuccess', {
                    message: 'Login successful.',
                    sessionStartTime: userSessionStart[username]
                });
            } else {
                console.log('Invalid password for user:', username);
                socket.emit('registrationError', 'Invalid password. Please try again.');
                return;
            }
        }
    
        updateLeaderboard();
    });
    

    // Handle correct answers
    socket.on('correctAnswer', (data) => {
        const elapsedTime = (Date.now() - userSessionStart[data.username]) / 1000; // in seconds
        if (elapsedTime > 300) { // 5 minutes
            socket.emit('warnReset', 'Your session time is up. If you continue, your score will be reset.');
            return;
        }

        console.log('Correct answer from:', data.username);
        if (userScores[data.username] !== undefined) {
            userScores[data.username] += 10;
            console.log('Updated score for', data.username, ':', userScores[data.username]);
            updateLeaderboard();
        }
    });

    // Function to update the leaderboard
    const updateLeaderboard = () => {
        const leaderboard = Object.entries(userScores)
            .map(([username, score]) => ({
                username,
                score
            }))
            .sort((a, b) => b.score - a.score);

        console.log('Sending leaderboard update:', leaderboard);
        io.emit('leaderboard', leaderboard);
    };

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Endpoint to fetch questions
app.get('/questions', (req, res) => {
    const query = 'SELECT * FROM questions';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching questions:', err);
            res.status(500).send('Error fetching questions');
            return;
        }
        res.json(result);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file for the quiz
app.get('/mcqOnline', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mcqOnline.html'));
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
