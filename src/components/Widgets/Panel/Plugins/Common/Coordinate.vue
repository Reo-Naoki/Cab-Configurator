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
    this.vglNamespace.beforeRender.splice(this.vglNamespace.beforeRender.indexOf(this.updateStyle), 1);
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
    vertPosition() {
      return [];
    },
    updateStyle() {
      this.inputElement.style.display = this.selectedArrow ? 'unset' : 'none';
      this.inputElement.value = this.selectedArrow ? this.inputElement.value : '0';
      const vertPosition = this.vertPosition();

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

      const vector2D = this.projectVectorTo2D(inputPosition.x, inputPosition.y, inputPosition.z);
      const rect = this.domElement.getBoundingClientRect();
      vector2D.x = Math.max(30, Math.min(vector2D.x, rect.width - 200));
      vector2D.y = Math.max(30, Math.min(vector2D.y, rect.height - 50));
      this.inputElement.style.top = `${vector2D.y}px`;
      this.inputElement.style.left = `${vector2D.x}px`;
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
