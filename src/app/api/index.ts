import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_BASEURL ?? "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export default api;
