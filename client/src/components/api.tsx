import axios from "axios";

const api = axios.create({
  baseURL: `${window.location.origin}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies for session management
});

console.log(`${window.location.protocol}//${window.location.hostname}`);

export default api;
