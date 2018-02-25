<template>
  <div>
  </div>
</template>

<script>
import { Vector3 } from 'three';
import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'PlankEdges',
  inject: ['vglNamespace'],
  props: {
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
    plankEdges: {
      type: String,
      required: true,
    },
    plankPoints: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      topElement: null,
      leftElement: null,
      rightElement: null,
      baseElement: null,
      cutHElement: null,
      cutVElement: null,
      containerElement: null,
    };
  },
  computed: {
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
    edges: {
      get() {
        return this.plankEdges.split('-');
      },
      set(val) {
        // val [one, two, three, four]
        this.$emit('update:plankEdges', val.join('-'));
        this.$nextTick(() => EventBus.$emit('save'));
      },
    },
  },
  mounted() {
    this.addElementsToDOM();
    this.changeEventHandler(true);
    this.vglNamespace.beforeRender.push(this.updateStyle);
  },
  beforeDestroy() {
    this.changeEventHandler(false);
    this.removeElements();
  },
  methods: {
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);
      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height;

      const rect = this.domElement.getBoundingClientRect();
      vector.x = Math.max(30, Math.min(vector.x, rect.width - 70));
      vector.y = Math.max(30, Math.min(vector.y, rect.height - 50));

      return vector;
    },
    createSelect() {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      const option3 = document.createElement('option');
      option1.setAttribute('value', '0');
      option2.setAttribute('value', '6');
      option3.setAttribute('value', '20');
      option1.innerHTML = 'non';
      option2.innerHTML = '0.6';
      option3.innerHTML = '20';
      select.appendChild(option1);
      select.appendChild(option2);
      select.appendChild(option3);
      select.classList.add('plank-edge-input');

      return select;
    },
    updateStyle() {
      const topPosition = new Vector3(
        this.plankPosition.x,
        this.plankType === 'VDP' || this.plankType === 'VP' ? this.plankPosition.y + this.plankDimension.height / 2 : this.plankPosition.y,
        this.plankType === 'FP' ? this.plankPosition.z - this.plankDimension.depth / 2 : this.plankPosition.z,
      );
      const vectorTop2D = this.projectVectorTo2D(topPosition.x, topPosition.y, topPosition.z);
      this.topElement.style.top = `${vectorTop2D.y}px`;
      this.topElement.style.left = `${vectorTop2D.x}px`;

      const leftPosition = new Vector3(
        this.plankType === 'FP' || this.plankType === 'VP' ? this.plankPosition.x - this.plankDimension.width / 2 : this.plankPosition.x,
        this.plankPosition.y,
        this.plankType === 'VDP' ? this.plankPosition.z + this.plankDimension.depth / 2 : this.plankPosition.z,
      );
      const vectorLeft2D = this.projectVectorTo2D(leftPosition.x, leftPosition.y, leftPosition.z);
      this.leftElement.style.top = `${vectorLeft2D.y}px`;
      this.leftElement.style.left = `${vectorLeft2D.x}px`;

      const rightPosition = new Vector3(
        this.plankType === 'FP' || this.plankType === 'VP' ? this.plankPosition.x + this.plankDimension.width / 2 : this.plankPosition.x,
        this.plankPosition.y,
        this.plankType === 'VDP' ? this.plankPosition.z - this.plankDimension.depth / 2 : this.plankPosition.z,
      );
      const vectorRight2D = this.projectVectorTo2D(rightPosition.x, rightPosition.y, rightPosition.z);
      this.rightElement.style.top = `${vectorRight2D.y}px`;
      this.rightElement.style.left = `${vectorRight2D.x}px`;

      const basePosition = new Vector3(
        this.plankPosition.x,
        this.plankType === 'VDP' || this.plankType === 'VP' ? this.plankPosition.y - this.plankDimension.height / 2 : this.plankPosition.y,
        this.plankType === 'FP' ? this.plankPosition.z + this.plankDimension.depth / 2 : this.plankPosition.z,
      );
      const vectorBase2D = this.projectVectorTo2D(basePosition.x, basePosition.y, basePosition.z);
      this.baseElement.style.top = `${vectorBase2D.y}px`;
      this.baseElement.style.left = `${vectorBase2D.x}px`;

      if (this.plankPoints) {
        const cutHPosition = new Vector3(
          this.plankPosition.x,
          this.plankPosition.y - this.plankDimension.height / 2 + this.plankPoints[3][1] * 10,
          this.plankPosition.z - this.plankDimension.depth / 2 + (this.plankPoints[3][0] + this.plankPoints[4][0]) * 5,
        );
        const vectorCutH2D = this.projectVectorTo2D(cutHPosition.x, cutHPosition.y, cutHPosition.z);
        this.cutHElement.style.top = `${vectorCutH2D.y}px`;
        this.cutHElement.style.left = `${vectorCutH2D.x}px`;

        const cutVPosition = new Vector3(
          this.plankPosition.x,
          this.plankPosition.y - this.plankDimension.height / 2 + (this.plankPoints[4][1] + this.plankPoints[5][1]) * 5,
          this.plankPosition.z - this.plankDimension.depth / 2 + this.plankPoints[4][0] * 10,
        );
        const vectorCutV2D = this.projectVectorTo2D(cutVPosition.x, cutVPosition.y, cutVPosition.z);
        this.cutVElement.style.top = `${vectorCutV2D.y}px`;
        this.cutVElement.style.left = `${vectorCutV2D.x}px`;
      }
    },
    addElementsToDOM() {
      const appDiv = document.getElementById('content-3d');
      const container = document.createElement('div');
      container.classList.add('edges-input-container');
      this.topElement = this.createSelect();
      this.topElement.value = this.initElement('top');
      this.leftElement = this.createSelect();
      this.leftElement.value = this.initElement('left');
      this.rightElement = this.createSelect();
      this.rightElement.value = this.initElement('right');
      this.baseElement = this.createSelect();
      this.baseElement.value = this.initElement('base');
      if (this.plankPoints) {
        this.cutHElement = this.createSelect();
        this.cutHElement.value = this.initElement('cutH');
        this.cutVElement = this.createSelect();
        this.cutVElement.value = this.initElement('cutV');
      }
      container.appendChild(this.topElement);
      container.appendChild(this.leftElement);
      container.appendChild(this.rightElement);
      container.appendChild(this.baseElement);
      if (this.plankPoints) {
        container.appendChild(this.cutHElement);
        container.appendChild(this.cutVElement);
      }
      this.containerElement = container;
      appDiv.insertBefore(container, appDiv.firstChild);
    },
    removeElements() {
      const appDiv = document.getElementById('content-3d');
      appDiv.removeChild(this.containerElement);
    },
    initElement(boxType) {
      switch (boxType) {
        case 'top':
          switch (this.plankType) {
            case 'VP':
              return this.edges[2];
            case 'FP':
              return this.edges[3];
            case 'VDP':
              return this.edges[1];
            default:
              return '0';
          }
        case 'left':
          switch (this.plankType) {
            case 'VP':
              return this.edges[3];
            case 'FP':
              return this.edges[0];
            case 'VDP':
              return this.edges[this.plankPoints ? 0 : 2];
            default:
              return '0';
          }
        case 'right':
          switch (this.plankType) {
            case 'VP':
              return this.edges[1];
            case 'FP':
              return this.edges[2];
            case 'VDP':
              return this.edges[this.plankPoints ? 2 : 0];
            default:
              return '0';
          }
        case 'base':
          switch (this.plankType) {
            case 'VP':
              return this.edges[0];
            case 'FP':
              return this.edges[1];
            case 'VDP':
              return this.edges[this.plankPoints ? 5 : 3];
            default:
              return '0';
          }
        case 'cutH':
          return this.edges[3];
        case 'cutV':
          return this.edges[4];
        default:
          return '0';
      }
    },
    onChange(boxType, val) {
      // boxType : top, left, right, base
      const { value } = val.target;
      const newEdges = [...this.edges];
      switch (boxType) {
        case 'top':
          switch (this.plankType) {
            case 'VP':
              newEdges[2] = value;
              break;
            case 'FP':
              newEdges[3] = value;
              break;
            case 'VDP':
              newEdges[1] = value;
              break;
            default:
              break;
          }
          break;
        case 'left':
          switch (this.plankType) {
            case 'VP':
              newEdges[3] = value;
              break;
            case 'FP':
              newEdges[0] = value;
              break;
            case 'VDP':
              newEdges[this.plankPoints ? 0 : 2] = value;
              break;
            default:
              break;
          }
          break;
        case 'right':
          switch (this.plankType) {
            case 'VP':
              newEdges[1] = value;
              break;
            case 'FP':
              newEdges[2] = value;
              break;
            case 'VDP':
              newEdges[this.plankPoints ? 2 : 0] = value;
              break;
            default:
              break;
          }
          break;
        case 'base':
          switch (this.plankType) {
            case 'VP':
              newEdges[0] = value;
              break;
            case 'FP':
              newEdges[1] = value;
              break;
            case 'VDP':
              newEdges[this.plankPoints ? 5 : 3] = value;
              break;
            default:
              break;
          }
          break;
        case 'cutH':
          newEdges[3] = value;
          break;
        case 'cutV':
          newEdges[4] = value;
          break;
        default:
          break;
      }
      this.edges = newEdges;
    },
    changeEventHandler(bool) {
      const self = this;
      const handleTopChange = (val => self.onChange('top', val));
      const handleLeftChange = (val => self.onChange('left', val));
      const handleRightChange = (val => self.onChange('right', val));
      const handleBaseChange = (val => self.onChange('base', val));
      const handleCutHChange = (val => self.onChange('cutH', val));
      const handleCutVChange = (val => self.onChange('cutV', val));

      if (bool) {
        this.topElement.addEventListener('change', handleTopChange);
        this.leftElement.addEventListener('change', handleLeftChange);
        this.rightElement.addEventListener('change', handleRightChange);
        this.baseElement.addEventListener('change', handleBaseChange);
        if (this.plankPoints) {
          this.cutHElement.addEventListener('change', handleCutHChange);
          this.cutVElement.addEventListener('change', handleCutVChange);
        }
      } else {
        this.topElement.removeEventListener('change', handleTopChange);
        this.leftElement.removeEventListener('change', handleLeftChange);
        this.rightElement.removeEventListener('change', handleRightChange);
        this.baseElement.removeEventListener('change', handleBaseChange);
        if (this.plankPoints) {
          this.cutHElement.removeEventListener('change', handleCutHChange);
          this.cutVElement.removeEventListener('change', handleCutVChange);
        }
      }
    },
  },
  watch: {
    plankPosition() {
      this.updateStyle();
    },
    plankDimension() {
      this.updateStyle();
    },
    plankType() {
      this.updateStyle();
    },
  },
};
</script>
<style>
  .plank-edge-input {
    position: absolute;
  }
</style>
