<template>
  <div v-if="selectedObject3D">
    <div class="wrapper-name-panel">
      <div v-bind:class="[`round-icon-2 ${enableCreateDrill ? '' : 'medium-emphasis'} createbtn`]" @click="createDrill()" title="Create Drill">
        <img src="../../../../assets/images/CreateDrill.png" alt="" width="24" height="24" :style="`vertical-align: sub; opacity: ${enableCreateDrill ? 0.7 : 0.5};`" />
      </div>
    </div>
    <div v-if="enableCreateDrill" style="width: 90%; margin: auto;">
      <label style="color: darkgray; text-align: -webkit-center;">Click on the panel at the location you want to drill</label>
    </div>
    <div v-if="selectedDrillIndex > -1">
      <div class="title-menu-left"><h2 class="heading-menu">Drill</h2></div>
      <div class="content-menu-left">
        <div class="wrapper-bottom-margin">
          <div style="display: flex; align-items: center; width: 50%; margin: auto; margin-left: 55px;">
            <input v-if="positionView.up === 'x'" class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="x" @keydown="applyX" @blur="applyX"/>
            <input v-else-if="positionView.up === 'y'" class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="y" @keydown="applyY" @blur="applyY"/>
            <input v-else class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="z" @keydown="applyZ" @blur="applyZ"/>
            <label style="font-weight: normal; margin: auto;">mm</label>
          </div>
          <div style="display: flex; align-items: center; width: 70%; margin-left: auto;">
            <img src="../../../../assets/images/DrillXY.png" alt="" height="64px" style="vertical-align: sub; opacity: 0.8;" />
            <input v-if="positionView.right === 'x'" class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="x" @keydown="applyX" @blur="applyX"/>
            <input v-else-if="positionView.right === 'y'" class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="y" @keydown="applyY" @blur="applyY"/>
            <input v-else class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;"
                   v-model.number="z" @keydown="applyZ" @blur="applyZ"/>
            <label style="font-weight: normal; margin: auto;">mm</label>
          </div>
        </div>
        <div v-if="wt !== 'HH'" class="flexbox-menu-left wrapper-bottom-margin">
          <div :class="{ 'children-orientation' : true, selected: di > 0}" @click="changeDrillShape('round')">
            <svg aria-hidden="true" focusable="false" width="3.5em" height="3.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                 preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16">
              <g fill="#444444"><circle cx="8" cy="8" r="8"/></g>
            </svg>
          </div>
          <div :class="{ 'children-orientation' : true, selected: !di || di === 0}" @click="changeDrillShape('rect')">
            <svg aria-hidden="true" focusable="false" width="3.5em" height="3.7em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                 preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
              <rect width="24" height="24" x="0" y="0" class="uim-primary" rx="5" fill="#444444"/>
            </svg>
          </div>
        </div>
        <div v-if="di > 0" class="wrapper-position wrapper-bottom-margin">
          <label class="inline-block normal attribute wrapper-margin-tbauto">
            <img src="../../../../assets/images/DrillDI.png" alt="" height="45px" style="vertical-align: sub; opacity: 0.8;" />
          </label>
          <div class="diameter wrapper-margin-tbauto">
            <select class="dimension-select w-select diameter-select" v-model.number="di" :style="`color: ${isChromeBrowser ? '#000000' : 'transparent'};`">
              <option v-for="(diameter, index) in diameterList" :key="`list${index}`" :value="diameter" style="color: #000000;">{{diameter}} mm</option>
            </select>
            <input v-if="wt !== 'HH'" class="diameter-input" type="text" name="format" v-model.number="inputDI" :style="`background-color: ${isChromeBrowser ? '#f3f3f3' : 'transparent'};`"
              @keydown="applyDI" @blur="applyDI" :readonly="!this[`${wt.toLowerCase()}DiFreeRange`]" />
          </div>
        </div>
        <div v-else class="wrapper-bottom-margin">
          <div style="display: flex; align-items: center; width: 50%; margin: auto; margin-left: 55px;">
            <input class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;" v-model.number="sx" @keydown="applySX" @blur="applySX"/>
            <label style="font-weight: normal; margin: auto;">mm</label>
          </div>
          <div style="display: flex; align-items: center; width: 70%; margin-left: auto;">
            <img src="../../../../assets/images/DrillSXY.png" alt="" height="64px" style="vertical-align: sub; opacity: 0.8;" />
            <input class="dimension-box position w-input" style="margin-bottom: auto; margin-top: auto;" v-model.number="sy" @keydown="applySY" @blur="applySY"/>
            <label style="font-weight: normal; margin: auto;">mm</label>
          </div>
        </div>
        <div v-if="isTypeVisible" class="flexbox-menu-left wrapper-bottom-margin">
          <div :class="{ 'children-orientation' : true, selected: wt === 'H'}" @click="wt = 'H';">
            <img src="../../../../assets/images/DrillH.png" alt="" style="vertical-align: sub; opacity: 0.8;" />
          </div>
          <div :class="{ 'children-orientation' : true, selected: wt === 'HT'}" @click="wt = 'HT';">
            <img src="../../../../assets/images/DrillHT.png" alt="" style="vertical-align: sub; opacity: 0.8;" />
          </div>
        </div>
        <div v-if="isSideVisible" class="flexbox-menu-left wrapper-bottom-margin">
          <div :class="{ 'children-orientation' : true, selected: sd === 1}" @click="sd = 1;">
            <img src="../../../../assets/images/DrillSD1.png" alt="" style="vertical-align: sub; opacity: 0.8;" />
          </div>
          <div :class="{ 'children-orientation' : true, selected: sd === 2}" @click="sd = 2;">
            <img src="../../../../assets/images/DrillSD2.png" alt="" style="vertical-align: sub; opacity: 0.8;" />
          </div>
        </div>
        <div v-if="isDepthVisible" class="wrapper-position wrapper-bottom-margin">
          <label class="inline-block normal attribute wrapper-margin-tbauto">
            <img v-if="wt === 'HH'" src="../../../../assets/images/DrillHHDP.png" alt="" height="45px" style="vertical-align: sub; opacity: 0.8;" />
            <img v-else src="../../../../assets/images/DrillHDP.png" alt="" height="45px" style="vertical-align: sub; opacity: 0.8;" />
          </label>
          <input class="dimension-box position w-input wrapper-margin-tbauto" v-model.number="dp" @keydown="applyDP" @blur="applyDP"/>
          <label style="font-weight: normal; margin: auto;">mm</label>
        </div>
        <div v-if="isDirectionVisible" class="wrapper-position wrapper-bottom-margin">
          <label class="inline-block normal attribute">Direction:</label>
          <select class="dimension-select w-select" v-model="dir">
            <option :value="'XM'">XM</option>
            <option :value="'XP'">XP</option>
            <option :value="'YP'">YP</option>
            <option :value="'YM'">YM</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: center;">
        <div v-bind:class="[`round-icon-2 medium-emphasis red ${isRemovable ? '' : 'disabled'}`]" style="border: none;"
          @click="isRemovable ? deleteDrill() : null" title="Delete Drill">
          <em class="el-icon-delete" style="font-size: 25px;"/>
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
      if (this.selectedObject3D.object3d.isShapeVertex) return -1;
      if (this.selectedObject3D.object3d.name.includes('_SHAPE')) return -1;
      const { name } = this.selectedObject3D.object3d;
      const drillIndex = Number(name.split('_')[2]);
      return Number(drillIndex);
    },
    isRemovable() {
      return this.selectedDrillIndex !== -1;
    },
    positionView() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return null;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const panel = window.panels[id];
      const work = panel.works[drillIndex];

      if (work.wt !== 'HH') return { up: 'x', right: 'y' };

      if (panel.ptype === 'FP') {
        if (work.dir === 'XM' || work.dir === 'XP') return { up: 'y', right: 'z' };
        return { up: 'x', right: 'z' };
      }
      if (panel.ptype === 'VP') {
        if (work.dir === 'XM' || work.dir === 'XP') return { up: 'z', right: 'y' };
        return { up: 'x', right: 'z' };
      }
      if (panel.ptype === 'VDP') {
        if (work.dir === 'XM' || work.dir === 'XP') return { up: 'z', right: 'y' };
        return { up: 'z', right: 'x' };
      }

      return null;
    },
    isPositionVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return { x: false, y: false, z: false };

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
      if (drillIndex === -1) return false;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const work = window.panels[id].works[drillIndex];
      if (!work.di || work.di === 0) return false;
      return work.wt !== 'HT';
    },
    isTypeVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return false;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const work = window.panels[id].works[drillIndex];
      if (work.wt === 'HH') return false;
      if (!work.di || work.di === 0) return false;
      return true;
    },
    isSideVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return false;

      const id = this.selectedObject3D.object3d.name.split('_')[0];
      const work = window.panels[id].works[drillIndex];
      if (!work.di || work.di === 0) return false;
      return work.wt === 'H';
    },
    isDirectionVisible() {
      const drillIndex = this.selectedDrillIndex;
      if (drillIndex === -1) return false;

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
    isChromeBrowser() {
      return navigator.appVersion.toLowerCase().includes('chrome');
    },
  },
  methods: {
    applyX(event) {
      if (event.type === 'blur' || event.key === 'Enter') {
        this.position = { ...this.position, x: this.posX };
      }
    },
    applyY(event) {
      if (event.type === 'blur' || event.key === 'Enter') {
        this.position = { ...this.position, y: this.posY };
      }
    },
    applyZ(event) {
      if (event.type === 'blur' || event.key === 'Enter') {
        this.position = { ...this.position, z: this.posZ };
      }
    },
    applySX(event) {
      if (event.type === 'blur' || event.key === 'Enter') {
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
      if (event.type === 'blur' || event.key === 'Enter') {
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
      if (event.type === 'blur' || event.key === 'Enter') {
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
            works[drillIndex].sd = 1;
            works[drillIndex].wt = 'HT';
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
    outline: none;
    margin-top: 2px;
    margin-left: 10px;
  }
  .wrapper-bottom-margin {
    border-bottom: solid 1px lightgray;
    padding: 10px;
  }
  .wrapper-margin-tbauto {
    margin-top: auto;
    margin-bottom: auto;
  }
</style>
