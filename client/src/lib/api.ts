// API configuration for different environments
// On Netlify (production), API is at /.netlify/functions/api
// On Replit/local dev, API is at /api
const API_BASE_URL = window.location.hostname.includes('netlify.app')
  ? '/.netlify/functions/api'
  : '/api';

export { API_BASE_URL };