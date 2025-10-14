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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGithubConfig();
    initializeEventListeners();
    loadToolsData();
    updateLanguage();
});

// ===== GitHub Configuration =====
function loadGithubConfig() {
    const saved = localStorage.getItem('githubConfig');
    if (saved) {
        githubConfig = JSON.parse(saved);
        updateGithubStatus(true);
    } else {
        // Show GitHub settings modal on first load
        setTimeout(() => showGithubModal(), 1000);
    }
}

function saveGithubConfig() {
    localStorage.setItem('githubConfig', JSON.stringify(githubConfig));
}

function showGithubModal() {
    const modal = document.getElementById('githubModal');
    modal.classList.add('active');
    
    // Populate fields
    document.getElementById('githubOwner').value = githubConfig.owner || '';
    document.getElementById('githubRepo').value = githubConfig.repo || '';
    document.getElementById('githubToken').value = githubConfig.token || '';
}

function updateGithubStatus(connected) {
    const statusEl = document.getElementById('githubStatus');
    const statusContainer = statusEl.parentElement;
    
    if (connected) {
        statusContainer.classList.add('connected');
        statusEl.textContent = 'Connected';
        statusEl.setAttribute('data-en', 'Connected');
        statusEl.setAttribute('data-ar', 'متصل');
    } else {
        statusContainer.classList.remove('connected');
        statusEl.textContent = 'Not Connected';
        statusEl.setAttribute('data-en', 'Not Connected');
        statusEl.setAttribute('data-ar', 'غير متصل');
    }
}

// ===== GitHub API Functions =====
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
        const content = atob(response.content);
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
        content: btoa(JSON.stringify(content, null, 2)),
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
        } else {
            // Load from localStorage as fallback
            const saved = localStorage.getItem('toolsData');
            if (saved) {
                toolsData = JSON.parse(saved);
            }
        }
        
        updateStats();
        renderToolsTable();
        hideLoading();
        showToast('Tools loaded successfully', 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to load tools: ' + error.message, 'error');
        console.error(error);
    }
}

async function saveToolsData(message = 'Update tools data') {
    showLoading('Saving to GitHub...');
    
    try {
        if (githubConfig.owner && githubConfig.repo && githubConfig.token) {
            // Get current file SHA
            const result = await getFileFromGithub('data/tools.json');
            
            // Update file on GitHub
            await updateFileOnGithub('data/tools.json', toolsData, result.sha, message);
            showToast('Saved to GitHub successfully', 'success');
        } else {
            // Save to localStorage as fallback
            localStorage.setItem('toolsData', JSON.stringify(toolsData));
            showToast('Saved locally (GitHub not configured)', 'info');
        }
        
        updateStats();
        renderToolsTable();
        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to save: ' + error.message, 'error');
        console.error(error);
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
                <div class="tool-icon-cell" style="background: ${tool.iconGradient || '#667eea'}">
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
    document.getElementById('badgeSelect').value = tool.badge || '';
    document.getElementById('iconClass').value = tool.iconClass;
    document.getElementById('iconGradient').value = tool.iconGradient;
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
        badge: document.getElementById('badgeSelect').value,
        iconClass: document.getElementById('iconClass').value,
        iconGradient: document.getElementById('iconGradient').value,
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
                        <div class="tool-icon-cell" style="background: ${tool.iconGradient || '#667eea'}">
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
    document.getElementById('saveGithub').addEventListener('click', () => {
        githubConfig.owner = document.getElementById('githubOwner').value;
        githubConfig.repo = document.getElementById('githubRepo').value;
        githubConfig.token = document.getElementById('githubToken').value;
        
        if (githubConfig.owner && githubConfig.repo && githubConfig.token) {
            saveGithubConfig();
            updateGithubStatus(true);
            closeGithubModal();
            loadToolsData();
            showToast('GitHub connected successfully', 'success');
        } else {
            showToast('Please fill all fields', 'error');
        }
    });
    document.getElementById('cancelGithub').addEventListener('click', closeGithubModal);
    document.getElementById('closeGithubModal').addEventListener('click', closeGithubModal);
    
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
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}