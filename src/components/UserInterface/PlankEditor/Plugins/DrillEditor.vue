<template>
  <div v-if="selectedObject3D">
    <div class="wrapper-name-panel">
      <div>Planche n°{{ selectedObject3D.object3d.name.split('_')[0] }}</div>
      <div v-bind:class="[`round-icon-2${enableCreateDrill ? '' : ' medium-emphasis'}`]" @click="createDrill()" title="Create Drill">
        <svg aria-hidden="true" focusable="false" width="1.2em" height="1.3em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
             preserveAspectRatio="xMidYMid meet" viewBox="3 2 20 20">
          <circle cx="11" cy="13" r="3" :fill="`${enableCreateDrill ? '#ffffff' : '#aaaaaa'}`" />
          <path d="M19 5h3v2h-3v3h-2V7h-3V5h3V2h2v3m-2 14v-6h2v8H3V5h8v2H5v12h12z" :fill="`${enableCreateDrill ? '#ffffff' : '#aaaaaa'}`" />
        </svg>
      </div>
      <div v-bind:class="[`round-icon-2 medium-emphasis red ${isRemovable ? '' : 'disabled'}`]" @click="isRemovable ? deleteDrill() : null" title="Delete Drill">
        <svg aria-hidden="true" focusable="false" width="1.2em" height="1.3em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
             preserveAspectRatio="xMidYMid meet" viewBox="2 2 20 20">
          <path d="m16.981,7.0673l0.0119,5.92826l2,0l0,-7.98119l-16,0l0,15.96237l8,0l0,-1.9953l-6,0l0,-11.97177" :fill="`${isRemovable ? '#aaaaaa' : '#ffffff'}`" />
          <circle cx="11" cy="13" r="3" :fill="`${isRemovable ? '#aaaaaa' : '#ffffff'}`" />
          <path d="m19.44341,20.18835l3,0l0,-1.99529l-3,0l0,-2.99295l-2,0l0,2.99295l-3,0l0,1.99529l3,0l0,2.99295l2,0l0,-2.99295m-8,0"
                transform="rotate(45 16.94340896606446,19.190700531005856) " :fill="`${isRemovable ? '#aaaaaa' : '#ffffff'}`" />
        </svg>
      </div>
    </div>
    <div>
      <div class="title-menu-left"><h2 class="heading-menu">Drill</h2></div>
      <div class="content-menu-left">
        <div class="wrapper-position">
          <label class="inline-block normal attribute">Position:</label>
          <div class="wrapper-position">
            <label v-if="isPositionVisible.x" class="inline-block normal label">X:</label>
            <input v-if="isPositionVisible.x" class="dimension-box position w-input" v-model.number="x" @keydown="applyX"/>
            <label v-if="isPositionVisible.y" class="inline-block normal label">Y:</label>
            <input v-if="isPositionVisible.y" class="dimension-box position w-input" v-model.number="y" @keydown="applyY"/>
            <label v-if="isPositionVisible.z" class="inline-block normal label">Z:</label>
            <input v-if="isPositionVisible.z" class="dimension-box position w-input" v-model.number="z" @keydown="applyZ"/>
          </div>
        </div>
        <div v-if="di > 0" class="wrapper-position">
          <label class="inline-block normal attribute">Diameter:</label>
          <div class="diameter">
            <select class="dimension-select w-select diameter-select" v-model.number="di">
              <option v-for="(diameter, index) in diameterList" :key="`list${index}`" :value="diameter">{{diameter}} mm</option>
            </select>
            <input class="diameter-input" type="text" name="format" v-model.number="inputDI" @keydown="applyDI" @blur="applyDI" :readonly="!this[`${wt.toLowerCase()}DiFreeRange`]" />
          </div>
        </div>
        <div v-else class="wrapper-position">
          <label class="inline-block normal attribute">Size:</label>
          <div class="wrapper-position">
            <label class="inline-block normal label">SX:</label>
            <input class="dimension-box position w-input" v-model.number="sx" @keydown="applySX"/>
            <label class="inline-block normal label">SY:</label>
            <input class="dimension-box position w-input" v-model.number="sy" @keydown="applySY"/>
          </div>
        </div>
        <div v-if="isDepthVisible" class="wrapper-position">
          <label class="inline-block normal attribute">Depth:</label>
          <input class="dimension-box position w-input" v-model.number="dp" @keydown="applyDP"/>
        </div>
        <div class="wrapper-position">
          <label class="inline-block normal attribute">Type:</label>
          <select class="dimension-select w-select" v-model="wt">
            <option :value="'H'">H</option>
            <option v-if="di > 0" :value="'HH'">HH</option>
            <option :value="'HT'">HT</option>
          </select>
        </div>
        <div v-if="isSideVisible" class="wrapper-position">
          <label class="inline-block normal attribute">Side:</label>
          <select class="dimension-select w-select" v-model="sd">
            <option :value="1">PSide</option>
            <option :value="2">MSide</option>
          </select>
        </div>
        <div v-if="isDirectionVisible" class="wrapper-position">
          <label class="inline-block normal attribute">Direction:</label>
          <select class="dimension-select w-select" v-model="dir">
            <option :value="'XM'">XM</option>
            <option :value="'XP'">XP</option>
            <option :value="'YP'">YP</option>
            <option :value="'YM'">YM</option>
          </select>
        </div>
        <div v-if="wt !== 'HH'" class="flexbox-menu-left">
          <div :class="{ 'children-orientation' : true, selected: di > 0}" @click="changeDrillShape('round')">
            <svg aria-hidden="true" focusable="false" width="3.5em" height="3.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                 preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16">
              <g fill="#626262"><circle cx="8" cy="8" r="8"/></g>
            </svg>
          </div>
          <div :class="{ 'children-orientation' : true, selected: di === 0}" @click="changeDrillShape('rect')">
            <svg aria-hidden="true" focusable="false" width="3.5em" height="3.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                 preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
              <rect width="24" height="24" x="0" y="0" class="uim-primary" rx="5" fill="#626262"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'DrillEditor',
  data() {
    return {
      posX: 0,
      posY: 0,
      posZ: 0,
      sizeX: 0,
      sizeY: 0,
      drillDepth: 0,
      drillDI: 0,
    };
  },
  computed: {
    ...mapState('Panels', [
      'panels',
      'enableCreateDrill',
      'hDiameters',
      'hhDiameters',
      'htDiameters',
      'hDiFreeRange',
      'htDiFreeRange',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    selectedDrillIndex() {
      if (!this.selectedObject3D) return -1;
      if (this.selectedObject3D.object3d.isPanel) return -1;
      const { name } = this.selectedObject3D.object3d;
      const drillIndex = Number(name.split('_')[2]);
      return Number(drillIndex);
    },
    isRemovable() {
      return this.selectedDrillIndex !== -1;
    },
    isPositionVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return { x: true, y: true, z: false };

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const work = window.panels[id].works[drillIndex];
      return {
        x: work.wt !== 'HH' || (work.wt === 'HH' && work.dir.includes('Y')),
        y: work.wt !== 'HH' || (work.wt === 'HH' && work.dir.includes('X')),
        z: work.wt === 'HH',
      };
    },
    diameterList() {
      if (this[`${this.wt.toLowerCase()}Diameters`].includes(this.di)) return this[`${this.wt.toLowerCase()}Diameters`];
      return [...this[`${this.wt.toLowerCase()}Diameters`], this.di];
    },
    isDepthVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return true;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      return window.panels[id].works[drillIndex].wt !== 'HT';
    },
    isSideVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return true;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      return window.panels[id].works[drillIndex].wt === 'H';
    },
    isDirectionVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return true;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      return window.panels[id].works[drillIndex].wt === 'HH';
    },
    position: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const { x, y, z } = window.panels[id].works[drillIndex];
          return { x, y, z };
        }
        return { x: 0, y: 0, z: 0 };
      },
      set({ x, y, z }) {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];

          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));
          works[drillIndex] = {
            ...works[drillIndex],
            x,
            y,
            z,
          };
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      },
    },
    x: {
      get() { return Math.round(this.position.x * 10) / 10; },
      set(val) { this.posX = parseFloat(val) || 0; },
    },
    y: {
      get() { return Math.round(this.position.y * 10) / 10; },
      set(val) { this.posY = parseFloat(val) || 0; },
    },
    z: {
      get() { return Math.round(this.position.z * 10) / 10; },
      set(val) { this.posZ = parseFloat(val) || 0; },
    },
    di: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].di;
        }
        return this[`${this.wt.toLowerCase()}Diameters`][0];
      },
      set(val) {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          works[drillIndex].di = Math.max(1, parseFloat(val) || 1);
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      },
    },
    inputDI: {
      get() { return this.di; },
      set(val) { this.drillDI = val; },
    },
    sx: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].sx;
        }
        return 0;
      },
      set(val) { this.sizeX = parseFloat(val) || 15; },
    },
    sy: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].sy;
        }
        return 0;
      },
      set(val) { this.sizeY = parseFloat(val) || 15; },
    },
    dp: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].dp;
        }
        return 0;
      },
      set(val) { this.drillDepth = parseFloat(val) || 0; },
    },
    wt: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].wt;
        }
        return 'H';
      },
      set(val) {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const panel = window.panels[id];
          const works = panel.works.slice(0).map(work => ({ ...work }));
          const { width, height, depth } = panel.dimensionsByType;
          let sideWidth = 0;
          let sideHeight = 0;
          let dir = 'XP';
          let offset = 0;

          if (panel.ptype === 'FP') {
            sideWidth = width / 10;
            sideHeight = depth / 10;
          } else if (panel.ptype === 'VP') {
            sideWidth = width / 10;
            sideHeight = height / 10;
          } else if (panel.ptype === 'VDP') {
            sideWidth = depth / 10;
            sideHeight = height / 10;
          }

          if (val === 'HH') {
            offset = works[drillIndex].x;
            if (sideWidth - works[drillIndex].x < offset) {
              dir = 'XM';
              offset = sideWidth - works[drillIndex].x;
            }
            if (works[drillIndex].y < offset) {
              dir = 'YP';
              offset = works[drillIndex].y;
            }
            if (sideHeight - works[drillIndex].y < offset) {
              dir = 'YM';
            }
            works[drillIndex].sd = null;
          } else {
            works[drillIndex].sd = 1;
            dir = null;
          }

          if (works[drillIndex].di) {
            if (val === 'H' && !this.hDiameters.includes(works[drillIndex].di)) [works[drillIndex].di] = this.hDiameters;
            else if (val === 'HH' && !this.hhDiameters.includes(works[drillIndex].di)) [works[drillIndex].di] = this.hhDiameters;
            else if (val === 'HT' && !this.htDiameters.includes(works[drillIndex].di)) [works[drillIndex].di] = this.htDiameters;
          }

          works[drillIndex].z = 0;
          works[drillIndex].dir = dir;
          works[drillIndex].wt = val;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      },
    },
    sd: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];

          const { works } = window.panels[id];
          return works[drillIndex].sd;
        }
        return 1;
      },
      set(val) {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          works[drillIndex].sd = val;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      },
    },
    dir: {
      get() {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          return window.panels[id].works[drillIndex].dir;
        }
        return 'XM';
      },
      set(val) {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          works[drillIndex].dir = val;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      },
    },
  },
  methods: {
    applyX(event) {
      if (event.key === 'Enter') {
        this.position = { ...this.position, x: this.posX };
      }
    },
    applyY(event) {
      if (event.key === 'Enter') {
        this.position = { ...this.position, y: this.posY };
      }
    },
    applyZ(event) {
      if (event.key === 'Enter') {
        this.position = { ...this.position, z: this.posZ };
      }
    },
    applySX(event) {
      if (event.key === 'Enter') {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          works[drillIndex].sx = this.sizeX;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      }
    },
    applySY(event) {
      if (event.key === 'Enter') {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          works[drillIndex].sy = this.sizeY;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      }
    },
    applyDP(event) {
      if (event.key === 'Enter') {
        const drillIndex = this.selectedDrillIndex;
        if (drillIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];
          const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

          if (works[drillIndex].wt === 'H') works[drillIndex].dp = Math.max(2, Math.min(window.panels[id].thick - 2, this.drillDepth));
          else works[drillIndex].dp = this.drillDepth;
          window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
          EventBus.$emit('save');
        }
      }
    },
    applyDI(event) {
      if (event.type === 'blur' || event.key === 'Enter') { this.di = this.drillDI; }
    },
    changeDrillShape(type) {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex >= 0) {
        const id = this.selectedObject3D.object3d.name.split('_')[0];
        const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

        if (type === 'round') {
          if (!works[drillIndex].di) {
            works[drillIndex].di = Math.min(works[drillIndex].sx, works[drillIndex].sy);
            works[drillIndex].sx = 0;
            works[drillIndex].sy = 0;
          }
        } else if (type === 'rect') {
          if (works[drillIndex].di) {
            works[drillIndex].sx = works[drillIndex].di;
            works[drillIndex].sy = works[drillIndex].di;
            works[drillIndex].di = 0;
          }
        }

        window.panels[id].$refs.drills.recalcDrillPos(works, drillIndex);
        EventBus.$emit('save');
      }
    },
    createDrill() {
      this.$store.commit('Panels/enableCreateDrill', !this.enableCreateDrill);
    },
    deleteDrill() {
      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const works = window.panels[id].works.slice(0).map(work => ({ ...work }));

      works.splice(this.selectedDrillIndex, 1);
      window.panels[id].$refs.drills.recalcDrillPos(works, -1);
      EventBus.$emit('save');

      this.$store.commit('Camera/selectObject3D', {
        object3d: {
          ...window.panels[id],
          name: window.panels[id].id,
          isPanel: true,
        },
      });
    },
    calcPlankPosAndSize(id, plankPoints) {
      let points = plankPoints;

      const minX = Math.min(...points.map(p => p[0]));
      const minY = Math.min(...points.map(p => p[1]));
      const maxX = Math.max(...points.map(p => p[0]));
      const maxY = Math.max(...points.map(p => p[1]));
      const width = (maxX - minX) * 10;
      const height = (maxY - minY) * 10;
      points = points.map(p => ([p[0] - minX, p[1] - minY]));

      window.panels[id].shapePoints = points;
      if (window.panels[id].ptype === 'FP') {
        window.panels[id].dimensionsByType = {
          width: height,
          height: window.panels[id].dimensionsByType.height,
          depth: width,
        };
        window.panels[id].fixedPosition = {
          x: window.panels[id].fixedPosition.x + minY * 10,
          y: window.panels[id].fixedPosition.y,
          z: window.panels[id].fixedPosition.z + minX * 10,
        };
      } else if (window.panels[id].ptype === 'VP') {
        window.panels[id].dimensionsByType = {
          width,
          height,
          depth: window.panels[id].dimensionsByType.depth,
        };
        window.panels[id].fixedPosition = {
          x: window.panels[id].fixedPosition.x + minX * 10,
          y: window.panels[id].fixedPosition.y + minY * 10,
          z: window.panels[id].fixedPosition.z,
        };
      } else if (window.panels[id].ptype === 'VDP') {
        window.panels[id].dimensionsByType = {
          width: window.panels[id].dimensionsByType.width,
          height,
          depth: width,
        };
        window.panels[id].fixedPosition = {
          x: window.panels[id].fixedPosition.x,
          y: window.panels[id].fixedPosition.y + minY * 10,
          z: window.panels[id].fixedPosition.z + minX * 10,
        };
      }
    },
  },
};
</script>
<style scoped>
  input {
    width: 100% !important;
    margin-left: 0px;
    margin-right: 0px;
  }
  .label {
    margin-left: 5px;
  }
  .attribute {
    font-size: 16px;
    font-weight: 600 !important;
    width: 120px;
  }
  .diameter {
    position: relative;
    width: 100%;
    height: 38px;
    display: block;
    margin-bottom: 10px;
  }
  .diameter-select {
    position: absolute;
  }
  .diameter-input {
    position: absolute;
    border: none;
    width: 80% !important;
    height: 34px;
    background-color: #f3f3f3;
    outline: none;
    margin-top: 2px;
    margin-left: 10px;
  }
</style>
