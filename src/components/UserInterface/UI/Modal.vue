<template>
  <div class="image-modal" :style="modalStyle">
    <span class="close" @click="close()"><em class="el-icon-circle-close"/></span>
    <div class="image-modal-content" @click.stop="">
      <slot></slot>
      <div class="slug">
        <slot name="slug"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Modal',
  props: {
    zIndex: {
      type: Number,
      default: 9000,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    modalStyle() {
      return {
        zIndex: this.zIndex,
        display: this.showModal ? 'flex' : 'none',
      };
    },
    showModal: {
      get() { return this.visible; },
      set(val) { this.$emit('update:visible', val); },
    },
  },
  methods: {
    close() {
      this.showModal = false;
    },
  },
};
</script>
<style scoped>
  .image-modal {
    position: fixed; /* Stay in place */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
  }

  .image-modal-content {
    margin: auto;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .close {
    position: absolute;
    top: 15px;
    right: 35px;
    color: #f1f1f1;
    font-size: 40px;
    cursor: pointer;
  }

  .slug {
    color: white;
    margin-top: 20px;
    text-align: center;
  }

</style>
