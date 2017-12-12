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
      :head-width="arrowHeadWidth"
      :linewidth = 10>
    </vgl-arrow-helper>
  </div>
</template>

<script>
import { Vector3 } from 'three';
// import EventBus from '../../../EventBus/EventBus';

export default {
  name: 'PlankCoordinate',
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
      arrowLength: 5000,
      arrowHeadLength: 800,
      arrowHeadWidth: 500,
      arrowColor: '#808080',
      magnetRange: 1000,
    };
  },
  computed: {
    arrows() {
      const {
        plankName, plankPosition,
      } = this;
      const prefixName = `${plankName}_coordinate_arrow`;
      return [
        {
          name: `${prefixName}_y`,
          dir: new Vector3(0, 1, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#00ff00',
        },
        {
          name: `${prefixName}_x`,
          dir: new Vector3(1, 0, 0),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#ff0000',
        },
        {
          name: `${prefixName}_z`,
          dir: new Vector3(0, 0, 1),
          position: new Vector3(plankPosition.x, plankPosition.y, plankPosition.z),
          color: '#0000ff',
        },
      ];
    },
    stringifyArrows() {
      return this.arrows.map(arrow => ({
        ...arrow,
        dir: `${arrow.dir.x} ${arrow.dir.y} ${arrow.dir.z}`,
        position: `${arrow.position.x} ${arrow.position.y} ${arrow.position.z}`,
        color: arrow.color,
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
        arrows[i].inst.isCoordinate = true;
        for (let ii = 0; ii < arrows[i].inst.children.length; ii += 1) {
          arrows[i].inst.children[ii].name = arrows[i].inst.name;
          arrows[i].inst.children[ii].isCoordinate = true;
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
      let newPosition = null;
      if (direction === 'y') {
        const { y } = this.arrows[0].position;
        const distance = Math.round(position.y - y);
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y + distance, z: this.plankPosition.z };
      } else if (direction === 'x') {
        const { x } = this.arrows[1].position;
        const distance = Math.round(position.x - x);
        newPosition = { x: this.plankPosition.x + distance, y: this.plankPosition.y, z: this.plankPosition.z };
      } else if (direction === 'z') {
        const { z } = this.arrows[2].position;
        const distance = Math.round(position.z - z);
        newPosition = { x: this.plankPosition.x, y: this.plankPosition.y, z: this.plankPosition.z + distance };
      }

      this.$emit('update:plankPosition', newPosition);
    },
  },
};
</script>

<style scoped>

</style>
