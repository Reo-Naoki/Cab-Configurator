<template>
  <el-dialog :visible="enableLayerManager"
             title="Couches"
             :destroy-on-close="true"
             :width="'450px'"
             :before-close="cancel">
    <div class="list-form">
      <div v-for="(layer, index) in panelLayers" :key="index">
        <div v-if="layer.name">
          <el-input v-if="index === editIndex" class="list-item" v-model="panelLayer" @blur="endEdit()"/>
          <el-button v-else class="list-item" @click="index === 0 ? null : startEdit(index)">{{ layer.name }}</el-button>
          <el-button class="remove-item" @click="index === 0 ? null : remove(index)" :disabled="index === 0">
            <em class="el-icon-delete" />
          </el-button>
        </div>
      </div>
      <el-button class="add-item" @click="add()">+</el-button>
    </div>
    <div slot="footer">
      <el-button @click="cancel()">Annuler</el-button>
      <el-button type="primary" @click="apply()">Appliquer</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex';
import {
  Dialog, Form, FormItem, Button, Input,
} from 'element-ui';

export default {
  name: 'LayerManager',
  props: {
    layers: {
      type: Array,
      required: true,
    },
  },
  components: {
    [Dialog.name]: Dialog,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Button.name]: Button,
    [Input.name]: Input,
  },
  data() {
    return {
      editIndex: null,
      editName: null,
      panelLayers: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'enableLayerManager',
    ]),
    panelLayer: {
      get() { return this.editName; },
      set(val) { this.editName = val; },
    },
  },
  methods: {
    startEdit(index) {
      this.editIndex = index;
      this.editName = this.panelLayers[index].name;
    },
    endEdit() {
      if (this.panelLayers.filter((layer, index) => (index !== this.editIndex && layer.name === this.editName)).length > 0) {
        let maxID = 1;
        const names = this.panelLayers.map(layer => layer.name);
        while (names.includes(`${this.editName} (${maxID})`)) maxID += 1;
        this.editName = `${this.editName} (${maxID})`;
      }
      this.panelLayers[this.editIndex].name = this.editName;
      this.editIndex = -1;
    },
    remove(index) {
      this.panelLayers[index].name = '';
      this.editIndex = -1;
    },
    add() {
      let ids = this.panelLayers.filter(layer => layer.name.includes('new (')).map(layer => layer.name.split('new (')[1]);
      ids = ids.filter(id => id.includes(')')).map(id => id.split(')')[0]);
      const maxID = ids.length > 0 ? Math.max(...ids.map(id => Number(id))) + 1 : 1;
      this.panelLayers.push({ name: `new (${maxID})` });
    },
    cancel(closeDialog = () => {}) {
      this.$store.commit('Panels/enableLayerManager', false);
      closeDialog(true);
    },
    apply() {
      this.$store.commit('Panels/setLayers', this.panelLayers.filter(layer => layer.name));
      this.$store.commit('Panels/updateLayers', { old: this.layers, new: this.panelLayers });
      this.cancel();
    },
  },
  watch: {
    enableLayerManager(isEnable, wasEnable) {
      if (isEnable && !wasEnable) {
        this.panelLayers = this.layers.map(layer => ({ ...layer }));
      }
    },
  },
};
</script>
<style scoped>
  .list-form {
    margin-left: 30px;
    margin-right: 30px;
    height:300px;
    overflow-y:scroll;
    border: 1px solid rgb(236, 236, 236);
  }
  .list-item {
    text-align: left;
    width: 85% !important;
    border-left: none !important;
    border-right: none !important;
    border-radius: 0px !important;
    height: 50px !important;
  }
  .remove-item {
    margin: 0px;
    width: 15% !important;
    border-left: none !important;
    border-right: none !important;
    border-radius: 0px !important;
    height: 50px !important;
  }
  .add-item {
    font-weight: 600;
    font-size: 1.5em;
    text-align: center;
    margin: 0px;
    padding: 0px;
    width: 100% !important;
    height: 30px !important;
  }
</style>
