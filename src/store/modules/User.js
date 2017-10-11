import Vue from 'vue';
import { MessageBox } from 'element-ui';
import { callDajax, isUserLogged } from '../../api/dajax';

const state = {
  projects: [],
  currentProjectID: null, // ref_id
  isAdesigner: false,
};
const getters = {
  currentProject: (s) => s.projects.find(p => Number(p.id_user_design) === s.currentProjectID),
  otherProjects: (s) => s.projects.filter(p => Number(p.id_user_design) !== s.currentProjectID),
  vglProjects: (s) => s.projects.filter(p => p.modele === 'VglDesigner'),
  otherVglProjects: (s, g) => g.vglProjects.filter(p => Number(p.id_user_design) !== s.currentProjectID),
};
const mutations = {
  isAdesigner(s, bool) {
    s.isAdesigner = bool;
  },
  addProject(s, project) {
    console.log(`Adding project ${s.projects.length}`);
    Vue.set(s.projects, s.projects.length, project);
  },
  setProjects(s, projects) {
    console.log('Setting all projects');
    s.projects = projects;
  },
  deleteProjects(s) {
    s.projects.slice(0, s.projects);
  },
  setCurrentProjectID(s, id = null) {
    s.currentProjectID = Number(id);
  },
};
const actions = {
  setUser(context) {
    context.commit('deleteProjects');
  },
  setProjects(context, projects = []) {
    context.commit('deleteProjects');
    context.commit('setProjects', projects);
  },
  getProjectsFromServer(context) {
    context.commit('deleteProjects');
    isUserLogged().then((logdata) => {
      if (!logdata.isLogged) return;
      //    if (!context.state.isLogged) return;
      const isProductionBuild = process.env.NODE_ENV === 'production';
      callDajax('getprojectslist', (isProductionBuild ? {} : { userid: 2 }))
        .then((response) => {
          console.log('Received projects from server');
          console.log(response);
          const { data } = response;
          console.log(`Received ${data.serverresult.projects.length} projects`);
          context.dispatch('setProjects', data.serverresult.projects || []);
        })
        .catch(() => {
          MessageBox.alert('Le serveur n\'a pas pu récupérer la liste de vos projets, contactez nous si le problème persiste.', {
            type: 'error',
            title: 'Erreur',
            confirmButtonText: 'Ok',
          });
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
