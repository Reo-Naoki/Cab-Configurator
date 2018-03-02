<template>
  <fieldset class="import-model">
    <legend>Importer un projet</legend>
    <input type="button" value="import model" @click="showModal = true">
    <Modal :visible.sync="showModal">
      <div>
        <div class="import-form">
          <fieldset>
            <legend>IMPORT MODEL</legend>
            <label>
              rlist
              <textarea v-model="rlist"></textarea>
            </label>
            <br/>
            <input type="button" value="IMPORT" @click="setRList()">
          </fieldset>
          <fieldset>
            <legend>IMPORT MATERIALS</legend>
            <label>
              materials
              <textarea v-model="mlist"></textarea>
            </label>
            <br/>
            <input type="button" value="IMPORT" @click="setMaterials()">
          </fieldset>
        </div>
      </div>
    </Modal>
  </fieldset>
</template>

<script>
import Modal from './Modal';

export default {
  name: 'OpenModel',
  components: { Modal },
  props: {
    planks: {
      type: Array,
      required: true,
    },
    materials: {
      type: Array,
      required: true,
    },
    connlist: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
      rlist: '',
      mlist: '',
    };
  },
  methods: {
    setRList() {
      const data = JSON.parse(this.rlist);
      this.$emit('update:planks', data.rlist.map(p => ({ ...p, material: p.material.toString() })));
      this.$emit('update:connlist', data.connlist);
    },
    setMaterials() {
      this.$emit('update:materials', JSON.parse(this.mlist).map(m => ({ ...m, id: m.id.toString() })));
    },
  },
};
</script>
<style scoped>
  .import-form {
    height: 60vh;
    width: 60vw;
    background-color: white;
  }
</style>
