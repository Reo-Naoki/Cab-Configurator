<template>
  <div>
    <div v-for="(work, index) in works" :key="`${plankID}_drill_key_${index}`">
      <vgl-cylinder-geometry v-if="work.di" :name="`${plankID}_drill_${index}_geometry`" v-bind="drillDimensions[index]" />
      <vgl-extrude-geometry v-if="!work.di"
                :name="`${plankID}_drill_${index}_geometry`"
                :shapes="drillShapes[index]"
                :depth="drillDepths[index]"
                :bevelEnabled="false"
                :curveSegments="1"
                :steps="8" />
      <vgl-mesh :geometry="`${plankID}_drill_${index}_geometry`"
                ref="drills"
                material="drill"
                :position="drillPositions[index]"
                :rotation="work.di ? drillRotations[index] : drillShapeRotations[index]"
                :name="`${plankID}_drill_${index}`" />
      <DrillCoordinate v-if="showCoordinateArrows(`${plankID}_drill_${index}`)"
        :drill-name="`${plankID}_drill_${index}`"
        :plank-position="plankPosition"
        :plank-dimension="plankDimension"
        :plank-type="plankType"
        :drill-center-position="drillCenterPosition()"
        :work="work"
        :works.sync="drillWorks"
        :recalcDrillPos="recalcDrillPos" />
    </div>
    <div v-if="selectedDrillIndex > -1">
      <vgl-geometry name="offsetLeft" :position-attribute="offsetVertices('Left')" />
      <vgl-line-segments geometry="offsetLeft" material="ruler" />
      <vgl-geometry name="offsetRight" :position-attribute="offsetVertices('Right')" />
      <vgl-line-segments geometry="offsetRight" material="ruler" />
      <vgl-geometry name="offsetUpper" :position-attribute="offsetVertices('Upper')" />
      <vgl-line-segments geometry="offsetUpper" material="ruler" />
      <vgl-geometry name="offsetLower" :position-attribute="offsetVertices('Lower')" />
      <vgl-line-segments geometry="offsetLower" material="ruler" />
    </div>
  </div>
</template>

<script>
import { Vector2, Vector3 } from 'three';
import { mapState } from 'vuex';
import DrillCoordinate from './DrillCoordinate';
import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'PlankDrill',
  inject: ['vglNamespace'],
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
    drillPositions: {
      type: Array,
      required: true,
    },
    drillCenterPositions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      radialSegments: 16,
      drillOffset: 2,
      elementUpper: null,
      elementLower: null,
      elementLeft: null,
      elementRight: null,
      containerElement: null,
    };
  },
  mounted() {
    this.setAsPlankDrill();
    this.addElementsToDOM();
    this.changeEventHandler(true);
    this.vglNamespace.beforeRender.push(this.updateStyle);
  },
  updated() {
    this.setAsPlankDrill();
  },
  beforeDestroy() {
    this.changeEventHandler(false);
    this.vglNamespace.beforeRender.splice(this.vglNamespace.beforeRender.indexOf(this.updateStyle), 1);
    this.removeElements();
  },
  computed: {
    ...mapState('Panels', [
      'enableDrillEdit',
      'moveDirection',
      'prevPosition',
      'hDiameters',
      'hhDiameters',
      'htDiameters',
      'hDiFreeRange',
      'htDiFreeRange',
      'hhDpMax',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
    selectedDrillIndex() {
      if (!this.enableDrillEdit || !this.selectedObject3D) return -1;
      const { name } = this.selectedObject3D.object3d;
      if (!name.includes('drill') || name.split('_')[0] !== this.plankID) return -1;
      return Number(name.split('_')[2]);
    },
    drillWorks: {
      get() { return this.works; },
      set(val) { this.$emit('update:works', val); },
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
            if (work.wt === 'H' || work.wt === 'HT') return `${rightAngle} ${0} ${rightAngle}`;
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
      const {
        plankType,
        plankDimension: { width, depth, height },
      } = this;
      let thick = 0;
      if (plankType === 'FP') thick = height;
      if (plankType === 'VP') thick = depth;
      if (plankType === 'VDP') thick = width;

      return this.works.map((work) => {
        if (work.di) {
          return {
            radiusTop: work.di * 5,
            radiusBottom: work.di * 5,
            height: work.wt === 'HT' ? thick + 6 : (work.dp * 10 + 3),
            radialSegments: this.radialSegments,
          };
        }
        return {
          width: work.sx * 10,
          depth: work.sy * 10,
          height: work.wt === 'HT' ? thick + 6 : (work.dp * 10 + 3),
        };
      });
    },
    drillShapes() {
      return this.works.map((work) => {
        if (work.di) return '';
        const { sx, sy } = work;
        const sxout = sx * 5;
        const syout = sy * 5;
        const sxin = sxout - 60;
        const syin = syout - 60;
        return [
          new Vector2(-sxin, -syout),
          new Vector2(sxin, -syout),
          new Vector2(sxout, -syin),
          new Vector2(sxout, syin),
          new Vector2(sxin, syout),
          new Vector2(-sxin, syout),
          new Vector2(-sxout, syin),
          new Vector2(-sxout, -syin),
        ];
      });
    },
    drillDepths() {
      const {
        plankType,
        plankDimension: { width, depth, height },
      } = this;
      let thick = 0;
      if (plankType === 'FP') thick = height;
      if (plankType === 'VP') thick = depth;
      if (plankType === 'VDP') thick = width;

      return this.works.map(work => (work.wt === 'HT' ? thick + 6 : (work.dp * 10 + 3)));
    },
    drillShapeRotations() {
      const rightAngle = Math.PI / 2;
      switch (this.plankType) {
        case 'FP':
          return this.works.map(work => `${work.sd === 1 ? rightAngle : -rightAngle} ${0} ${0}`);
        case 'VP':
          return this.works.map(work => `${work.sd === 1 && work.wt !== 'HT' ? 0 : rightAngle * 2} ${0} ${0}`);
        case 'VDP':
          return this.works.map(work => `${rightAngle} ${work.sd === 1 ? -rightAngle : rightAngle} ${rightAngle}`);
        default:
          return [];
      }
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
    stringToVector(position) {
      const [x, y, z] = position.split(' ').map(v => parseInt(v, 10));
      return new Vector3(x, y, z);
    },
    drillCenterPosition() {
      return this.drillCenterPositions[this.selectedDrillIndex];
    },
    createDrill(point) {
      const {
        plankType,
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
      } = this;
      const works = this.works.slice(0).map(work => ({ ...work }));
      let x = 0;
      let y = 0;
      let z = 0;
      let sideWidth = 0;
      let sideHeight = 0;
      let sideDepth = 0;
      let dir = null;
      let sd = plankType === 'VP' ? 2 : 1;

      if (plankType === 'FP') {
        x = (point.x - px) / 10;
        y = (pz + depth - point.z) / 10;
        z = (py + height - point.y) / 10;
        sideWidth = width / 10;
        sideHeight = depth / 10;
        sideDepth = height / 10;
      } else if (plankType === 'VP') {
        x = (point.x - px) / 10;
        y = (point.y - py) / 10;
        z = (pz + depth - point.z) / 10;
        sideWidth = width / 10;
        sideHeight = height / 10;
        sideDepth = depth / 10;
      } else if (plankType === 'VDP') {
        x = (pz + depth - point.z) / 10;
        y = (point.y - py) / 10;
        z = (px + width - point.x) / 10;
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
      else if (z >= sideDepth) sd = plankType === 'VP' ? 1 : 2;

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
      EventBus.$emit('save');
    },
    recalcDrillPos(newWorks, drillIndex) {
      const { plankType } = this;
      let { width, height, depth } = this.plankDimension;
      const works = newWorks.slice(0).map(work => ({ ...work }));

      if (drillIndex > -1) {
        const {
          wt,
          x,
          y,
          z,
          di,
          sx,
          sy,
          dp,
          dir,
        } = works[drillIndex];
        width /= 10;
        height /= 10;
        depth /= 10;

        if (di) {
          if (wt === 'H') {
            if (!this.hDiameters.includes(di)) works[drillIndex].di = Math.min(this.hDiFreeRange[1], Math.max(this.hDiFreeRange[0], di));
          } else if (wt === 'HT') {
            if (!this.htDiameters.includes(di)) works[drillIndex].di = Math.min(this.htDiFreeRange[1], Math.max(this.htDiFreeRange[0], di));
          } else if (wt === 'HH') {
            if (!this.hhDiameters.includes(di)) [works[drillIndex].di] = this.hhDiameters;
          }
        } else {
          if (plankType === 'VDP') works[drillIndex].sx = Math.max(15, Math.min(sx, depth - this.drillOffset * 2));
          else works[drillIndex].sx = Math.max(15, Math.min(sx, width - this.drillOffset * 2));
          if (plankType === 'FP') works[drillIndex].sy = Math.max(15, Math.min(sy, depth - this.drillOffset * 2));
          else works[drillIndex].sy = Math.max(15, Math.min(sy, height - this.drillOffset * 2));
        }

        if (wt === 'HH') {
          works[drillIndex].dp = Math.min(this.hhDpMax, Math.max(2, dp));
        }

        const rad = works[drillIndex].di / 2 + this.drillOffset;

        if (works[drillIndex].di) {
          if (wt !== 'HH' || (dir !== 'XM' && dir !== 'XP')) {
            if (plankType === 'VDP') works[drillIndex].x = Math.min(depth - rad, Math.max(rad, x));
            else works[drillIndex].x = Math.min(width - rad, Math.max(rad, x));
          }
          if (wt !== 'HH' || (dir !== 'YM' && dir !== 'YP')) {
            if (plankType === 'FP') works[drillIndex].y = Math.min(depth - rad, Math.max(rad, y));
            else works[drillIndex].y = Math.min(height - rad, Math.max(rad, y));
          }
          if (wt === 'HH') {
            if (plankType === 'FP') {
              works[drillIndex].z = Math.min(height - rad, Math.max(rad, z));
              if (dir === 'YM') works[drillIndex].y = depth;
              else if (dir === 'XM') works[drillIndex].x = width;
            } else if (plankType === 'VP') {
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
        } else {
          const sxOffset = works[drillIndex].sx / 2 + this.drillOffset;
          const syOffset = works[drillIndex].sy / 2 + this.drillOffset;
          if (plankType === 'VDP') works[drillIndex].x = Math.min(depth - sxOffset, Math.max(sxOffset, x));
          else works[drillIndex].x = Math.min(width - sxOffset, Math.max(sxOffset, x));
          if (plankType === 'FP') works[drillIndex].y = Math.min(depth - syOffset, Math.max(syOffset, y));
          else works[drillIndex].y = Math.min(height - syOffset, Math.max(syOffset, y));
        }
      }

      this.$emit('update:works', works);
    },
    projectVectorTo2D(x, y, z, type) {
      let dx = Number(x);
      let dy = Number(y);
      let dz = Number(z);
      const {
        plankType,
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
      } = this;
      const work = this.drillWorks[this.selectedDrillIndex];

      if (type === 'Left') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) dx = (dx + px) / 2;
        else dz = (dz + pz + depth) / 2;
      } else if (type === 'Right') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) dx = (dx + px + width) / 2;
        else dz = (dz + pz) / 2;
      } else if (type === 'Upper') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) dz = (dz + pz) / 2;
        else if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) dx = (dx + px) / 2;
        else dy = (dy + py + height) / 2;
      } else if (type === 'Lower') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) dz = (dz + pz + depth) / 2;
        else if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) dx = (dx + px + width) / 2;
        else dy = (dy + py) / 2;
      }

      const p = new Vector3(dx, dy, dz);
      const vector = p.project(this.cameraInst);
      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height - 8;

      const rect = this.domElement.getBoundingClientRect();
      vector.x = Math.max(30, Math.min(vector.x, rect.width - 70));
      vector.y = Math.max(30, Math.min(vector.y, rect.height - 50));

      return vector;
    },
    offsetValue(x, y, z, type) {
      const dx = Number(x);
      const dy = Number(y);
      const dz = Number(z);
      const {
        plankType,
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
      } = this;
      const work = this.drillWorks[this.selectedDrillIndex];

      if (type === 'Left') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) return (dx - px) / 10;
        return (pz + depth - dz) / 10;
      }
      if (type === 'Right') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) return (px + width - dx) / 10;
        return (dz - pz) / 10;
      }
      if (type === 'Upper') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) return (dz - pz) / 10;
        if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) return (dx - px) / 10;
        return (py + height - dy) / 10;
      }
      if (type === 'Lower') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) return (pz + depth - dz) / 10;
        if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) return (px + width - dx) / 10;
        return (dy - py) / 10;
      }
      return 0;
    },
    offsetVertices(type) {
      const { x: dx, y: dy, z: dz } = this.drillCenterPosition();
      let vx = dx;
      let vy = dy;
      let vz = dz;
      const {
        plankType,
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
      } = this;
      const work = this.drillWorks[this.selectedDrillIndex];

      if (type === 'Left') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) vx = px;
        else vz = pz + depth;
      } else if (type === 'Right') {
        if ((plankType !== 'VDP' && (work.wt !== 'HH' || work.dir.includes('Y')))
        || (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('X'))) vx = px + width;
        else vz = pz;
      } else if (type === 'Upper') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) vz = pz;
        else if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) vx = px;
        else vy = py + height;
      } else if (type === 'Lower') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType === 'VP' && work.wt === 'HH' && work.dir.includes('Y'))) vz = pz + depth;
        else if (plankType === 'VDP' && work.wt === 'HH' && work.dir.includes('Y')) vx = px + width;
        else vy = py;
      }

      return [vx, vy, vz, dx, dy, dz];
    },
    updateStyle() {
      if (this.selectedDrillIndex > -1) {
        const { x, y, z } = this.drillCenterPosition();

        let vector2D = this.projectVectorTo2D(x, y, z, 'Left');
        this.elementLeft.style.top = `${vector2D.y}px`;
        this.elementLeft.style.left = `${vector2D.x}px`;
        this.elementLeft.style.display = 'unset';
        this.elementLeft.value = this.offsetValue(x, y, z, 'Left');

        vector2D = this.projectVectorTo2D(x, y, z, 'Right');
        this.elementRight.style.top = `${vector2D.y}px`;
        this.elementRight.style.left = `${vector2D.x}px`;
        this.elementRight.style.display = 'unset';
        this.elementRight.value = this.offsetValue(x, y, z, 'Right');

        vector2D = this.projectVectorTo2D(x, y, z, 'Upper');
        this.elementUpper.style.top = `${vector2D.y}px`;
        this.elementUpper.style.left = `${vector2D.x}px`;
        this.elementUpper.style.display = 'unset';
        this.elementUpper.value = this.offsetValue(x, y, z, 'Upper');

        vector2D = this.projectVectorTo2D(x, y, z, 'Lower');
        this.elementLower.style.top = `${vector2D.y}px`;
        this.elementLower.style.left = `${vector2D.x}px`;
        this.elementLower.style.display = 'unset';
        this.elementLower.value = this.offsetValue(x, y, z, 'Lower');
      } else {
        this.elementLeft.style.display = 'none';
        this.elementRight.style.display = 'none';
        this.elementUpper.style.display = 'none';
        this.elementLower.style.display = 'none';
      }
    },
    createInput(type) {
      const inputField = document.createElement('input');
      inputField.classList.add('drill-offset-input');
      inputField.setAttribute('type', 'number');
      inputField.setAttribute('id', type);
      inputField.defaultValue = '0';

      return inputField;
    },
    addElementsToDOM() {
      const appDiv = document.getElementById('content-3d');
      const container = document.createElement('div');
      container.classList.add('line-input-container');

      this.elementLeft = this.createInput('Left');
      this.elementLeft.value = '0';
      container.appendChild(this.elementLeft);

      this.elementRight = this.createInput('Right');
      this.elementRight.value = '0';
      container.appendChild(this.elementRight);

      this.elementUpper = this.createInput('Upper');
      this.elementUpper.value = '0';
      container.appendChild(this.elementUpper);

      this.elementLower = this.createInput('Lower');
      this.elementLower.value = '0';
      container.appendChild(this.elementLower);

      this.containerElement = container;
      appDiv.insertBefore(container, appDiv.firstChild);
    },
    removeElements() {
      const appDiv = document.getElementById('content-3d');
      appDiv.removeChild(this.containerElement);
    },
    onChange(type, value) {
      const {
        plankType,
        plankDimension: { width, depth, height },
      } = this;
      const index = this.selectedDrillIndex;
      const works = this.drillWorks.slice(0).map(work => ({ ...work }));
      const work = works[index];

      if (type === 'Left') {
        if (work.wt !== 'HH' || work.dir.includes('Y')) works[index].x = value;
        else if (plankType === 'FP') works[index].y = value;
        else if (plankType === 'VP') works[index].z = value;
        else if (plankType === 'VDP') works[index].z = width / 10 - value;
      } else if (type === 'Right') {
        if (work.wt !== 'HH' || work.dir.includes('Y')) {
          if (plankType !== 'VDP') works[index].x = width / 10 - value;
          else works[index].x = depth / 10 - value;
        } else if (plankType === 'FP') works[index].y = depth / 10 - value;
        else if (plankType === 'VP') works[index].z = depth / 10 - value;
        else if (plankType === 'VDP') works[index].z = value;
      } else if (type === 'Upper') {
        if (plankType === 'FP' && work.wt !== 'HH') works[index].y = depth / 10 - value;
        else if (plankType !== 'FP' && (work.wt !== 'HH' || work.dir.includes('X'))) works[index].y = height / 10 - value;
        else if (plankType === 'FP') works[index].z = value;
        else if (plankType === 'VP') works[index].z = depth / 10 - value;
        else if (plankType === 'VDP') works[index].z = width / 10 - value;
      } else if (type === 'Lower') {
        if ((plankType === 'FP' && work.wt !== 'HH') || (plankType !== 'FP' && (work.wt !== 'HH' || work.dir.includes('X')))) works[index].y = value;
        else if (plankType === 'FP') works[index].z = height / 10 - value;
        else works[index].z = value;
      }

      this.recalcDrillPos(works, index);
      EventBus.$emit('save');
    },
    onKeyDown(event) {
      if (event.key === 'Escape') {
        const appDiv = this.vglNamespace.renderers[0].inst.domElement;
        const keyboardEvent = new KeyboardEvent('keydown', event, false);
        appDiv.dispatchEvent(keyboardEvent);
      } else if (event.key === 'Enter') {
        const { value } = event.target;
        this.onChange(event.target.id, value);
      }
    },
    sendMouseEvent(type, event) {
      const appDiv = this.vglNamespace.renderers[0].inst.domElement;
      const mouseEvent = new MouseEvent(type, event, false);
      appDiv.dispatchEvent(mouseEvent);
    },
    onMouseDown(event) {
      this.sendMouseEvent('mousedown', event);
    },
    onMouseClick(event) {
      this.sendMouseEvent('click', event);
    },
    onMouseMove(event) {
      this.sendMouseEvent('mousemove', event);
    },
    onMouseRightClick(event) {
      this.sendMouseEvent('auxclick', event);
    },
    onMouseWheel(event) {
      this.sendMouseEvent('wheel', event);
    },
    changeEventHandler(bool) {
      if (bool) {
        this.addListener(this.elementLeft);
        this.addListener(this.elementRight);
        this.addListener(this.elementUpper);
        this.addListener(this.elementLower);
      } else {
        this.removeListener(this.elementLeft);
        this.removeListener(this.elementRight);
        this.removeListener(this.elementUpper);
        this.removeListener(this.elementLower);
      }
    },
    addListener(element) {
      element.addEventListener('keydown', this.onKeyDown);
      element.addEventListener('mousedown', this.onMouseDown, false);
      element.addEventListener('click', this.onMouseClick, false);
      element.addEventListener('mousemove', this.onMouseMove, false);
      element.addEventListener('auxclick', this.onMouseRightClick, false);
      element.addEventListener('wheel', this.onMouseWheel, false);
    },
    removeListener(element) {
      element.removeEventListener('keydown', this.onKeyDown);
      element.removeEventListener('mousedown', this.onMouseDown, false);
      element.removeEventListener('click', this.onMouseClick, false);
      element.removeEventListener('mousemove', this.onMouseMove, false);
      element.removeEventListener('auxclick', this.onMouseRightClick, false);
      element.removeEventListener('wheel', this.onMouseWheel, false);
    },
  },
  watch: {
    plankPosition() {
      this.updateStyle();
    },
    plankDimension() {
      this.updateStyle();
    },
  },
};
</script>
<style>
  .drill-offset-input {
    position: absolute;
    font-size: 14px;
    width: 80px;
    background: space;
    border: slategrey;
  }
</style>
