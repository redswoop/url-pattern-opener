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
    
    // Normalize URL
    const normalizedUrl = normalizeUrl(href);
    
    // Check if URL matches pattern
    if (matchesPattern(normalizedUrl, pattern, patternType)) {
      if (!foundUrls.has(normalizedUrl)) {
        foundUrls.add(normalizedUrl);
        urls.push(normalizedUrl);
      }
    }
  });
  
  // Also check for URLs in text content (optional)
  const textNodes = getTextNodes(document.body);
  const urlRegex = /https?:\/\/[^\s<>"'()[\]{}]+/g;
  
  textNodes.forEach(node => {
    const matches = node.textContent.match(urlRegex);
    if (matches) {
      matches.forEach(url => {
        // Clean up and normalize the URL
        const cleanUrl = url.replace(/[.,;!?]+$/, '');
        const normalizedUrl = normalizeUrl(cleanUrl);
        
        if (matchesPattern(normalizedUrl, pattern, patternType)) {
          if (!foundUrls.has(normalizedUrl)) {
            foundUrls.add(normalizedUrl);
            urls.push(normalizedUrl);
          }
        }
      });
    }
  });
  
  return urls;
}

function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Remove trailing slash for consistency
    let normalizedUrl = urlObj.toString();
    if (normalizedUrl.endsWith('/') && urlObj.pathname === '/') {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    return normalizedUrl;
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
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
