<template>
  <div v-if="$route.name === 'projects'">
    Projects
  </div>
  <router-view v-else/>
</template>

<script>
export default {
  name: 'Projects',
  created() {
    this.$store.dispatch('User/getProjectsFromServer');
  },
};
</script>
