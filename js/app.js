// Statistics Management
class Statistics {
    static STORAGE_KEY = 'quizStatistics';
    static MAX_VISIT_HISTORY = 50;

    constructor() {
        this.stats = this.loadStats();
        this.startTime = Date.now();
        this.setupEventListeners();
        this.updateTotalTime();
    }

    loadStats() {
        try {
            const stored = localStorage.getItem(Statistics.STORAGE_KEY);
            const defaultStats = {
                totalTimeSpent: 0,
                visits: [],
                lastVisit: null
            };
            return stored ? JSON.parse(stored) : defaultStats;
        } catch (error) {
            console.error('Error loading statistics:', error);
            return {
                totalTimeSpent: 0,
                visits: [],
                lastVisit: null
            };
        }
    }

    saveStats() {
        try {
            // Limit visit history to prevent excessive storage
            if (this.stats.visits.length > Statistics.MAX_VISIT_HISTORY) {
                this.stats.visits = this.stats.visits.slice(0, Statistics.MAX_VISIT_HISTORY);
            }
            localStorage.setItem(Statistics.STORAGE_KEY, JSON.stringify(this.stats));
        } catch (error) {
            console.error('Error saving statistics:', error);
        }
    }

    formatDate(date) {
        try {
            const d = new Date(date);
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            }).format(d);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    addVisit(url, title) {
        try {
            // Check if we already have a visit with the same URL currently in progress
            const existingVisit = this.stats.visits.find(v => 
                v.url === url && v.endTime === undefined
            );
            
            if (existingVisit) {
                // Update existing visit instead of creating a new one
                existingVisit.count = (existingVisit.count || 1) + 1;
                existingVisit.lastVisitTime = Date.now();
                this.saveStats();
                return;
            }
            
            const visit = {
                url,
                title,
                timestamp: Date.now(),
                duration: '0s',
                startTime: Date.now(),
                count: 1
            };
            this.stats.visits.unshift(visit);
            this.stats.lastVisit = visit.timestamp;
            this.saveStats();
            this.updateVisitHistory();
        } catch (error) {
            console.error('Error adding visit:', error);
        }
    }

    updateTotalTime() {
        try {
            const updateInterval = setInterval(() => {
                const currentTime = Date.now();
                const sessionTime = Math.floor((currentTime - this.startTime) / 1000);
                this.stats.totalTimeSpent = sessionTime;
                this.saveStats();
                this.updateStatDisplay();
            }, 1000);

            // Cleanup to prevent memory leaks
            window.addEventListener('beforeunload', () => clearInterval(updateInterval));
        } catch (error) {
            console.error('Error updating total time:', error);
        }
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m ${seconds % 60}s`;
    }

    updateStatDisplay() {
        try {
            const totalTimeElement = document.getElementById('totalTimeSpent');
            const totalVisitsElement = document.getElementById('totalVisits');
            
            if (totalTimeElement) {
                totalTimeElement.textContent = this.formatTime(this.stats.totalTimeSpent);
            }
            if (totalVisitsElement) {
                totalVisitsElement.textContent = this.stats.visits.length;
            }
        } catch (error) {
            console.error('Error updating stat display:', error);
        }
    }

    updateVisitHistory() {
        try {
            const visitHistoryElement = document.getElementById('visitHistory');
            if (!visitHistoryElement) return;

            visitHistoryElement.innerHTML = this.stats.visits
                .map(visit => `
                    <div class="visit-item">
                        <span class="visit-title">${this.escapeHtml(visit.title)}</span>
                        <span class="visit-time">${this.formatDate(visit.timestamp)}</span>
                        <span class="visit-duration">${visit.duration}</span>
                        ${visit.count > 1 ? `<span class="visit-count">Visits: ${visit.count}</span>` : ''}
                    </div>
                `)
                .join('');
        } catch (error) {
            console.error('Error updating visit history:', error);
        }
    }

    updateVisitDuration(url) {
        try {
            const visit = this.stats.visits.find(v => v.url === url);
            if (visit) {
                const duration = Math.floor((Date.now() - visit.startTime) / 1000);
                visit.duration = this.formatTime(duration);
                visit.endTime = Date.now();
                this.saveStats();
            }
        } catch (error) {
            console.error('Error updating visit duration:', error);
        }
    }

    setupEventListeners() {
        try {
            const statsButton = document.getElementById('statsButton');
            const statsModal = document.getElementById('statsModal');
            const closeStats = document.getElementById('closeStats');

            statsButton.addEventListener('click', () => {
                this.updateStatDisplay();
                this.updateVisitHistory();
                statsModal.classList.add('active');
            });

            closeStats.addEventListener('click', () => {
                statsModal.classList.remove('active');
            });

            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) {
                    statsModal.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Utility method to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Visited Links Management
class VisitedLinks {
    static STORAGE_KEY = 'visitedQuizLinks';
    static QUIZ_LIST_KEY = 'quizListData';

    constructor() {
        this.visited = this.loadVisited();
        this.statistics = new Statistics();
        this.renderQuizCards();
        this.initializeVisitedState();
        this.setupSwitchListeners();
        this.setupQuizCardListeners();
        this.saveQuizList();
    }

    loadVisited() {
        try {
            const stored = localStorage.getItem(VisitedLinks.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading visited links:', error);
            return {};
        }
    }

    saveVisited() {
        try {
            localStorage.setItem(VisitedLinks.STORAGE_KEY, JSON.stringify(this.visited));
        } catch (error) {
            console.error('Error saving visited links:', error);
        }
    }

    isVisited(url) {
        return !!this.visited[url];
    }

    markAsVisited(url) {
        try {
            // If it was already visited before, we're incrementing the visit count
            const wasVisitedBefore = this.isVisited(url);
            
            this.visited[url] = true;
            this.saveVisited();
            this.updateSwitch(url, true);
            
            // Add visit to statistics
            const card = document.querySelector(`.quiz-card[data-url="${url}"]`);
            if (card) {
                const title = card.querySelector('h2').textContent;
                this.statistics.addVisit(url, title);
            }
        } catch (error) {
            console.error('Error marking as visited:', error);
        }
    }

    markAsUnvisited(url) {
        try {
            delete this.visited[url];
            this.saveVisited();
            this.updateSwitch(url, false);
        } catch (error) {
            console.error('Error marking as unvisited:', error);
        }
    }

    updateSwitch(url, visited) {
        const switchInput = document.querySelector(`.visit-switch[data-url="${url}"]`);
        if (switchInput) {
            switchInput.checked = visited;
        }
    }

    initializeVisitedState() {
        const switches = document.querySelectorAll('.visit-switch');
        switches.forEach(switchInput => {
            const url = switchInput.dataset.url;
            if (this.isVisited(url)) {
                switchInput.checked = true;
            }
        });
    }

    setupSwitchListeners() {
        const switches = document.querySelectorAll('.visit-switch');
        switches.forEach(switchInput => {
            switchInput.addEventListener('change', (e) => {
                const url = switchInput.dataset.url;
                
                // Prevent manual switching on for unvisited links
                if (!this.isVisited(url) && e.target.checked) {
                    e.preventDefault();
                    e.target.checked = false;
                    return;
                }

                if (e.target.checked) {
                    this.markAsVisited(url);
                } else {
                    this.markAsUnvisited(url);
                }
            });
        });
    }

    setupQuizCardListeners() {
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const url = card.dataset.url;
                const switchInput = card.querySelector('.visit-switch');

                // Open confirmation modal
                const modal = document.getElementById('confirmModal');
                modal.classList.add('active');

                // Setup modal buttons
                const confirmYes = document.getElementById('confirmYes');
                const confirmNo = document.getElementById('confirmNo');

                const handleConfirm = (confirmed) => {
                    modal.classList.remove('active');
                    
                    if (confirmed) {
                        // Mark as visited and open link
                        this.markAsVisited(url);
                        window.open(url, '_blank');
                    }
                };

                confirmYes.onclick = () => handleConfirm(true);
                confirmNo.onclick = () => handleConfirm(false);
            });
        });
    }

    // Render quiz cards from data.js
    renderQuizCards() {
        try {
            const quizGrid = document.getElementById('quizGrid');
            if (!quizGrid) return;
            
            // Clear any existing content
            quizGrid.innerHTML = '';
            
            // Get quiz data from data.js
            const quizzes = getAllQuizData();
            
            quizzes.forEach(quiz => {
                const cardElement = document.createElement('div');
                cardElement.className = 'quiz-card';
                cardElement.setAttribute('data-url', quiz.url);
                
                let tagsHtml = '';
                if (quiz.tags && quiz.tags.length) {
                    tagsHtml = '<div class="quiz-tags">' + 
                        quiz.tags.map(tag => `<span class="tag">${tag}</span>`).join('') +
                        '</div>';
                }
                
                cardElement.innerHTML = `
                    <div class="quiz-header">
                        <h2>${quiz.title}</h2>
                        <div class="quiz-visited">
                            <label class="switch">
                                <input type="checkbox" class="visit-switch" data-url="${quiz.url}">
                                <span class="slider"></span>
                            </label>
                            <span class="visit-label">Visited</span>
                        </div>
                    </div>
                    <p>${quiz.description}</p>
                    ${tagsHtml}
                `;
                
                quizGrid.appendChild(cardElement);
            });
        } catch (error) {
            console.error('Error rendering quiz cards:', error);
        }
    }

    // Save quiz list to localStorage for use by statistics page
    saveQuizList() {
        try {
            // We're now using the centralized quiz data, no need to extract it
            // This is handled by data.js
        } catch (error) {
            console.error('Error saving quiz list:', error);
        }
    }
}

// Global variables for modal and current quiz
let currentQuizUrl = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const visitedLinks = new VisitedLinks();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
} 