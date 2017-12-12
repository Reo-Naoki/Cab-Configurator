// HANDLE POSTMESSAGE RESPONSE
import allowedOrigins from './origins';
import store from '../store';

const dajaxResponse = {
  getprojectslist: ({ serverresult /* ,userid */ }) => store.dispatch('User/setProjects', serverresult.projects || []),
  saveproject: response => store.dispatch('Panels/projectSaved', response),
  saveandcart: response => store.dispatch('Panels/addedToCart', response),
};

const proxy = {
  // 'method', function
  logout: () => store.dispatch('User/setUser', false),
  login: () => store.dispatch('User/setUser', true),
  dajax: ({ method, payload }) => { if (dajaxResponse[method]) dajaxResponse[method](payload); else console.log(method, payload); },
};

const messageHandler = (event) => {
  const { data, origin } = event;
  if (!allowedOrigins.includes(origin)) return;
  // console.log('message allowed', data);
  if (Object(data) !== data) return;
  const { method = '', payload = null } = data;
  if (proxy[method]) proxy[method](payload);
};

window.addEventListener('message', messageHandler, false);
