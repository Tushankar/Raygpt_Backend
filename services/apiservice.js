import axios from "axios";
import FormData from "form-data";
import fs from "fs"; // only if you deal with local files, else use buffers/base64

const DIDIT_API_BASE = "https://verification.didit.me/v2";
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

async function callDiditAPI(endpoint, formData) {
  try {
    const response = await axios.post(`${DIDIT_API_BASE}/${endpoint}`, formData, {
      headers: {
        ...formData.getHeaders(),
        "x-api-key": DIDIT_API_KEY,
        "accept": "application/json",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Didit API Error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}
