// Handle messages to/from main window when in iframe

const proxy = {
  // 'method', function
  logout: () => console.log('logout'), // store.dispatch('User/setUser', false),
  login: () => console.log('login'), // store.dispatch('User/setUser', true),
};

// Initialize the messageChannel
const iframeMessageChannel = new MessageChannel();
console.info('Sending postMessage to parent to establish MessageChannel');
const hostwindow = new URLSearchParams(window.location.search).get('hostwindow');
const isInIframe = (!!hostwindow);
const siteUrl = (hostwindow || ((window.location.hostname.includes('localhost')
  || window.location.hostname.includes('herokuapp')) ? 'https://dev.dessinetonmeuble.fr' : ''));
console.info(`Site URL for links: ${siteUrl}`);

// const isProductionBuild = process.env.NODE_ENV === 'production';

const mainPagePort = iframeMessageChannel.port1;
if (isInIframe) {
  // eslint-disable-next-line no-restricted-globals
  parent.postMessage('Init MessageChannel', siteUrl, [iframeMessageChannel.port2]);

  mainPagePort.onmessage = (event) => {
    // MessagePort message handler - here we receive messages sent by the main window
    // They should contain a payload, possibly a proxy method
    // or simply a promise id that was given when we made the call to main window in
    // sendMessageAndWait. In that case we just have to resolve or reject this promise
    // depending on result
    const {
      pmethod = null, payload = null, iPromise = 0, success = true,
    } = event.data;
    console.log('Message received from main window: ', event);
    if (iPromise !== 0) {
      // console.log(`Promise ${iPromise} was attached to this message`);
      const { resolve, reject } = window.messagePromiseList.get(iPromise);
      if (!success) {
        reject();
        console.error('Main window reported failure to respond to sendMessage request');
      } else {
        console.log('Message forwarded as resolve with data: ', payload);
        resolve(payload);
      }
      window.messagePromiseList.delete(iPromise);
    } else if (proxy[pmethod]) proxy[pmethod](payload);
    else console.error('Message received from main page but no proxy or Promise to handle it', event);
  };
}

const sendMessage = (pmethod = '', payload = null) => {
  console.log(`SendMessage ${pmethod}`);
  // allowedRecipient.forEach(r => parent.postMessage({ method, payload }, r));
  mainPagePort.postMessage({ pmethod, payload });
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
  mainPagePort.postMessage({ pmethod, payload, promiseId: iMessagePromise });
}));

export {
  sendMessage,
  sendMessageAndWait,
  isInIframe,
  siteUrl,
};
