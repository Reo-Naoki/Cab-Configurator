<template>
  <el-dialog :visible="newConnection != null"
             v-if="newConnection != null"
             :title="`Fixation  P${selectedConnection.p1}-P${selectedConnection.p2}`"
             :destroy-on-close="true"
             :width="'450px'"
             :before-close="unselect">
    <el-form v-if="overlappedConnections.length > 1">
      <el-form-item class="overlap-form" label="Overlapped connections:">
        <el-container>
          <select class="dimension-select w-select overlap-select" v-model="currentConnection">
            <option v-for="connection in overlappedConnections" :key="connection.name" :value="connection.name" :label="connection.label" />
          </select>
        </el-container>
      </el-form-item>
    </el-form>
    <el-form :model="newConnection" v-if="newConnection">
      <el-form-item label="Mode de fixation">
        <el-container>
          <el-col :offset="3">
            <el-row v-if="isVisible('undefined')"><el-radio v-model="newConnection.type" label="undefined" >Indéfini</el-radio></el-row>
            <el-row v-if="isVisible(undefined)"><el-radio v-model="newConnection.type" label="default">Tourillon+excentrique</el-radio></el-row>
            <el-row v-if="isVisible('rafix')"><el-radio v-model="newConnection.type" label="rafix">Rafix</el-radio></el-row>
            <el-row v-if="isVisible('free')"><el-radio v-model="newConnection.type" label="free">Pas de fixation</el-radio></el-row>
            <el-row v-if="isVisible('wooddowels')"><el-radio v-model="newConnection.type" label="wooddowels">Tourillons seuls</el-radio></el-row>
            <el-row v-if="isVisible('holeline32')"><el-radio v-model="newConnection.type" label="holeline32">Taquet tous les 32mm</el-radio></el-row>
            <el-row v-if="isVisible('adj40')"><el-radio v-model="newConnection.type" label="adj40">Taquet 3 positions</el-radio></el-row>
            <el-row v-if="isVisible('hdfgrove')"><el-radio v-model="newConnection.type" label="hdfgrove">Feuillure pour fond 4mm</el-radio></el-row>
            <el-row v-if="isVisible('hinged')"><el-radio v-model="newConnection.type" label="hinged">Porte</el-radio></el-row>
          </el-col>
        </el-container>
      </el-form-item>
      <el-form-item v-if="newConnection.type == 'default' || newConnection.type == 'rafix'" label="Placement des excentriques">
        <el-radio v-model="newConnection.p2side" :label="1">Face 1</el-radio>
        <el-radio v-model="newConnection.p2side" :label="2">Face 2</el-radio>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="unselect()">Annuler</el-button>
      <el-button type="primary" @click="applyConnection()">Modifier connexion</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from 'vuex';
import { Vector3 } from 'three';
import {
  Dialog, Form, FormItem, Select, Radio, Option, Button, Container, Col, Row,
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
    [Container.name]: Container,
    [Col.name]: Col,
    [Row.name]: Row,
  },
  data() {
    return {
      newConnection: null,
      connectedPanelType: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'connections',
      'panels',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
      'prevSelectedObject3D',
    ]),
    selectedConnection() {
      if (!this.selectedObject3D || !this.selectedObject3D.object3d) return null;
      if (this.selectedObject3D.object3d.name.includes('bubble')) {
        const [, p1, p2] = this.selectedObject3D.object3d.name.split('_');
        return this.connections.find(c => c.softEquals({ p1, p2 }));
      }
      return null;
    },
    overlappedConnections() {
      return this.connections.filter(c => {
        const { center } = this.selectedConnection;
        return new Vector3(center.x, center.y, center.z).distanceTo(new Vector3(c.center.x, c.center.y, c.center.z)) < 500;
      }).map(c => ({
        ...c,
        name: `${c.p1}-${c.p2}`,
        label: `P${c.p1}-P${c.p2}`,
      }));
    },
    currentConnection: {
      get() { return `${this.selectedConnection.p1}-${this.selectedConnection.p2}`; },
      set(data) {
        const otherConnection = this.connections.find(c => c.softEquals({ p1: data.split('-')[0], p2: data.split('-')[1] }));
        this.$store.commit('Camera/selectObject3D', {
          object3d: {
            name: `bubble_${otherConnection.p1}_${otherConnection.p2}`,
            isConnectionBubble: true,
          },
        });
      },
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
      if (this.prevSelectedObject3D) this.$store.commit('Camera/selectObject3D', { object3d: this.prevSelectedObject3D.object3d });
      else this.$store.commit('Camera/selectObject3D');
      this.newConnection = null;
    },
    applyConnection() {
      const updatedConnection = this.newConnection.type === 'default' ? { ...this.newConnection, type: undefined } : { ...this.newConnection };
      this.unselect();
      this.$store.dispatch('Panels/updateConnection', updatedConnection);
    },
    isVisible(value) {
      const { p1, p2 } = this.selectedConnection;
      if (window.panels[p1].ptype === window.panels[p2].ptype) {
        if (value === 'undefined') return true;
        return false;
      }
      switch (value) {
        case 'undefined':
        case 'free':
          return true;
        case undefined:
        case 'rafix':
        case 'wooddowels':
        case 'holeline32':
        case 'adj40':
        case 'hdfgrove':
        case 'hinged':
          return this.connectedPanelType !== 'HDFPanel';
        default:
          return false;
      }
    },
  },
  watch: {
    selectedConnection(connection) {
      if (!connection) return;
      this.newConnection = connection.type ? connection.clone() : { ...connection, type: 'default' };

      const connectedPanels = this.panels.filter(c => (c.id === this.newConnection.p1.toString() || c.id === this.newConnection.p2.toString()));

      if (connectedPanels[0].thick === 4 || connectedPanels[1].thick === 4) this.connectedPanelType = 'HDFPanel';
      else this.connectedPanelType = 'Panel';
    },
  },
};
</script>

<style scoped>
  .overlap-form {
    margin-bottom: 0px;
  }
  .overlap-select {
    background: white;
  }
</style>
