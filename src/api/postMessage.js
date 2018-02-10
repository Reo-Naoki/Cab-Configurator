// POSTMESSAGE IFRAME HANDLER

const sendMessage = (pmethod = '', payload = null) => {
  // console.log('sending message', method, payload);
  // allowedRecipient.forEach(r => parent.postMessage({ method, payload }, r));
  window.mainPagePort.postMessage({ pmethod, payload });
};

let iMessagePromise = 0;
window.messagePromiseList = new Map();

// In order to simplify callbacks management, we create a promise for each call to the main window
// The resolve and reject of these promises are kept in window.messagePromiseList with an Id so they
// can be retrieved when the main window sends a message back

const sendMessageAndWait = (pmethod = '', payload = null) => new Promise(((resolve, reject) => {
  // Store resolve and reject functions for use when the main window will return the answer and thus trigger the callback
  console.log(`SendMessageAndWait ${pmethod}`);
  iMessagePromise += 1;
  window.messagePromiseList.set(iMessagePromise, { resolve, reject });
  window.mainPagePort.postMessage({ pmethod, payload, promiseId: iMessagePromise });
}));

export {
  sendMessage,
  sendMessageAndWait,
};
