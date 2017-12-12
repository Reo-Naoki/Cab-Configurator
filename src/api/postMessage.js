/* eslint-disable no-restricted-globals */
// POSTMESSAGE IFRAME HANDLER
import allowedRecipient from './origins';

const sendMessage = (method = '', payload = null) => {
  // console.log('sending message', method, payload);
  allowedRecipient.forEach(r => parent.postMessage({ method, payload }, r));
};

export default sendMessage;
