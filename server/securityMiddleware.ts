import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.stripe.com https://maps.googleapis.com; " +
    "frame-src https://js.stripe.com;"
  );
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );
  
  next();
};

// Rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form rate limiting
export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 contact form submissions per hour
  message: {
    error: 'Too many contact form submissions from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chatbot rate limiting
export const chatbotRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 chatbot requests per 5 minutes
  message: {
    error: 'Too many chatbot requests from this IP, please wait before sending more messages.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // List of dangerous patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /import\s+/gi,
    /require\s*\(/gi,
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
  ];

  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    let sanitized = str;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Limit length to prevent DoS
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
    }
    
    return sanitized.trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizedObj[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitizedObj;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// File upload security middleware
export const secureFileUpload = (req: Request, res: Response, next: NextFunction) => {
  // Allowed file types for documents
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  // Maximum file size (10MB)
  const maxFileSize = 10 * 1024 * 1024;

  if (req.file) {
    // Check file type
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only PDF, images, and documents are allowed.',
      });
    }

    // Check file size
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB.',
      });
    }

    // Check for potential executable extensions in filename
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.zip', '.rar', '.7z', '.tar', '.gz', '.php', '.asp',
      '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
    ];

    const filename = req.file.originalname.toLowerCase();
    const hasDangerousExtension = dangerousExtensions.some(ext => 
      filename.endsWith(ext)
    );

    if (hasDangerousExtension) {
      return res.status(400).json({
        message: 'File type not allowed for security reasons.',
      });
    }
  }

  next();
};

// SQL injection protection (basic patterns)
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
    /('\s*(OR|AND)\s*'[^']*'\s*=\s*')/gi,
  ];

  const checkForSqlInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (Array.isArray(value)) {
      return value.some(checkForSqlInjection);
    }
    if (value && typeof value === 'object') {
      return Object.values(value).some(checkForSqlInjection);
    }
    return false;
  };

  if (checkForSqlInjection(req.body) || 
      checkForSqlInjection(req.query) || 
      checkForSqlInjection(req.params)) {
    return res.status(400).json({
      message: 'Invalid request detected.',
    });
  }

  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /admin/i,
    /login/i,
    /auth/i,
    /api/i,
    /password/i,
    /token/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(req.get('Referer') || '')
  );

  if (isSuspicious) {
    console.log(`[SECURITY] ${timestamp} - IP: ${ip} - ${req.method} ${req.url} - UA: ${userAgent}`);
  }

  next();
};

// CSRF protection for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check for custom header (AJAX requests)
  const customHeader = req.get('X-Requested-With');
  if (customHeader === 'XMLHttpRequest') {
    return next();
  }

  // Check for proper content type
  const contentType = req.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return next();
  }

  // For other requests, require CSRF token or origin validation
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const host = req.get('Host');

  if (origin && origin.includes(host || '')) {
    return next();
  }

  if (referer && referer.includes(host || '')) {
    return next();
  }

  return res.status(403).json({
    message: 'CSRF protection: Request rejected.',
  });
};

// Privacy protection for sensitive pages
export const privacyProtection = (req: Request, res: Response, next: NextFunction) => {
  // Add headers to prevent caching and screenshots
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Prevent embedding in frames
  res.setHeader('X-Frame-Options', 'DENY');
  
  next();
};