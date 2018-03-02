<template>
  <div class="ard-savebox" v-if="isVisible">
    <h3>{{t('saveyourproject')}}</h3>
    <div class="trait-horizontal middle" v-if="currentProject"></div>
    <div class="ard-savebox-inside rm" v-if="currentProject">
      <div class="ard-projectlist-projectname">
        {{t('currentproject')}}:
      </div>
      <img :src="projectImgUrl(currentProject.id_user_design)" width="140" alt="" class="ard-projectlist-projectimg">
      <div class="ard-projectlist-projectname">{{currentProject.name}} <A :href="parentOrigin + /meuble/ + currentProject.id_user_design" target="_blank">({{currentProject.id_user_design}})</A></div>
      <a href="#" class="eel-button w-inline-block" @click="saveCurrent()">
        <div>{{t('saveproject')}}</div>
      </a>
    </div>
    <div class="trait-horizontal middle"></div>
    <div class="ard-savebox-inside rm">
      <div class="ard-projectlist-projectname">
        <label for="projectName">{{t('saveas')}}:</label>
        <input
          v-model="newName"
          id="projectName"
          size="29"
          type="text"
          :placeholder="t('projectname')"
          title=""
        >
      </div>
      <a href="#" class="eel-button w-inline-block" @click="saveProjectAs(newName)">
        <div>{{t('saveproject')}}</div>
      </a>
    </div>
    <div class="trait-horizontal middle"></div>
    <div class="list-projet-rm">
      <div v-for="(project, pid) in otherVglProjects" :key="pid" class="ard-projectlistitem w-clearfix">
        <img :src="projectImgUrl(project.id_user_design)" width="140" alt="" class="ard-projectlist-projectimg">
        <div class="ard-projectlist-projectname">{{project.name}} du {{project.date}}</div>
        <a :href="projectUrl(project.id_user_design)" class="eel-button medium smallbutton w-inline-block"
           target="_blank">
          <div>{{t('open')}}</div>
        </a>
      </div>
      <div v-if="projects.length === 0">{{t('noproject')}}.</div>
    </div>
    <a href="#" class="eel-button red w-inline-block" @click="isVisible=false">
      <div>{{t('close')}}</div>
    </a>
  </div>
</template>

<script>
/* eslint-disable camelcase */
import { mapGetters, mapState } from 'vuex';
import EventBus from '../../../../EventBus/EventBus';
import { sendMessage } from '../../../../../api/postMessage';


export default {
  name: 'projectsBox',
  props: [],
  data() {
    return {
      updateList: false,
      isVisible: false,
      newName: '', // New name for Save As
      actionWatcherDestroyer: () => {},
    };
  },
  created() {
    this.actionWatcherDestroyer = this.$store.subscribeAction((action) => {
      // set updateList to false after setting project from parent origin
      if (action.type === 'User/setProjects') this.updateList = false;
    });
  },
  beforeDestroy() {
    this.actionWatcherDestroyer();
  },
  watch: {
    updateList(newstate) {
      // console.log('SaveBox getProjects');
      if (newstate) this.$store.dispatch('User/getProjectsFromServer');
    },
  },
  computed: {
    ...mapState('User', [
      'isLogged',
      'currentProjectID', // ref_id
      'projects',
      'parentOrigin',
    ]),
    ...mapGetters('User', [
      'currentProject',
      'otherVglProjects',
    ]), /*
    projectsWithoutCurrent() {
      return this.projectsList.filter(p => parseInt(p.id_user_design, 10) !== this.ref_id);
    },
    currentProject() {
      return this.projectsList.filter(p => parseInt(p.id_user_design, 10) === this.ref_id);
    }, */
  },
  methods: {
    t(msg) {
      return this.$t(msg);
    },
    projectImgUrl(id_user_design) {
      return `https://dessinetonmeuble.fr/uimg/img${id_user_design}.png`;
    },
    projectUrl(id_user_design) {
      return `${this.parentOrigin}/meuble/${id_user_design}`;
    },
    saveCurrent() {
      this.$store.dispatch('Panels/save', { name: this.currentProject.name });
    },
    saveProjectAs() {
      this.$store.dispatch('Panels/save', { name: this.newName, saveAsNew: true });
    },
    displayProjects() {
      // eslint-disable-next-line no-undef
      if (this.isLogged) {
        // Force update if connected and 0 projects - we may have just connected, and there is
        // no watcher to trigger an update once connection is successfull
        // Will generate extra calls for customers with 0 project but minimal response size
        if (this.projects.length === 0) this.updateList = true;
        this.isVisible = true;
      } else {
        sendMessage('login');
      }
    },
  },
  mounted() {
    EventBus.$on('updateProjectsList', () => {
      this.newName = '';
      this.updateList = true;
    });
    EventBus.$on('showProjectsList', () => {
      this.displayProjects();
    });
    EventBus.$on('hideProjectsList', () => {
      this.isVisible = false;
    });
  },
};
</script>
