<template>
  <div v-if="selectedObject3D">
    <div class="wrapper-name-panel">
      <div>Planche n°{{ selectedObject3D.object3d.name.split('_')[0] }}</div>
      <div v-bind:class="[`round-icon-2${enableCreatePoint ? '' : ' medium-emphasis'}`]" @click="createPoint()">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false"
            width="1.2em" height="1.3em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
            preserveAspectRatio="xMidYMid meet" viewBox="3 1 20 20">
          <path d="M17 15.7V13h2v4l-9 4l-7-7l4-9h4v2H8.3l-2.9 6.6l5 5l6.6-2.9M22 5v2h-3v3h-2V7h-3V5h3V2h2v3h3z" :fill="`${enableCreatePoint ? '#ffffff' : '#aaaaaa'}`"/>
        </svg>
      </div>
      <div v-bind:class="[`round-icon-2 medium-emphasis red ${isRemovable ? '' : 'disabled'}`]" @click="isRemovable ? deletePoint() : null" >
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false"
            width="1em" height="1.3em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
            preserveAspectRatio="xMidYMid meet" viewBox="2 1 20 20">
          <path d="M21.1 15.5L19 17.6l-2.1-2.1l-1.4 1.4l2.1 2.1l-2.1 2.1l1.4 1.4l2.1-2.1l2.1 2.1l1.4-1.4l-2.1-2.1l2.1-2.1l-1.4-1.4M16
                  5v4.6L10.6 15H9.1l-2-6H8V3H2v6h3l2 6H6v6h6v-4.6l5.4-5.4H22V5h-6M6 7H4V5h2v2m4 12H8v-2h2v2M20 9h-2V7h2v2"
                  :fill="`${isRemovable ? '#aaaaaa' : '#ffffff'}`"/>
        </svg>
      </div>
    </div>
    <div>
      <div class="title-menu-left"><h2 class="heading-menu">Point</h2></div>
      <div class="content-menu-left">
        <div class="wrapper-position">
          <label class="inline-block normal attribute">Position:</label>
          <label class="inline-block normal ml-1">X:</label>
          <input class="dimension-box position w-input" v-model.number="x" @keydown="applyX"/>
          <label class="inline-block normal">Y:</label>
          <input class="dimension-box position w-input" v-model.number="y" @keydown="applyY"/>
        </div>
      </div>
      <div class="content-menu-left">
        <div class="wrapper-position">
          <label class="inline-block normal attribute">Angle:</label>
          <label class="position angle ml-2">{{angle}}°</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Vector2 } from 'three';
import { mapState } from 'vuex';

export default {
  name: 'ShapeEditor',
  computed: {
    ...mapState('Panels', [
      'panels',
      'enableCreatePoint',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    data() {
      return {
        posX: 0,
        posY: 0,
      };
    },
    selectedPointIndex() {
      if (!this.selectedObject3D) return -1;
      if (this.selectedObject3D.object3d.isPanel) return -1;
      const { name } = this.selectedObject3D.object3d;
      const pointIndex = Number(name.split('SHAPE')[1].split('M')[0]);
      return Number(pointIndex);
    },
    isRemovable() {
      if (this.selectedPointIndex === -1) return false;
      if (window.panels[this.selectedObject3D.object3d.name.split('_')[0]].shapePoints.length === 3) return false;
      return true;
    },
    angle() {
      if (this.selectedPointIndex >= 0) {
        const points = window.panels[this.selectedObject3D.object3d.name.split('_')[0]].shapePoints;
        const pointIndex = this.selectedPointIndex;
        const prevIndex = (pointIndex - 1 + points.length) % points.length;
        const nextIndex = (pointIndex + 1) % points.length;
        const prevVect = new Vector2(points[prevIndex][0] - points[pointIndex][0], points[prevIndex][1] - points[pointIndex][1]);
        const nextVect = new Vector2(points[nextIndex][0] - points[pointIndex][0], points[nextIndex][1] - points[pointIndex][1]);
        return Math.round((((prevVect.angle() - nextVect.angle()) / Math.PI * 180 + 360) % 360) * 100) / 100;
      }
      return 0;
    },
    position: {
      get() {
        if (this.selectedPointIndex >= 0) {
          const { points } = window.panels[this.selectedObject3D.object3d.name.split('_')[0]];
          const pointIndex = this.selectedPointIndex;
          const [x, y] = points[pointIndex];
          return { x, y };
        }
        return { x: 0, y: 0 };
      },
      set({ x, y }) {
        if (this.selectedPointIndex >= 0) {
          const id = this.selectedObject3D.object3d.name.split('_')[0];

          const { points } = window.panels[id];
          const pointIndex = this.selectedPointIndex;
          points[pointIndex] = [x, y];

          this.calcPlankPosAndSize(id, points);
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
  },
  methods: {
    modify(key, event) {
      const { x, y, z } = { ...this.pos, [key]: event.target.value };
      this.$emit('update:pos', [x, y, z]);
    },
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
    createPoint() {
      this.$store.commit('Panels/enableCreatePoint', !this.enableCreatePoint);
    },
    deletePoint() {
      const id = this.selectedObject3D.object3d.name.split('_')[0];

      const points = Array.from(window.panels[id].shapePoints);
      const edges = Array.from(window.panels[id].edges.split('-'));
      points.splice(this.selectedPointIndex, 1);
      edges.splice(this.selectedPointIndex, 1);
      window.panels[id].edges = edges.join('-');
      this.$store.commit('Camera/selectObject3D', {
        object3d: {
          ...window.panels[id],
          name: window.panels[id].id,
          isPanel: true,
        },
      });

      this.calcPlankPosAndSize(id, points);
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
    width: 60px;
  }
  .attribute {
    font-size: 16px;
    font-weight: 600 !important;
  }
  .content-center {
    place-content: center;
  }
  .angle {
    text-align: center;
  }
  .ml-1 {
    margin-left: 1.0em !important;
  }
  .ml-2 {
    margin-left: 2.0em !important;
  }
</style>
