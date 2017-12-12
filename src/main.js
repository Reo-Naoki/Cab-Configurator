import Vue from 'vue';
import * as VueGL from 'vue-gl';
import VglDesigner from './VglDesigner';
import store from './store';
import router from './router';
import './assets/css/wf.css';
import './assets/css/wf-adesigner.css';
import i18n from './i18n';
import './api/handleMessage';

Object.keys(VueGL).forEach((name) => {
  // register every VueGL component globally (could be improved)
  Vue.component(name, VueGL[name]);
});

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  i18n,
  render: h => h(VglDesigner),
}).$mount('#vgl-designer');
