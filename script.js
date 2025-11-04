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
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuClick(e.target);
            });
        });

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

        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        menuItem.classList.add('active');

        this.loadWikipediaArticle(topic);
    }

    async loadWikipediaArticle(topic) {
        this.showLoading();
        this.currentTopic = topic;

        try {
            // Get summary first
            const summaryResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
            );

            if (!summaryResponse.ok) {
                throw new Error('Article not found');
            }

            const summaryData = await summaryResponse.json();

            // Get full article content
            const contentResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(topic)}`
            );

            let fullContent = '';
            if (contentResponse.ok) {
                fullContent = await contentResponse.text();
            }

            this.displayArticle(summaryData, fullContent);
        } catch (error) {
            this.displayError(error);
        } finally {
            this.hideLoading();
        }
    }

    displayArticle(summaryData, fullContent) {
        const contentDiv = document.getElementById('article-content');
        const titleElement = document.getElementById('article-title');
        const descriptionElement = document.getElementById('article-description');

        titleElement.textContent = summaryData.title;
        descriptionElement.textContent = summaryData.description || 'Exploring comprehensive knowledge from Wikipedia';

        if (fullContent) {
            // Process and display full HTML content
            const processedContent = this.processWikipediaHTML(fullContent);
            contentDiv.innerHTML = this.createArticleLayout(summaryData, processedContent);
        } else {
            // Fallback to summary only
            contentDiv.innerHTML = this.createSummaryLayout(summaryData);
        }
    }

    processWikipediaHTML(htmlContent) {
        // Create temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Remove unwanted elements
        const unwantedSelectors = [
            '.mw-editsection',
            '.reference',
            '.noprint',
            '.navbox',
            '.infobox',
            '.metadata',
            '.hatnote',
            '.shortdescription'
        ];

        unwantedSelectors.forEach(selector => {
            tempDiv.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Add custom styling to tables
        tempDiv.querySelectorAll('table').forEach(table => {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.margin = '1.5rem 0';
        });

        tempDiv.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = '1px solid var(--border-color)';
            cell.style.padding = '0.75rem';
            cell.style.textAlign = 'left';
        });

        // Style headings
        tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            heading.style.color = 'var(--text-color)';
            heading.style.marginTop = '2rem';
            heading.style.marginBottom = '1rem';
        });

        // Style paragraphs
        tempDiv.querySelectorAll('p').forEach(p => {
            p.style.marginBottom = '1.5rem';
            p.style.lineHeight = '1.8';
            p.style.color = 'var(--text-color)';
        });

        // Style lists
        tempDiv.querySelectorAll('ul, ol').forEach(list => {
            list.style.margin = '1.5rem 0';
            list.style.paddingLeft = '2rem';
        });

        tempDiv.querySelectorAll('li').forEach(li => {
            li.style.marginBottom = '0.5rem';
            li.style.color = 'var(--text-color)';
        });

        return tempDiv.innerHTML;
    }

    createArticleLayout(summaryData, processedContent) {
        return `
            <div class="article-meta">
                <div class="meta-left">
                    <span class="article-source">📚 Wikipedia Encyclopedia</span>
                    <span class="article-date">🕒 Last Updated: ${new Date().toLocaleDateString()}</span>
                </div>
                <a href="${summaryData.content_urls.desktop.page}" target="_blank" class="read-more">
                    📖 Read Full Article on Wikipedia →
                </a>
            </div>

            <div class="article-header">
                ${summaryData.thumbnail ? `
                    <div class="article-hero">
                        <img src="${summaryData.thumbnail.source}" alt="${summaryData.title}" class="hero-image">
                        <div class="image-caption">${summaryData.thumbnail.source.split('/').pop()}</div>
                    </div>
                ` : ''}
                
                <div class="article-intro">
                    <h1>${summaryData.title}</h1>
                    <p class="article-description">${summaryData.description || 'Comprehensive overview'}</p>
                    <div class="article-extract">
                        <p><strong>Summary:</strong> ${summaryData.extract}</p>
                    </div>
                </div>
            </div>

            <div class="wikipedia-content">
                ${processedContent || `
                    <div class="content-section">
                        <h2>Overview</h2>
                        <p>${summaryData.extract}</p>
                        <p class="content-notice">🔍 For the complete article with detailed sections, visit the Wikipedia page using the link above.</p>
                    </div>
                `}
            </div>

            ${this.generateRelatedContent()}
        `;
    }

    createSummaryLayout(summaryData) {
        return `
            <div class="article-meta">
                <div class="meta-left">
                    <span class="article-source">📚 Wikipedia Summary</span>
                </div>
                <a href="${summaryData.content_urls.desktop.page}" target="_blank" class="read-more">
                    📖 Read Full Article →
                </a>
            </div>

            <div class="article-header">
                ${summaryData.thumbnail ? `
                    <img src="${summaryData.thumbnail.source}" alt="${summaryData.title}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1rem;">
                ` : ''}
                
                <h1>${summaryData.title}</h1>
                <p class="article-description">${summaryData.description || 'Detailed overview from Wikipedia'}</p>
            </div>

            <div class="wikipedia-content">
                <div class="content-section">
                    <h2>Comprehensive Summary</h2>
                    <p>${summaryData.extract}</p>
                    
                    <div class="additional-info">
                        <h3>📋 Key Information</h3>
                        <ul>
                            <li><strong>Topic:</strong> ${summaryData.title}</li>
                            <li><strong>Type:</strong> ${summaryData.type || 'Article'}</li>
                            <li><strong>Content:</strong> Wikipedia Encyclopedia</li>
                            <li><strong>Language:</strong> English</li>
                        </ul>
                    </div>

                    <div class="explore-more">
                        <h3>🔍 Want to learn more?</h3>
                        <p>Click the "Read Full Article" button above to explore the complete Wikipedia page with detailed sections, references, and additional resources.</p>
                    </div>
                </div>
            </div>

            ${this.generateRelatedContent()}
        `;
    }

    generateRelatedContent() {
        const topics = {
            'Artificial Intelligence': [
                'Machine Learning', 'Deep Learning', 'Neural Networks', 
                'Computer Vision', 'Natural Language Processing', 'Robotics',
                'Expert Systems', 'AI Ethics', 'Artificial General Intelligence'
            ],
            'Quantum Computing': [
                'Qubit', 'Superposition', 'Quantum Entanglement',
                'Quantum Algorithm', 'Quantum Supremacy', 'Quantum Cryptography'
            ],
            'Renewable Energy': [
                'Solar Power', 'Wind Energy', 'Hydroelectricity',
                'Geothermal Energy', 'Biomass', 'Sustainable Technology'
            ],
            'Space Exploration': [
                'NASA', 'SpaceX', 'International Space Station',
                'Mars Exploration', 'Satellite Technology', 'Astronomy'
            ],
            'Biotechnology': [
                'Genetic Engineering', 'CRISPR', 'Bioinformatics',
                'Pharmaceuticals', 'Synthetic Biology', 'Medical Technology'
            ]
        };

        const currentTopics = topics[this.currentTopic] || [
            'Technology', 'Science', 'Research', 'Innovation', 'Development'
        ];

        return `
            <div class="related-topics">
                <h3>🔗 Related Topics</h3>
                <p>Explore these related subjects for deeper understanding:</p>
                <div class="topics-grid">
                    ${currentTopics.map(topic => 
                        `<span class="topic-tag" onclick="wikipediaReader.loadWikipediaArticle('${topic}')">${topic}</span>`
                    ).join('')}
                </div>
            </div>

            <div class="article-actions">
                <button onclick="window.open('https://en.wikipedia.org/wiki/${encodeURIComponent(this.currentTopic)}', '_blank')" class="action-btn primary">
                    📚 Open in Wikipedia
                </button>
                <button onclick="window.print()" class="action-btn secondary">
                    🖨️ Print Article
                </button>
                <button onclick="this.shareArticle()" class="action-btn secondary">
                    📤 Share
                </button>
            </div>
        `;
    }

    shareArticle() {
        if (navigator.share) {
            navigator.share({
                title: this.currentTopic,
                text: `Check out this Wikipedia article about ${this.currentTopic}`,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(this.currentTopic)}`
            });
        } else {
            // Fallback
            navigator.clipboard.writeText(`https://en.wikipedia.org/wiki/${encodeURIComponent(this.currentTopic)}`);
            alert('Link copied to clipboard!');
        }
    }

    displayError(error) {
        const contentDiv = document.getElementById('article-content');
        contentDiv.innerHTML = `
            <div class="error-state">
                <div class="error-icon">😕</div>
                <h2>Article Not Available</h2>
                <p>We encountered an issue loading the article for "${this.currentTopic}".</p>
                <p class="error-details">Error: ${error.message}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="action-btn primary">
                        🔄 Try Again
                    </button>
                    <button onclick="wikipediaReader.loadWikipediaArticle('Technology')" class="action-btn secondary">
                        🚀 Browse Technology
                    </button>
                </div>
            </div>
        `;
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
        document.getElementById('article-content').style.opacity = '0.3';
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('article-content').style.opacity = '1';
    }
}

// Initialize the application
let wikipediaReader;
document.addEventListener('DOMContentLoaded', () => {
    wikipediaReader = new WikipediaReader();
    
    // Load first article automatically
    setTimeout(() => {
        wikipediaReader.loadWikipediaArticle('Artificial Intelligence');
    }, 1000);
});
