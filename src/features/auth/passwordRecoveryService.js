import axios from 'axios';

const API_URL = 'http://localhost:5055/api/Auth';

export async function sendRecoveryEmail(email) {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data?.message || 'Error al enviar el correo' };
  }
}
