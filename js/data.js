// Centralized quiz data list
const quizData = [
    {
        id: 'quiz1',
        url: 'https://quizizz.com/join?gc=16757108',
        title: 'Week 1-2',
        description: 'One word at a time, one step closer to fluency.',
    },
    {
        id: 'quiz2',
        url: 'https://quizizz.com/join?gc=05773812',
        title: 'Week 1-3',
        description: 'The limits of my language mean the limits of my world.',
    },
    {
        id: 'quiz3',
        url: 'https://quizizz.com/join?gc=32524812',
        title: 'Week 2-1',
        description:'What I cannot express, I cannot fully grasp',
    },
    {
        id: 'quiz4',
        url: 'https://quizizz.com/join?gc=31747212',
        title: 'Week 2-2',
        description:'Language is the map; without it, I wander blind.',
    },
    {
        id: 'quiz5',
        url: 'https://quizizz.com/join?gc=00020364',
        title: 'Week 2-3',
        description:'Language is the map; without it, I wander blind.',
    },
    {
        id: 'quiz6',
        url: 'https://quizizz.com/join?gc=49796684',
        title: 'Week 3-1',
        description:'Language is the map; without it, I wander blind.',
    },
    {
        id: 'quiz7',
        url: 'https://quizizz.com/join?gc=21004492',
        title: 'Week 3-2',
        description:'Language is the map; without it, I wander blind.',
    },
    {
        id: 'quiz8',
        url: 'https://quizizz.com/join?gc=15517748',
        title: 'Week 3-3',
        description:'Have a nice weekend and see you all next Monday💕👌🌷🪷🌸🌼🌻🪻🌹🌞🌱🍄🍁',
    },
    {
        id: 'quiz9',
        url: 'https://quizizz.com/join?gc=46170420',
        title: 'Week 4-1',
        description:'PHÂN BỔ THỜI GIAN KHOA HỌC VÀ HỢP LÝ ĐỂ VIỆC HỌC ĐƯỢC HIỆU QUẢ NHẤT, CÁC BẠN NHÉ 💖👌😍😘😎 😎😎💕💕',
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