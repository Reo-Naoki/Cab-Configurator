import {
  Vector2,
  Vector3,
  Matrix4,
  Plane,
  Raycaster,
} from 'three';

export default {
  name: 'DragControls',
  inject: ['vglNamespace'],
  props: {
    camera: {
      type: String,
      required: true,
    },
    enable: {
      type: Boolean,
      default: true,
    },
    enableMoving: {
      type: Boolean,
      default: false,
    },
    enableResizing: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: null,
      hoveredObject: null,
      selectedObject: null,
      isDragging: false,
    };
  },
  computed: {
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras[this.camera];
    },
    objects() {
      return Object.values(this.vglNamespace.object3ds);
    },
    plane: () => new Plane(),
    raycaster: () => new Raycaster(),
    prevMousePos: () => new Vector2(),
    mouse: () => new Vector2(),
    offset: () => new Vector3(),
    intersection: () => new Vector3(),
    worldPosition: () => new Vector3(),
    inverseMatrix: () => new Matrix4(),
  },
  methods: {
    activate() {
      this.domElement.addEventListener('touchstart', this.onDocumentTouchStart, false);
      this.domElement.addEventListener('keydown', this.onDocumentKeyDown, false);
      this.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
      this.domElement.addEventListener('click', this.onDocumentMouseClick, false);
      this.domElement.addEventListener('auxclick', this.onDocumentRightMouseClick, false);
      this.domElement.addEventListener('wheel', this.onDocumentMouseWheel, false);

      let appDiv = this.domElement;
      if (document.getElementById('content-3d')) appDiv = document.getElementById('content-3d');

      appDiv.addEventListener('mousemove', this.onDocumentMouseMove, false);
      appDiv.addEventListener('touchmove', this.onDocumentTouchMove, false);
      appDiv.addEventListener('touchend', this.onDocumentTouchEnd, false);
    },
    deactivate() {
      this.domElement.removeEventListener('touchstart', this.onDocumentTouchStart, false);
      this.domElement.removeEventListener('keydown', this.onDocumentKeyDown, false);
      this.domElement.removeEventListener('click', this.onDocumentMouseClick, false);
      this.domElement.removeEventListener('auxclick', this.onDocumentRightMouseClick, false);
      this.domElement.removeEventListener('wheel', this.onDocumentMouseWheel, false);

      let appDiv = this.domElement;
      if (document.getElementById('content-3d')) appDiv = document.getElementById('content-3d');

      appDiv.removeEventListener('mousemove', this.onDocumentMouseMove, false);
      appDiv.removeEventListener('touchmove', this.onDocumentTouchMove, false);
      appDiv.removeEventListener('touchend', this.onDocumentTouchEnd, false);
    },
    setRaycaster(event) {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.cameraInst);
    },
    onDocumentMouseWheel(event) {
      event.preventDefault();

      this.onDocumentMouseMove(event);
    },
    onDocumentMouseDown(event) {
      event.preventDefault();

      // Save mouse position
      this.prevMousePos.x = event.clientX;
      this.prevMousePos.y = event.clientY;
      this.isDragging = true;
    },
    onDocumentMouseMove(event) {
      event.preventDefault();

      this.setRaycaster(event);
      const intersects = this.raycaster.intersectObjects(this.objects, true);

      if (this.selected != null && this.enable && ((this.enableMoving && (this.selected.isPanel || this.selected.isCoordinate)) || (this.enableResizing && this.selected.isDimension))) {
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
          const position = this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix);
          const roundPosition = {
            x: Math.round(position.x),
            y: Math.round(position.y),
            z: Math.round(position.z),
          };
          // careful, position will need to be fixed (it's a threejs position)
          this.$emit('move', {
            event,
            selected: this.selected,
            position: roundPosition,
            faceIndex: this.selectedFaceIndex,
            magnetism: !event.shiftKey,
          });
        }
        return;
      }

      if (intersects.length > 0) {
        const { name } = intersects[0].object;
        const objectID = name.split('_')[0];
        const intersectObj = (name.includes('physicalGeometry')) ? intersects.find(c => c.object.name === objectID) : intersects[0];

        const { object, point } = (!intersectObj && intersects.length > 1) ? intersects[1] : intersectObj;

        if (object.isPanel && this.selectedObject === object && this.enableMoving && !this.isDragging) {
          this.$emit('hovermove', object, point.clone().sub(object.position));
        } else if (!object.isVertex) {
          this.$store.commit('Camera/setHoverObject3D');
        }
      } else {
        this.$store.commit('Camera/setHoverObject3D');
      }

      if (intersects.length > 0) {
        const { name } = intersects[0].object;
        const objectID = name.split('_')[0];
        const intersectObj = (name.includes('physicalGeometry')) ? intersects.find(c => c.object.name === objectID) : intersects[0];

        const { object } = (!intersectObj && intersects.length > 1) ? intersects[1] : intersectObj;

        this.plane.setFromNormalAndCoplanarPoint(this.cameraInst.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(object.matrixWorld));

        if (this.hoveredObject !== object) {
          this.domElement.style.cursor = 'pointer';
          this.hoveredObject = object;
          // this.$emit('hoveron', object);
        }
      } else if (this.hoveredObject !== null) {
        this.domElement.style.cursor = 'auto';
        this.hoveredObject = null;
        // this.$emit('hoveroff', this.hoveredObject);
      }
    },
    onDocumentMouseClick(event) {
      event.preventDefault();
      this.isDragging = false;

      if (this.selected) { // Object was selected and it is moving or resizing
        this.$store.commit('Panels/enableMoving', false);
        this.$store.commit('Panels/enableResizing', false);
        this.$emit('dragend', this.selected);
        this.$emit('hoveroff');
        this.selected = null;

        this.domElement.style.cursor = this.hoveredObject ? 'pointer' : 'auto';
      } else if (this.prevMousePos.distanceTo(new Vector2(event.clientX, event.clientY)) < 10) { // If mouse clicked on same place
        this.raycaster.setFromCamera(this.mouse, this.cameraInst);

        const intersects = this.raycaster.intersectObjects(this.objects, true);
        if (intersects.length > 0) {
          const { name } = intersects[0].object;
          const objectID = name.split('_')[0];
          const intersectObj = (name.includes('physicalGeometry')) ? intersects.find(c => c.object.name === objectID) : intersects[0];

          const { object, faceIndex } = (!intersectObj && intersects.length > 1) ? intersects[1] : intersectObj;

          this.selected = (object.isDimension || object.isCoordinate) ? object.parent : object;
          this.selectedFaceIndex = faceIndex;

          if (object.isPanel) {
            this.selectedPanel = object;
            this.selectedPanelFaceIndex = faceIndex;
          } else if (object.isVertex) {
            this.selected = this.selectedPanel;
            this.selectedFaceIndex = this.selectedPanelFaceIndex;
          }

          if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            const matrixWorld = this.selected.parent != null
              ? this.selected.parent.matrixWorld
              : this.selected.matrixWorld;
            this.inverseMatrix.getInverse(matrixWorld);
            this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));
          }

          this.$emit('dragstart', this.selected, this.selectedFaceIndex);

          if (this.selected.isDimension) {
            this.domElement.style.cursor = 'move';
            this.isDragging = true;
            this.$emit('hoveron');
          } else if (this.selected.isCoordinate) {
            this.domElement.style.cursor = 'move';
            this.isDragging = true;
            this.$emit('hoveron');
          } else if (this.selectedObject !== this.selected) {
            this.$store.commit('Panels/enableMoving', false);
            this.$store.commit('Panels/enableResizing', false);
            this.selectedObject = this.selected;
            this.selected = null;
          } else if (this.enableMoving) {
            this.domElement.style.cursor = 'move';
            this.isDragging = true;
            this.$emit('hoveron');
          } else {
            this.selected = null;
          }
        } else {
          this.$store.commit('Camera/selectObject3D');

          this.selectedObject = null;
          this.selected = null;
        }
      }
    },
    onDocumentRightMouseClick(event) {
      event.preventDefault();

      if (this.selected) {
        this.$emit('dragcancel', this.selected);
        this.$emit('hoveroff');
        this.selected = null;
      }
      this.isDragging = false;

      this.domElement.style.cursor = this.hoveredObject ? 'pointer' : 'auto';
    },
    onDocumentTouchMove(event) {
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      [event] = event.changedTouches;

      this.setRaycaster(event);

      if (this.selected && this.enable && this.enableMoving) {
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
          const position = this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix);
          const roundPosition = {
            x: Math.round(position.x),
            y: Math.round(position.y),
            z: Math.round(position.z),
          };
          this.$emit('move', {
            selected: this.selected,
            position: roundPosition,
            faceIndex: this.selectedFaceIndex,
          });
        }
      }
    },
    onDocumentTouchStart(event) {
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      [event] = event.changedTouches;

      this.setRaycaster(event);
      const intersects = this.raycaster.intersectObjects(this.objects, true);

      if (intersects.length > 0) {
        this.selected = intersects[0].object;

        this.plane.setFromNormalAndCoplanarPoint(this.cameraInst.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));

        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
          const matrixWorld = this.selected.parent != null
            ? this.selected.parent.matrixWorld
            : this.selected.matrixWorld;
          this.inverseMatrix.getInverse(matrixWorld);
          this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));
        }
        if (this.enableMoving) this.domElement.style.cursor = 'move';
        this.$emit('dragstart', this.selected, this.selectedFaceIndex);
      }
    },
    onDocumentTouchEnd(event) {
      event.preventDefault();

      if (this.selected) {
        this.$emit('dragend', this.selected);
        this.selected = null;
      }

      this.domElement.style.cursor = 'auto';
    },
    onDocumentKeyDown(event) {
      event.preventDefault();

      if (this.selected && event.code === 'Escape') {
        this.onDocumentRightMouseClick(event);
      }
    },
  },
  watch: {
    enable: {
      handler(isEnable) {
        if (isEnable) this.activate();
        else this.deactivate();
      },
      immediate: true,
    },
  },
  render(h) { return this.$slots.default ? h('div', this.$slots.default) : undefined; },
};
