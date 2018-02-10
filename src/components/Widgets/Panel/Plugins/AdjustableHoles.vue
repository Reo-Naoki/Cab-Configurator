<template>
  <div>
    <vgl-circle-geometry ref="left" name="leftAdjustHole" :radius="holeRadius"/>
    <vgl-circle-geometry ref="right" name="rightAdjustHole" :radius="holeRadius"/>
    <vgl-mesh v-for="(hole, index) in leftHoles" :key="`adjustHole(${hole.x}-${hole.y}-${hole.z}_${index})`"
              geometry="leftAdjustHole"
              material="black"
              :position="`${hole.x} ${hole.y} ${hole.z}`"
    />
    <vgl-mesh v-for="(hole, index) in rightHoles" :key="`adjustHole(${hole.x}-${hole.y}-${hole.z}_${index})`"
              geometry="rightAdjustHole"
              material="black"
              :position="`${hole.x} ${hole.y} ${hole.z}`"
    />
  </div>
</template>

<script>
import { Vector3 } from 'three';

export default {
  name: 'AdjustableHoles',
  props: {
    connections: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      leftHoles: [],
      rightHoles: [],
      holesPadding: 400,
      holeRadius: 50,
    };
  },
  mounted() {
    this.$refs.left.inst.lookAt(new Vector3(1, 0, 0));
    this.$refs.right.inst.lookAt(new Vector3(-1, 0, 0));
    this.generateHolesPosition(this.connections);
  },
  watch: {
    connections(val) {
      this.generateHolesPosition(val);
    },
  },
  methods: {
    generateLeftHolesPosition(leftMontant) {
      const holes = [];
      // LEFT MONTANT HOLES
      let { x: lx, z: lz } = leftMontant.inst.fixedPosition;
      lx += (leftMontant.inst.dimensionsByType.width / 2);
      lz -= (leftMontant.inst.dimensionsByType.depth / 2);
      for (let holePosition = Number(leftMontant.data.bot) * 10; holePosition <= Number(leftMontant.data.top) * 10; holePosition += 320) {
        holes.push(new Vector3(lx + 10, holePosition, lz + this.holesPadding));
        holes.push(new Vector3(lx + 10, holePosition, lz + leftMontant.inst.dimensionsByType.depth - this.holesPadding));
      }
      return holes;
    },
    generateRightHolesPosition(rightMontant) {
      const holes = [];
      // RIGHT MONTANT HOLES
      let { x: rx, z: rz } = rightMontant.inst.fixedPosition;
      rx -= (rightMontant.inst.dimensionsByType.width / 2);
      rz -= (rightMontant.inst.dimensionsByType.depth / 2);
      for (let holePosition = Number(rightMontant.data.bot) * 10; holePosition <= Number(rightMontant.data.top) * 10; holePosition += 320) {
        holes.push(new Vector3(rx - 10, holePosition, rz + this.holesPadding));
        holes.push(new Vector3(rx - 10, holePosition, rz + rightMontant.inst.dimensionsByType.depth - this.holesPadding));
      }
      return holes;
    },
    generateHolesPosition(connections) {
      const [m1, m2] = connections;
      if (!m1 || !m2) return [];
      if (!m1.data || !m2.data) return [];
      let leftMontant;
      let rightMontant;
      if (window.panels[m1.p2.toString()].position.x < window.panels[m2.p2.toString()].position.x) {
        leftMontant = {
          inst: window.panels[m1.p2.toString()],
          data: m1.data,
        };
        rightMontant = {
          inst: window.panels[m2.p2.toString()],
          data: m2.data,
        };
      } else {
        leftMontant = {
          inst: window.panels[m2.p2.toString()],
          data: m2.data,
        };
        rightMontant = {
          inst: window.panels[m1.p2.toString()],
          data: m1.data,
        };
      }
      this.leftHoles = this.generateLeftHolesPosition(leftMontant);
      this.rightHoles = this.generateRightHolesPosition(rightMontant);
      return null;
    },
  },
};
</script>
