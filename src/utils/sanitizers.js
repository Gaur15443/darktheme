// Custom sanitizer function without external libraries
export const sanitizeInput = input => {
  if (typeof input !== 'string') return input; // Return non-string inputs as is

  let sanitized = input;

  // Return if input is already sanitized
  if (/&(?:amp|lt|gt|quot|#39);/.test(sanitized)) {
    return sanitized; // Already sanitized, return as is
  }

  // Escape potentially harmful characters
  sanitized = sanitized.replace(/[&<>"']/g, match => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapeMap[match];
  });

  // Remove any dangerous HTML tags
  const tagsToRemove = ['script', 'iframe', 'embed', 'object', 'style', 'link'];
  tagsToRemove.forEach(tag => {
    const regex = new RegExp(
      `<${tag}\\b[^<]*(?:(?!<\/${tag}>)<[^<]*)*<\/${tag}>`,
      'gi',
    );
    sanitized = sanitized.replace(regex, '');
  });

  // Remove inline event handlers (e.g., onclick="alert(1)")
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');

  // Remove JavaScript: URLs
  sanitized = sanitized.replace(/href=["']?javascript:[^"']*["']?/gi, '');

  // Remove control characters (non-printable)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  sanitized = sanitized.replace(
    /[.*+?^${}()|[\]\\]/g,
    match => `[remove]${match}`,
  );

  return sanitized;
};

// Function to reverse the sanitization process
export const desanitizeInput = sanitized => {
  if (typeof sanitized !== 'string') return sanitized; // Return non-string inputs as is

  let original = sanitized;

  // Reverse HTML entity escaping
  const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ', // Non-breaking space
    '&copy;': '©', // Copyright symbol
    '&reg;': '®', // Registered trademark symbol
    '&euro;': '€', // Euro symbol
    '&mdash;': '—', // Em dash
    '&mdash;': '–', // En dash
  };

  // Use a regular expression to replace entities
  original = original.replace(
    /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&copy;|&reg;|&euro;|&mdash;|&ndash;/g,
    match => unescapeMap[match],
  );

  original = original.replace(/\[remove\](.*?)/g, '$1');

  // Optional: Additional decoding for other characters or tags that were removed
  // Note: This assumes the sanitized input doesn't contain any other modifications that need to be reversed.

  return original;
};
