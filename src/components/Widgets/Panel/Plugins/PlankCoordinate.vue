<template>
  <div>
    <vgl-arrow-helper
      v-for="(arrow, index) in stringifyArrows" :key="arrow.name + index"
      ref="arrows"
      v-bind="arrow"
      :head-length="arrowHeadLength"
      :head-width="arrowHeadWidth"
      :color="arrowColor"
      :linewidth = 10 />
  </div>
</template>

<script>
import { Vector3 } from 'three';
import { mapState } from 'vuex';
import Coordinate from './Common/Coordinate';

export default {
  name: 'PlankCoordinate',
  inject: ['vglNamespace'],
  mixins: [Coordinate],
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
    isGroupArrow: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      arrowHeadLength: 800,
      arrowHeadWidth: 500,
      arrowColor: '#808080',
      inputElement: null,
      containerElement: null,
      selectedArrow: null,
    };
  },
  computed: {
    ...mapState('Panels', [
      'prevPosition',
    ]),
    centerPivotPos() {
      if (this.isGroupArrow) return this.prevPosition;
      return {
        x: this.prevPosition.x + this.plankDimension.width / 2,
        y: this.prevPosition.y + this.plankDimension.height / 2,
        z: this.prevPosition.z + this.plankDimension.depth / 2,
      };
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
          length: plankDimension.width / 2 < 4000 ? 5000 : 3000 + plankDimension.width / 2,
        },
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          length: plankDimension.height / 2 < 4000 ? 5000 : 3000 + plankDimension.height / 2,
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          length: plankDimension.depth / 2 < 4000 ? 5000 : 3000 + plankDimension.depth / 2,
        },
        {
          name: `${prefixName}_-x`,
          dir: new Vector3(-1, 0, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          length: plankDimension.width / 2 < 4000 ? 5000 : 3000 + plankDimension.width / 2,
        },
        {
          name: `${prefixName}_-y`,
          dir: new Vector3(0, -1, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          length: plankDimension.height / 2 < 4000 ? 5000 : 3000 + plankDimension.height / 2,
        },
        {
          name: `${prefixName}_-z`,
          dir: new Vector3(0, 0, -1),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          length: plankDimension.depth / 2 < 4000 ? 5000 : 3000 + plankDimension.depth / 2,
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
      let distance = 0;
      this.selectedArrow = direction;

      if (direction === 'x' || direction === '-x') {
        distance = position.x - this.centerPivotPos.x;
        newPosition = { x: position.x, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction === 'y' || direction === '-y') {
        distance = position.y - this.centerPivotPos.y;
        newPosition = { x: this.plankPosition.x, y: position.y, z: this.plankPosition.z };
      } else if (direction === 'z' || direction === '-z') {
        distance = position.z - this.centerPivotPos.z;
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: position.z };
      }

      this.inputElement.value = distance / 10 * (direction.includes('-') ? -1 : 1);

      this.$emit('update:plankPosition', newPosition);
    },
    moveByDistance(direction, distance) {
      let newPosition = null;
      const sign = direction.includes('-') ? -1 : 1;

      if (direction.includes('x')) {
        newPosition = { x: this.centerPivotPos.x + distance * sign, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction.includes('y')) {
        newPosition = { x: this.plankPosition.x, y: this.centerPivotPos.y + distance * sign, z: this.plankPosition.z };
      } else if (direction.includes('z')) {
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.centerPivotPos.z + distance * sign };
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

      if (this.selectedArrow) {
        const sign = this.selectedArrow.includes('-') ? -1 : 1;

        if (this.selectedArrow.includes('x')) {
          inputPosition.x += this.arrows[0].length * sign;
        } else if (this.selectedArrow.includes('y')) {
          inputPosition.y += this.arrows[1].length * sign;
        } else if (this.selectedArrow.includes('z')) {
          inputPosition.z += this.arrows[2].length * sign;
        }
      }

      const vectorTop2D = this.projectVectorTo2D(inputPosition.x, inputPosition.y, inputPosition.z);
      const rect = this.domElement.getBoundingClientRect();
      vectorTop2D.x = Math.max(30, Math.min(vectorTop2D.x, rect.width - 200));
      vectorTop2D.y = Math.max(30, Math.min(vectorTop2D.y, rect.height - 50));
      this.inputElement.style.top = `${vectorTop2D.y}px`;
      this.inputElement.style.left = `${vectorTop2D.x}px`;
    },
  },
};
</script>
<style>
  .plank-coordinate-input {
    position: absolute;
  }
</style>
