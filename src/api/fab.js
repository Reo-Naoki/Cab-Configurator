import axios from 'axios';
import { sendMessageAndWait, isInIframe, siteUrl } from '@/api/messages';

const callFabApi = (method = '', payload = {}) => {
  if (isInIframe) return sendMessageAndWait('fabapi', { method, data: payload });
  return axios({
    method: 'post',
    baseURL: `${siteUrl}/modules/adesigner/fabapi.php`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: { route: method },
    data: payload,
  });
};

export default callFabApi;
