<script>
import { Vector3 } from 'three';

export default {
  name: 'Coordinate',
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
  computed: {
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
  },
  methods: {
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);

      vector.x = (vector.x + 1) / 2 * this.domElement.width - 70;
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
        if (this.isGroupArrow) arrows[i].inst.isGroupArrow = true;
        for (let ii = 0; ii < arrows[i].inst.children.length; ii += 1) {
          arrows[i].inst.children[ii].name = arrows[i].inst.name;
          arrows[i].inst.children[ii].isCoordinate = true;
        }
      }
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
        const keyboardEvent = new KeyboardEvent('keydown', event, false);
        appDiv.dispatchEvent(keyboardEvent);
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
