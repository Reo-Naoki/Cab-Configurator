<template>
  <div v-if="selectedObject3DIndex !== -1">
    <div class="title-menu-left"><h2 class="heading-menu">Orientation de la planche</h2></div>
    <div class="content-menu-left">
      <div class="flexbox-menu-left">
        <div :class="{ 'children-orientation' : true, selected: panelType === 'FP'}" @click="panelType = 'FP'">
          <img src="https://uploads-ssl.webflow.com/5d9d9d81e6b3b4240b6e8c53/5da96789a56f396431af0bed_plat.svg" alt="FlatPanel">
        </div>
        <div :class="{ 'children-orientation' : true, selected: panelType === 'VDP'}" @click="panelType = 'VDP'">
          <img src="https://uploads-ssl.webflow.com/5d9d9d81e6b3b4240b6e8c53/5da96789a56f393377af0bee_cote.svg" alt="Montant">
        </div>
        <div :class="{ 'children-orientation' : true, selected: panelType === 'VP'}" @click="panelType = 'VP'">
          <img src="https://uploads-ssl.webflow.com/5d9d9d81e6b3b4240b6e8c53/5da96789a56f39d4ebaf0bef_carre%20face.svg" alt="VerticalPanel">
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
      if (this.selectedObject3D.object3d.isDimension || this.selectedObject3D.object3d.isCoordinate) {
        return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name.split('_')[0]);
      }
      return this.panels.findIndex(p => p.id === this.selectedObject3D.object3d.name);
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
