<template>
  <div>
    <Header />
    <div class="content-vgl">
      <PlankEditor :layers="getLayers"/>
      <div id="content-3d" class="content-3d">
        <vgl-renderer ref="renderer" :antialias="true" style="height: 100%" precision="highp" power-preference="high-performance" :preserve-drawing-buffer="true" >
          <Materials :materials="materials" />
          <Camera />
          <vgl-scene ref="scene" backgroundColor="#f8f8ff">
            <Panels />
            <vgl-ambient-light color="#4F4F4F" intensity="2" />
            <vgl-directional-light color="#ffffff" name="light" position="1 1 1" :intensity="0.5"/>
            <vgl-directional-light color="#ffffff" name="light2" position="-1 1 -1" :intensity="0.5"/>
            <vgl-grid-helper
              :size="80000"
              :divisions="16"
              color-center-line="#cfcfcf"
              color-grid="#cfcfcf" />
          </vgl-scene>
        </vgl-renderer>
        <DisplayOptions/>
        <ToolBar :layers="getLayers"/>
        <ButtonPlus />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import * as THREE from 'three';
import Materials from './Materials/Materials';
import EventBus from './EventBus/EventBus';
import Camera from './Camera';
import Panels from './Widgets/Panels';
import Header from './UserInterface/UI/Header/Header';
import PlankEditor from './UserInterface/PlankEditor/PlankEditor';
import ButtonPlus from './UserInterface/UI/ButtonPlus';
import DisplayOptions from './UserInterface/UI/DisplayOptions/DisplayOptions';
import ToolBar from './UserInterface/UI/ToolBar/ToolBar';

export default {
  name: 'app',
  components: {
    ButtonPlus,
    PlankEditor,
    Header,
    Panels,
    Camera,
    Materials,
    DisplayOptions,
    ToolBar,
  },
  props: {
    materials: {
      type: Array,
      default: () => [
        {
          id: 1,
          manufacturer: '6',
          ref: 'W908',
          finish: 'SM',
        }, {
          id: 0,
          manufacturer: '3',
          ref: 'D2201',
          finish: null,
        },
      ],
    },
    planks: {
      type: Array,
      default: () => [],
    },
    connlist: {
      type: Array,
      default: () => [],
    },
    adesigner: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      storeActionWatcher: null,
    };
  },
  async created() {
    const self = this;
    this.$store.commit('User/isAdesigner', this.adesigner);
    await this.$store.dispatch('DisplayManager/hideItems', ['connections']);
    await this.$store.dispatch('DisplayManager/showItems', ['dimension-arrows']);
    await this.$store.dispatch('Panels/deserialize', {
      connlist: this.connlist,
      materials: this.materials,
      rlist: this.planks,
      options: { initMaterials: true },
    });

    // handle materials update
    this.storeActionWatcher = this.$store.subscribeAction({
      after: (action) => {
        if (action.type === 'materials/updateMaterial') {
          self.handleUpdateMaterial(action.payload);
        }
      },
    });

    await this.$nextTick();
    EventBus.$emit('save'); // history saving
  },
  mounted() {
    window.refs = this.$refs;
    window.EventBus = EventBus;
    window.scene = this.$refs.scene.inst;
    window.renderer = this.$refs.renderer.inst;
    window.THREE = THREE;
    window.app = this;
    window.vue = Vue;
  },
  computed: {
    ...mapState('Panels', [
      'panels',
      'layers',
    ]),
    getLayers() {
      let panelLayers = this.panels.filter(l => l.layer).map(l => ({ name: l.layer }));
      panelLayers = panelLayers.concat(this.layers);
      panelLayers = panelLayers.filter((l, index) => panelLayers.findIndex(layer => layer.name === l.name) === index);
      panelLayers.sort((a, b) => ((a.name > b.name || b.name === 'Structure') ? 1 : -1));
      this.setLayers(panelLayers);

      return panelLayers;
    },
  },
  methods: {
    setLayers(data) {
      this.$store.commit('Panels/setLayers', data);
    },
    handleUpdateMaterial({ oldMaterialID, newMaterialID, color }) {
      if (newMaterialID == null && color == null) {
        this.$store.dispatch('Panels/replaceMaterialInPanels', { oldMaterial: oldMaterialID, newMaterial: 1 });
      }
      if (newMaterialID && newMaterialID > 0 && !this.$store.getters['Panels/isMaterialInPanel'](newMaterialID)) {
        this.$store.commit('materials/removeMaterial', newMaterialID);
      }
      this.$store.dispatch('Panels/refreshPaletteIndexes');
    },
  },
  destroyed() {
    this.storeActionWatcher();
  },
};
</script>
<style>
</style>
