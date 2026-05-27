import axios from 'axios';

// In production (Render), use the backend URL from env variable.
// In development, axios uses the proxy in package.json (localhost:8080).
const API_BASE = process.env.REACT_APP_API_URL || '';

if (API_BASE) {
    axios.defaults.baseURL = API_BASE;
}

export default axios;
