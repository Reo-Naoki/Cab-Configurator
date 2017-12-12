<template>
  <div>
    <span v-if="data == null">Patientez svp...</span>
    <App v-else :materials="data.materials" :connlist="data.connlist" :planks="data.rlist" adesigner/>
  </div>
</template>

<script>
import App from '../../../components/App';

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
      handler() { this.getRList(); },
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
        const response = await fetch(`${this.$store.state.User.parentOrigin}/modules/adesigner/dajax.php`, {
          method: 'POST',
          body: JSON.stringify({
            method: 'getrlistfromprojectid',
            data: { project_id: this.projectID },
          }),
        });
        const json = await response.json();
        this.data = JSON.parse(json.serverresult).data;
      } catch (e) {
        // TODO
        console.error(e);
      }
    },
  },
  beforeDestroy() {
    this.$store.commit('User/setCurrentProjectID'); // no args = null);
  },
};
</script>

<style scoped>

</style>
