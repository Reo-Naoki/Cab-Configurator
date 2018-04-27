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
  name: 'VerticeCoordinate',
  inject: ['vglNamespace'],
  mixins: [Coordinate],
  props: {
    verticeName: {
      type: String,
      required: true,
    },
    verticePosition: {
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
    shapePoints: {
      type: Array,
      required: true,
    },
    thick: {
      type: Number,
      required: true,
    },
  },
  created() {
    window.verticeCoordinates[this.verticeName] = this;
  },
  data() {
    return {
      arrowLength: 1000,
      arrowHeadLength: 300,
      arrowHeadWidth: this.thick * 10 + 100,
      arrowColor: '#808080',
      magnetRange: 500,
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
      return this.stringToVector(this.verticePosition);
    },
    arrows() {
      const prefixName = `${this.verticeName}_coordinate_arrow`;
      const arrowPosition = new Vector3(this.position.x, this.position.y, this.position.z);

      return [
        {
          name: `${prefixName}_x`,
          dir: new Vector3(1, 0, 0),
          position: arrowPosition,
          visible: this.plankType !== 'VDP',
        },
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: arrowPosition,
          visible: this.plankType !== 'FP',
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: arrowPosition,
          visible: this.plankType !== 'VP',
        },
        {
          name: `${prefixName}_-x`,
          dir: new Vector3(-1, 0, 0),
          position: arrowPosition,
          visible: this.plankType !== 'VDP',
        },
        {
          name: `${prefixName}_-y`,
          dir: new Vector3(0, -1, 0),
          position: arrowPosition,
          visible: this.plankType !== 'FP',
        },
        {
          name: `${prefixName}_-z`,
          dir: new Vector3(0, 0, -1),
          position: arrowPosition,
          visible: this.plankType !== 'VP',
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
      const verticeIndex = Number(this.verticeName.split('SHAPE')[1].split('M')[0]);
      const plankPosition = window.panels[this.verticeName.split('_')[0]].position;
      const points = this.shapePoints.slice(0);
      if (direction.includes('x')) {
        distance = position.x - this.prevPosition.x;
        if (this.plankType === 'FP') points[verticeIndex][1] = (this.prevPosition.x - plankPosition.x + distance) / 10;
        if (this.plankType === 'VP') points[verticeIndex][0] = (this.prevPosition.x - plankPosition.x + distance) / 10;
      } else if (direction.includes('y')) {
        distance = position.y - this.prevPosition.y;
        points[verticeIndex][1] = (this.prevPosition.y - plankPosition.y + distance) / 10;
      } else if (direction.includes('z')) {
        distance = position.z - this.prevPosition.z;
        points[verticeIndex][0] = (this.prevPosition.z - plankPosition.z + distance) / 10;
      }

      this.inputElement.value = distance / 10 * (direction.includes('-') ? -1 : 1);

      this.calcPlankPosAndSize(points);
    },
    moveByDistance(direction, distance) {
      const verticeIndex = Number(this.verticeName.split('SHAPE')[1].split('M')[0]);
      const plankPosition = window.panels[this.verticeName.split('_')[0]].position;
      const points = this.shapePoints.slice(0);
      const sign = direction.includes('-') ? -1 : 1;

      if (direction.includes('x')) {
        if (this.plankType === 'FP') points[verticeIndex][1] = (this.prevPosition.x - plankPosition.x + distance * sign) / 10;
        if (this.plankType === 'VP') points[verticeIndex][0] = (this.prevPosition.x - plankPosition.x + distance * sign) / 10;
      } else if (direction.includes('y')) {
        points[verticeIndex][1] = (this.prevPosition.y - plankPosition.y + distance * sign) / 10;
      } else if (direction.includes('z')) {
        points[verticeIndex][0] = (this.prevPosition.z - plankPosition.z + distance * sign) / 10;
      }

      this.inputElement.value = distance / 10 * sign;

      this.calcPlankPosAndSize(points);
    },
    calcPlankPosAndSize(plankPoints) {
      let points = plankPoints;

      const minX = Math.min(...points.map(p => p[0]));
      const minY = Math.min(...points.map(p => p[1]));
      const maxX = Math.max(...points.map(p => p[0]));
      const maxY = Math.max(...points.map(p => p[1]));
      const width = (maxX - minX) * 10;
      const height = (maxY - minY) * 10;
      points = points.map(p => ([p[0] - minX, p[1] - minY]));

      this.$emit('update:shapePoints', points);
      if (this.plankType === 'FP') {
        this.$emit('update:plankDimension', { width: height, height: this.plankDimension.height, depth: width });
        this.$emit('update:plankPosition', { x: this.plankPosition.x + minY * 10, y: this.plankPosition.y, z: this.plankPosition.z + minX * 10 });
      } else if (this.plankType === 'VP') {
        this.$emit('update:plankDimension', { width, height, depth: this.plankDimension.depth });
        this.$emit('update:plankPosition', { x: this.plankPosition.x + minX * 10, y: this.plankPosition.y + minY * 10, z: this.plankPosition.z });
      } else if (this.plankType === 'VDP') {
        this.$emit('update:plankDimension', { width: this.plankDimension.width, height, depth: width });
        this.$emit('update:plankPosition', { x: this.plankPosition.x, y: this.plankPosition.y + minY * 10, z: this.plankPosition.z + minX * 10 });
      }
    },
    createInput() {
      const inputField = document.createElement('input');
      inputField.classList.add('vertice-coordinate-input');
      inputField.setAttribute('type', 'number');
      inputField.defaultValue = '';

      return inputField;
    },
    updateStyle() {
      this.inputElement.style.display = this.selectedArrow ? 'unset' : 'none';
      this.inputElement.value = this.selectedArrow ? this.inputElement.value : '0';
      const vertPosition = this.stringToVector(this.verticePosition);

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
  .vertice-coordinate-input {
    position: absolute;
  }
</style>
