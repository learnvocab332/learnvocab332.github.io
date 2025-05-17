// Statistics Page Management
class StatisticsPage {
    static STORAGE_KEY = 'visitedQuizLinks';
    static STATS_STORAGE_KEY = 'quizStatistics';
    static QUIZ_LIST_KEY = 'quizListData';

    constructor() {
        this.visitData = this.loadVisitData();
        this.statsData = this.loadStatsData();
        this.renderStatisticsPage();
        this.setupClearDataButton();
    }

    loadVisitData() {
        try {
            const stored = localStorage.getItem(StatisticsPage.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading visited links data:', error);
            return {};
        }
    }

    loadStatsData() {
        try {
            const stored = localStorage.getItem(StatisticsPage.STATS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : { visits: [] };
        } catch (error) {
            console.error('Error loading statistics data:', error);
            return { visits: [] };
        }
    }

    // Group visits by URL and count occurrences
    processVisitData() {
        const visitCounts = {};
        const urlToTitleMap = {};
        
        // Process visits from statistics data
        this.statsData.visits.forEach(visit => {
            if (!visitCounts[visit.url]) {
                visitCounts[visit.url] = [];
                urlToTitleMap[visit.url] = visit.title;
            }
            
            visitCounts[visit.url].push({
                timestamp: visit.timestamp,
                duration: visit.duration || '0s'
            });
        });
        
        // Convert to array for easier rendering
        return Object.keys(visitCounts).map(url => ({
            url,
            title: urlToTitleMap[url] || 'Unknown Title',
            visits: visitCounts[url].sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent first
        }));
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    }

    // Clear all stored data and refresh the page
    clearAllData() {
        try {
            localStorage.removeItem(StatisticsPage.STORAGE_KEY);
            localStorage.removeItem(StatisticsPage.STATS_STORAGE_KEY);
            
            // Reload the page to show empty statistics
            window.location.reload();
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }

    setupClearDataButton() {
        const clearBtn = document.getElementById('clearLocalStorageBtn');
        const clearModal = document.getElementById('clearDataModal');
        const confirmClearBtn = document.getElementById('confirmClear');
        const cancelClearBtn = document.getElementById('cancelClear');
        
        if (clearBtn && clearModal) {
            // Open modal when clear button is clicked
            clearBtn.addEventListener('click', () => {
                clearModal.classList.add('active');
            });
            
            // Set up confirmation button
            if (confirmClearBtn) {
                confirmClearBtn.addEventListener('click', () => {
                    this.clearAllData();
                });
            }
            
            // Set up cancel button
            if (cancelClearBtn) {
                cancelClearBtn.addEventListener('click', () => {
                    clearModal.classList.remove('active');
                });
            }
            
            // Close modal when clicking outside
            clearModal.addEventListener('click', (e) => {
                if (e.target === clearModal) {
                    clearModal.classList.remove('active');
                }
            });
        }
    }

    // Function to get quiz list from our centralized data source
    getQuizList() {
        try {
            // First check if data.js is available (indicated by global function)
            if (typeof getAllQuizData === 'function') {
                return Promise.resolve(getAllQuizData());
            }
            
            // Fallback to localStorage if data.js is not loaded
            const storedList = localStorage.getItem(StatisticsPage.QUIZ_LIST_KEY);
            if (storedList) {
                const parsedList = JSON.parse(storedList);
                return Promise.resolve(parsedList);
            }
            
            // Last resort - try to fetch from index.html
            return this.fetchQuizListFromIndex();
        } catch (error) {
            console.error('Error getting quiz list:', error);
            return Promise.resolve([]);
        }
    }
    
    // Fallback method to fetch quiz list from index.html if needed
    async fetchQuizListFromIndex() {
        try {
            const response = await fetch('/index.html');
            if (!response.ok) {
                throw new Error('Failed to fetch index.html');
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract quiz cards
            const quizCards = doc.querySelectorAll('.quiz-card');
            return Array.from(quizCards).map(card => {
                const url = card.getAttribute('data-url');
                const titleElement = card.querySelector('h2');
                const title = titleElement ? titleElement.textContent : 'Unknown Quiz';
                const descElement = card.querySelector('p');
                const description = descElement ? descElement.textContent : '';
                
                return { 
                    url, 
                    title,
                    description
                };
            });
        } catch (error) {
            console.error('Error fetching quiz list from index:', error);
            return [];
        }
    }

    renderStatisticsPage() {
        const quizGrid = document.querySelector('.quiz-grid');
        if (!quizGrid) return;
        
        // Clear existing content
        quizGrid.innerHTML = '';
        
        // Process and sort data
        const processedData = this.processVisitData();
        
        if (processedData.length === 0) {
            quizGrid.innerHTML = '<div class="no-stats">No visits recorded yet. Start exploring quizzes!</div>';
            return;
        }
        
        // Get quiz list from centralized data source
        this.getQuizList().then(quizList => {
            // Create a card for each URL that exists in our statistics
            processedData.forEach(item => {
                const cardElement = document.createElement('div');
                cardElement.className = 'quiz-card';
                cardElement.setAttribute('data-url', item.url);
                
                // Find matching quiz from the list if available
                const matchingQuiz = quizList.find(quiz => quiz.url === item.url);
                const title = matchingQuiz ? matchingQuiz.title : item.title;
                
                const headerHtml = `
                    <div class="quiz-header">
                        <h2>${title}</h2>
                    </div>
                `;
                
                let tagsHtml = '';
                
                // Add visit history entries
                item.visits.forEach((visit, index) => {
                    tagsHtml += `
                    <div class="quiz-tags">
                        <span class="tag">${index + 1}</span>
                        <span class="tag">${this.formatDate(visit.timestamp)}</span>
                        ${visit.duration ? `<span class="tag">Duration: ${visit.duration}</span>` : ''}
                    </div>
                    `;
                });
                
                cardElement.innerHTML = headerHtml + tagsHtml;
                quizGrid.appendChild(cardElement);
            });
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const statsPage = new StatisticsPage();
}); 