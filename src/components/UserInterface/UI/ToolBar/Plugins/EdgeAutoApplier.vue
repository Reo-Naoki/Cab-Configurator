<template>
  <div class="toolbar-popup applier-div">
    <el-radio v-model="applyMode" class="mode-radio" label="all">
      Apply to all visible edges
    </el-radio>
    <el-radio v-model="applyMode" class="mode-radio" label="undefined">
      Apply to undefined edges
    </el-radio>
    <div class="layout-button apply-button">
      <el-button class="layout-button" @click="apply()">
        Apply
      </el-button>
    </div>
  </div>
</template>

<script>
import { Radio, Button } from 'element-ui';
import { mapState } from 'vuex';

export default {
  name: 'EdgeAutoApplier',
  components: {
    [Radio.name]: Radio,
    [Button.name]: Button,
  },
  data() {
    return {
      applyMode: 'all',
    };
  },
  computed: {
    ...mapState('Panels', [
      'enableEdgeAutoApplier',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  methods: {
    apply() {
      if (this.selectedObject3D && this.selectedObject3D.object3d.isGroup) {
        const allChildPanels = window.groups[this.selectedObject3D.object3d.name].getAllChildPanels();
        allChildPanels.forEach((panel) => {
          panel.autoEdgeApply(this.applyMode);
        });
      } else {
        Object.values(window.panels).forEach(panel => panel.autoEdgeApply(this.applyMode));
      }
      this.$store.dispatch('DisplayManager/hideItems', ['edges-selector']);
      this.$store.commit('Panels/enableEdgeAutoApplier', false);
    },
  },
};
</script>

<style>
  .applier-div {
    padding: 20px;
  }
  .mode-radio {
    padding: 10px;
  }
  .apply-button {
    width: 100%;
    padding-top: 20px;
  }
</style>
