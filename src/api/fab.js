import axios from 'axios';
import { sendMessageAndWait } from './postMessage';

const path = (process.env.NODE_ENV === 'production') ? 'https://dessinetonmeuble.fr/' : 'https://dev.dessinetonmeuble.fr/';

const callFabApi = (method = '', payload = {}) => {
  if (window.mainPagePort) return sendMessageAndWait('fabapi', { method, data: payload });
  return axios({
    method: 'post',
    baseURL: `${path}/modules/adesigner/fabapi.php`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: { route: method },

  });
};

export default callFabApi;
