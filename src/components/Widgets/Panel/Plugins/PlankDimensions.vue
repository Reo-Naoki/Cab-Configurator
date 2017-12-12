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
    this.setAsPlankDimensionHelper();
    window.mdr = this;
  },
  data() {
    return {
      arrowLength: 1000,
      arrowHeadLength: 800,
      arrowHeadWidth: 500,
      arrowColor: '#808080',
      magnetRange: 1000,
    };
  },
  computed: {
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
    select() {
      // TODO
      // this.arrowColor = isSelected ? '#123456' : '#808080';
    },
    /* getNeighbours() {
      const { arrows, vglNamespace: { object3ds } } = this;
      const planks = Object.values(object3ds).filter(o => o.name !== this.plankName && o.isPanel);
      const neighbours = {};
      const raycaster = new Raycaster();
      for (let i = 0; i < arrows.length; i += 1) {
        raycaster.set(arrows[i].position, arrows[i].dir);
        const intersects = raycaster.intersectObjects(planks, false);
        const key = arrows[i].name.split('_').pop();
        if (intersects.length > 0) {
          [neighbours[key]] = intersects;
        } else {
          neighbours[key] = null;
        }
      }
      return neighbours;
    }, */
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
          const zDistance = Math.round(Math.abs(Math.abs(z) - Math.abs(position.z)));
          if (z < position.z) {
            // increase
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + zDistance };
            newDimension = { width, height, depth: depth - zDistance };
          } else {
            newDimension = { width, height, depth: depth + zDistance };
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - zDistance };
          }
        } else {
          const yDistance = Math.round(Math.abs(Math.abs(y) - Math.abs(position.y)));
          if (y < position.y) {
            // increase
            newDimension = { width, height: height + yDistance, depth };
          } else {
            newDimension = { width, height: height - yDistance, depth };
          }
        }
      } else if (direction === 'right') {
        const { x, z } = this.arrows[1].position;
        if (this.plankType === 'VDP') {
          const zDistance = Math.round(Math.abs(Math.abs(z) - Math.abs(position.z)));
          if (z < position.z) {
            // increase
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + zDistance };
            newDimension = { width, height, depth: depth - zDistance };
          } else {
            newDimension = { width, height, depth: depth + zDistance };
            newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z - zDistance };
          }
        } else {
          const xDistance = Math.round(Math.abs(Math.abs(x) - Math.abs(position.x)));
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
          const zDistance = Math.round(Math.abs(Math.abs(z) - Math.abs(position.z)));
          if (z < position.z) {
            // increase
            newDimension = { width, height, depth: depth + zDistance };
          } else {
            newDimension = { width, height, depth: depth - zDistance };
          }
        } else {
          const yDistance = Math.round(Math.abs(Math.abs(y) - Math.abs(position.y)));
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
          const zDistance = Math.round(Math.abs(Math.abs(z) - Math.abs(position.z)));
          if (z < position.z) {
            // increase
            newDimension = { width, height, depth: depth + zDistance };
          } else {
            newDimension = { width, height, depth: depth - zDistance };
          }
        } else {
          const xDistance = Math.round(Math.abs(Math.abs(x) - Math.abs(position.x)));
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
      if (newDimension) {
        // something has changed, check value integrity
        if (newPosition) this.$emit('update:plankPosition', newPosition);
        this.$emit('update:plankDimension', newDimension);
      }
    },
  },
};
</script>

<style scoped>

</style>
