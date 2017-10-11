import axios from 'axios';
import { sendMessageAndWait, isInIframe, siteUrl } from '@/api/messages';

const callDajax = (method = '', payload = {}) => {
  if (isInIframe) return sendMessageAndWait('dajax', { method, data: payload });
  return axios({
    method: 'post',
    baseURL: `${siteUrl}/modules/adesigner/dajax.php`,
    timeout: 10000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: { method, data: payload },
  });
};

const isUserLogged = () => {
  if (isInIframe) return sendMessageAndWait('isLogged', {});
  return new Promise(resolve => { resolve({ isLogged: window.isLogged }); });
};

export { callDajax, isUserLogged };

// ?XDEBUG_SESSION_START=PHPSTORM
