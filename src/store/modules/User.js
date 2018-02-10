import Vue from 'vue';
import { MessageBox } from 'element-ui';
import callDajax from '../../api/dajax';

const state = {
  isLogged: false,
  projects: [],
  currentProjectID: null, // ref_id
  parentOrigin: '', // unsafe, only use for basic /GET request
  isAdesigner: false,
};
const getters = {
  currentProject: (s) => s.projects.find(p => Number(p.id_user_design) === s.currentProjectID),
  otherProjects: (s) => s.projects.filter(p => Number(p.id_user_design) !== s.currentProjectID),
  vglProjects: (s) => s.projects.filter(p => p.modele !== 'VglDesigner'),
  otherVglProjects: (s, g) => g.vglProjects.filter(p => Number(p.id_user_design) !== s.currentProjectID),
};
const mutations = {
  isAdesigner(s, bool) {
    s.isAdesigner = bool;
  },
  isLogged(s, bool) {
    s.isLogged = bool;
  },
  addProject(s, project) {
    Vue.set(s.projects, s.projects.length, project);
  },
  deleteProjects(s) {
    s.projects.slice(0, s.projects);
  },
  setCurrentProjectID(s, id = null) {
    s.currentProjectID = Number(id);
  },
  setParentOrigin(s, origin = '') {
    s.parentOrigin = String(origin);
  },
};
const actions = {
  setUser(context, isLogged = false) {
    context.commit('isLogged', isLogged);
    context.commit('deleteProjects');
  },
  setProjects(context, projects = []) {
    context.commit('deleteProjects');
    projects.forEach(p => context.commit('addProject', p));
  },
  getProjectsFromServer(context) {
    context.dispatch('setProjects'); // empty projects list
    if (!context.state.isLogged) return;
    callDajax('getprojectslist')
      .then(({ serverresult /* ,userid */ }) => context.dispatch('User/setProjects', serverresult.projects || []))
      .catch(() => {
        MessageBox.alert('Le serveur n\'a pas pu récupérer la liste de vos projets, contactez nous si le problème persiste.', {
          type: 'error',
          title: 'Erreur',
          confirmButtonText: 'Ok',
        });
      });
  },
};

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};
