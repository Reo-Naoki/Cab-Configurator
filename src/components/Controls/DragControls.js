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
      hovered: null,
      selectedObject: null,
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
    prevMouse: () => new Vector2(),
    mouse: () => new Vector2(),
    offset: () => new Vector3(),
    intersection: () => new Vector3(),
    worldPosition: () => new Vector3(),
    inverseMatrix: () => new Matrix4(),
  },
  methods: {
    activate() {
      this.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
      this.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
      this.domElement.addEventListener('click', this.onDocumentMouseClick, false);
      this.domElement.addEventListener('auxclick', this.onDocumentMouseClick, false);
      this.domElement.addEventListener('mouseleave', this.onDocumentMouseCancel, false);
      this.domElement.addEventListener('touchmove', this.onDocumentTouchMove, false);
      this.domElement.addEventListener('touchstart', this.onDocumentTouchStart, false);
      this.domElement.addEventListener('touchend', this.onDocumentTouchEnd, false);
    },
    deactivate() {
      this.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
      this.domElement.removeEventListener('click', this.onDocumentMouseClick, false);
      this.domElement.removeEventListener('auxclick', this.onDocumentMouseClick, false);
      this.domElement.removeEventListener('mouseleave', this.onDocumentMouseCancel, false);
      this.domElement.removeEventListener('touchmove', this.onDocumentTouchMove, false);
      this.domElement.removeEventListener('touchstart', this.onDocumentTouchStart, false);
      this.domElement.removeEventListener('touchend', this.onDocumentTouchEnd, false);
    },
    onDocumentMouseDown(event) {
      event.preventDefault();
      this.prevMouse.x = event.clientX;
      this.prevMouse.y = event.clientY;
    },
    onDocumentMouseMove(event) {
      event.preventDefault();
      const rect = this.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraInst);

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

      // if (this.selectedObject != null) {
      //   const position = this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix);
      //   const roundPosition = {
      //     x: Math.round(position.x),
      //     y: Math.round(position.y),
      //     z: Math.round(position.z),
      //   };
      //   this.$emit('move', {
      //     event,
      //     selected: this.selectedObject,
      //     position: roundPosition,
      //     faceIndex: this.selectedFaceIndex,
      //     magnetism: !event.shiftKey,
      //   });
      // }
      this.raycaster.setFromCamera(this.mouse, this.cameraInst);
      const intersects = this.raycaster.intersectObjects(this.objects, true);

      if (intersects.length > 0) {
        const { object } = intersects[0];
        this.plane.setFromNormalAndCoplanarPoint(this.cameraInst.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(object.matrixWorld));

        if (this.hovered !== object) {
          this.domElement.style.cursor = 'pointer';
          this.hovered = object;
          this.$emit('hoveron', object);
        }
      } else if (this.hovered !== null) {
        this.domElement.style.cursor = 'auto';
        this.hovered = null;
        this.$emit('hoveroff', this.hovered);
      }
    },
    onDocumentMouseClick(event) {
      event.preventDefault();

      if (this.selected) {
        this.$emit('dragend', this.selected);
        this.selected = null;

        this.domElement.style.cursor = this.hovered ? 'pointer' : 'auto';
      } else {
        this.raycaster.setFromCamera(this.mouse, this.cameraInst);

        const intersects = this.raycaster.intersectObjects(this.objects, true);
        if (intersects.length > 0) {
          const { object, faceIndex } = intersects[0];
          this.selected = (object.isDimension || object.isCoordinate) ? object.parent : object;
          this.selectedFaceIndex = faceIndex;
          if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            const matrixWorld = this.selected.parent != null
              ? this.selected.parent.matrixWorld
              : this.selected.matrixWorld;
            this.inverseMatrix.getInverse(matrixWorld);
            this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));
          }

          if (this.selected.isDimension) {
            this.$emit('dragstart', this.selected, this.selectedFaceIndex);
            this.domElement.style.cursor = 'move';
          } else if (this.selected.isCoordinate) {
            this.$emit('dragstart', this.selected, this.selectedFaceIndex);
            this.domElement.style.cursor = 'move';
          } else if (this.selectedObject !== this.selected) {
            this.selectedObject = this.selected;
            this.$emit('dragstart', this.selected, this.selectedFaceIndex);
            this.selected = null;
          } else {
            this.$emit('dragstart', this.selected, this.selectedFaceIndex);

            if (this.enableMoving) {
              this.domElement.style.cursor = 'move';
            } else {
              this.selected = null;
            }
          }
        } else {
          if (this.prevMouse.x === event.clientX && this.prevMouse.y === event.clientY) {
            this.$store.commit('Camera/selectObject3D');
          }

          this.selectedObject = null;
          this.selected = null;
        }
      }
    },
    onDocumentMouseCancel(event) {
      event.preventDefault();
      // if (this.selected) {
      //   this.$emit('dragend', this.selected);
      //   this.selected = null;
      // }
      // this.domElement.style.cursor = this.hovered ? 'pointer' : 'auto';
    },
    onDocumentTouchMove(event) {
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      [event] = event.changedTouches;

      const rect = this.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraInst);

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

      const rect = this.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraInst);

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
