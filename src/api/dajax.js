import postMessage from './postMessage';

const callDajax = (method = '', payload = {}) => { // payload can't be null (dajax data format checking)
  postMessage('dajax', { method, data: payload });
};

export default callDajax;
