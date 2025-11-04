// Dalam class WikipediaReader, tambahkan method berikut:

setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');

    // Search on button click
    searchBtn.addEventListener('click', () => {
        this.performSearch(searchInput.value);
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.performSearch(searchInput.value);
        }
    });

    // Real-time suggestions
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchSuggestions.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(() => {
            this.fetchSearchSuggestions(query);
        }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchSuggestions.classList.remove('active');
        }
    });
}

async fetchSearchSuggestions(query) {
    const searchSuggestions = document.getElementById('search-suggestions');
    
    try {
        searchSuggestions.innerHTML = '<div class="search-loading"><i class="fas fa-spinner"></i>Searching...</div>';
        searchSuggestions.classList.add('active');

        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
        );

        const data = await response.json();
        this.displaySearchSuggestions(data);
    } catch (error) {
        searchSuggestions.innerHTML = '<div class="search-loading">Failed to load suggestions</div>';
    }
}

displaySearchSuggestions(data) {
    const searchSuggestions = document.getElementById('search-suggestions');
    const [query, titles, descriptions, urls] = data;

    if (titles.length === 0) {
        searchSuggestions.innerHTML = '<div class="suggestion-item">No results found</div>';
        return;
    }

    searchSuggestions.innerHTML = titles.map((title, index) => `
        <div class="suggestion-item" data-title="${title}">
            <i class="fas fa-search"></i>
            <div>
                <div class="suggestion-title">${title}</div>
                <div class="suggestion-desc">${descriptions[index] || 'Wikipedia article'}</div>
            </div>
        </div>
    `).join('');

    // Add click listeners to suggestions
    searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            document.getElementById('search-input').value = title;
            searchSuggestions.classList.remove('active');
            this.performSearch(title);
        });
    });
}

async performSearch(query) {
    if (!query.trim()) return;

    this.showLoading();
    try {
        await this.loadWikipediaArticle(query);
        document.getElementById('search-input').value = '';
        document.getElementById('search-suggestions').classList.remove('active');
    } catch (error) {
        this.displayError(error);
    }
}

setupRightSidebar() {
    const toggleBtn = document.getElementById('toggle-right-sidebar');
    const closeBtn = document.getElementById('close-right-sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    toggleBtn.addEventListener('click', () => {
        rightSidebar.classList.add('active');
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        rightSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        rightSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Quick links functionality
    document.querySelectorAll('.quick-link:not(.external)').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const topic = link.dataset.topic;
            this.loadWikipediaArticle(topic);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                rightSidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

// Update init method untuk include search dan sidebar:
init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupSearch();
    this.setupRightSidebar();
}
