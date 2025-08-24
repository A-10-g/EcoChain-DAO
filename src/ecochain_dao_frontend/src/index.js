// Simple authentication system
let currentUser = null;
let allUsers = [];

// Metadata field counter
let metadataFieldCount = 0;

// Generate a unique Principal ID
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

// Authentication Functions
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
        alert('Please enter a Principal ID');
        return;
    }
    
    // Check if user exists in our mock database
    const existingUser = JSON.parse(localStorage.getItem('ecochain_users') || '[]')
        .find(user => user.principal === principalId);
    
    if (existingUser) {
        currentUser = existingUser;
        showMainApp();
        updateUI();
        alert(`Welcome back, ${existingUser.name}!`);
    } else {
        alert('User not found. Please register first or check your Principal ID.');
    }
};

window.registerNewUser = function() {
    const name = document.getElementById('registerName').value.trim();
    
    if (!name) {
        alert('Please enter your name');
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
    
    alert(`Account created successfully!\n\nYour Principal ID: ${principalId}\n\nYou received 1,000 ECO tokens!\n\nSave your Principal ID for future logins.`);
};

window.logout = function() {
    currentUser = null;
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Reset forms
    document.getElementById('loginPrincipal').value = '';
    document.getElementById('registerName').value = '';
};

function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadAllUsers();
}

// Helper functions
function getCurrentBalance() {
    return currentUser ? currentUser.balance : 0;
}

function formatBalance(balance) {
    return balance.toLocaleString() + ' ECO';
}

function updateBalance(newBalance) {
    if (currentUser) {
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
    }
}

function saveCurrentUser() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    const userIndex = users.findIndex(u => u.principal === currentUser.principal);
    if (userIndex >= 0) {
        users[userIndex] = currentUser;
        localStorage.setItem('ecochain_users', JSON.stringify(users));
    }
}

function updateUI() {
    if (!currentUser) return;
    
    document.getElementById('userBalance').textContent = formatBalance(currentUser.balance);
    document.getElementById('userPrincipal').textContent = currentUser.principal.substring(0, 10) + '...';
    
    // Update profile information
    updateProfileUI();
    
    // Update transfer info if elements exist
    const transferBalance = document.getElementById('currentBalanceTransfer');
    if (transferBalance) {
        transferBalance.textContent = formatBalance(currentUser.balance);
    }
    const yourPrincipalId = document.getElementById('yourPrincipalId');
    if (yourPrincipalId) {
        yourPrincipalId.textContent = currentUser.principal;
    }
    
    // Update stats
    document.getElementById('userProposals').textContent = currentUser.proposalsCreated || 0;
    document.getElementById('userVotes').textContent = currentUser.votesCast || 0;
    document.getElementById('userDataSubmissions').textContent = currentUser.dataSubmissions || 0;
    
    // System stats
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    document.getElementById('totalUsers').textContent = users.length;
}

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
    
    // Save to localStorage
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
    
    alert(`✅ Data Submitted Successfully!\n\n📊 Type: ${formData.type.replace('_', ' ').toUpperCase()}\n📍 Location: ${formData.location}\n💰 You earned 50 ECO tokens!\n\nYour data is now available for community validation.`);
    
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

// Create structured proposal
window.createStructuredProposal = function(event) {
    event.preventDefault();
    
    const currentBalance = getCurrentBalance();
    if (currentBalance < 1000) {
        alert('You need at least 1,000 ECO tokens to create a proposal!');
        return;
    }
    
    const proposalData = {
        id: Date.now(),
        type: document.getElementById('proposalType').value,
        title: document.getElementById('proposalTitle').value,
        problemStatement: document.getElementById('problemStatement').value,
        proposedSolution: document.getElementById('proposedSolution').value,
        expectedImpact: document.getElementById('expectedImpact').value,
        implementationCost: document.getElementById('implementationCost').value,
        timeline: document.getElementById('timeline').value,
        additionalDetails: document.getElementById('additionalDetails').value,
        votingDuration: parseInt(document.getElementById('votingDuration').value),
        createdBy: currentUser.name,
        creatorId: currentUser.principal,
        createdAt: new Date().toISOString(),
        yesVotes: 0,
        noVotes: 0,
        voters: [],
        isActive: true
    };
    
    // Save to localStorage
    const proposals = JSON.parse(localStorage.getItem('dao_proposals') || '[]');
    proposals.push(proposalData);
    localStorage.setItem('dao_proposals', JSON.stringify(proposals));
    
    // Update stats
    if (currentUser) {
        currentUser.proposalsCreated = (currentUser.proposalsCreated || 0) + 1;
        saveCurrentUser();
        updateUI();
    }
    
    alert(`✅ Proposal Created Successfully!\n\n📝 Title: ${proposalData.title}\n🗳️ Voting Duration: ${proposalData.votingDuration} days\n\nYour proposal is now live for community voting!`);
    
    // Reset form
    resetProposalForm();
};

// Reset proposal form
window.resetProposalForm = function() {
    document.querySelector('#proposals form').reset();
};

// Load unvalidated data with enhanced display
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

// Validate structured data
window.validateStructuredData = function(dataId) {
    const submittedData = JSON.parse(localStorage.getItem('submitted_environmental_data') || '[]');
    const dataIndex = submittedData.findIndex(data => data.id === dataId);
    
    if (dataIndex === -1) return;
    
    const data = submittedData[dataIndex];
    
    // Check if user is trying to validate their own data
    if (data.submitterId === currentUser.principal) {
        alert('❌ You cannot validate your own data submission!');
        return;
    }
    
    // Mark as validated
    submittedData[dataIndex].validated = true;
    submittedData[dataIndex].validatedBy = currentUser.principal;
    submittedData[dataIndex].validatedAt = new Date().toISOString();
    
    localStorage.setItem('submitted_environmental_data', JSON.stringify(submittedData));
    
    // Add 25 to current balance
    const newBalance = getCurrentBalance() + 25;
    updateBalance(newBalance);
    
    alert(`✅ Data Validated Successfully!\n\n💰 You earned 25 ECO tokens!\n📊 Data Type: ${data.type.replace('_', ' ').toUpperCase()}\n📍 Location: ${data.location}`);
    
    // Reload the validation list
    loadUnvalidatedData();
};

// Reject data
window.rejectData = function(dataId) {
    if (!confirm('Are you sure you want to reject this data submission?\n\nThis action will remove it from validation.')) {
        return;
    }
    
    const submittedData = JSON.parse(localStorage.getItem('submitted_environmental_data') || '[]');
    const filteredData = submittedData.filter(data => data.id !== dataId);
    localStorage.setItem('submitted_environmental_data', JSON.stringify(filteredData));
    
    alert('❌ Data submission has been rejected and removed.');
    
    // Reload the validation list
    loadUnvalidatedData();
};

// Filter validation data
window.filterValidationData = function() {
    const typeFilter = document.getElementById('filterDataType').value.toLowerCase();
    const locationFilter = document.getElementById('filterLocation').value.toLowerCase();
    const dataCards = document.querySelectorAll('.enhanced-data-card');
    
    dataCards.forEach(card => {
        const cardType = card.dataset.type;
        const cardLocation = card.dataset.location;
        
        const typeMatch = !typeFilter || cardType === typeFilter;
        const locationMatch = !locationFilter || cardLocation.includes(locationFilter);
        
        card.style.display = (typeMatch && locationMatch) ? 'block' : 'none';
    });
};

// Transfer tokens with Principal ID input
window.transferTokens = function() {
    const recipientId = document.getElementById('recipientId').value.trim();
    const amount = parseInt(document.getElementById('transferAmount').value);
    
    if (!recipientId) {
        alert('Please enter the recipient\'s Principal ID!');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }
    
    const currentBalance = getCurrentBalance();
    if (amount > currentBalance) {
        alert('Insufficient balance!\n\nYour current balance: ' + formatBalance(currentBalance));
        return;
    }
    
    // Check if trying to send to self
    if (recipientId === currentUser.principal) {
        alert('You cannot transfer tokens to yourself!');
        return;
    }
    
    // Find recipient by Principal ID
    const users = JSON.parse(localStorage.getItem('ecochain_users') || '[]');
    const recipient = users.find(u => u.principal === recipientId);
    
    if (!recipient) {
        alert('Recipient not found!\n\nPlease check the Principal ID and make sure the user is registered.\n\nYou can click "View All Users" to see registered users.');
        return;
    }
    
    // Confirm transfer
    const confirmMessage = `Transfer Confirmation:\n\nTo: ${recipient.name}\nPrincipal: ${recipient.principal}\nAmount: ${amount} ECO\n\nYour new balance will be: ${formatBalance(currentBalance - amount)}\n\nProceed with transfer?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Perform transfer
    currentUser.balance -= amount;
    recipient.balance += amount;
    
    // Save both users
    const currentUserIndex = users.findIndex(u => u.principal === currentUser.principal);
    const recipientIndex = users.findIndex(u => u.principal === recipient.principal);
    
    if (currentUserIndex >= 0) users[currentUserIndex] = currentUser;
    if (recipientIndex >= 0) users[recipientIndex] = recipient;
    
    localStorage.setItem('ecochain_users', JSON.stringify(users));
    
    updateUI();
    loadAllUsers(); // Refresh user list
    
    alert(`Transfer Successful! ✅\n\n✓ Sent ${amount} ECO tokens to ${recipient.name}\n✓ Transaction completed\n\nYour new balance: ${formatBalance(currentUser.balance)}\nRecipient's new balance: ${formatBalance(recipient.balance)}`);
    
    // Reset form
    document.getElementById('recipientId').value = '';
    document.getElementById('transferAmount').value = '';
    
    // Hide user list if visible
    const usersList = document.getElementById('usersList');
    if (usersList) {
        usersList.style.display = 'none';
    }
};

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
        alert(`Selected User: ${user.name}\n\nPrincipal ID has been filled in the form.\nNow enter the amount you want to transfer.`);
    }
};

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

// Download backup function
window.downloadBackup = function() {
    const backupContent = `EcoChain DAO Account Backup
============================

Account Name: ${currentUser.name}
Principal ID: ${currentUser.principal}
Balance: ${currentUser.balance} ECO Tokens
Registration Date: ${new Date(currentUser.registeredAt).toLocaleString()}

⚠️ IMPORTANT SECURITY NOTICE:
- Keep this Principal ID safe and secure
- This is your unique identifier for accessing your EcoChain DAO account
- Never share this ID with untrusted parties
- Store this backup in a secure location

Generated on: ${new Date().toLocaleString()}
EcoChain DAO - Decentralized Environmental Governance Platform`;

    // Create and download file
    const blob = new Blob([backupContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `ecochain-dao-backup-${currentUser.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Visual feedback
    const backupBtn = document.querySelector('.btn-backup');
    if (backupBtn) {
        const originalText = backupBtn.innerHTML;
        
        backupBtn.innerHTML = '⬇️ Downloaded!';
        backupBtn.style.background = '#28a745';
        
        setTimeout(() => {
            backupBtn.innerHTML = originalText;
            backupBtn.style.background = '';
        }, 3000);
    }
    
    alert('✅ Backup Downloaded!\n\nYour account backup has been saved as a text file.\n\nPlease store it in a secure location for account recovery.');
};

// Enhanced copy function
window.copyToClipboard = function(text) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess();
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
        showCopySuccess();
    } catch (err) {
        alert('Failed to copy. Please manually copy this ID:\n\n' + text);
    }
    
    document.body.removeChild(tempTextArea);
}

function showCopySuccess() {
    // Create floating notification
    const notification = document.createElement('div');
    notification.innerHTML = '✅ Principal ID Copied!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 9999;
        font-weight: bold;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

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
    alert(`Vote Activated!\n\nVoted "${choice}" on Proposal #${proposalId}\n\nThis will:\n- Record your vote\n- Award 10 ECO tokens\n- Update vote counts`);
    
    // Add 10 to current balance
    const newBalance = getCurrentBalance() + 10;
    updateBalance(newBalance);
    
    if (currentUser) {
        currentUser.votesCast = (currentUser.votesCast || 0) + 1;
        saveCurrentUser();
        updateUI();
    }
    
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('EcoChain DAO initialized successfully!');
    
    // Check if elements exist before trying to access them
    const authModal = document.getElementById('authModal');
    const mainApp = document.getElementById('mainApp');
    
    if (authModal && mainApp) {
        // Show authentication modal
        authModal.style.display = 'flex';
        mainApp.style.display = 'none';
        
        // Show login tab by default
        showAuthTab('login');
    } else {
        console.error('Required elements not found - make sure HTML is updated');
    }
    
    // Set current time as default for measurement time
    const measurementTimeField = document.getElementById('measurementTime');
    if (measurementTimeField) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        measurementTimeField.value = now.toISOString().slice(0, 16);
    }
});

console.log('EcoChain DAO JavaScript loaded successfully!');
