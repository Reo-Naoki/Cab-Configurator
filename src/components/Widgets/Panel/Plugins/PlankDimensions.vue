<template>
  <div>
    <vgl-arrow-helper
      v-for="(arrow, index) in stringifyArrows" :key="arrow.name + index"
      ref="arrows"
      v-bind="arrow"
      :visible="visible"
      :color="arrowColor"
      :length="arrowLength"
      :head-length="arrowHeadLength"
      :head-width="arrowHeadWidth">
    </vgl-arrow-helper>
  </div>
</template>

<script>
import { Vector3 } from 'three';
// import EventBus from '../../../EventBus/EventBus';
import PlanksDimensions from '../Models/PlanksDimensions';

export default {
  name: 'PlankDimensions',
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
    plankType: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.addElementsToDOM();
    this.setAsPlankDimensionHelper();
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
      arrowLength: 1000,
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
        plankName, plankType, plankPosition, plankDimension,
      } = this;
      const prefixName = `${plankName}_dimensions_arrow`;
      return [
        {
          name: `${prefixName}_upper`,
          dir: plankType === 'FP' ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0),
          position: plankType === 'FP'
            ? new Vector3(plankPosition.x, plankPosition.y, plankPosition.z - plankDimension.depth / 2)
            : new Vector3(plankPosition.x, plankPosition.y + plankDimension.height / 2, plankPosition.z),
        },
        {
          name: `${prefixName}_right`,
          dir: plankType === 'VDP' ? new Vector3(0, 0, -1) : new Vector3(1, 0, 0),
          position: plankType === 'VDP'
            ? new Vector3(plankPosition.x, plankPosition.y, plankPosition.z - plankDimension.depth / 2)
            : new Vector3(plankPosition.x + plankDimension.width / 2, plankPosition.y, plankPosition.z),
        },
        {
          name: `${prefixName}_lower`,
          dir: plankType === 'FP' ? new Vector3(0, 0, 1) : new Vector3(0, -1, 0),
          position: plankType === 'FP'
            ? new Vector3(plankPosition.x, plankPosition.y, plankPosition.z + plankDimension.depth / 2)
            : new Vector3(plankPosition.x, plankPosition.y - plankDimension.height / 2, plankPosition.z),
        },
        {
          name: `${prefixName}_left`,
          dir: plankType === 'VDP' ? new Vector3(0, 0, 1) : new Vector3(-1, 0, 0),
          position: plankType === 'VDP'
            ? new Vector3(plankPosition.x, plankPosition.y, plankPosition.z + plankDimension.depth / 2)
            : new Vector3(plankPosition.x - plankDimension.width / 2, plankPosition.y, plankPosition.z),
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
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);

      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height + 20;

      return vector;
    },
    select(object3d) {
      // TODO
      if (object3d) {
        this.selectedArrow = object3d.name.split('_').pop();
        if (this.selectedArrow === 'upper' || this.selectedArrow === 'lower') {
          if (this.plankType === 'FP') this.inputElement.value = this.plankDimension.depth / 10;
          else this.inputElement.value = this.plankDimension.height / 10;
        } else if (this.selectedArrow === 'left' || this.selectedArrow === 'right') {
          if (this.plankType === 'VDP') this.inputElement.value = this.plankDimension.depth / 10;
          else this.inputElement.value = this.plankDimension.width / 10;
        }
      } else {
        this.selectedArrow = null;
        this.updateStyle();
      }
    },
    setAsPlankDimensionHelper() {
      const { arrows } = this.$refs;
      if (arrows == null) return;
      for (let i = 0; i < arrows.length; i += 1) {
        arrows[i].inst.isDimension = true;
        for (let ii = 0; ii < arrows[i].inst.children.length; ii += 1) {
          arrows[i].inst.children[ii].name = arrows[i].inst.name;
          arrows[i].inst.children[ii].isDimension = true;
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
      const { width, height, depth } = this.plankDimension;
      let newPosition = null;
      let newDimension = null;
      if (direction === 'upper') {
        const { y, z } = this.arrows[0].position;
        if (this.plankType === 'FP') {
          const zDistance = Math.abs(z - position.z);
          if (z < position.z) {
            // increase
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + zDistance };
            newDimension = { width, height, depth: depth - zDistance };
          } else {
            newDimension = { width, height, depth: depth + zDistance };
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - zDistance };
          }
        } else {
          const yDistance = Math.abs(y - position.y);
          if (y > position.y) {
            // increase
            newDimension = { width, height: height - yDistance, depth };
          } else {
            newDimension = { width, height: height + yDistance, depth };
          }
        }
      } else if (direction === 'right') {
        const { x, z } = this.arrows[1].position;
        if (this.plankType === 'VDP') {
          const zDistance = Math.abs(z - position.z);
          if (z < position.z) {
            // increase
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + zDistance };
            newDimension = { width, height, depth: depth - zDistance };
          } else {
            newDimension = { width, height, depth: depth + zDistance };
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - zDistance };
          }
        } else {
          const xDistance = Math.abs(x - position.x);
          if (x < position.x) {
            // increase
            newDimension = { width: width + xDistance, height, depth };
          } else {
            newDimension = { width: width - xDistance, height, depth };
          }
        }
      } else if (direction === 'lower') {
        const { y, z } = this.arrows[2].position;
        if (this.plankType === 'FP') {
          const zDistance = Math.abs(z - position.z);
          if (z < position.z) {
            // increase
            newDimension = { width, height, depth: depth + zDistance };
          } else {
            newDimension = { width, height, depth: depth - zDistance };
          }
        } else {
          const yDistance = Math.abs(y - position.y);
          if (y < position.y) {
            // increase
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y + yDistance, z: this.plankPosition.z };
            newDimension = { width, height: height - yDistance, depth };
          } else {
            newDimension = { width, height: height + yDistance, depth };
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y - yDistance, z: this.plankPosition.z };
          }
        }
      } else if (direction === 'left') {
        // TODO
        const { x, z } = this.arrows[3].position;
        if (this.plankType === 'VDP') {
          const zDistance = Math.abs(z - position.z);
          if (z < position.z) {
            // increase
            newDimension = { width, height, depth: depth + zDistance };
          } else {
            newDimension = { width, height, depth: depth - zDistance };
          }
        } else {
          const xDistance = Math.abs(x - position.x);
          if (x < position.x) {
            // increase
            newDimension = { width: width - xDistance, height, depth };
            newPosition = { x: this.plankPosition.x + xDistance, y: this.plankPosition.y, z: this.plankPosition.z };
          } else {
            newDimension = { width: width + xDistance, height, depth };
            newPosition = { x: this.plankPosition.x - xDistance, y: this.plankPosition.y, z: this.plankPosition.z };
          }
        }
      }

      newDimension = { width: Math.round(newDimension.width), height: Math.round(newDimension.height), depth: Math.round(newDimension.depth) };

      if (newDimension) {
        let dimensionX;
        let dimensionY;
        let key;

        if (this.plankType === 'FP') {
          dimensionX = newDimension.depth;
          dimensionY = newDimension.width;
          if (direction === 'upper' || direction === 'lower') key = 'x';
          else key = 'y';
        } else if (this.plankType === 'VDP') {
          dimensionX = newDimension.depth;
          dimensionY = newDimension.height;
          if (direction === 'upper' || direction === 'lower') key = 'y';
          else key = 'x';
        } else {
          dimensionX = newDimension.width;
          dimensionY = newDimension.height;
          if (direction === 'upper' || direction === 'lower') key = 'y';
          else key = 'x';
        }

        const dimensions = new PlanksDimensions({ x: dimensionX / 10, y: dimensionY / 10, thick: null });

        if (!dimensions.isValid) {
          dimensions.makeValid(key);

          if (this.plankType === 'FP') {
            if (direction === 'upper' || direction === 'lower') {
              newDimension.depth = dimensions[key] * 10;
              if (direction === 'upper') newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - newDimension.depth + depth };
            } else {
              newDimension.width = dimensions[key] * 10;
              if (direction === 'left') newPosition = { x: this.plankPosition.x - newDimension.width + width, y: this.plankPosition.y, z: this.plankPosition.z };
            }
          } else if (this.plankType === 'VDP') {
            if (direction === 'upper' || direction === 'lower') {
              newDimension.height = dimensions[key] * 10;
              if (direction === 'lower') newPosition = { x: this.plankPosition.x, y: this.plankPosition.y - newDimension.height + height, z: this.plankPosition.z };
            } else {
              newDimension.depth = dimensions[key] * 10;
              if (direction === 'right') newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - newDimension.depth + depth };
            }
          } else if (this.plankType === 'VP') {
            if (direction === 'upper' || direction === 'lower') {
              newDimension.height = dimensions[key] * 10;
              if (direction === 'lower') newPosition = { x: this.plankPosition.x, y: this.plankPosition.y - newDimension.height + height, z: this.plankPosition.z };
            } else {
              newDimension.width = dimensions[key] * 10;
              if (direction === 'left') newPosition = { x: this.plankPosition.x - newDimension.width + width, y: this.plankPosition.y, z: this.plankPosition.z };
            }
          }
        }

        this.inputElement.value = dimensions[key];

        // something has changed, check value integrity
        this.$emit('update:plankDimension', newDimension);
        if (newPosition) this.$emit('update:plankPosition', newPosition);
      }
    },
    resizeByValue(direction, value) {
      let newPosition = null;

      if (direction === 'upper') {
        if (this.plankType === 'FP') newPosition = { x: this.arrows[0].position.x, y: this.arrows[0].position.y, z: this.arrows[0].position.z - value + this.plankDimension.depth };
        else newPosition = { x: this.arrows[0].position.x, y: this.arrows[0].position.y + value - this.plankDimension.height, z: this.arrows[0].position.z };
      } else if (direction === 'lower') {
        if (this.plankType === 'FP') newPosition = { x: this.arrows[2].position.x, y: this.arrows[2].position.y, z: this.arrows[2].position.z + value - this.plankDimension.depth };
        else newPosition = { x: this.arrows[2].position.x, y: this.arrows[2].position.y - value + this.plankDimension.height, z: this.arrows[2].position.z };
      } else if (direction === 'left') {
        if (this.plankType === 'VDP') newPosition = { x: this.arrows[3].position.x, y: this.arrows[3].position.y, z: this.arrows[3].position.z + value - this.plankDimension.depth };
        else newPosition = { x: this.arrows[3].position.x - value + this.plankDimension.width, y: this.arrows[3].position.y, z: this.arrows[3].position.z };
      } else if (direction === 'right') {
        if (this.plankType === 'VDP') newPosition = { x: this.arrows[1].position.x, y: this.arrows[1].position.y, z: this.arrows[1].position.z - value + this.plankDimension.depth };
        else newPosition = { x: this.arrows[1].position.x + value - this.plankDimension.width, y: this.arrows[1].position.y, z: this.arrows[1].position.z };
      }

      this.resizeLogic(direction, newPosition);
    },
    createInput() {
      const inputField = document.createElement('input');
      inputField.classList.add('plank-dimension-input');
      inputField.setAttribute('type', 'number');
      inputField.defaultValue = '';

      return inputField;
    },
    updateStyle() {
      this.inputElement.style.display = this.selectedArrow ? 'unset' : 'none';
      this.inputElement.value = this.selectedArrow ? this.inputElement.value : '0';

      if (this.selectedArrow) this.inputElement.focus();
      let inputPosition = new Vector3(
        this.plankPosition.x,
        this.plankPosition.y,
        this.plankPosition.z,
      );

      switch (this.selectedArrow) {
        case 'upper':
          inputPosition = this.arrows[0].position;
          break;
        case 'right':
          inputPosition = this.arrows[1].position;
          break;
        case 'lower':
          inputPosition = this.arrows[2].position;
          break;
        case 'left':
          inputPosition = this.arrows[3].position;
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
      container.classList.add('dimension-input-container');
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
        this.resizeByValue(this.selectedArrow, parseFloat(value) * 10);
        this.inputElement.value = '';
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
      if (this.inputElement.value.length === 0) this.inputElement.value = '0';
      this.inputElement.value = parseFloat(this.inputElement.value);
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
  .plank-dimension-input {
    position: absolute;
  }
</style>
