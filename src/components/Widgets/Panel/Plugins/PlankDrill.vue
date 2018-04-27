<template>
  <div>
    <div v-for="(work, index) in works" :key="`${plankID}_drill_key_${index}`">
      <vgl-cylinder-geometry :name="`${plankID}_drill_${index}_geometry`" v-bind="drillDimensions[index]"/>
      <vgl-mesh :geometry="`${plankID}_drill_${index}_geometry`"
                ref="drills"
                material="drill"
                :position="drillPositions[index]"
                :rotation="drillRotations[index]"
                :name="`${plankID}_drill_${index}`" />
      <DrillCoordinate v-if="showCoordinateArrows(`${plankID}_drill_${index}`)"
        :drill-name="`${plankID}_drill_${index}`"
        :plank-position="plankPosition"
        :plank-dimension="plankDimension"
        :plank-type="plankType"
        :drill-position="drillPositions[index]"
        :work="work"
        :works.sync="drillWorks"
        :recalcDrillPos="recalcDrillPos" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DrillCoordinate from './DrillCoordinate';

export default {
  name: 'PlankDrill',
  components: {
    DrillCoordinate,
  },
  props: {
    plankID: {
      type: String,
      required: true,
    },
    plankPosition: {
      type: Object,
      required: true,
    },
    plankDimension: {
      type: Object,
      required: true,
    },
    plankType: {
      type: String,
      required: true,
    },
    connections: {
      // connections related to current panel
      type: Array,
      default: () => [],
    },
    works: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      radialSegments: 20,
      drillOffset: 2,
    };
  },
  mounted() {
    this.setAsPlankDrill();
  },
  updated() {
    this.setAsPlankDrill();
  },
  computed: {
    ...mapState('Panels', [
      'enableDrillEdit',
      'moveDirection',
      'prevPosition',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    drillWorks: {
      get() { return this.works; },
      set(val) { this.$emit('update:works', val); },
    },
    drillPositions() {
      let { x, y } = this.plankPosition;
      const z = this.plankPosition.z + this.plankDimension.depth;
      const pos = this.works.map(work => {
        let posX = (work.x || 0) * 10;
        let posY = (work.y || 0) * 10;
        let posZ = (work.z || 0) * 10;
        if (work.wt === 'H') {
          const sign = this.plankType === 'VP' ? -1 : 1;
          if (work.sd === 1) posZ += work.dp * 5 * sign;
          else posZ -= work.dp * 5 * sign;
        } else if (work.wt === 'HH') {
          if (work.dir === 'XP') posX += work.dp * 5;
          else if (work.dir === 'XM') posX -= work.dp * 5;
          else if (work.dir === 'YP') posY += work.dp * 5;
          else if (work.dir === 'YM') posY -= work.dp * 5;
        }
        return {
          x: posX,
          y: posY,
          z: posZ,
        };
      });
      const { width, height, depth } = this.plankDimension;

      switch (this.plankType) {
        case 'FP':
          y += height;
          return this.works.map((work, index) => {
            const workX = x + pos[index].x;
            const workY = work.wt === 'HT' ? y - height / 2 : (y - pos[index].z - (work.sd === 2 ? height : 0));
            const workZ = z - pos[index].y;
            return `${workX} ${workY} ${workZ}`;
          });
        case 'VP':
          return this.works.map((work, index) => {
            const workX = x + pos[index].x;
            const workY = y + pos[index].y;
            const workZ = work.wt === 'HT' ? z - depth / 2 : (z - pos[index].z - (work.sd === 1 ? depth : 0));
            return `${workX} ${workY} ${workZ}`;
          });
        case 'VDP':
          x += width;
          return this.works.map((work, index) => {
            const workX = work.wt === 'HT' ? x - width / 2 : (x - pos[index].z - (work.sd === 2 ? width : 0));
            const workY = y + pos[index].y;
            const workZ = z - pos[index].x;
            return `${workX} ${workY} ${workZ}`;
          });
        default:
          return [];
      }
    },
    drillRotations() {
      const rightAngle = Math.PI / 2;
      switch (this.plankType) {
        case 'FP':
          return this.works.map(work => {
            if (work.wt === 'H' || work.wt === 'HT') return `${0} ${0} ${0}`;
            if (work.wt === 'HH') {
              if (work.dir.includes('X')) return `${0} ${0} ${rightAngle}`;
              if (work.dir.includes('Y')) return `${rightAngle} ${0} ${0}`;
            }
            return `${0} ${0} ${0}`;
          });
        case 'VP':
          return this.works.map(work => {
            if (work.wt === 'H' || work.wt === 'HT') return `${rightAngle} ${0} ${0}`;
            if (work.wt === 'HH') {
              if (work.dir.includes('X')) return `${0} ${0} ${rightAngle}`;
              if (work.dir.includes('Y')) return `${0} ${0} ${0}`;
            }
            return `${rightAngle} ${0} ${0}`;
          });
        case 'VDP':
          return this.works.map(work => {
            if (work.wt === 'H' || work.wt === 'HT') return `${0} ${0} ${rightAngle}`;
            if (work.wt === 'HH') {
              if (work.dir.includes('X')) return `${rightAngle} ${0} ${0}`;
              if (work.dir.includes('Y')) return `${0} ${0} ${0}`;
            }
            return `${0} ${0} ${rightAngle}`;
          });
        default:
          return [];
      }
    },
    drillDimensions() {
      let thick = 0;
      if (this.plankType === 'FP') thick = this.plankDimension.height;
      if (this.plankType === 'VP') thick = this.plankDimension.depth;
      if (this.plankType === 'VDP') thick = this.plankDimension.width;

      return this.works.map(work => ({
        radiusTop: work.di * 5,
        radiusBottom: work.di * 5,
        height: work.wt === 'HT' ? thick + 6 : work.dp * 10 + 3,
        radialSegments: this.radialSegments,
      }));
    },
  },
  methods: {
    setAsPlankDrill() {
      const { drills } = this.$refs;
      if (drills == null) return;
      for (let i = 0; i < drills.length; i += 1) {
        drills[i].inst.isDrillGeometry = true;
      }
    },
    showCoordinateArrows(name) {
      if (!this.enableDrillEdit || !this.selectedObject3D || !this.selectedObject3D.object3d.name.includes('drill')) return false;
      if (!this.selectedObject3D.object3d.name.includes(name)) return false;
      return true;
    },
    createDrill(point) {
      const works = this.works.slice(0).map(work => ({ ...work }));
      const { width, height, depth } = this.plankDimension;
      const { plankPosition } = this;
      let x = 0;
      let y = 0;
      let z = 0;
      let sideWidth = 0;
      let sideHeight = 0;
      let sideDepth = 0;
      let dir = null;
      let sd = this.plankType === 'VP' ? 2 : 1;

      if (this.plankType === 'FP') {
        x = (point.x - plankPosition.x) / 10;
        y = (plankPosition.z + depth - point.z) / 10;
        z = (plankPosition.y + height - point.y) / 10;
        sideWidth = width / 10;
        sideHeight = depth / 10;
        sideDepth = height / 10;
      } else if (this.plankType === 'VP') {
        x = (point.x - plankPosition.x) / 10;
        y = (point.y - plankPosition.y) / 10;
        z = (plankPosition.z + depth - point.z) / 10;
        sideWidth = width / 10;
        sideHeight = height / 10;
        sideDepth = depth / 10;
      } else if (this.plankType === 'VDP') {
        x = (plankPosition.z + depth - point.z) / 10;
        y = (point.y - plankPosition.y) / 10;
        z = (plankPosition.x + width - point.x) / 10;
        sideWidth = depth / 10;
        sideHeight = height / 10;
        sideDepth = width / 10;
      }

      x = Math.round(x * 10) / 10;
      y = Math.round(y * 10) / 10;
      z = Math.round(z * 10) / 10;
      if (x <= 0) dir = 'XP';
      else if (x >= sideWidth) dir = 'XM';
      else if (y <= 0) dir = 'YP';
      else if (y >= sideHeight) dir = 'YM';
      else if (z >= sideDepth) sd = this.plankType === 'VP' ? 1 : 2;

      const newWork = {
        name: '',
        wt: dir ? 'HH' : 'H',
        x,
        y,
        di: 5.0,
        dp: 5,
      };
      if (dir) {
        newWork.dir = dir;
        newWork.z = z;
      } else newWork.sd = sd;

      works.push(newWork);
      this.recalcDrillPos(works, works.length - 1);
    },
    recalcDrillPos(newWorks, drillIndex) {
      const works = newWorks.slice(0).map(work => ({ ...work }));
      let { width, height, depth } = this.plankDimension;
      const {
        wt,
        x,
        y,
        z,
        di,
        dir,
      } = works[drillIndex];
      const rad = di / 2 + this.drillOffset;
      width /= 10;
      height /= 10;
      depth /= 10;

      if (wt !== 'HH' || (dir !== 'XM' && dir !== 'XP')) {
        if (this.plankType === 'VDP') works[drillIndex].x = Math.min(depth - rad, Math.max(rad, x));
        else works[drillIndex].x = Math.min(width - rad, Math.max(rad, x));
      }
      if (wt !== 'HH' || (dir !== 'YM' && dir !== 'YP')) {
        if (this.plankType === 'FP') works[drillIndex].y = Math.min(depth - rad, Math.max(rad, y));
        else works[drillIndex].y = Math.min(height - rad, Math.max(rad, y));
      }
      if (wt === 'HH') {
        if (this.plankType === 'FP') {
          works[drillIndex].z = Math.min(height - rad, Math.max(rad, z));
          if (dir === 'YM') works[drillIndex].y = depth;
          else if (dir === 'XM') works[drillIndex].x = width;
        } else if (this.plankType === 'VP') {
          works[drillIndex].z = Math.min(depth - rad, Math.max(rad, z));
          if (dir === 'YM') works[drillIndex].y = height;
          else if (dir === 'XM') works[drillIndex].x = width;
        } else {
          works[drillIndex].z = Math.min(width - rad, Math.max(rad, z));
          if (dir === 'YM') works[drillIndex].y = height;
          else if (dir === 'XM') works[drillIndex].x = depth;
        }
        if (dir === 'YP') works[drillIndex].y = 0;
        else if (dir === 'XP') works[drillIndex].x = 0;
      } else works[drillIndex].z = 0;

      this.$emit('update:works', works);
    },
  },
};
</script>
