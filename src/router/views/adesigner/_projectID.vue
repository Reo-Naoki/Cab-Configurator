<template>
  <div>
    <span v-if="data == null">Patientez svp...</span>
    <App v-else :materials="data.materials" :connlist="data.connlist" :planks="data.rlist" adesigner/>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import App from '../../../components/App';
import { callDajax } from '@/api/dajax';

export default {
  name: 'AdesignerProject',
  components: { App },
  props: {
    projectID: {
      type: String,
      default: '',
    },
  },
  watch: {
    projectID: {
      handler() {
        this.getRList();
      },
      immediate: true,
    },
  },
  data() {
    return {
      data: null,
    };
  },
  methods: {
    async getRList() {
      this.data = null;
      this.$store.commit('User/setCurrentProjectID', this.projectID);
      try {
        const response = await callDajax('getrlistfromprojectid', { project_id: this.projectID });
        const json = JSON.parse(response.data.serverresult) || { data: {} };
        this.data = json.data;
      } catch (e) {
        console.error(e);
        MessageBox.alert('Impossible de charger le projet, contactez nous si le problème persiste.', {
          type: 'error',
          title: 'Erreur',
          confirmButtonText: 'Ok',
        });
      }
    },
  },
  beforeDestroy() {
    this.$store.commit('User/setCurrentProjectID'); // no args = null);
  },
};
</script>
