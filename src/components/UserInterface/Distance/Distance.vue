<template>
  <div v-if="begin != null && end != null">
    <fieldset>
      <legend>Distance entre {{ begin.name }} et {{ end.name }}</legend>
      <p>Distance: {{ distance }}</p>
      <p>DistanceX: {{ zDistance }}</p>
      <p>DistanceY: {{ xDistance }}</p>
      <p>DistanceZ: {{ yDistance }}</p>
    </fieldset>
  </div>
</template>

<script>
export default {
  name: 'Distance',
  props: {
    begin: {
      required: true,
    },
    end: {
      required: true,
    },
  },
  computed: {
    distance() {
      const { begin: { position: bpos }, end: { position: epos } } = this;
      return bpos.distanceTo(epos);
    },
    xDistance() {
      const { begin: { position: bpos }, end: { position: epos } } = this;
      return Math.abs(bpos.x - epos.x);
    },
    yDistance() {
      const { begin: { position: bpos }, end: { position: epos } } = this;
      return Math.abs(bpos.y - epos.y);
    },
    zDistance() {
      const { begin: { position: bpos }, end: { position: epos } } = this;
      return Math.abs(bpos.z - epos.z);
    },
  },
};
</script>
