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
// import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'VerticeCoordinate',
  inject: ['vglNamespace'],
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
  },
  mounted() {
    this.addElementsToDOM();
    this.setAsverticeCoordinateHelper();
    this.changeEventHandler(true);
    this.vglNamespace.beforeRender.push(this.updateStyle);
    window.mdr = this;
  },
  beforeDestroy() {
    this.changeEventHandler(false);
    this.removeElements();
  },
  created() {
    window.verticeCoordinates[this.verticeName] = this;
  },
  data() {
    return {
      arrowLength: 1000,
      arrowHeadLength: 300,
      arrowHeadWidth: 200,
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
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
    position() {
      return this.stringToVector(this.verticePosition);
    },
    arrows() {
      const prefixName = `${this.verticeName}_coordinate_arrow`;
      const vertPosition = this.position;

      return [
        {
          name: `${prefixName}_x`,
          dir: new Vector3(1, 0, 0),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
          visible: this.plankType !== 'VDP',
        },
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
          visible: this.plankType !== 'FP',
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
          visible: this.plankType !== 'VP',
        },
        {
          name: `${prefixName}_-x`,
          dir: new Vector3(-1, 0, 0),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
          visible: this.plankType !== 'VDP',
        },
        {
          name: `${prefixName}_-y`,
          dir: new Vector3(0, -1, 0),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
          visible: this.plankType !== 'FP',
        },
        {
          name: `${prefixName}_-z`,
          dir: new Vector3(0, 0, -1),
          position: new Vector3(vertPosition.x, vertPosition.y, vertPosition.z),
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
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);

      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height + 30;

      return vector;
    },
    select(object3d) {
      // TODO
      if (object3d) {
        this.selectedArrow = object3d.name.split('_').pop();
      } else {
        this.selectedArrow = null;
        this.updateStyle();
      }
    },
    setAsverticeCoordinateHelper() {
      const { arrows } = this.$refs;
      if (arrows == null) return;
      for (let i = 0; i < arrows.length; i += 1) {
        arrows[i].inst.isCoordinate = true;
        if (this.isGroupArrow) arrows[i].inst.isGroupArrow = true;
        for (let ii = 0; ii < arrows[i].inst.children.length; ii += 1) {
          arrows[i].inst.children[ii].name = arrows[i].inst.name;
          arrows[i].inst.children[ii].isCoordinate = true;
        }
      }
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
      const points = this.shapePoints;
      if (direction === 'x' || direction === '-x') {
        distance = position.x - this.prevPosition.x;
        if (this.plankType === 'FP') points[verticeIndex][1] = (this.prevPosition.x - window.panels[this.verticeName.split('_')[0]].position.x + distance) / 10;
        if (this.plankType === 'VP') points[verticeIndex][0] = (this.prevPosition.x - window.panels[this.verticeName.split('_')[0]].position.x + distance) / 10;
      } else if (direction === 'y' || direction === '-y') {
        distance = position.y - this.prevPosition.y;
        points[verticeIndex][1] = (this.prevPosition.y - window.panels[this.verticeName.split('_')[0]].position.y + distance) / 10;
      } else if (direction === 'z' || direction === '-z') {
        distance = position.z - this.prevPosition.z;
        points[verticeIndex][0] = (this.prevPosition.z - window.panels[this.verticeName.split('_')[0]].position.z + distance) / 10;
      }

      this.inputElement.value = distance / 10 * (direction.includes('-') ? -1 : 1);

      this.calcPlankPosAndSize(points);
    },
    moveByDistance(direction, distance) {
      this.selectedArrow = direction;
      const verticeIndex = Number(this.verticeName.split('SHAPE')[1].split('M')[0]);
      const points = this.shapePoints;
      if (direction === 'x' || direction === '-x') {
        // points[verticeIndex][1] = (this.prevPosition.y - window.panels[this.verticeName.split('_')[0]].position.y + distance) / 10;
      } else if (direction === 'y') {
        points[verticeIndex][1] = (this.prevPosition.y - window.panels[this.verticeName.split('_')[0]].position.y + distance) / 10;
      } else if (direction === '-y') {
        points[verticeIndex][1] = (this.prevPosition.y - window.panels[this.verticeName.split('_')[0]].position.y - distance) / 10;
      } else if (direction === 'z') {
        points[verticeIndex][0] = (this.prevPosition.z - window.panels[this.verticeName.split('_')[0]].position.z + distance) / 10;
      } else if (direction === '-z') {
        points[verticeIndex][0] = (this.prevPosition.z - window.panels[this.verticeName.split('_')[0]].position.z - distance) / 10;
      }

      this.inputElement.value = distance / 10 * (direction.includes('-') ? -1 : 1);

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
    addElementsToDOM() {
      const appDiv = document.getElementById('content-3d');
      const container = document.createElement('div');
      container.classList.add('coordinate-input-container');
      this.inputElement = this.createInput();
      container.appendChild(this.inputElement);
      this.containerElement = container;
      appDiv.insertBefore(container, appDiv.firstChild);
    },
    removeElements() {
      const appDiv = document.getElementById('content-3d');
      appDiv.removeChild(this.containerElement);
    },
    onKeyDown(event) {
      if (event.key === 'Escape') {
        const appDiv = this.vglNamespace.renderers[0].inst.domElement;
        const auxclickEvent = new MouseEvent('auxclick', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        appDiv.dispatchEvent(auxclickEvent);
      } else if (event.key === 'Enter') {
        const { value } = this.inputElement;
        this.moveByDistance(this.selectedArrow, parseFloat(value) * 10);
        this.inputElement.value = '0';
        const appDiv = this.vglNamespace.renderers[0].inst.domElement;
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        appDiv.dispatchEvent(clickEvent);
      } else {
        this.onKeyUp();
      }
    },
    onKeyUp() {
      if (this.inputElement.value.length > 0 && this.inputElement.value !== '-') this.inputElement.value = parseFloat(this.inputElement.value);
    },
    changeEventHandler(bool) {
      if (bool) {
        this.inputElement.addEventListener('keydown', this.onKeyDown);
        this.inputElement.addEventListener('keyup', this.onKeyUp);
      } else {
        this.inputElement.removeEventListener('keydown', this.onKeyDown);
        this.inputElement.removeEventListener('keyup', this.onKeyUp);
      }
    },
  },
};
</script>
<style>
  .vertice-coordinate-input {
    position: absolute;
  }
</style>
