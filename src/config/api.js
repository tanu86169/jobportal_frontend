const getApiBase = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost/job_portal/job-portal-api/api";
  url = String(url).trim();
  // Fix accidental double protocol like http://http://
  url = url.replace(/^https?:\/\/(https?:\/\/)+/i, "$1");
  url = url.replace(/\/+$/, "");
  return url || "http://localhost/job_portal/job-portal-api/api";
};

const API_BASE = getApiBase();

export { API_BASE };
export default API_BASE;