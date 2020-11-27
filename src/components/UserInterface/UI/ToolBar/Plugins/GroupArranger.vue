<template>
  <div class="toolbar-popup group-arranger">
    <label v-if="firstLayoutGroup === null" class="group-select-inst">Please select first cabinet</label>
    <label v-else-if="secondLayoutGroup === null" class="group-select-inst">Please select second cabinet</label>
    <div v-else class="layout-div">
      <el-button class="layout-button" @click="rightAlign()" :title="'Right Align'" >
        <img src="../../../../../assets/images/Layout-Right.png" alt="" width="100%" height="100%" :style="`vertical-align: sub; opacity: 0.7;`" />
      </el-button>
      <el-button class="layout-button" @click="leftAlign()" :title="'Left Align'" >
        <img src="../../../../../assets/images/Layout-Left.png" alt="" width="100%" height="100%" :style="`vertical-align: sub; opacity: 0.7;`" />
      </el-button>
      <el-button class="layout-button" @click="upperAlign()" :title="'Upper Align'" >
        <img src="../../../../../assets/images/Layout-Upper.png" alt="" width="100%" height="100%" :style="`vertical-align: sub; opacity: 0.7;`" />
      </el-button>
    </div>
  </div>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';
import { Vector3 } from 'three';

export default {
  name: 'GroupArranger',
  components: {
    [Button.name]: Button,
  },
  computed: {
    ...mapState('Panels', [
      'enableGroupArranger',
      'firstLayoutGroup',
      'secondLayoutGroup',
      'groups',
    ]),
    fBoxMax() {
      return window.groups[this.groups[this.firstLayoutGroup].name].boundingBox.max;
    },
    fBoxMin() {
      return window.groups[this.groups[this.firstLayoutGroup].name].boundingBox.min;
    },
    sBoxMax() {
      return window.groups[this.groups[this.secondLayoutGroup].name].boundingBox.max;
    },
    sBoxMin() {
      return window.groups[this.groups[this.secondLayoutGroup].name].boundingBox.min;
    },
  },
  methods: {
    rightAlign() {
      const fRDB = new Vector3(this.fBoxMax.x, this.fBoxMin.y, this.fBoxMin.z);
      const sLDB = new Vector3(this.sBoxMin.x, this.sBoxMin.y, this.sBoxMin.z);
      fRDB.sub(sLDB);
      this.alignSecondCabinet(fRDB);
    },
    leftAlign() {
      const fLDB = new Vector3(this.fBoxMin.x, this.fBoxMin.y, this.fBoxMin.z);
      const sRDB = new Vector3(this.sBoxMax.x, this.sBoxMin.y, this.sBoxMin.z);
      fLDB.sub(sRDB);
      this.alignSecondCabinet(fLDB);
    },
    upperAlign() {
      const fLUB = new Vector3(this.fBoxMin.x, this.fBoxMax.y, this.fBoxMin.z);
      const sLDB = new Vector3(this.sBoxMin.x, this.sBoxMin.y, this.sBoxMin.z);
      fLUB.sub(sLDB);
      this.alignSecondCabinet(fLUB);
    },
    alignSecondCabinet(offset) {
      window.groups[this.groups[this.secondLayoutGroup].name].moveByOffset(offset);
      this.$store.commit('Panels/enableGroupArranger', false);
    },
  },
};
</script>

<style>
  .group-select-inst {
    height: 100%;
    display: grid;
    align-items: center;
    text-align: center;
  }
  .group-arranger {
    width: 300px;
    height: 100px;
  }
  .layout-div {
    padding: 15px 0px;
    height: 100%;
    text-align: center;
  }
  .layout-button {
    padding: 5px;
    width: 30%;
    height: 100%;
    align-items: center;
    text-align: center;
  }
</style>
