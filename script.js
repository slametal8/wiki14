class WikipediaReader {
    constructor() {
        this.currentTopic = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
    }

    setupEventListeners() {
        // Menu item clicks
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuClick(e.target);
            });
        });

        // Theme switcher
        document.getElementById('theme-switcher').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeButton(newTheme);
    }

    updateThemeButton(theme) {
        const button = document.getElementById('theme-switcher');
        button.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    handleMenuClick(element) {
        const menuItem = element.closest('.menu-item');
        const topic = menuItem.dataset.topic;

        // Update active state
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        menuItem.classList.add('active');

        // Load article
        this.loadWikipediaArticle(topic);
    }

    async loadWikipediaArticle(topic) {
        this.showLoading();
        this.currentTopic = topic;

        try {
            const response = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
            );

            if (!response.ok) {
                throw new Error('Article not found');
            }

            const data = await response.json();
            this.displayArticle(data);
        } catch (error) {
            this.displayError(error);
        } finally {
            this.hideLoading();
        }
    }

    displayArticle(data) {
        const contentDiv = document.getElementById('article-content');
        const titleElement = document.getElementById('article-title');
        const descriptionElement = document.getElementById('article-description');

        // Update header
        titleElement.textContent = data.title;
        descriptionElement.textContent = data.description || 'Exploring knowledge from Wikipedia';

        // Create article content
        contentDiv.innerHTML = `
            <div class="article-meta">
                <span class="article-source">📚 Source: Wikipedia</span>
                <a href="${data.content_urls.desktop.page}" target="_blank" class="read-more">
                    Read Full Article →
                </a>
            </div>
            <div class="wikipedia-content">
                ${data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 1.5rem;">` : ''}
                <h2>${data.title}</h2>
                <p>${data.extract}</p>
                ${this.generateRelatedTopics()}
            </div>
        `;
    }

    generateRelatedTopics() {
        const relatedTopics = [
            'Machine Learning', 'Deep Learning', 'Neural Networks', 
            'Computer Vision', 'Natural Language Processing'
        ];

        if (this.currentTopic.toLowerCase().includes('ai') || 
            this.currentTopic.toLowerCase().includes('artificial')) {
            return `
                <div style="margin-top: 2rem; padding: 1.5rem; background: var(--sidebar-bg); border-radius: 8px;">
                    <h3 style="margin-bottom: 1rem;">🔗 Related Topics</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${relatedTopics.map(topic => 
                            `<span style="background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">${topic}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        return '';
    }

    displayError(error) {
        const contentDiv = document.getElementById('article-content');
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                <h2>Article Not Found</h2>
                <p style="color: var(--text-light); margin-bottom: 1.5rem;">
                    We couldn't find the requested article. Please try another topic.
                </p>
                <button onclick="location.reload()" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
        document.getElementById('article-content').style.opacity = '0.5';
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('article-content').style.opacity = '1';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WikipediaReader();
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(0)';
            }
        });
    });

    // Add parallax effect to header
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.content-header');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
});
