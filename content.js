// Content script to find URLs on the page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'findUrls') {
    const urls = findMatchingUrls(request.pattern, request.patternType);
    sendResponse({urls: urls});
  }
});

function findMatchingUrls(pattern, patternType) {
  const urls = [];
  const foundUrls = new Set(); // Prevent duplicates
  
  // Get all anchor tags with href attributes
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.href;
    
    // Skip empty hrefs, javascript:, mailto:, tel:, etc.
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || 
        href.startsWith('tel:') || href.startsWith('#')) {
      return;
    }
    
    // Check if URL matches pattern
    if (matchesPattern(href, pattern, patternType)) {
      if (!foundUrls.has(href)) {
        foundUrls.add(href);
        urls.push(href);
      }
    }
  });
  
  // Also check for URLs in text content (optional)
  const textNodes = getTextNodes(document.body);
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  
  textNodes.forEach(node => {
    const matches = node.textContent.match(urlRegex);
    if (matches) {
      matches.forEach(url => {
        // Clean up the URL (remove trailing punctuation)
        const cleanUrl = url.replace(/[.,;!?]+$/, '');
        if (matchesPattern(cleanUrl, pattern, patternType)) {
          if (!foundUrls.has(cleanUrl)) {
            foundUrls.add(cleanUrl);
            urls.push(cleanUrl);
          }
        }
      });
    }
  });
  
  return urls;
}

function matchesPattern(url, pattern, patternType) {
  try {
    if (patternType === 'regex') {
      const regex = new RegExp(pattern, 'i');
      return regex.test(url);
    } else {
      // Wildcard pattern
      return matchesWildcard(url, pattern);
    }
  } catch (e) {
    console.error('Pattern matching error:', e);
    return false;
  }
}

function matchesWildcard(url, pattern) {
  // Convert wildcard pattern to regex
  // Escape special regex characters except *
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  
  const regex = new RegExp('^' + escapedPattern + '$', 'i');
  return regex.test(url);
}

function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    // Skip script and style elements
    if (node.parentElement && 
        ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
      continue;
    }
    textNodes.push(node);
  }
  
  return textNodes;
}
