// Background script for the extension
chrome.runtime.onInstalled.addListener(function() {
  console.log('URL Pattern Opener extension installed');
});

// Handle keyboard shortcut for default pattern
chrome.commands.onCommand.addListener(function(command) {
  if (command === 'run-default-pattern') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      
      chrome.storage.sync.get(['domainPatterns'], function(result) {
        const domainPatterns = result.domainPatterns || {};
        const patterns = domainPatterns[domain] || [];
        
        if (patterns.length > 0) {
          // Run the first (most recent) pattern
          const pattern = patterns[patterns.length - 1];
          runPatternOnTab(tabs[0].id, pattern);
        }
      });
    });
  }
});

// Handle extension icon click - smart behavior based on saved patterns
chrome.action.onClicked.addListener(function(tab) {
  const url = new URL(tab.url);
  const domain = url.hostname;
  
  chrome.storage.sync.get(['domainPatterns'], function(result) {
    const domainPatterns = result.domainPatterns || {};
    const patterns = domainPatterns[domain] || [];
    
    if (patterns.length === 1) {
      // Single pattern - run it immediately
      runPatternOnTab(tab.id, patterns[0]);
    } else if (patterns.length > 1) {
      // Multiple patterns - show popup with dropdown
      chrome.action.openPopup();
    } else {
      // No patterns - show popup for configuration
      chrome.action.openPopup();
    }
  });
});

function runPatternOnTab(tabId, patternObj) {
  chrome.tabs.sendMessage(tabId, {
    action: 'findUrls',
    pattern: patternObj.pattern,
    patternType: patternObj.type
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Error communicating with tab:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.urls && response.urls.length > 0) {
      // Open URLs with delay
      response.urls.forEach((url, index) => {
        setTimeout(() => {
          chrome.tabs.create({url: url, active: false});
        }, index * 100);
      });
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'URL Pattern Opener',
        message: `Opened ${response.urls.length} URLs matching "${patternObj.name}"`
      });
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'URL Pattern Opener',
        message: `No URLs found matching "${patternObj.name}"`
      });
    }
  });
}

// Optional: Add context menu for quick access
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "openUrlPattern",
    title: "Open URLs matching pattern",
    contexts: ["page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "openUrlPattern") {
    chrome.action.openPopup();
  }
});
