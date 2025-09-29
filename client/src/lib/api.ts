// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'  // Netlify Functions
  : '/api';  // Local development

export { API_BASE_URL };