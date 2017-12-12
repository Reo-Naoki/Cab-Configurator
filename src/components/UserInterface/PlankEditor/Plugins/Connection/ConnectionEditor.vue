<template>
  <el-dialog :visible="newConnection != null"
             v-if="newConnection != null"
             :title="`Fixation  P${selectedConnection.p1}-P${selectedConnection.p2}`"
             :destroy-on-close="true"
             :width="'450px'"
             :before-close="unselect">
    <el-form :model="newConnection" v-if="newConnection">
      <!--
      <el-form-item label="Planche femelle">
        <el-select v-model="reactiveP2" disabled>
          <el-option :label="`planche n°${selectedConnection.p1}`" :value="selectedConnection.p1"></el-option>
          <el-option :label="`planche n°${selectedConnection.p2}`" :value="selectedConnection.p2"></el-option>
        </el-select>
      </el-form-item>
      -->
      <el-form-item label="Mode de fixation">
        <el-select v-model="newConnection.type">
          <el-option label="Indéfini" value="undefined" disabled/>
          <el-option label="Tourillon+excentrique" :value="undefined"/>
          <el-option label="Pas de fixation" value="free"/>
          <el-option label="Taquet tous les 32mm" value="holeline32"/>
          <el-option label="Taquet 3 positions" value="adj40"/>
          <el-option label="Feuillure pour fond 3mm" value="hdfgrove"/>
          <el-option label="Porte" value="hinged"/>
        </el-select>
      </el-form-item>
      <el-form-item label="Placement des excentriques">
        <el-radio v-model="newConnection.p2side" :label="1">Face 1</el-radio>
        <el-radio v-model="newConnection.p2side" :label="2">Face 2</el-radio>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="unselect()">Annuler</el-button>
      <el-button type="primary" @click="applyConnection()" :disabled="newConnection.isUndefinedConnection">Modifier connexion</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from 'vuex';
import {
  Dialog, Form, FormItem, Select, Radio, Option, Button,
} from 'element-ui';

export default {
  name: 'ConnectionEditor',
  components: {
    [Dialog.name]: Dialog,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Select.name]: Select,
    [Radio.name]: Radio,
    [Option.name]: Option,
    [Button.name]: Button,
  },
  data() {
    return {
      newConnection: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'connections',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedConnection() {
      if (!this.selectedObject3D || !this.selectedObject3D.object3d) return null;
      if (this.selectedObject3D.object3d.name.includes('bubble')) {
        const [, p1, p2] = this.selectedObject3D.object3d.name.split('_');
        return this.connections.find(c => c.softEquals({ p1, p2 }));
      }
      return null;
    },
    reactiveP2: {
      get() {
        return this.newConnection.p2;
      },
      set(val) {
        this.newConnection.p2 = val;
        if (val === this.selectedConnection.p2) {
          this.newConnection.p1 = this.selectedConnection.p1;
        } else {
          this.newConnection.p1 = this.selectedConnection.p2;
        }
      },
    },
  },
  methods: {
    unselect(closeDialog = () => {}) {
      closeDialog(true);
      this.$store.commit('Camera/selectObject3D');
      this.newConnection = null;
    },
    applyConnection() {
      const updatedConnection = this.newConnection.clone();
      this.unselect();
      this.$store.dispatch('Panels/updateConnection', updatedConnection);
    },
  },
  watch: {
    selectedConnection(connection) {
      if (!connection) return;
      this.newConnection = connection.clone();
    },
  },
};
</script>

<style scoped>

</style>
