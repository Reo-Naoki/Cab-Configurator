<template>
  <div v-if="begin != null && end != null">
   <vgl-geometry ref="geometry" name="ruler" :position-attribute="vertices" />
   <vgl-line-segments ref="line" geometry="ruler" material="ruler" />
  </div>
</template>

<script>
import { Vector3, Vector2 } from 'three';
import { mapState } from 'vuex';

export default {
  name: 'Ruler',
  inject: ['vglNamespace'],
  props: {
    begin: {
      required: true,
    },
    end: {
      required: true,
    },
  },
  mounted() {
    this.addElementsToDOM();
    this.changeEventHandler(true);
    this.vglNamespace.beforeRender.push(this.updateStyle);
    window.ruler = this;
  },
  beforeDestroy() {
    this.changeEventHandler(false);
    this.removeElements();
  },
  data() {
    return {
      textElement: null,
      leftBarElement: null,
      rightBarElement: null,
      containerElement: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'rulerPointStep',
    ]),
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
    vertices() {
      const { begin: { x: bx, y: by, z: bz }, end: { x: ex, y: ey, z: ez } } = this;
      return [bx, by, bz, ex, ey, ez];
    },
  },
  methods: {
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);

      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height;

      return new Vector2(vector.x, vector.y);
    },
    createText() {
      const infoField = document.createElement('div');
      infoField.classList.add('plank-ruler-text');
      infoField.innerHTML = '';

      return infoField;
    },
    createBar() {
      const rulerBar = document.createElement('div');
      rulerBar.classList.add('plank-ruler-bar');

      return rulerBar;
    },
    updateStyle() {
      const beginPoint = this.begin ? new Vector3(this.begin.x, this.begin.y, this.begin.z) : null;
      const endPoint = this.end ? new Vector3(this.end.x, this.end.y, this.end.z) : null;

      if (beginPoint && endPoint) {
        this.textElement.style.display = beginPoint.distanceTo(endPoint) > 0 ? 'unset' : 'none';
        this.leftBarElement.style.display = (this.rulerPointStep === 0 && beginPoint.distanceTo(endPoint) > 0) ? 'unset' : 'none';
        this.rightBarElement.style.display = (this.rulerPointStep === 0 && beginPoint.distanceTo(endPoint) > 0) ? 'unset' : 'none';

        const totalDistance = (beginPoint.distanceTo(endPoint) / 10).toFixed(1);
        const xDistance = Math.abs((beginPoint.z - endPoint.z) / 10).toFixed(1);
        const yDistance = Math.abs((beginPoint.x - endPoint.x) / 10).toFixed(1);
        const zDistance = Math.abs((beginPoint.y - endPoint.y) / 10).toFixed(1);
        this.textElement.innerHTML = `
            <h4 style="margin-bottom: 0px; text-align: center">${totalDistance} mm</h4>
            <div style="border-bottom: 1px solid black; height: 2px" />
            <div style="padding-left: 5px">X: ${xDistance} mm</div>
            <div style="padding-left: 5px">Y: ${yDistance} mm</div>
            <div style="padding-left: 5px">Z: ${zDistance} mm</div>
        `;

        const rect = this.domElement.getBoundingClientRect();

        const leftBar2D = this.projectVectorTo2D(beginPoint.x, beginPoint.y, beginPoint.z);
        leftBar2D.x = Math.max(20, Math.min(leftBar2D.x, rect.width - 20));
        leftBar2D.y = Math.max(30, Math.min(leftBar2D.y, rect.height - 25));
        this.leftBarElement.style.top = `${leftBar2D.y}px`;
        this.leftBarElement.style.left = `${leftBar2D.x}px`;

        const rightBar2D = this.projectVectorTo2D(endPoint.x, endPoint.y, endPoint.z);
        rightBar2D.x = Math.max(20, Math.min(rightBar2D.x, rect.width - 20));
        rightBar2D.y = Math.max(30, Math.min(rightBar2D.y, rect.height - 25));
        this.rightBarElement.style.top = `${rightBar2D.y}px`;
        this.rightBarElement.style.left = `${rightBar2D.x}px`;

        const vectorTop2D = leftBar2D.clone().lerp(rightBar2D, 0.5);
        vectorTop2D.x = Math.max(30, Math.min(vectorTop2D.x - 50, rect.width - 150));
        vectorTop2D.y = Math.max(10, Math.min(vectorTop2D.y - 100, rect.height - 100));
        this.textElement.style.top = `${vectorTop2D.y}px`;
        this.textElement.style.left = `${vectorTop2D.x}px`;

        let angle = leftBar2D.clone().sub(rightBar2D).angle() / Math.PI * 180.0;
        if (angle < 90 || angle > 270) angle += 180;
        this.leftBarElement.style.transform = `rotate(${angle}deg)`;
        this.leftBarElement.style.transformOrigin = '0% 0%';
        this.rightBarElement.style.transform = `rotate(${angle}deg)`;
        this.rightBarElement.style.transformOrigin = '0% 0%';
      } else {
        this.textElement.style.display = 'none';
        this.leftBarElement.style.display = 'none';
        this.rightBarElement.style.display = 'none';
        this.textElement.innerHTML = '0';
      }
    },
    addElementsToDOM() {
      const appDiv = document.getElementById('content-3d');
      const container = document.createElement('div');
      container.classList.add('ruler-text-container');
      this.leftBarElement = this.createBar();
      container.appendChild(this.leftBarElement);
      this.rightBarElement = this.createBar();
      container.appendChild(this.rightBarElement);
      this.textElement = this.createText();
      container.appendChild(this.textElement);
      this.containerElement = container;
      appDiv.insertBefore(container, appDiv.firstChild);
      this.containerElement.style.cursor = 'crosshair';
    },
    removeElements() {
      const appDiv = document.getElementById('content-3d');
      appDiv.removeChild(this.containerElement);
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
        this.textElement.addEventListener('mousedown', this.onMouseDown, false);
        this.textElement.addEventListener('click', this.onMouseClick, false);
        this.textElement.addEventListener('mousemove', this.onMouseMove, false);
        this.textElement.addEventListener('auxclick', this.onMouseRightClick, false);
        this.textElement.addEventListener('wheel', this.onMouseWheel, false);
        this.leftBarElement.addEventListener('mousedown', this.onMouseDown, false);
        this.leftBarElement.addEventListener('click', this.onMouseClick, false);
        this.rightBarElement.addEventListener('mousedown', this.onMouseDown, false);
        this.rightBarElement.addEventListener('click', this.onMouseClick, false);
      } else {
        this.textElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.textElement.removeEventListener('click', this.onMouseClick, false);
        this.textElement.removeEventListener('mousemove', this.onMouseMove, false);
        this.textElement.removeEventListener('auxclick', this.onMouseRightClick, false);
        this.textElement.removeEventListener('wheel', this.onMouseWheel, false);
        this.leftBarElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.leftBarElement.removeEventListener('click', this.onMouseClick, false);
        this.rightBarElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.rightBarElement.removeEventListener('click', this.onMouseClick, false);
      }
    },
  },
};
</script>

<style>
  .plank-ruler-text {
    text-align: left;
    width: 120px;
    height:25px;
    position: absolute;
    user-select: none;
  }
  .plank-ruler-bar {
    border: 1px solid #ff5555;
    width: 1px;
    height:15px;
    position: absolute;
  }
</style>
