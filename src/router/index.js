import Vue from 'vue';
import Router from 'vue-router';
import Root from './views/index';
import store from '../store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'root',
      component: Root,
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('./views/projects.vue'),
      children: [
        {
          path: ':projectID',
          component: () => import('./views/projects/_projectID.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/adesigner',
      name: 'adesigner',
      component: () => import('./views/adesigner.vue'),
      children: [
        {
          path: ':projectID',
          component: () => import('./views/adesigner/_projectID.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/expert',
      name: 'expert',
      component: () => import('./views/expert.vue'),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.query.user) await store.dispatch('User/setUser', true);
  if (to.query.origin) store.commit('User/setParentOrigin', to.query.origin);
  next();
});

export default router;
