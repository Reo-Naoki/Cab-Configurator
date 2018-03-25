<template>
  <div>
  </div>
</template>

<script>
import { Vector2, Vector3 } from 'three';
import { mapState } from 'vuex';
import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'ShapeLines',
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
    plankPoints: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      edgeElements: [],
      containerElement: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'panels',
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
    selectedObject3DIndex() {
      if (!this.selectedObject3D) return -1;
      const selectedObject = this.selectedObject3D.object3d;
      if (selectedObject.isPanel) return this.panels.findIndex(p => p.id === selectedObject.name);
      return this.panels.findIndex(p => p.id === selectedObject.name.split('_')[0]);
    },
    edges() {
      return this.plankPoints.map((point, index) => {
        const nextIndex = (index + 1) % this.plankPoints.length;
        const nextPoint = this.plankPoints[nextIndex];
        return Math.round(new Vector2(point[0], point[1]).distanceTo(new Vector2(nextPoint[0], nextPoint[1])) * 10) / 10;
      });
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
      vector.x = (vector.x + 1) / 2 * this.domElement.width - 25;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height - 10;

      const rect = this.domElement.getBoundingClientRect();
      vector.x = Math.max(30, Math.min(vector.x, rect.width - 70));
      vector.y = Math.max(30, Math.min(vector.y, rect.height - 50));

      return vector;
    },
    updateStyle() {
      if (this.plankPoints.length !== this.edgeElements.length) {
        this.changeEventHandler(false);
        this.removeElements();
        this.addElementsToDOM();
        this.changeEventHandler(true);
      }

      const name = this.selectedObject3D ? this.selectedObject3D.object3d.name : '';
      const pointIndex = name.includes('SHAPE') ? Number(name.split('SHAPE')[1].split('M')[0]) : -1;

      this.plankPoints.forEach((point, index) => {
        const nextIndex = (index + 1) % this.plankPoints.length;
        const edgePosition = new Vector3(
          this.plankPosition.x,
          this.plankPosition.y - this.plankDimension.height / 2 + (point[1] + this.plankPoints[nextIndex][1]) * 5,
          this.plankPosition.z - this.plankDimension.depth / 2 + (point[0] + this.plankPoints[nextIndex][0]) * 5,
        );
        const vectorEdge2D = this.projectVectorTo2D(edgePosition.x, edgePosition.y, edgePosition.z);

        this.edgeElements[index].style.top = `${vectorEdge2D.y}px`;
        this.edgeElements[index].style.left = `${vectorEdge2D.x}px`;
        this.edgeElements[index].style.display = (pointIndex === index || pointIndex === nextIndex || pointIndex === -1) ? 'unset' : 'none';
        this.edgeElements[index].value = this.edges[index];
      });
    },
    createInput(id) {
      const inputField = document.createElement('input');
      inputField.classList.add('plank-line-input');
      inputField.setAttribute('type', 'number');
      inputField.setAttribute('id', id);
      inputField.defaultValue = '0';

      return inputField;
    },
    addElementsToDOM() {
      this.edgeElements = [];
      const appDiv = document.getElementById('content-3d');
      const container = document.createElement('div');
      container.classList.add('line-input-container');

      this.plankPoints.forEach((point, index) => {
        const edgeElement = this.createInput(index);
        edgeElement.value = this.edges[index];
        this.edgeElements.push(edgeElement);
        container.appendChild(edgeElement);
      });

      this.containerElement = container;
      appDiv.insertBefore(container, appDiv.firstChild);
    },
    removeElements() {
      const appDiv = document.getElementById('content-3d');
      appDiv.removeChild(this.containerElement);
    },
    onChange(index, value) {
      const { name } = this.selectedObject3D.object3d;
      const pointIndex = name.includes('SHAPE') ? Number(name.split('SHAPE')[1].split('M')[0]) : ((index + 1) % this.plankPoints.length);
      const nextIndex = (name.includes('SHAPE') && pointIndex === index) ? (index + 1) % this.plankPoints.length : index;
      let points = Array.from(this.plankPoints);
      const direct = new Vector2(points[pointIndex][0] - points[nextIndex][0], points[pointIndex][1] - points[nextIndex][1]).normalize();

      points[pointIndex] = new Vector2(points[nextIndex][0], points[nextIndex][1]).add(direct.multiplyScalar(value));
      points[pointIndex] = [points[pointIndex].x, points[pointIndex].y];

      const minX = Math.min(...points.map(p => p[0]));
      const minY = Math.min(...points.map(p => p[1]));
      const maxX = Math.max(...points.map(p => p[0]));
      const maxY = Math.max(...points.map(p => p[1]));
      const width = (maxX - minX) * 10;
      const height = (maxY - minY) * 10;
      points = points.map(p => ([p[0] - minX, p[1] - minY]));

      Object.values(window.panels)[this.selectedObject3DIndex].dimensionsByType = {
        depth: width,
        height,
        width: Object.values(window.panels)[this.selectedObject3DIndex].dimensionsByType.width,
      };
      Object.values(window.panels)[this.selectedObject3DIndex].fixedPosition = {
        x: Object.values(window.panels)[this.selectedObject3DIndex].fixedPosition.x,
        y: Object.values(window.panels)[this.selectedObject3DIndex].fixedPosition.y + minY * 10,
        z: Object.values(window.panels)[this.selectedObject3DIndex].fixedPosition.z + minX * 10,
      };

      this.$emit('update:plankPoints', points);
      this.$nextTick(() => EventBus.$emit('save'));
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
        const { value } = event.target;
        this.onChange(Number(event.target.id), value);
        const appDiv = this.vglNamespace.renderers[0].inst.domElement;
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        appDiv.dispatchEvent(clickEvent);
      }
    },
    sendMouseEvent(type, event) {
      const appDiv = this.vglNamespace.renderers[0].inst.domElement;
      const mouseEvent = new MouseEvent(type, event, false);
      appDiv.dispatchEvent(mouseEvent);
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
        this.edgeElements.forEach((element) => {
          element.addEventListener('keydown', this.onKeyDown);
          element.addEventListener('mousemove', this.onMouseMove, false);
          element.addEventListener('auxclick', this.onMouseRightClick, false);
          element.addEventListener('wheel', this.onMouseWheel, false);
        });
      } else {
        this.edgeElements.forEach((element) => {
          element.removeEventListener('keydown', this.onKeyDown);
          element.removeEventListener('mousemove', this.onMouseMove, false);
          element.removeEventListener('auxclick', this.onMouseRightClick, false);
          element.removeEventListener('wheel', this.onMouseWheel, false);
        });
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
  },
};
</script>
<style>
  .plank-line-input {
    position: absolute;
    font-size: 14px;
    width: 90px;
    background: space;
    border: slategrey;
  }
</style>
