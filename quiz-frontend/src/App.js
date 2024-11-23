import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/questions');
                setQuestions(response.data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, []);

    return (
        <div>
            <h1>Quiz Questions</h1>
            {questions.length > 0 ? (
                <ul>
                    {questions.map((question) => (
                        <li key={question.id}>
                            <strong>{question.text}</strong>
                            <ul>
                                <li>A. {question.option_a}</li>
                                <li>B. {question.option_b}</li>
                                <li>C. {question.option_c}</li>
                                <li>D. {question.option_d}</li>
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading questions...</p>
            )}
        </div>
    );
}

export default App;
