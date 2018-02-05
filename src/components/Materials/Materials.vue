<template>
  <div>
    <div v-for="(material, index) in materials" :key="material.id + '(' + index + ')'">
      <vgl-texture v-if="material.ref" :src="getMaterialURL(material.ref)" :name="material.ref"/>
      <vgl-mesh-lambert-material :name="material.id.toString()" :map="material.ref"></vgl-mesh-lambert-material>
    </div>

    <vgl-texture :src="getMaterialURL('raw')" name="raw"/>
    <vgl-mesh-lambert-material name="raw" map="raw"></vgl-mesh-lambert-material>
    <vgl-mesh-standard-material name="sticker" color="#FF0000"></vgl-mesh-standard-material>
    <vgl-mesh-standard-material name="hover" color="#ADD9E6"></vgl-mesh-standard-material>
    <vgl-mesh-lambert-material name="red" color="#FF0000"></vgl-mesh-lambert-material>
    <vgl-mesh-lambert-material name="green" color="#008000"></vgl-mesh-lambert-material>
    <vgl-mesh-standard-material name="black" color="#000000"></vgl-mesh-standard-material>
    <vgl-mesh-lambert-material name="selected" color="#4c8fc8" :opacity="0.8" :transparent="true"></vgl-mesh-lambert-material>
    <vgl-mesh-standard-material name="plane" :opacity="0.5" :transparent="true"></vgl-mesh-standard-material>
    <vgl-line-dashed-material name="ruler" linewidth="5000"></vgl-line-dashed-material>

    <vgl-texture :src="excentriqueURI" name="excentrique" :premultiply-alpha="true" :alpha="true"/>
    <vgl-mesh-lambert-material name="excentrique" map="excentrique" :opacity="0.5" :transparent="true" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import excentriqueImage from '../../assets/images/excentrique.png';

export default {
  name: 'Materials',
  computed: {
    ...mapState('materials', [
      'materials',
    ]),
    excentriqueURI() {
      return excentriqueImage;
    },
  },
  methods: {
    getMaterialURL(ref) {
      return `/resources/colors/${ref}/3d-${ref}.jpg`;
    },
  },
};
</script>

<style scoped>

</style>
