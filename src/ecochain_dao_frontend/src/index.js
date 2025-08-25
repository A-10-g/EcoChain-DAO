// =================== ENHANCED ECOCHAIN DAO - MULTI-TAB TESTING VERSION ===================
// This version allows different users in different tabs while maintaining enhanced transfer functionality

// Simple authentication system
let currentUser = null;
let allUsers = [];
let metadataFieldCount = 0;
let tabId = generateTabId(); // Unique ID for this tab

// Generate unique tab ID
function generateTabId() {
    return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// =================== STORAGE EVENT LISTENER FOR CROSS-TAB DATA SYNC ===================
// This handles real-time updates for DATA and BALANCE changes (but NOT login sessions)
window.addEventListener('storage', function(event) {
    // Only sync data changes, not login sessions
    if (event.key === 'ecochain_users') {
        console.log('Users data updated in another tab, syncing balances...');
        handleUsersUpdate(event.newValue);
    } else if (event.key === 'submitted_environmental_data') {
        console.log('Environmental data updated in another tab, syncing...');
        handleDataUpdate();
    } else if (event.key === 'dao_proposals') {
        console.log('Proposals updated in another tab, syncing...');
        handleProposalsUpdate();
    }
    // NOTE: Removed session sync to allow different users per tab
});

// Handle users data update from other tabs (BALANCE UPDATES ONLY)
function handleUsersUpdate(newUsersData) {
    if (!newUsersData || !currentUser) return;
    
    try {
        const updatedUsers = JSON.parse(newUsersData);
        allUsers = updatedUsers;
        
        // Only update if current user's balance changed (for token transfers)
        const updatedCurrentUser = updatedUsers.find(u => u.principal === currentUser.principal);
        if (updatedCurrentUser && updatedCurrentUser.balance !== currentUser.balance) {
            const oldBalance = currentUser.balance;
            console.log(`Balance updated from ${oldBalance} to ${updatedCurrentUser.balance}`);
            currentUser = updatedCurrentUser;
            updateUI();
            
            // Show notification for received tokens
            const difference = updatedCurrentUser.balance - oldBalance;
            if (difference > 0) {
                showNotification(`💰 You received ${difference} ECO tokens!`, 'success');
            }
        }
        
        // Refresh user lists if visible
        const usersList = document.getElementById('usersList');
        if (usersList && usersList.style.display !== 'none') {
            showAllUsers();
        }
    } catch (error) {
        console.error('Error handling users update:', error);
    }
}

// Handle data submission updates
function handleDataUpdate() {
    const validateTab = document.getElementById('validate-data');
    if (validateTab && validateTab.classList.contains('active')) {
        loadUnvalidatedData();
        showNotification('📊 New data available for validation', 'info', 3000);
    }
}

// Handle proposals updates  
function handleProposalsUpdate() {
    const voteTab = document.getElementById('vote');
    if (voteTab && voteTab.classList.contains('active')) {
        loadProposals();
        showNotification('🗳️ New proposals available', 'info', 3000);
    }
}

// =================== ENHANCED NOTIFICATION SYSTEM ===================
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }[type] || 'ℹ️';
    
    notification.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// =================== AUTHENTICATION FUNCTIONS (INDEPENDENT PER TAB) ===================

function generatePrincipalId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz234567';
    let result = '';
    for (let i = 0; i < 27; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 4 || i === 9 || i === 14 || i === 19) {
            result += '-';
        }
    }
    return result;
}

window.showAuthTab = function(tabName) {
    document.querySelectorAll('.auth-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    }
};

window.loginUser = function() {
    const principalId = document.getElementById('loginPrincipal').value.trim();
    
    if (!principalId) {
        showNotification('Please enter a Principal ID', 'warning');
        return;
    }
    
    // Check if user exists in our mock database
    const existingUser = JSON.parse(localStorage.getItem('ecochain_users') || '[]')
        .find(user => user.principal === principalId);
    
    if (existingUser) {
        currentUser = existingUser;
        showMainApp();
        updateUI();
        showNotification(`Welcome back, ${existingUser.name}! (Tab: ${tabId.substr(-4)})`, 'success');
    } else {
        showNotification('User not found. Please register first or check your Principal ID.', 'error');
    }
};

window.registerNewUser = function() {
    const name = document.getElementById('registerName').value.trim();
    
    if (!name) {
        showNotification('Please enter your name', 'warning');
        return;
    }
    
    // Generate unique Principal ID
    const principalId = generatePrincipalId();
    
    // Create new user
    const newUser = {
        principal: principalId,
        name: name,
        balance: 1000,
        registeredAt: new Date().toISOString(),
        proposalsCreated: 0,
        votesCast: 0,
        dataSubmissions: 0
    };
    
    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    users.push(newUser);
    localStorage.setItem('ecochain_users', JSON.stringify(users));
    
    currentUser = newUser;
    showMainApp();
    updateUI();
    
    showNotification(`Account created successfully! You received 1,000 ECO tokens!`, 'success', 6000);
    
    // Show Principal ID in a separate notification
    setTimeout(() => {
        showNotification(`Your Principal ID: ${principalId} (Save this for future logins!)`, 'info', 10000);
    }, 2000);
};

window.logout = function() {
    currentUser = null;
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Reset forms
    document.getElementById('loginPrincipal').value = '';
    document.getElementById('registerName').value = '';
    
    showNotification('Logged out successfully', 'info');
};

function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadAllUsers();
}

// =================== ENHANCED BALANCE AND USER MANAGEMENT ===================

function getCurrentBalance() {
    return currentUser ? currentUser.balance : 0;
}

function formatBalance(balance) {
    return balance.toLocaleString() + ' ECO';
}

function updateBalance(newBalance) {
    if (currentUser) {
        const oldBalance = currentUser.balance;
        currentUser.balance = newBalance;
        saveCurrentUser();
        
        document.getElementById('userBalance').textContent = formatBalance(newBalance);
        
        // Update transfer info if it exists
        const transferBalance = document.getElementById('currentBalanceTransfer');
        if (transferBalance) {
            transferBalance.textContent = formatBalance(newBalance);
        }
        
        // Update profile balance with animation
        const profileBalance = document.getElementById('profileBalance');
        if (profileBalance) {
            animateNumber(profileBalance, newBalance);
            
            // Update progress bar
            const progressBar = document.getElementById('balanceProgress');
            if (progressBar) {
                const maxBalance = 10000;
                const percentage = Math.min((newBalance / maxBalance) * 100, 100);
                progressBar.style.width = percentage + '%';
            }
        }
        
        // Show balance change notification if significant
        const difference = newBalance - oldBalance;
        if (Math.abs(difference) >= 10) {
            const message = difference > 0 ? 
                `💰 +${difference} ECO tokens earned!` : 
                `💸 ${Math.abs(difference)} ECO tokens spent`;
            showNotification(message, difference > 0 ? 'success' : 'info');
        }
    }
}

function saveCurrentUser() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    const userIndex = users.findIndex(u => u.principal === currentUser.principal);
    if (userIndex >= 0) {
        users[userIndex] = currentUser;
        localStorage.setItem('ecochain_users', JSON.stringify(users));
        // This will trigger storage event in other tabs
    }
}

function updateUI() {
    if (!currentUser) return;
    
    document.getElementById('userBalance').textContent = formatBalance(currentUser.balance);
    document.getElementById('userPrincipal').textContent = currentUser.principal.substring(0, 10) + '...';
    
    updateProfileUI();
    
    const transferBalance = document.getElementById('currentBalanceTransfer');
    if (transferBalance) {
        transferBalance.textContent = formatBalance(currentUser.balance);
    }
    const yourPrincipalId = document.getElementById('yourPrincipalId');
    if (yourPrincipalId) {
        yourPrincipalId.textContent = currentUser.principal;
    }
    
    document.getElementById('userProposals').textContent = currentUser.proposalsCreated || 0;
    document.getElementById('userVotes').textContent = currentUser.votesCast || 0;
    document.getElementById('userDataSubmissions').textContent = currentUser.dataSubmissions || 0;
    
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    document.getElementById('totalUsers').textContent = users.length;

    const proposals = JSON.parse(localStorage.getItem('dao_proposals') || '[]');
    document.getElementById('totalProposals').textContent = proposals.length;
}

// =================== ENHANCED TOKEN TRANSFER WITH CROSS-TAB SYNC ===================

window.transferTokens = function() {
    const recipientId = document.getElementById('recipientId').value.trim();
    const amount = parseInt(document.getElementById('transferAmount').value);
    
    if (!recipientId) {
        showNotification('Please enter the recipient\'s Principal ID!', 'warning');
        return;
    }
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount!', 'warning');
        return;
    }
    
    const currentBalance = getCurrentBalance();
    if (amount > currentBalance) {
        showNotification(`Insufficient balance! You have ${formatBalance(currentBalance)}`, 'error');
        return;
    }
    
    // Check if trying to send to self
    if (recipientId === currentUser.principal) {
        showNotification('You cannot transfer tokens to yourself!', 'warning');
        return;
    }
    
    // Find recipient by Principal ID
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    const recipientIndex = users.findIndex(u => u.principal === recipientId);
    
    if (recipientIndex === -1) {
        showNotification('Recipient not found! Please check the Principal ID.', 'error');
        return;
    }
    
    const recipient = users[recipientIndex];
    
    // Confirm transfer
    const confirmMessage = `Transfer Confirmation:\n\nTo: ${recipient.name}\nAmount: ${amount} ECO\n\nYour new balance: ${formatBalance(currentBalance - amount)}\n\nProceed?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // *** ENHANCED TRANSFER: Update both sender and recipient ***
    currentUser.balance -= amount;
    recipient.balance += amount;
    
    // Update sender data
    const currentUserIndex = users.findIndex(u => u.principal === currentUser.principal);
    if (currentUserIndex >= 0) {
        users[currentUserIndex] = currentUser;
    }
    
    // Update recipient data  
    users[recipientIndex] = recipient;
    
    // Save all changes to localStorage - this triggers storage event for cross-tab balance sync
    localStorage.setItem('ecochain_users', JSON.stringify(users));
    
    // Update UI immediately for sender
    updateUI();
    loadAllUsers();
    
    showNotification(
        `✅ Transfer successful! Sent ${amount} ECO to ${recipient.name}. New balance: ${formatBalance(currentUser.balance)}`, 
        'success', 
        6000
    );
    
    // Reset form
    document.getElementById('recipientId').value = '';
    document.getElementById('transferAmount').value = '';
    
    // Hide user list if visible
    const usersList = document.getElementById('usersList');
    if (usersList) {
        usersList.style.display = 'none';
    }
};

// =================== USER INTERFACE FUNCTIONS ===================

// Simplified profile UI update
function updateProfileUI() {
    if (!currentUser) return;
    
    // Profile header
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const profileInitials = document.getElementById('profileInitials');
    if (profileInitials) {
        profileInitials.textContent = initials;
    }
    
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = currentUser.name;
    }
    
    // Profile balance with animation
    const profileBalance = document.getElementById('profileBalance');
    if (profileBalance) {
        animateNumber(profileBalance, currentUser.balance);
        
        // Update progress bar based on balance
        const progressBar = document.getElementById('balanceProgress');
        if (progressBar) {
            const maxBalance = 10000; // Max for progress bar
            const percentage = Math.min((currentUser.balance / maxBalance) * 100, 100);
            progressBar.style.width = percentage + '%';
        }
    }
    
    // Profile stats
    const profileDataSubmissions = document.getElementById('profileDataSubmissions');
    if (profileDataSubmissions) {
        animateNumber(profileDataSubmissions, currentUser.dataSubmissions || 0);
    }
    
    const profileVotes = document.getElementById('profileVotes');
    if (profileVotes) {
        animateNumber(profileVotes, currentUser.votesCast || 0);
    }
    
    const profileProposals = document.getElementById('profileProposals');
    if (profileProposals) {
        animateNumber(profileProposals, currentUser.proposalsCreated || 0);
    }
    
    // Principal ID
    const profilePrincipalId = document.getElementById('profilePrincipalId');
    if (profilePrincipalId) {
        profilePrincipalId.textContent = currentUser.principal;
    }
}

// Animate numbers
function animateNumber(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutCubic);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function loadAllUsers() {
    allUsers = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
}

// =================== DATA SUBMISSION FUNCTIONS ===================

// Update data fields based on selected type
window.updateDataFields = function() {
    const dataType = document.getElementById('dataType').value;
    const unitField = document.getElementById('dataUnit');
    
    // Set default units based on data type
    const defaultUnits = {
        'air_quality': 'AQI',
        'water_quality': 'pH',
        'soil_analysis': '%',
        'weather': '°C',
        'noise_pollution': 'dB',
        'biodiversity': 'count'
    };
    
    if (defaultUnits[dataType]) {
        unitField.placeholder = `e.g., ${defaultUnits[dataType]}`;
    }
};

// Add metadata field
window.addMetadataField = function() {
    metadataFieldCount++;
    const container = document.getElementById('metadataFields');
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'metadata-field';
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Field name (e.g., Temperature)" name="metadataKey_${metadataFieldCount}">
        <input type="text" placeholder="Field value (e.g., 25°C)" name="metadataValue_${metadataFieldCount}">
        <button type="button" class="btn-remove" onclick="removeMetadataField(this)">Remove</button>
    `;
    
    container.appendChild(fieldDiv);
};

// Remove metadata field
window.removeMetadataField = function(button) {
    button.parentElement.remove();
};

// Submit structured data
window.submitStructuredData = function(event) {
    event.preventDefault();
    
    const formData = {
        type: document.getElementById('dataType').value,
        value: parseFloat(document.getElementById('dataValue').value),
        unit: document.getElementById('dataUnit').value,
        location: document.getElementById('location').value,
        latitude: document.getElementById('latitude').value || null,
        longitude: document.getElementById('longitude').value || null,
        deviceId: document.getElementById('deviceId').value || null,
        measurementTime: document.getElementById('measurementTime').value,
        submittedBy: currentUser.name,
        submittedAt: new Date().toISOString(),
        submitterId: currentUser.principal,
        validated: false,
        id: Date.now(), // Simple ID generation
        metadata: {}
    };
    
    // Collect metadata
    const metadataFields = document.querySelectorAll('#metadataFields .metadata-field');
    metadataFields.forEach(field => {
        const keyInput = field.querySelector('input[name^="metadataKey_"]');
        const valueInput = field.querySelector('input[name^="metadataValue_"]');
        if (keyInput.value && valueInput.value) {
            formData.metadata[keyInput.value] = valueInput.value;
        }
    });
    
    // Save to localStorage - this will trigger cross-tab sync
    const submittedData = JSON.parse(localStorage.getItem('submitted_environmental_data') || '[]');
    submittedData.push(formData);
    localStorage.setItem('submitted_environmental_data', JSON.stringify(submittedData));
    
    // Add 50 to current balance
    const newBalance = getCurrentBalance() + 50;
    updateBalance(newBalance);
    
    // Update stats
    if (currentUser) {
        currentUser.dataSubmissions = (currentUser.dataSubmissions || 0) + 1;
        saveCurrentUser();
        updateUI();
    }
    
    showNotification(`✅ Data Submitted Successfully! Earned 50 ECO tokens. Data is now available for community validation.`, 'success', 6000);
    
    // Reset form
    resetDataForm();
};

// Reset data form
window.resetDataForm = function() {
    document.querySelector('#submit-data form').reset();
    document.getElementById('metadataFields').innerHTML = '';
    metadataFieldCount = 0;
    
    // Set current time as default
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('measurementTime').value = now.toISOString().slice(0, 16);
};

// =================== VALIDATION FUNCTIONS WITH CROSS-TAB SYNC ===================

// Load unvalidated data with enhanced display and cross-tab sync
window.loadUnvalidatedData = function() {
    const dataList = document.getElementById('unvalidatedDataList');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (!dataList) return;
    
    const submittedData = JSON.parse(localStorage.getItem('submitted_environmental_data') || '[]');
    const unvalidatedData = submittedData.filter(data => !data.validated);
    
    if (unvalidatedData.length === 0) {
        dataList.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    dataList.innerHTML = unvalidatedData.map(data => `
        <div class="enhanced-data-card" data-type="${data.type}" data-location="${data.location.toLowerCase()}">
            <div class="data-card-header">
                <div class="data-type-badge">${data.type.replace('_', ' ').toUpperCase()}</div>
                <div class="submission-time">${new Date(data.submittedAt).toLocaleDateString()}</div>
            </div>
            
            <div class="data-main-info">
                <div class="data-value-large">${data.value}</div>
                <div class="data-unit">${data.unit}</div>
                <div class="location-info">
                    <strong>📍 ${data.location}</strong>
                    ${data.latitude && data.longitude ? `<br><small>${data.latitude}, ${data.longitude}</small>` : ''}
                </div>
            </div>
            
            <div class="data-details">
                <div class="data-detail">
                    <span class="data-detail-label">Submitted By</span>
                    <span class="data-detail-value">${data.submittedBy}</span>
                </div>
                <div class="data-detail">
                    <span class="data-detail-label">Measurement Time</span>
                    <span class="data-detail-value">${new Date(data.measurementTime).toLocaleString()}</span>
                </div>
                ${data.deviceId ? `
                <div class="data-detail">
                    <span class="data-detail-label">Device ID</span>
                    <span class="data-detail-value">${data.deviceId}</span>
                </div>
                ` : ''}
            </div>
            
            ${Object.keys(data.metadata).length > 0 ? `
            <div class="metadata-display">
                <h5>Additional Information</h5>
                ${Object.entries(data.metadata).map(([key, value]) => `
                    <div class="metadata-item">
                        <span class="key">${key}:</span>
                        <span class="value">${value}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="vote-section">
                <div class="vote-buttons">
                    <button class="btn btn-success" onclick="validateStructuredData(${data.id})">
                        ✅ Validate Data (+25 ECO)
                    </button>
                    <button class="btn btn-danger" onclick="rejectData(${data.id})">
                        ❌ Reject Data
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

// Validate structured data with cross-tab sync
window.validateStructuredData = function(dataId) {
    const submittedData = JSON.parse(localStorage.getItem('submitted_environmental_data') || '[]');
    const dataIndex = submittedData.findIndex(data => data.id === dataId);
    
    if (dataIndex === -1) return;
    
    const data = submittedData[dataIndex];
    
    // Check if user is trying to validate their own data
    if (data.submitterId === currentUser.principal) {
        showNotification('❌ You cannot validate your own data submission!', 'error');
        return;
    }
    
    // Mark as validated
    submittedData[dataIndex].validated = true;
    submittedData[dataIndex].validatedBy = currentUser.principal;
    submittedData[dataIndex].validatedAt = new Date().toISOString();
    
    // This will trigger cross-tab sync for validation data
    localStorage.setItem('submitted_environmental_data', JSON.stringify(submittedData));
    
    // Add 25 to current balance
    const newBalance = getCurrentBalance() + 25;
    updateBalance(newBalance);
    
    showNotification(`✅ Data Validated Successfully! You earned 25 ECO tokens!`, 'success');
    
    // Reload the validation list
    loadUnvalidatedData();
};

// =================== USER MANAGEMENT FUNCTIONS ===================

window.showAllUsers = function() {
    const usersList = document.getElementById('usersList');
    const usersListContent = document.getElementById('usersListContent');
    
    if (!usersList || !usersListContent) return;
    
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    
    if (users.length <= 1) {
        usersListContent.innerHTML = '<p>No other users registered yet. Share the app with friends to start transferring tokens!</p>';
    } else {
        usersListContent.innerHTML = users
            .filter(user => user.principal !== currentUser.principal)
            .map(user => `
                <div class="user-item" onclick="selectUser('${user.principal}')">
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-principal">${user.principal}</div>
                    </div>
                    <div class="user-balance">${formatBalance(user.balance)}</div>
                    <button class="btn btn-secondary copy-id-btn" onclick="event.stopPropagation(); copyToClipboard('${user.principal}')">Copy ID</button>
                </div>
            `).join('');
    }
    
    // Toggle visibility
    if (usersList.style.display === 'none' || !usersList.style.display) {
        usersList.style.display = 'block';
    } else {
        usersList.style.display = 'none';
    }
};

window.selectUser = function(principalId) {
    document.getElementById('recipientId').value = principalId;
    document.getElementById('usersList').style.display = 'none';
    
    // Find user to show confirmation
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    const user = users.find(u => u.principal === principalId);
    
    if (user) {
        showNotification(`Selected User: ${user.name}. Now enter the amount to transfer.`, 'info', 3000);
    }
};

// =================== UTILITY FUNCTIONS ===================

// Enhanced copy function with visual feedback
window.copyPrincipalId = function() {
    const principalId = currentUser.principal;
    copyToClipboard(principalId);
    
    // Visual feedback
    const copyBtn = document.querySelector('.btn-copy');
    if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }
};

// Enhanced copy function
window.copyToClipboard = function(text) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✅ Copied to clipboard!', 'success', 2000);
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
};

function fallbackCopyToClipboard(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.left = '-9999px';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('✅ Copied to clipboard!', 'success', 2000);
    } catch (err) {
        showNotification('Failed to copy. Please manually copy this ID:\n\n' + text, 'error');
    }
    
    document.body.removeChild(tempTextArea);
}

// =================== TAB SWITCHING ===================

// Tab switching functionality
window.showTab = function(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load content for specific tabs
    if (tabName === 'validate-data') {
        loadUnvalidatedData();
    } else if (tabName === 'vote') {
        loadProposals();
    } else if (tabName === 'submit-data') {
        // Set current time when opening submit data tab
        const measurementTimeField = document.getElementById('measurementTime');
        if (measurementTimeField && !measurementTimeField.value) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            measurementTimeField.value = now.toISOString().slice(0, 16);
        }
    }
};

// =================== SAMPLE PROPOSAL FUNCTIONS ===================

// Load sample proposals
window.loadProposals = function() {
    const proposalsList = document.getElementById('proposalsList');
    if (proposalsList) {
        proposalsList.innerHTML = `
            <div class="proposal-card">
                <h4>Proposal #1</h4>
                <p>Implement carbon credit rewards for verified environmental data submissions</p>
                <div class="vote-section">
                    <div class="vote-buttons">
                        <span class="vote-count yes">Yes: 15</span>
                        <span class="vote-count no">No: 3</span>
                        <button class="btn btn-success" onclick="vote(1, 'Yes')">Vote Yes (+10 ECO)</button>
                        <button class="btn btn-danger" onclick="vote(1, 'No')">Vote No (+10 ECO)</button>
                    </div>
                </div>
            </div>
            <div class="proposal-card">
                <h4>Proposal #2</h4>
                <p>Increase validation rewards from 25 to 35 ECO tokens</p>
                <div class="vote-section">
                    <div class="vote-buttons">
                        <span class="vote-count yes">Yes: 8</span>
                        <span class="vote-count no">No: 12</span>
                        <button class="btn btn-success" onclick="vote(2, 'Yes')">Vote Yes (+10 ECO)</button>
                        <button class="btn btn-danger" onclick="vote(2, 'No')">Vote No (+10 ECO)</button>
                    </div>
                </div>
            </div>
            <div class="proposal-card">
                <h4>Proposal #3</h4>
                <p>Add reputation system for frequent data contributors</p>
                <div class="vote-section">
                    <div class="vote-buttons">
                        <span class="vote-count yes">Yes: 22</span>
                        <span class="vote-count no">No: 5</span>
                        <button class="btn btn-success" onclick="vote(3, 'Yes')">Vote Yes (+10 ECO)</button>
                        <button class="btn btn-danger" onclick="vote(3, 'No')">Vote No (+10 ECO)</button>
                    </div>
                </div>
            </div>
        `;
    }
};

window.vote = function(proposalId, choice) {
    // Add 10 to current balance
    const newBalance = getCurrentBalance() + 10;
    updateBalance(newBalance);
    
    if (currentUser) {
        currentUser.votesCast = (currentUser.votesCast || 0) + 1;
        saveCurrentUser();
        updateUI();
    }
    
    showNotification(`✅ Voted "${choice}" on Proposal #${proposalId}! Earned 10 ECO tokens.`, 'success');
    
    // Update vote display and disable buttons for this proposal
    const proposalCards = document.querySelectorAll('.proposal-card');
    proposalCards.forEach(card => {
        if (card.innerHTML.includes(`Proposal #${proposalId}`)) {
            const buttons = card.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = btn.textContent.replace('(+10 ECO)', '(Voted)');
            });
            card.innerHTML += `<p style="color: blue; font-weight: bold;">✓ You voted: ${choice}</p>`;
        }
    });
};

// =================== INITIALIZATION WITHOUT AUTO-LOGIN ===================

// Initialize when page loads WITHOUT persistent session restore
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced EcoChain DAO (Multi-Tab Testing Version) initialized successfully!');
    console.log('Tab ID:', tabId);
    
    // Always show authentication modal (no auto-login)
    const authModal = document.getElementById('authModal');
    const mainApp = document.getElementById('mainApp');
    
    if (authModal && mainApp) {
        authModal.style.display = 'flex';
        mainApp.style.display = 'none';
        showAuthTab('login');
    }
    
    // Set current time as default for measurement time
    const measurementTimeField = document.getElementById('measurementTime');
    if (measurementTimeField) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        measurementTimeField.value = now.toISOString().slice(0, 16);
    }
    
    showNotification(`🌱 EcoChain DAO loaded! Tab: ${tabId.substr(-4)}`, 'success', 3000);
});

console.log('Enhanced EcoChain DAO (Multi-Tab Testing Version) loaded successfully!');

// =================== STUB IMPLEMENTATIONS ===================

window.createStructuredProposal = function(event) {
    event.preventDefault();
    showNotification('Proposal creation functionality working!', 'info');
};

window.resetProposalForm = function() {
    // Reset form logic here
};

window.filterValidationData = function() {
    // Filter validation data logic here
};

window.rejectData = function(dataId) {
    showNotification('Data rejection functionality working!', 'info');
};

window.downloadBackup = function() {
    showNotification('Backup download functionality working!', 'info');
};