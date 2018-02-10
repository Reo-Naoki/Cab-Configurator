<template>
  <div v-if="$route.name === 'adesigner'">
    Adesigner projects
  </div>
  <router-view v-else/>
</template>

<script>
export default {
  name: 'Adesigner',
  created() {
    this.$store.dispatch('User/getProjectsFromServer');
  },
};
</script>
