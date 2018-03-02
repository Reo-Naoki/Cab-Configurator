import {
  Vector2,
  Vector3,
  Matrix4,
  Plane,
  Raycaster,
} from 'three';
import { mapState } from 'vuex';

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
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras[this.camera];
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
    objects() {
      return Object.values(this.vglNamespace.object3ds).filter(obj => obj.isPanel || obj.isDimension || obj.isCoordinate || obj.isPhysicalGeometry || obj.isConnectionBubble);
    },
    childObjects() {
      return this.vglNamespace.object3ds;
    },
    resetMoveResize() {
      this.$store.commit('Panels/enableMoving', false);
      this.$store.commit('Panels/enableResizing', false);
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
            magnetism: !event.shiftKey,
          });
        }
        return;
      }

      const intersects = this.raycaster.intersectObjects(this.objects(), true);

      if (intersects.length > 0) {
        const { name } = intersects[0].object;
        const objectID = name.split('_')[0];
        const intersectObj = intersects[0].object.isPhysicalGeometry ? { object: this.childObjects()[objectID], point: intersects[0].point } : intersects[0];

        if (!intersectObj && intersects.length <= 1) return;

        const { object, point } = (!intersectObj && intersects.length > 1) ? intersects[1] : intersectObj;
        // if (object.isPanel && this.selectedObject === object && this.enableMoving && !this.isDragging) {
        if (this.selectedObject3D && object.isPanel && this.enableMoving && !this.isDragging
          && (this.selectedObject3D.object3d === object
            || (() => {
              let { groupName } = window.panels[object.name];
              while (groupName) {
                if (this.selectedObject3D.object3d.name === groupName) return true;
                ({ groupName } = window.groups[groupName]);
              }
              return false;
            }))) {
          this.$emit('hovermove', object, point.clone());
        } else {
          this.$store.commit('Camera/setHoverObject3D');
        }

        this.plane.setFromNormalAndCoplanarPoint(this.cameraInst.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(object.matrixWorld));

        if (this.hoveredObject !== object) {
          this.domElement.style.cursor = 'pointer';
          this.hoveredObject = object;
          // this.$emit('hoveron', object);
        }
      } else {
        if (this.hoveredObject !== null) {
          this.domElement.style.cursor = 'auto';
          this.hoveredObject = null;
          // this.$emit('hoveroff', this.hoveredObject);
        }
        this.$store.commit('Camera/setHoverObject3D');
      }
    },
    onDocumentMouseClick(event) {
      event.preventDefault();
      this.isDragging = false;

      if (this.selected) { // Object was selected and it is moving or resizing
        this.resetMoveResize();
        this.$emit('dragend', this.selected);
        this.$emit('hoveroff');
        this.selected = null;

        this.domElement.style.cursor = this.hoveredObject ? 'pointer' : 'auto';
      } else if (this.prevMousePos.distanceTo(new Vector2(event.clientX, event.clientY)) < 10) { // If mouse clicked on same place
        this.raycaster.setFromCamera(this.mouse, this.cameraInst);

        const intersects = this.raycaster.intersectObjects(this.objects(), true);
        if (intersects.length > 0) {
          const { name } = intersects[0].object;
          const objectID = name.split('_')[0];
          const intersectObj = intersects[0].object.isPhysicalGeometry ? { object: this.childObjects()[objectID], point: intersects[0].point } : intersects[0];

          if (!intersectObj) return;

          const { object } = (!intersectObj && intersects.length > 1) ? intersects[1] : intersectObj;
          this.selected = (object.isDimension || object.isCoordinate) ? object.parent : object;

          if (object.isPanel) this.selectedPanel = object;

          if (this.selectedObject3D) this.selectedObject = this.selectedObject3D.object3d;
          this.$emit('dragstart', this.selected);

          const selectedObject3D = this.vglNamespace.object3ds[this.selectedObject3D.object3d.name];
          if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            const matrixWorld = selectedObject3D.parent != null
              ? selectedObject3D.parent.matrixWorld
              : selectedObject3D.matrixWorld;
            this.inverseMatrix.getInverse(matrixWorld);
            this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(selectedObject3D.matrixWorld));
          }

          if (this.selected.isDimension || this.selected.isCoordinate) {
            this.domElement.style.cursor = 'move';
            this.isDragging = true;
            this.$emit('hoveron');
          } else if (!this.selectedObject || (!this.selectedObject.isDimension && !this.selectedObject.isCoordinate && this.selectedObject3D.object3d !== this.selectedObject)) {
            this.resetMoveResize();
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
        this.$emit('dragcancel');
        this.$emit('hoveroff');
        this.selected = null;
      }

      this.isDragging = false;
      this.resetMoveResize();
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
          });
        }
      }
    },
    onDocumentTouchStart(event) {
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      [event] = event.changedTouches;

      this.setRaycaster(event);
      const intersects = this.raycaster.intersectObjects(this.objects(), true);

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
        this.$emit('dragstart', this.selected);
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
      } else if (this.selected && event.code === 'ArrowUp') {
        this.$store.commit('Panels/setMoveDirection', 'y');
      } else if (this.selected && event.code === 'ArrowLeft') {
        this.$store.commit('Panels/setMoveDirection', 'x');
      } else if (this.selected && event.code === 'ArrowRight') {
        this.$store.commit('Panels/setMoveDirection', 'z');
      } else if (this.selected && event.code === 'ArrowDown') {
        this.$store.commit('Panels/setMoveDirection');
      } else this.$store.commit('Panels/setMoveDirection');
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
