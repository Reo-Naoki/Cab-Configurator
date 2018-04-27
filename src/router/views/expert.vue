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
    App,
    [Card.name]: Card,
    [Button.name]: Button,
    [Input.name]: Input,
  },
  data() {
    return {
      // rlist: '{"rlist":[{"x":400,"y":463.2,"thick":18,"ptype":"FP","name":"Base0-1","pos":[0,18.4,85],"material":"1","id":"1-1","edges":"0-6-0-0"},{"x":400,"y":500,"thick":18,"ptype":"FP","name":"Dessus","pos":[0,0,582],"material":"1","id":"2-2","edges":"6-6-6-0"},{"x":400,"thick":18,"y":581,"points":[[400,0], [400, 300], [200, 300], [200, 450], [100,581],[0,581],[0,84],[15,84],[15,0]],"ptype":"VDP","name":"Montant0","pos":[0,0.4,1],"material":"1","id":"3-3","edges":"6-0-0-0-0-0-0-0-6"},{"x":400,"thick":18,"y":581,"points":[[400,0], [400, 300], [200, 300], [200, 450], [100,581],[0,581],[0,84],[15,84],[15,0]],"ptype":"FP","name":"Montant10","pos":[500,0.4,1],"material":"1","id":"30-3","edges":"6-0-0-0-0-0-0-0-6"},{"x":400,"thick":18,"y":581,"points":[[400,0], [400, 300], [200, 300], [200, 450], [100,581],[0,581],[0,84],[15,84],[15,0]],"ptype":"VP","name":"Montant11","pos":[1200,0.4,1],"material":"1","id":"31-3","edges":"6-0-0-0-0-0-0-0-6"},{"x":400,"thick":18,"y":581,"points":[[400,0],[400,581],[0,581],[0,84],[15,84],[15,0]],"ptype":"VDP","name":"Montant1","pos":[0,481.6,1],"material":"1","id":"4-4","edges":"6-0-0-0-0-6"},{"thick":18,"x":463.2,"y":84,"ptype":"VP","name":"AVSocle","pos":[367,18.4,1],"material":"1","id":"5-5","edges":"0-0-0-0"},{"thick":18,"x":463.2,"y":84,"ptype":"VP","name":"ARSocle","pos":[15,18.4,1],"material":"1","id":"6-5","edges":"0-0-0-0"},{"thick":4,"x":479.2,"y":495,"ptype":"VP","name":"Fond panel","pos":[0,10.4,95],"material":"0","id":"7-6","edges":"0-0-0-0","layer":"Fond"}],"connlist":[{"p1":3,"p2":1,"p2side":2},{"p1":2,"p2":3,"p2side":1},{"p1":4,"p2":1,"p2side":2},{"p1":2,"p2":4,"p2side":2},{"p1":3,"p2":5,"p2side":1},{"p1":4,"p2":5,"p2side":1},{"p1":1,"p2":5,"p2side":1},{"p1":3,"p2":6,"p2side":1},{"p1":4,"p2":6,"p2side":1},{"p1":1,"p2":6,"p2side":1},{"p1":3,"p2":7,"type":"hdfgrove"},{"p1":4,"p2":7,"type":"hdfgrove"},{"p1":1,"p2":7,"type":"hdfgrove"},{"p1":2,"p2":7,"type":"hdfgrove"}],"price":0,"ecotax":1.3,"weight":15,"messages":{"widedoor":{"level":2,"widgets":[47,46,45]}},"materials":[{"id":-3,"ref":"White16","manufacturer":1,"finish":"SM"},{"id":0,"ref":"D2201","manufacturer":3,"finish":""},{"id":1,"ref":"W908","manufacturer":6,"finish":"SM"}]}',
      rlist: null,
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
