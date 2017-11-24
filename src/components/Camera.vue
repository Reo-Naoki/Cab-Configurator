<template>
  <vgl-perspective-camera :zoom="zoom"
                          :near="near"
                          :fov="fov"
                          :far="far"
                          :orbit-position="`${position.radius} ${position.phi} ${position.theta}`"
                          :orbit-target="`${target.x} ${target.y} ${target.z}`"
                          name="camera1"
                          ref="camera"
  />
</template>

<script>
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mapState } from 'vuex';
import EventBus from './EventBus/EventBus';

export default {
  name: 'Camera',
  inject: ['vglNamespace'],
  computed: {
    ...mapState('Camera', [
      'zoom',
      'near',
      'fov',
      'far',
      'position',
      'target',
      'enableOrbitControls',
      'enableRotate',
      'enablePan',
    ]),
  },
  watch: {
    enableOrbitControls(isEnabled) {
      EventBus.controls.enabled = isEnabled;
    },
    enableRotate(isEnabled) {
      EventBus.controls.enableRotate = isEnabled;
    },
    enablePan(isEnabled) {
      EventBus.controls.enablePan = isEnabled;
    },
  },
  mounted() {
    const controls = new OrbitControls(
      this.$refs.camera.inst,
      this.vglNamespace.renderers[0].inst.domElement,
    );
    controls.screenSpacePanning = true; // allow pan on z and y instead of x, y
    controls.rotateSpeed = 0.45;
    controls.panSpeed = 0.45;
    controls.minDistance = 5000;
    controls.maxDistance = 80000;
    controls.addEventListener('change', this.vglNamespace.update);
    this.vglNamespace.beforeRender.unshift(controls.update);
    EventBus.controls = controls;
  },
};
</script>
