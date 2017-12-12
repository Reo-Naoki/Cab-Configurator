<template>
  <div v-if="!start" class="wrapper">
    <el-card class="centered">
      <div slot="header">
        <span>R-List</span>
        <el-button style="float: right; padding: 3px 0" type="text"
                   :disabled="AppBinding == null"
                   @click="start = true">Valider</el-button>
      </div>
      <el-input
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
        placeholder="Insert R-List"
        v-model="rlist">
      </el-input>
    </el-card>
  </div>
  <App v-bind="AppBinding" v-else/>
</template>

<script>
import { Card, Button, Input } from 'element-ui';
import App from '../../components/App';

export default {
  name: 'Expert',
  components: {
    App, [Card.name]: Card, [Button.name]: Button, [Input.name]: Input,
  },
  data() {
    return {
      rlist: '',
      start: false,
    };
  },
  computed: {
    AppBinding() {
      try {
        const { rlist, connlist, materials } = JSON.parse(this.rlist || {}) || {};
        return { planks: rlist, connlist, materials };
      } catch (e) {
        return null;
      }
    },
  },
};
</script>

<style scoped>
  .wrapper {
    height: 100vh;
    text-align: center;
  }

  .wrapper:before {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
  .centered {
    display: inline-block;
    padding: 10px 15px;
    vertical-align: middle;
    width: 460px;
  }
</style>
