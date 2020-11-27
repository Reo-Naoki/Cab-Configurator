<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Orientation de la planche</h2></div>
    <div class="content-menu-left">
      <div class="flexbox-menu-left">
        <label class="inline-block normal attribute wrapper-margin-tbauto margin-auto">
          <img src="../../../../assets/images/PType.png" alt="" height="45px" style="vertical-align: sub;" />
        </label>
        <div :class="{ 'children-orientation' : true, selected: panelType === 'FP', 'typebtn': true}" @click="panelType = 'FP'">
          <img src="../../../../assets/images/FP.png" alt="FlatPanel">
        </div>
        <div :class="{ 'children-orientation' : true, selected: panelType === 'VDP', 'typebtn': true}" @click="panelType = 'VDP'">
          <img src="../../../../assets/images/VDP.png" alt="Montant">
        </div>
        <div :class="{ 'children-orientation' : true, selected: panelType === 'VP', 'typebtn': true}" @click="panelType = 'VP'">
          <img src="../../../../assets/images/VP.png" alt="VerticalPanel">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TypeEditor',
  computed: {
    ...mapState('Panels', [
      'panels',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
    },
    panel() {
      return this.panels[this.selectedObject3DIndex];
    },
    panelType: {
      get() { return this.panel.ptype; },
      set(data) {
        this.$store.commit('Panels/setPanelData', {
          index: this.selectedObject3DIndex,
          key: 'ptype',
          data,
        });
      },
    },
  },
};
</script>
<style>
  .margin-auto {
    margin: auto;
    margin-left: 20px;
    margin-right: 20px;
  }
  .typebtn {
    margin: auto !important;
    width: 50px !important;
    height: 50px !important;
    padding: 1px !important;
  }
  .typebtn.selected {
    background-color: lightgray !important;
  }
</style>
