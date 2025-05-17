// Centralized quiz data list
const quizData = [
    {
        id: 'quiz1',
        url: 'https://quizizz.com/join?gc=16757108',
        title: 'Week 2',
        description: 'One word at a time, one step closer to fluency.',
    },
    {
        id: 'quiz2',
        url: 'https://quizizz.com/join?gc=05773812',
        title: 'Week 3',
        description: 'The limits of my language mean the limits of my world.',
    }
];

// Function to get all quiz data
function getAllQuizData() {
    return quizData;
}

// Function to get quiz by ID
function getQuizById(id) {
    return quizData.find(quiz => quiz.id === id);
}

// Function to get quiz by URL
function getQuizByUrl(url) {
    return quizData.find(quiz => quiz.url === url);
}

// Store quiz data in localStorage for cross-page access
function saveQuizDataToStorage() {
    try {
        localStorage.setItem('quizListData', JSON.stringify(quizData));
    } catch (error) {
        console.error('Error saving quiz data to localStorage:', error);
    }
}

// Initialize storage on script load
saveQuizDataToStorage(); 