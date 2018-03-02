<template>
  <Modal :visible.sync="showImportBox">
    <div class="wrapper">
      <el-card class="centered">
        <div slot="header">
          <span>R-List</span>
          <el-button style="float: right; padding: 3px 0" type="text"
                    :disabled="getRlist == null"
                    @click="importRlist">Valider</el-button>
        </div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          placeholder="Insert R-List"
          v-model="rlist">
        </el-input>
      </el-card>
    </div>
  </Modal>
</template>

<script>
import {
  Dialog,
  Card,
  Button,
  Input,
} from 'element-ui';
import Modal from './Modal';

export default {
  name: 'ImportModel',
  components: {
    Modal,
    [Dialog.name]: Dialog,
    [Card.name]: Card,
    [Button.name]: Button,
    [Input.name]: Input,
  },
  props: {
    planks: {
      type: Array,
      required: false,
    },
    materials: {
      type: Array,
      required: false,
    },
    connlist: {
      type: Array,
      required: false,
    },
    showImportDialog: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      rlist: '',
    };
  },
  computed: {
    showImportBox: {
      get() {
        return this.showImportDialog;
      },
      set(val) {
        this.$emit('update:showImportDialog', val);
      },
    },
    getRlist() {
      try {
        const { rlist, connlist, materials } = JSON.parse(this.rlist || {}) || {};
        return { rlist, connlist, materials };
      } catch (e) {
        return null;
      }
    },
  },
  methods: {
    importRlist() {
      this.$store.dispatch('Panels/importRlist', this.getRlist).then(() => { this.showImportBox = false; });
    },
  },
  watch: {
    showImportBox(isVisible, wasVisible) {
      if (isVisible && !wasVisible) {
        this.rlist = '';
      }
    },
  },
};
</script>
<style scoped>
  .wrapper {
    height: 100vh;
    text-align: center;
  }

  .wrapper:before {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
  .centered {
    display: inline-block;
    padding: 10px 15px;
    vertical-align: middle;
    width: 460px;
  }
</style>
