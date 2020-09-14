<template>
  <div>
    <div v-for="(material, index) in materials" :key="material.id + '(' + index + ')'">
      <vgl-texture v-if="material.ref" :src="getMaterialURL(material.ref)" :name="material.ref"/>
      <vgl-mesh-lambert-material :name="material.id.toString()" :map="material.ref" />
    </div>

    <vgl-texture :src="getMaterialURL('raw')" name="raw" />
    <vgl-mesh-lambert-material name="raw" map="raw" />
    <vgl-mesh-standard-material name="sticker" color="#FF0000" />
    <vgl-mesh-standard-material name="hover" color="#ADD9E6" />
    <vgl-mesh-lambert-material name="red" color="#FF0000" />
    <vgl-mesh-lambert-material name="green" color="#008000" />
    <vgl-mesh-lambert-material name="blue" color="#2222FF" />
    <vgl-mesh-lambert-material name="brown" color="#A52A2A" />
    <vgl-mesh-lambert-material name="violet" color="#EE82EE" />
    <vgl-mesh-lambert-material name="yellow" color="#D0D000" />
    <vgl-mesh-lambert-material name="cyan" color="#44B7EB" />
    <vgl-mesh-lambert-material name="pink" color="#FFB6C1" />
    <vgl-mesh-standard-material name="black" color="#000000" />
    <vgl-mesh-lambert-material name="selected" color="#4c8fc8" :opacity="0.8" :transparent="true" />
    <vgl-mesh-standard-material name="plane" :opacity="0.5" :transparent="true" />
    <vgl-line-dashed-material name="ruler" dash-size="250" gap-size="200" color="#ff5555" depthTest="false" />
    <vgl-line-basic-material name="outline" :linewidth="5" color="#666666" />

    <vgl-texture :src="excentriqueURI" name="excentrique" :premultiply-alpha="true" :alpha="true"/>
    <vgl-mesh-lambert-material name="excentrique" map="excentrique" />
    <vgl-mesh-lambert-material name="drill" color="#333333" />
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
