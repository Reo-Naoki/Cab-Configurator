<template>
  <div>
    <vgl-arrow-helper
      v-for="(arrow, index) in stringifyArrows" :key="arrow.name + index"
      ref="arrows"
      v-bind="arrow"
      :length="arrowLength"
      :head-length="arrowHeadLength"
      :head-width="arrowHeadWidth"
      :color="arrowColor"
      :linewidth = 10 />
  </div>
</template>

<script>
import { Vector3 } from 'three';
import { mapState } from 'vuex';
import Coordinate from './Common/Coordinate';

export default {
  name: 'DrillCoordinate',
  inject: ['vglNamespace'],
  mixins: [Coordinate],
  props: {
    drillName: {
      type: String,
      required: true,
    },
    drillCenterPosition: {
      type: Vector3,
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
    work: {
      type: Object,
      required: true,
    },
    works: {
      type: Array,
      required: true,
    },
    recalcDrillPos: {
      type: Function,
      required: true,
    },
  },
  created() {
    window.drillCoordinates[this.drillName] = this;
  },
  data() {
    return {
      arrowLength: 700,
      arrowHeadLength: 300,
      arrowHeadWidth: 200,
      arrowColor: '#808080',
      magnetRange: 500,
      drillOffset: 2,
      inputElement: null,
      containerElement: null,
      selectedArrow: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'panels',
      'prevPosition',
      'prevDimension',
    ]),
    position() {
      return this.drillCenterPosition;
    },
    arrows() {
      const prefixName = `${this.drillName}_coordinate_arrow`;
      const arrowPosition = this.drillCenterPosition;
      const { work } = this;
      let dir = 'none';

      if (this.plankType === 'FP') {
        if (work.wt === 'HH') {
          if (work.dir.includes('X')) dir = 'X';
          else dir = 'Z';
        } else if (work.wt === 'H') dir = 'Y';
        else if (work.wt === 'HT') dir = 'Y';
      } else if (this.plankType === 'VP') {
        if (work.wt === 'HH') {
          if (work.dir.includes('X')) dir = 'X';
          else dir = 'Y';
        } else if (work.wt === 'H') dir = 'Z';
        else if (work.wt === 'HT') dir = 'Z';
      } else if (this.plankType === 'VDP') {
        if (work.wt === 'HH') {
          if (work.dir.includes('X')) dir = 'Z';
          else dir = 'Y';
        } else if (work.wt === 'H') dir = 'X';
        else if (work.wt === 'HT') dir = 'X';
      }

      return [
        {
          name: `${prefixName}_x`,
          dir: new Vector3(1, 0, 0),
          position: arrowPosition,
          visible: dir !== 'X',
        },
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: arrowPosition,
          visible: dir !== 'Y',
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: arrowPosition,
          visible: dir !== 'Z',
        },
        {
          name: `${prefixName}_-x`,
          dir: new Vector3(-1, 0, 0),
          position: arrowPosition,
          visible: dir !== 'X',
        },
        {
          name: `${prefixName}_-y`,
          dir: new Vector3(0, -1, 0),
          position: arrowPosition,
          visible: dir !== 'Y',
        },
        {
          name: `${prefixName}_-z`,
          dir: new Vector3(0, 0, -1),
          position: arrowPosition,
          visible: dir !== 'Z',
        },
      ];
    },
    stringifyArrows() {
      return this.arrows.map(arrow => ({
        ...arrow,
        dir: `${arrow.dir.x} ${arrow.dir.y} ${arrow.dir.z}`,
        position: `${arrow.position.x} ${arrow.position.y} ${arrow.position.z}`,
      }));
    },
  },
  methods: {
    stringToVector(position) {
      const [x, y, z] = position.split(' ').map(v => parseInt(v, 10));
      return new Vector3(x, y, z);
    },
    vectorToString(position) {
      return `${position.x} ${position.y} ${position.z}`;
    },
    move(name, position, vertex, magnetism) {
      // resize: name is the selected arrow name (1-1_dimension_arrow_upper)
      // resize: position is the mouse position while dragging
      const direction = name.split('_').pop();
      if (vertex && magnetism) {
        this.moveLogic(direction, vertex);
      } else {
        this.moveLogic(direction, position);
      }
    },
    moveLogic(direction, position) {
      let distance = 0;
      this.selectedArrow = direction;
      const drillIndex = Number(this.drillName.split('drill_')[1]);
      const { plankPosition } = this;
      const { width, height, depth } = this.plankDimension;
      const works = this.works.slice(0).map(work => ({ ...work }));
      if (direction.includes('x')) {
        distance = position.x - this.prevPosition.x;
        if (this.plankType === 'VDP') works[drillIndex].z = (plankPosition.x + width - this.prevPosition.x - distance) / 10;
        else works[drillIndex].x = (this.prevPosition.x - plankPosition.x + distance) / 10;
      } else if (direction.includes('y')) {
        distance = position.y - this.prevPosition.y;
        if (this.plankType === 'FP') works[drillIndex].z = (plankPosition.y + height - this.prevPosition.y - distance) / 10;
        else works[drillIndex].y = (this.prevPosition.y - plankPosition.y + distance) / 10;
      } else if (direction.includes('z')) {
        distance = position.z - this.prevPosition.z;
        if (this.plankType === 'FP') works[drillIndex].y = (plankPosition.z + depth - this.prevPosition.z - distance) / 10;
        else if (this.plankType === 'VP') works[drillIndex].z = (plankPosition.z + depth - this.prevPosition.z - distance) / 10;
        else works[drillIndex].x = (plankPosition.z + depth - this.prevPosition.z - distance) / 10;
      }

      this.inputElement.value = distance / 10 * (direction.includes('-') ? -1 : 1);

      this.recalcDrillPos(works, drillIndex);
    },
    moveByDistance(direction, distance) {
      const drillIndex = Number(this.drillName.split('drill_')[1]);
      const { plankPosition } = this;
      const { width, height, depth } = this.plankDimension;
      const works = this.works.slice(0).map(work => ({ ...work }));
      const sign = direction.includes('-') ? -1 : 1;

      if (direction.includes('x')) {
        if (this.plankType === 'VDP') works[drillIndex].z = (plankPosition.x + width - this.prevPosition.x - distance * sign) / 10;
        else works[drillIndex].x = (this.prevPosition.x - plankPosition.x + distance * sign) / 10;
      } else if (direction.includes('y')) {
        if (this.plankType === 'FP') works[drillIndex].z = (plankPosition.y + height - this.prevPosition.y - distance * sign) / 10;
        else works[drillIndex].y = (this.prevPosition.y - plankPosition.y + distance * sign) / 10;
      } else if (direction.includes('z')) {
        if (this.plankType === 'FP') works[drillIndex].y = (plankPosition.z + depth - this.prevPosition.z - distance * sign) / 10;
        else if (this.plankType === 'VP') works[drillIndex].z = (plankPosition.z + depth - this.prevPosition.z - distance * sign) / 10;
        else works[drillIndex].x = (plankPosition.z + depth - this.prevPosition.z - distance * sign) / 10;
      }

      this.inputElement.value = distance / 10 * sign;

      this.recalcDrillPos(works, drillIndex);
    },
    createInput() {
      const inputField = document.createElement('input');
      inputField.classList.add('drill-coordinate-input');
      inputField.setAttribute('type', 'number');
      inputField.defaultValue = '';

      return inputField;
    },
    updateStyle() {
      this.inputElement.style.display = this.selectedArrow ? 'unset' : 'none';
      this.inputElement.value = this.selectedArrow ? this.inputElement.value : '0';
      const vertPosition = this.drillCenterPosition;

      if (this.selectedArrow) this.inputElement.focus();
      const inputPosition = new Vector3(
        vertPosition.x,
        vertPosition.y,
        vertPosition.z,
      );

      switch (this.selectedArrow) {
        case 'x':
          inputPosition.x += this.arrowLength;
          break;
        case '-x':
          inputPosition.x -= this.arrowLength;
          break;
        case 'y':
          inputPosition.y += this.arrowLength;
          break;
        case '-y':
          inputPosition.y -= this.arrowLength;
          break;
        case 'z':
          inputPosition.z += this.arrowLength;
          break;
        case '-z':
          inputPosition.z -= this.arrowLength;
          break;
        default:
          break;
      }

      const vectorTop2D = this.projectVectorTo2D(inputPosition.x, inputPosition.y, inputPosition.z);
      const rect = this.domElement.getBoundingClientRect();
      vectorTop2D.x = Math.max(30, Math.min(vectorTop2D.x, rect.width - 200));
      vectorTop2D.y = Math.max(30, Math.min(vectorTop2D.y, rect.height - 50));
      this.inputElement.style.top = `${vectorTop2D.y}px`;
      this.inputElement.style.left = `${vectorTop2D.x}px`;
    },
  },
};
</script>
<style>
  .drill-coordinate-input {
    position: absolute;
  }
</style>
