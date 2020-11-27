<template>
  <div class="toolbar-div">
    <el-button v-if="groups.length > 1" class="toolbar-button" @click="changeGroupArranger()" :title="'Arrange Cabinets'" >
      <img src="../../../../../assets/images/Arrange.png" alt="" width="28" height="28" :style="`vertical-align: sub; opacity: 0.7;`" />
    </el-button>
    <GroupArranger v-if="enableGroupArranger"/>
  </div>
</template>

<script>
import { Button } from 'element-ui';
import { mapState } from 'vuex';
import GroupArranger from './GroupArranger';

export default {
  name: 'ArrangeButton',
  components: {
    [Button.name]: Button,
    GroupArranger,
  },
  computed: {
    ...mapState('Panels', [
      'enableGroupArranger',
      'groups',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  methods: {
    changeGroupArranger() {
      this.$store.commit('Panels/enableGroupArranger', !this.enableGroupArranger);
      this.$store.commit('Camera/selectObject3D');
    },
  },
};
</script>
