// HANDLE POSTMESSAGE RESPONSE
import store from '../store';

const proxy = {
  // 'method', function
  logout: () => store.dispatch('User/setUser', false),
  login: () => store.dispatch('User/setUser', true),
};

// Initialize the messageChannel
const iframeMessageChannel = new MessageChannel();
console.log('Sending postMessage to parent');
const hostwindow = new URLSearchParams(window.location.search).get('hostwindow');
if (hostwindow) {
  window.mainPagePort = iframeMessageChannel.port1;
  // eslint-disable-next-line no-restricted-globals
  parent.postMessage('Init MessageChannel', hostwindow, [iframeMessageChannel.port2]);

  window.mainPagePort.onmessage = (event) => {
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
