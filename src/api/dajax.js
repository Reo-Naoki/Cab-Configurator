import { sendMessageAndWait } from './postMessage';

const callDajax = (method = '', payload = {}) => sendMessageAndWait('dajax', { method, data: payload });
// payload can't be null (dajax data format checking)

export default callDajax;
