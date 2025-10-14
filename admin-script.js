// Admin Panel JavaScript with GitHub Integration

// Global Variables
let currentLang = 'en';
let currentSection = 'online';
let toolsData = {
    online: [],
    desktop: [],
    mobile: [],
    extensions: []
};
let editingIndex = null;
let deleteIndex = null;
let githubConfig = {
    owner: '',
    repo: '',
    token: '',
    branch: 'main'
};
let hasUnsavedChanges = false; // Track unsaved changes

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGithubConfig();
    initializeEventListeners();
    loadToolsData();
    updateLanguage();
});

// ===== GitHub Configuration =====
function loadGithubConfig() {
    // Try to load from localStorage if user chose "Remember Me"
    const savedConfig = localStorage.getItem('githubConfig');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedConfig && rememberMe) {
        try {
            githubConfig = JSON.parse(savedConfig);
            updateGithubStatus(true);
            return;
        } catch (error) {
            console.error('Failed to load saved config:', error);
        }
    }
    
    // Show GitHub modal on first load if not configured
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
        setTimeout(() => showGithubModal(), 1000);
    } else {
        updateGithubStatus(true);
    }
}

function saveGithubConfig(rememberMe = false) {
    if (rememberMe) {
        // Save to localStorage if user wants to be remembered
        localStorage.setItem('githubConfig', JSON.stringify(githubConfig));
        localStorage.setItem('rememberMe', 'true');
    } else {
        // Clear from localStorage
        localStorage.removeItem('githubConfig');
        localStorage.removeItem('rememberMe');
    }
}

function showGithubModal() {
    const modal = document.getElementById('githubModal');
    modal.classList.add('active');
    
    // Populate token field
    document.getElementById('githubToken').value = githubConfig.token || '';
    
    // Set Remember Me checkbox state
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    document.getElementById('rememberMe').checked = rememberMe;
    
    // Show detected repo info if available
    if (githubConfig.owner && githubConfig.repo) {
        document.getElementById('detectedOwner').textContent = githubConfig.owner;
        document.getElementById('detectedRepo').textContent = githubConfig.repo;
        document.getElementById('repoInfo').style.display = 'block';
    } else {
        document.getElementById('repoInfo').style.display = 'none';
    }
}

function updateGithubStatus(connected) {
    const statusEl = document.getElementById('githubStatus');
    const statusContainer = statusEl.parentElement;
    const logoutBtn = document.getElementById('logoutGithub');
    const manualSyncBtn = document.getElementById('manualSyncButton');
    
    if (connected) {
        statusContainer.classList.add('connected');
        statusEl.textContent = 'Connected';
        statusEl.setAttribute('data-en', 'Connected');
        statusEl.setAttribute('data-ar', 'متصل');
        logoutBtn.style.display = 'flex';
        manualSyncBtn.style.display = 'flex';
    } else {
        statusContainer.classList.remove('connected');
        statusEl.textContent = 'Not Connected';
        statusEl.setAttribute('data-en', 'Not Connected');
        statusEl.setAttribute('data-ar', 'غير متصل');
        logoutBtn.style.display = 'none';
        manualSyncBtn.style.display = 'none';
    }
}

function logoutFromGithub() {
    if (confirm(currentLang === 'en' ? 
        'Are you sure you want to disconnect from GitHub? You will need to reconnect to access your data.' : 
        'هل أنت متأكد من قطع الاتصال مع GitHub؟ ستحتاج إلى إعادة الاتصال للوصول إلى بياناتك.')) {
        
        // Clear GitHub config from memory
        githubConfig = {
            owner: '',
            repo: '',
            token: '',
            branch: 'main'
        };
        
        // Clear from localStorage
        localStorage.removeItem('githubConfig');
        localStorage.removeItem('rememberMe');
        
        // Clear tools data
        toolsData = {
            online: [],
            desktop: [],
            mobile: [],
            extensions: []
        };
        
        // Update UI
        updateGithubStatus(false);
        updateStats();
        renderToolsTable();
        
        // Show success message
        showToast(currentLang === 'en' ? 
            'Disconnected from GitHub successfully. Connect again to access your data.' : 
            'تم قطع الاتصال مع GitHub بنجاح. اتصل مرة أخرى للوصول إلى بياناتك.', 'success');
    }
}

// ===== Helper Functions for Unicode Support =====
function utf8ToBase64(str) {
    // Convert UTF-8 string to Base64 (supports Unicode/Arabic)
    return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
    // Convert Base64 to UTF-8 string (supports Unicode/Arabic)
    return decodeURIComponent(escape(atob(str)));
}

// ===== GitHub API Functions =====
async function detectRepositoryFromToken(token) {
    // Get user info to find repo
    try {
        // First, get user's username
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Invalid token or insufficient permissions');
        }
        
        const userData = await userResponse.json();
        const username = userData.login;
        
        // Get user's repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!reposResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await reposResponse.json();
        
        // Try to find ai-tools repo or similar
        let targetRepo = repos.find(r => r.name.toLowerCase() === 'ai-tools');
        
        // If not found, try to find repo with data/tools.json
        if (!targetRepo) {
            for (const repo of repos) {
                try {
                    const contentResponse = await fetch(
                        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/data/tools.json`,
                        {
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        }
                    );
                    
                    if (contentResponse.ok) {
                        targetRepo = repo;
                        break;
                    }
                } catch (e) {
                    // Continue searching
                }
            }
        }
        
        // If still not found, use the most recently updated repo
        if (!targetRepo && repos.length > 0) {
            targetRepo = repos[0];
        }
        
        if (targetRepo) {
            return {
                owner: targetRepo.owner.login,
                repo: targetRepo.name
            };
        } else {
            throw new Error('No repositories found');
        }
        
    } catch (error) {
        console.error('Repository detection failed:', error);
        throw error;
    }
}

async function githubRequest(endpoint, method = 'GET', data = null) {
    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Authorization': `token ${githubConfig.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GitHub Request Failed:', error);
        throw error;
    }
}

async function getFileFromGithub(path) {
    try {
        const response = await githubRequest(`contents/${path}`);
        const content = base64ToUtf8(response.content);
        return {
            content: JSON.parse(content),
            sha: response.sha
        };
    } catch (error) {
        // File doesn't exist, return empty structure
        return {
            content: { online: [], desktop: [], mobile: [], extensions: [] },
            sha: null
        };
    }
}

async function updateFileOnGithub(path, content, sha, message) {
    const data = {
        message: message,
        content: utf8ToBase64(JSON.stringify(content, null, 2)),
        branch: githubConfig.branch
    };
    
    if (sha) {
        data.sha = sha;
    }
    
    return await githubRequest(`contents/${path}`, 'PUT', data);
}

// ===== Data Management =====
async function loadToolsData() {
    showLoading('Loading tools from GitHub...');
    
    try {
        if (githubConfig.owner && githubConfig.repo && githubConfig.token) {
            const result = await getFileFromGithub('data/tools.json');
            toolsData = result.content;
            hasUnsavedChanges = false; // Reset after loading from GitHub
            updateUnsavedIndicator();
            updateStats();
            renderToolsTable();
            hideLoading();
            showToast('Tools loaded successfully', 'success');
        } else {
            hideLoading();
            showToast(currentLang === 'en' ? 
                'Please connect to GitHub to load your tools.' : 
                'يرجى الاتصال بـ GitHub لتحميل أدواتك.', 'info');
        }
    } catch (error) {
        hideLoading();
        showToast('Failed to load tools: ' + error.message, 'error');
        console.error(error);
    }
}

async function saveToolsData(message = 'Update tools data') {
    // Save locally only (in memory)
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
    updateStats();
    renderToolsTable();
    
    showToast(currentLang === 'en' ? 
        'Changes saved locally. Click "Sync Now" to upload to GitHub.' : 
        'تم حفظ التغييرات محليًا. اضغط "مزامنة الآن" للرفع إلى GitHub.', 'info');
}

// Manual Sync to GitHub
async function manualSyncToGithub() {
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
        showToast(currentLang === 'en' ? 
            'Please connect to GitHub first.' : 
            'يرجى الاتصال بـ GitHub أولًا.', 'error');
        return;
    }
    
    if (!hasUnsavedChanges) {
        showToast(currentLang === 'en' ? 
            'No changes to sync.' : 
            'لا توجد تغييرات للمزامنة.', 'info');
        return;
    }
    
    const syncBtn = document.getElementById('manualSyncButton');
    syncBtn.classList.add('syncing');
    
    showLoading('Syncing to GitHub...');
    
    try {
        // Get current file SHA
        const result = await getFileFromGithub('data/tools.json');
        
        // Update file on GitHub
        await updateFileOnGithub(
            'data/tools.json', 
            toolsData, 
            result.sha, 
            'Manual sync: Update tools data'
        );
        
        // Reset unsaved changes flag
        hasUnsavedChanges = false;
        updateUnsavedIndicator();
        
        hideLoading();
        syncBtn.classList.remove('syncing');
        
        showToast(currentLang === 'en' ? 
            'Successfully synced to GitHub!' : 
            'تمت المزامنة مع GitHub بنجاح!', 'success');
        
    } catch (error) {
        hideLoading();
        syncBtn.classList.remove('syncing');
        showToast(currentLang === 'en' ? 
            'Failed to sync: ' + error.message : 
            'فشلت المزامنة: ' + error.message, 'error');
        console.error(error);
    }
}

// Update unsaved changes indicator
function updateUnsavedIndicator() {
    const syncBtn = document.getElementById('manualSyncButton');
    const unsavedBadge = document.getElementById('unsavedBadge');
    
    if (hasUnsavedChanges) {
        syncBtn.classList.add('has-changes');
        unsavedBadge.style.display = 'flex';
    } else {
        syncBtn.classList.remove('has-changes');
        unsavedBadge.style.display = 'none';
    }
}

function updateStats() {
    document.getElementById('onlineCount').textContent = toolsData.online.length;
    document.getElementById('desktopCount').textContent = toolsData.desktop.length;
    document.getElementById('mobileCount').textContent = toolsData.mobile.length;
    document.getElementById('extensionsCount').textContent = toolsData.extensions.length;
}

// ===== Table Rendering =====
function renderToolsTable() {
    const tbody = document.getElementById('toolsTableBody');
    const tools = toolsData[currentSection];
    
    if (tools.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <i class="fas fa-inbox"></i>
                    <span>No tools found in this section</span>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = tools.map((tool, index) => `
        <tr>
            <td>
                <div class="tool-icon-cell" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                    <i class="${tool.iconClass || 'fas fa-tools'}"></i>
                </div>
            </td>
            <td class="tool-name-cell">${tool.name}</td>
            <td class="tool-desc-cell">${tool.descriptionEn}</td>
            <td>
                ${tool.category ? `<span class="category-badge">${tool.category}</span>` : '-'}
            </td>
            <td>
                <span class="pricing-badge">${getPricingLabel(tool.pricing)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editTool(${index})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="confirmDelete(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getPricingLabel(pricing) {
    const labels = {
        free: 'Free',
        freemium: 'Free + Paid',
        paid: 'Paid'
    };
    return labels[pricing] || pricing;
}

// ===== Form Handling =====
function openAddModal() {
    editingIndex = null;
    document.getElementById('modalTitle').textContent = 'Add New Tool';
    document.getElementById('toolForm').reset();
    document.getElementById('editIndex').value = '';
    document.getElementById('sectionSelect').value = currentSection;
    updatePlatformsVisibility();
    updateCategoryVisibility();
    document.getElementById('toolModal').classList.add('active');
}

function editTool(index) {
    editingIndex = index;
    const tool = toolsData[currentSection][index];
    
    document.getElementById('modalTitle').textContent = 'Edit Tool';
    document.getElementById('editIndex').value = index;
    
    // Populate form
    document.getElementById('toolName').value = tool.name;
    document.getElementById('descriptionEn').value = tool.descriptionEn;
    document.getElementById('descriptionAr').value = tool.descriptionAr;
    document.getElementById('toolUrl').value = tool.url;
    document.getElementById('sectionSelect').value = currentSection;
    document.getElementById('categorySelect').value = tool.category || '';
    document.getElementById('pricingSelect').value = tool.pricing;
    document.getElementById('iconClass').value = tool.iconClass;
    document.getElementById('featuresEn').value = tool.featuresEn ? tool.featuresEn.join(', ') : '';
    document.getElementById('featuresAr').value = tool.featuresAr ? tool.featuresAr.join(', ') : '';
    
    // Platforms
    if (tool.platforms) {
        document.querySelectorAll('input[name="platforms"]').forEach(checkbox => {
            checkbox.checked = tool.platforms.includes(checkbox.value);
        });
    }
    
    updatePlatformsVisibility();
    updateCategoryVisibility();
    document.getElementById('toolModal').classList.add('active');
}

function saveTool(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('toolName').value,
        descriptionEn: document.getElementById('descriptionEn').value,
        descriptionAr: document.getElementById('descriptionAr').value,
        url: document.getElementById('toolUrl').value,
        section: document.getElementById('sectionSelect').value,
        category: document.getElementById('categorySelect').value,
        pricing: document.getElementById('pricingSelect').value,
        iconClass: document.getElementById('iconClass').value,
        featuresEn: document.getElementById('featuresEn').value.split(',').map(f => f.trim()).filter(f => f),
        featuresAr: document.getElementById('featuresAr').value.split(',').map(f => f.trim()).filter(f => f),
        platforms: Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.value)
    };
    
    const targetSection = formData.section;
    delete formData.section;
    
    if (editingIndex !== null) {
        // Update existing tool
        toolsData[currentSection][editingIndex] = formData;
        
        // If section changed, move the tool
        if (targetSection !== currentSection) {
            toolsData[targetSection].push(formData);
            toolsData[currentSection].splice(editingIndex, 1);
            currentSection = targetSection;
            switchSection(targetSection);
        }
        
        saveToolsData(`Update tool: ${formData.name}`);
    } else {
        // Add new tool
        toolsData[targetSection].push(formData);
        currentSection = targetSection;
        switchSection(targetSection);
        saveToolsData(`Add new tool: ${formData.name}`);
    }
    
    closeModal();
}

// ===== Delete Handling =====
function confirmDelete(index) {
    deleteIndex = index;
    const tool = toolsData[currentSection][index];
    document.getElementById('deleteToolName').textContent = tool.name;
    document.getElementById('deleteModal').classList.add('active');
}

function deleteTool() {
    if (deleteIndex !== null) {
        const tool = toolsData[currentSection][deleteIndex];
        toolsData[currentSection].splice(deleteIndex, 1);
        saveToolsData(`Delete tool: ${tool.name}`);
        deleteIndex = null;
        closeDeleteModal();
    }
}

// ===== Import/Export =====
function exportData() {
    const dataStr = JSON.stringify(toolsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

function importData() {
    const input = document.getElementById('importFile');
    const file = input.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Validate structure
            if (!imported.online || !imported.desktop || !imported.mobile || !imported.extensions) {
                throw new Error('Invalid data structure');
            }
            
            if (confirm('This will replace all current data. Continue?')) {
                toolsData = imported;
                await saveToolsData('Import data from file');
                showToast('Data imported successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to import: ' + error.message, 'error');
        }
        
        input.value = '';
    };
    
    reader.readAsText(file);
}

// ===== UI Helpers =====
function switchSection(section) {
    currentSection = section;
    
    // Update menu
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    renderToolsTable();
}

function updatePlatformsVisibility() {
    const section = document.getElementById('sectionSelect').value;
    const platformsSection = document.getElementById('platformsSection');
    
    if (section === 'desktop' || section === 'mobile') {
        platformsSection.style.display = 'block';
    } else {
        platformsSection.style.display = 'none';
    }
}

function updateCategoryVisibility() {
    const section = document.getElementById('sectionSelect').value;
    const categoryGroup = document.getElementById('categoryGroup');
    
    if (section === 'online') {
        categoryGroup.style.display = 'block';
    } else {
        categoryGroup.style.display = 'none';
    }
}

function closeModal() {
    document.getElementById('toolModal').classList.remove('active');
    editingIndex = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteIndex = null;
}

function closeGithubModal() {
    document.getElementById('githubModal').classList.remove('active');
}

function showLoading(message = 'Processing...') {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = 'toast show ' + type;
    
    // Update icon
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Search =====
function searchTools() {
    const query = document.getElementById('adminSearch').value.toLowerCase();
    const tools = toolsData[currentSection];
    const tbody = document.getElementById('toolsTableBody');
    
    const filtered = tools.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.descriptionEn.toLowerCase().includes(query) ||
        tool.descriptionAr.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <i class="fas fa-search"></i>
                    <span>No tools found matching "${query}"</span>
                </td>
            </tr>
        `;
    } else {
        const allTools = toolsData[currentSection];
        tbody.innerHTML = filtered.map((tool) => {
            const index = allTools.indexOf(tool);
            return `
                <tr>
                    <td>
                        <div class="tool-icon-cell" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                            <i class="${tool.iconClass || 'fas fa-tools'}"></i>
                        </div>
                    </td>
                    <td class="tool-name-cell">${tool.name}</td>
                    <td class="tool-desc-cell">${tool.descriptionEn}</td>
                    <td>
                        ${tool.category ? `<span class="category-badge">${tool.category}</span>` : '-'}
                    </td>
                    <td>
                        <span class="pricing-badge">${getPricingLabel(tool.pricing)}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="editTool(${index})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="confirmDelete(${index})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// ===== Language Toggle =====
function updateLanguage() {
    const html = document.documentElement;
    
    if (currentLang === 'ar') {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
    } else {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
    }
    
    document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
        const key = currentLang === 'en' ? 'data-en' : 'data-ar';
        if (element.hasAttribute(key)) {
            element.textContent = element.getAttribute(key);
        }
    });
    
    document.querySelectorAll('[data-placeholder-en], [data-placeholder-ar]').forEach(element => {
        const key = currentLang === 'en' ? 'data-placeholder-en' : 'data-placeholder-ar';
        if (element.hasAttribute(key)) {
            element.placeholder = element.getAttribute(key);
        }
    });
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Menu items
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.dataset.section);
        });
    });
    
    // Add new tool
    document.getElementById('addNewTool').addEventListener('click', openAddModal);
    
    // Form submission
    document.getElementById('toolForm').addEventListener('submit', saveTool);
    
    // Cancel buttons
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Delete modal
    document.getElementById('confirmDelete').addEventListener('click', deleteTool);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    
    // GitHub modal
    document.getElementById('syncButton').addEventListener('click', showGithubModal);
    
    // Auto-detect repository when token is entered
    let detectionTimeout;
    document.getElementById('githubToken').addEventListener('input', async (e) => {
        const token = e.target.value.trim();
        const tokenInput = e.target;
        
        // Clear previous timeout
        if (detectionTimeout) {
            clearTimeout(detectionTimeout);
        }
        
        // Only try to detect if token looks valid (starts with ghp_ or github_pat_)
        if (token.length > 20 && (token.startsWith('ghp_') || token.startsWith('github_pat_'))) {
            // Add detecting class for animation
            tokenInput.classList.add('detecting');
            
            // Debounce detection by 800ms
            detectionTimeout = setTimeout(async () => {
                try {
                    showLoading('Detecting repository...');
                    const repoInfo = await detectRepositoryFromToken(token);
                    
                    // Update UI to show detected repo
                    document.getElementById('detectedOwner').textContent = repoInfo.owner;
                    document.getElementById('detectedRepo').textContent = repoInfo.repo;
                    document.getElementById('repoInfo').style.display = 'block';
                    
                    // Store temporarily (will be saved on Connect button)
                    githubConfig.owner = repoInfo.owner;
                    githubConfig.repo = repoInfo.repo;
                    githubConfig.token = token;
                    
                    tokenInput.classList.remove('detecting');
                    hideLoading();
                    showToast('Repository detected successfully!', 'success');
                } catch (error) {
                    tokenInput.classList.remove('detecting');
                    hideLoading();
                    document.getElementById('repoInfo').style.display = 'none';
                    console.error('Auto-detection failed:', error);
                    // Only show error if it's not just a network issue
                    if (!error.message.includes('fetch')) {
                        showToast('Unable to auto-detect repository', 'error');
                    }
                }
            }, 800);
        } else {
            // Hide repo info if token is cleared or invalid
            tokenInput.classList.remove('detecting');
            document.getElementById('repoInfo').style.display = 'none';
        }
    });
    
    document.getElementById('saveGithub').addEventListener('click', async () => {
        const token = document.getElementById('githubToken').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!token) {
            showToast('Please enter GitHub token', 'error');
            return;
        }
        
        try {
            // If repo not detected yet, try to detect it
            if (!githubConfig.owner || !githubConfig.repo) {
                showLoading('Detecting repository...');
                const repoInfo = await detectRepositoryFromToken(token);
                githubConfig.owner = repoInfo.owner;
                githubConfig.repo = repoInfo.repo;
                githubConfig.token = token;
            }
            
            if (githubConfig.owner && githubConfig.repo && githubConfig.token) {
                // Save config with Remember Me option
                saveGithubConfig(rememberMe);
                updateGithubStatus(true);
                closeGithubModal();
                hideLoading();
                loadToolsData();
                
                const message = rememberMe ? 
                    (currentLang === 'en' ? 
                        'GitHub connected successfully! You will stay signed in.' : 
                        'تم الاتصال بـ GitHub بنجاح! ستبقى متصلاً.') :
                    (currentLang === 'en' ? 
                        'GitHub connected successfully! You will need to sign in again after closing the browser.' : 
                        'تم الاتصال بـ GitHub بنجاح! ستحتاج للتسجيل مجددًا بعد إغلاق المتصفح.');
                
                showToast(message, 'success');
            } else {
                hideLoading();
                showToast('Failed to detect repository', 'error');
            }
        } catch (error) {
            hideLoading();
            showToast('Connection failed: ' + error.message, 'error');
        }
    });
    
    document.getElementById('cancelGithub').addEventListener('click', closeGithubModal);
    document.getElementById('closeGithubModal').addEventListener('click', closeGithubModal);
    
    // Logout from GitHub
    document.getElementById('logoutGithub').addEventListener('click', logoutFromGithub);
    
    // Manual Sync Button
    document.getElementById('manualSyncButton').addEventListener('click', manualSyncToGithub);
    
    // Import/Export
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Search
    document.getElementById('adminSearch').addEventListener('input', searchTools);
    
    // Section select change
    document.getElementById('sectionSelect').addEventListener('change', () => {
        updatePlatformsVisibility();
        updateCategoryVisibility();
    });
    
    // Language toggle
    document.getElementById('adminLangToggle').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        document.getElementById('adminLangText').textContent = currentLang === 'en' ? 'العربية' : 'English';
        updateLanguage();
    });
    
    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
    
    // Note: Modals can only be closed via close button (removed outside click handler)
}
