// Store found URLs and opened URLs to prevent duplicates
let foundUrls = [];
let openedUrls = new Set();
let currentDomain = '';

document.addEventListener('DOMContentLoaded', function() {
  const patternInput = document.getElementById('pattern');
  const patternNameInput = document.getElementById('patternName');
  const findButton = document.getElementById('findUrls');
  const saveButton = document.getElementById('savePattern');
  const openButton = document.getElementById('openUrls');
  const statusDiv = document.getElementById('status');
  
  // Load opened URLs from storage to persist across popup sessions
  chrome.storage.local.get(['openedUrls'], function(result) {
    if (result.openedUrls) {
      openedUrls = new Set(result.openedUrls);
    }
  });
  
  // Get current domain and load saved patterns
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = new URL(tabs[0].url);
    currentDomain = url.hostname;
    document.getElementById('currentDomain').textContent = currentDomain;
    
    loadDomainPatterns();
    loadQuickActions();
  });
  
  // Load saved pattern for current domain
  chrome.storage.sync.get(['domainPatterns'], function(result) {
    const domainPatterns = result.domainPatterns || {};
    const patterns = domainPatterns[currentDomain] || [];
    
    if (patterns.length > 0) {
      const lastPattern = patterns[patterns.length - 1];
      patternInput.value = lastPattern.pattern;
      patternNameInput.value = lastPattern.name || '';
      document.querySelector(`input[name="patternType"][value="${lastPattern.type}"]`).checked = true;
    }
  });
  
  // Test pattern button
  findButton.addEventListener('click', function() {
    const pattern = patternInput.value.trim();
    if (!pattern) {
      showStatus('Please enter a pattern', 'error');
      return;
    }
    
    testPattern(pattern);
  });
  
  // Save pattern button
  saveButton.addEventListener('click', function() {
    const pattern = patternInput.value.trim();
    const patternName = patternNameInput.value.trim();
    
    if (!pattern) {
      showStatus('Please enter a pattern', 'error');
      return;
    }
    
    const patternType = document.querySelector('input[name="patternType"]:checked').value;
    
    savePatternForDomain(currentDomain, {
      pattern: pattern,
      type: patternType,
      name: patternName || pattern
    });
  });
  
  // Open URLs button
  openButton.addEventListener('click', function() {
    if (foundUrls.length === 0) {
      showStatus('No URLs to open', 'error');
      return;
    }
    
    openMatchingUrls(foundUrls);
  });
  
  function loadQuickActions() {
    chrome.storage.sync.get(['domainPatterns'], function(result) {
      const domainPatterns = result.domainPatterns || {};
      const patterns = domainPatterns[currentDomain] || [];
      
      if (patterns.length > 0) {
        const quickActions = document.getElementById('quickActions');
        const quickButtons = document.getElementById('quickButtons');
        
        quickButtons.innerHTML = '';
        
        patterns.forEach((patternObj, index) => {
          const btn = document.createElement('button');
          btn.className = 'quick-btn';
          btn.textContent = patternObj.name;
          btn.onclick = () => runQuickPattern(patternObj);
          quickButtons.appendChild(btn);
        });
        
        quickActions.style.display = 'block';
      }
    });
  }
  
  function loadDomainPatterns() {
    chrome.storage.sync.get(['domainPatterns'], function(result) {
      const domainPatterns = result.domainPatterns || {};
      const domainList = document.getElementById('domainList');
      
      domainList.innerHTML = '';
      
      Object.keys(domainPatterns).forEach(domain => {
        const patterns = domainPatterns[domain];
        if (patterns.length === 0) return;
        
        const domainDiv = document.createElement('div');
        domainDiv.className = 'domain-item';
        
        const domainName = document.createElement('div');
        domainName.className = 'domain-name';
        domainName.textContent = domain;
        domainDiv.appendChild(domainName);
        
        const patternList = document.createElement('div');
        patternList.className = 'pattern-list';
        
        patterns.forEach((patternObj, index) => {
          const patternItem = document.createElement('div');
          patternItem.className = 'pattern-item';
          
          const patternName = document.createElement('span');
          patternName.className = 'pattern-name';
          patternName.textContent = patternObj.name;
          
          const patternCode = document.createElement('span');
          patternCode.className = 'pattern-code';
          patternCode.textContent = `${patternObj.pattern} (${patternObj.type})`;
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = '×';
          deleteBtn.onclick = () => deletePattern(domain, index);
          
          patternItem.appendChild(patternName);
          patternItem.appendChild(patternCode);
          patternItem.appendChild(deleteBtn);
          patternList.appendChild(patternItem);
        });
        
        domainDiv.appendChild(patternList);
        domainList.appendChild(domainDiv);
      });
    });
  }
  
  function savePatternForDomain(domain, patternObj) {
    chrome.storage.sync.get(['domainPatterns'], function(result) {
      const domainPatterns = result.domainPatterns || {};
      
      if (!domainPatterns[domain]) {
        domainPatterns[domain] = [];
      }
      
      // Check if pattern already exists
      const existingIndex = domainPatterns[domain].findIndex(p => p.pattern === patternObj.pattern);
      if (existingIndex !== -1) {
        domainPatterns[domain][existingIndex] = patternObj;
        showStatus('Pattern updated', 'success');
      } else {
        domainPatterns[domain].push(patternObj);
        showStatus('Pattern saved', 'success');
      }
      
      chrome.storage.sync.set({domainPatterns: domainPatterns}, function() {
        loadDomainPatterns();
        loadQuickActions();
      });
    });
  }
  
  function deletePattern(domain, index) {
    chrome.storage.sync.get(['domainPatterns'], function(result) {
      const domainPatterns = result.domainPatterns || {};
      
      if (domainPatterns[domain]) {
        domainPatterns[domain].splice(index, 1);
        if (domainPatterns[domain].length === 0) {
          delete domainPatterns[domain];
        }
        
        chrome.storage.sync.set({domainPatterns: domainPatterns}, function() {
          loadDomainPatterns();
          loadQuickActions();
          showStatus('Pattern deleted', 'success');
        });
      }
    });
  }
  
  function runQuickPattern(patternObj) {
    testPattern(patternObj.pattern, patternObj.type, true);
  }
  
  function testPattern(pattern, patternType = null, autoOpen = false) {
    if (!patternType) {
      patternType = document.querySelector('input[name="patternType"]:checked').value;
    }
    
    // Clear previous results
    foundUrls = [];
    openButton.style.display = 'none';
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'findUrls',
        pattern: pattern,
        patternType: patternType
      }, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: Could not communicate with page', 'error');
          return;
        }
        
        if (response && response.urls) {
          // Remove duplicates and already opened URLs
          const uniqueUrls = [...new Set(response.urls)];
          foundUrls = uniqueUrls.filter(url => !openedUrls.has(url));
          
          if (foundUrls.length > 0) {
            showStatus(`Found ${foundUrls.length} new matching URLs`, 'success');
            openButton.style.display = 'inline-block';
            
            if (autoOpen) {
              openMatchingUrls(foundUrls);
            }
          } else if (uniqueUrls.length > 0) {
            showStatus(`Found ${uniqueUrls.length} URLs but all have been opened already`, 'error');
          } else {
            showStatus('No matching URLs found', 'error');
          }
        } else {
          showStatus('No matching URLs found', 'error');
        }
      });
    });
  }
  
  function openMatchingUrls(urls) {
    if (urls.length === 0) {
      showStatus('No new URLs to open', 'error');
      return;
    }
    
    let opened = 0;
    const urlsToOpen = [...urls]; // Create a copy to avoid modification during iteration
    
    urlsToOpen.forEach((url, index) => {
      setTimeout(() => {
        chrome.tabs.create({url: url, active: false}, function(tab) {
          if (chrome.runtime.lastError) {
            console.error('Error opening URL:', url, chrome.runtime.lastError);
          } else {
            openedUrls.add(url);
            opened++;
            showStatus(`Opened ${opened}/${urlsToOpen.length} URLs`, 'success');
            
            // Save opened URLs to storage
            chrome.storage.local.set({openedUrls: Array.from(openedUrls)});
          }
        });
      }, index * 100);
    });
    
    showStatus(`Opening ${urlsToOpen.length} URLs...`, 'success');
  }
  
  // Add a function to clear opened URLs history
  function clearOpenedUrls() {
    openedUrls.clear();
    chrome.storage.local.remove(['openedUrls']);
    showStatus('Cleared opened URLs history', 'success');
  }
  
  // Add clear button functionality (can be called manually from console)
  window.clearOpenedUrls = clearOpenedUrls;
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
});
