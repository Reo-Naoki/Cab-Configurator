<template>
  <div>
    <vgl-arrow-helper
      v-for="(arrow, index) in stringifyArrows" :key="arrow.name + index"
      ref="arrows"
      v-bind="arrow"
      :visible="visible"
      :head-length="arrowHeadLength"
      :head-width="arrowHeadWidth"
      :linewidth = 10>
    </vgl-arrow-helper>
  </div>
</template>

<script>
import { Vector3 } from 'three';
// import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'PlankCoordinate',
  inject: ['vglNamespace'],
  props: {
    plankName: {
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
    visible: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.addElementsToDOM();
    this.setAsPlankCoordinateHelper();
    this.changeEventHandler(true);
    this.vglNamespace.beforeRender.push(this.updateStyle);
    window.mdr = this;
  },
  beforeDestroy() {
    this.changeEventHandler(false);
    this.removeElements();
  },
  data() {
    return {
      arrowLength: 5000,
      arrowHeadLength: 800,
      arrowHeadWidth: 500,
      arrowColor: '#808080',
      magnetRange: 1000,
      inputElement: null,
      containerElement: null,
      selectedArrow: null,
    };
  },
  computed: {
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
    arrows() {
      const {
        plankName, plankPosition, plankDimension,
      } = this;
      const prefixName = `${plankName}_coordinate_arrow`;
      return [
        {
          name: `${prefixName}_x`,
          dir: new Vector3(1, 0, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.width / 2 < 4000 ? 5000 : 3000 + plankDimension.width / 2,
        },
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.height / 2 < 4000 ? 5000 : 3000 + plankDimension.height / 2,
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.depth / 2 < 4000 ? 5000 : 3000 + plankDimension.depth / 2,
        },
        {
          name: `${prefixName}_-x`,
          dir: new Vector3(-1, 0, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.width / 2 < 4000 ? 5000 : 3000 + plankDimension.width / 2,
        },
        {
          name: `${prefixName}_-y`,
          dir: new Vector3(0, -1, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.height / 2 < 4000 ? 5000 : 3000 + plankDimension.height / 2,
        },
        {
          name: `${prefixName}_-z`,
          dir: new Vector3(0, 0, -1),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#808080',
          length: plankDimension.depth / 2 < 4000 ? 5000 : 3000 + plankDimension.depth / 2,
        },
      ];
    },
    stringifyArrows() {
      return this.arrows.map(arrow => ({
        ...arrow,
        dir: `${arrow.dir.x} ${arrow.dir.y} ${arrow.dir.z}`,
        position: `${arrow.position.x} ${arrow.position.y} ${arrow.position.z}`,
        color: arrow.color,
      }));
    },
  },
  methods: {
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
    setAsPlankCoordinateHelper() {
      const { arrows } = this.$refs;
      if (arrows == null) return;
      for (let i = 0; i < arrows.length; i += 1) {
        arrows[i].inst.isCoordinate = true;
        for (let ii = 0; ii < arrows[i].inst.children.length; ii += 1) {
          arrows[i].inst.children[ii].name = arrows[i].inst.name;
          arrows[i].inst.children[ii].isCoordinate = true;
        }
      }
    },
    resize(name, position, vertex, magnetism) {
      // resize: name is the selected arrow name (1-1_dimension_arrow_upper)
      // resize: position is the mouse position while dragging
      const direction = name.split('_').pop();
      if (vertex && magnetism) {
        this.resizeLogic(direction, vertex);
      } else {
        this.resizeLogic(direction, position);
      }
    },
    resizeLogic(direction, position) {
      let newPosition = null;
      this.selectedArrow = direction;

      if (direction === 'x' || direction === '-x') {
        const distance = position.x - this.plankPosition.x;
        newPosition = { x: this.plankPosition.x + distance, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction === 'y' || direction === '-y') {
        const distance = position.y - this.plankPosition.y;
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y + distance, z: this.plankPosition.z };
      } else if (direction === 'z' || direction === '-z') {
        const distance = position.z - this.plankPosition.z;
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + distance };
      }

      this.$emit('update:plankPosition', newPosition);
    },
    moveByDistance(direction, distance) {
      let newPosition = null;

      if (direction === 'x') {
        newPosition = { x: this.plankPosition.x + distance, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction === '-x') {
        newPosition = { x: this.plankPosition.x - distance, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction === 'y') {
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y + distance, z: this.plankPosition.z };
      } else if (direction === '-y') {
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y - distance, z: this.plankPosition.z };
      } else if (direction === 'z') {
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + distance };
      } else if (direction === '-z') {
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - distance };
      }

      this.$emit('update:plankPosition', newPosition);
    },
    createInput() {
      const inputField = document.createElement('input');
      inputField.classList.add('plank-coordinate-input');
      inputField.setAttribute('type', 'number');
      inputField.defaultValue = '';

      return inputField;
    },
    updateStyle() {
      this.inputElement.style.display = this.selectedArrow ? 'unset' : 'none';
      this.inputElement.value = this.selectedArrow ? this.inputElement.value : '0';

      if (this.selectedArrow) this.inputElement.focus();
      const inputPosition = new Vector3(
        this.plankPosition.x,
        this.plankPosition.y,
        this.plankPosition.z,
      );

      switch (this.selectedArrow) {
        case 'x':
          inputPosition.x += this.arrows[0].length;
          break;
        case '-x':
          inputPosition.x -= this.arrows[0].length;
          break;
        case 'y':
          inputPosition.y += this.arrows[1].length;
          break;
        case '-y':
          inputPosition.y -= this.arrows[1].length;
          break;
        case 'z':
          inputPosition.z += this.arrows[2].length;
          break;
        case '-z':
          inputPosition.z -= this.arrows[2].length;
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
  .plank-coordinate-input {
    position: absolute;
  }
</style>
