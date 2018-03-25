<template>
  <div v-if="false"></div>
</template>

<script>
import { Vector3 } from 'three';
import { mapState } from 'vuex';
import Connection from './Models/Connection';

export default {
  name: 'Connections',
  data() {
    return {
      init: true,
    };
  },
  computed: {
    ...mapState('Panels', [
      'connections',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
  },
  methods: {
    getFemalePanelName(current, browsing, intersectionCenter) {
      // return the name of the P2/femalePanel between current and browsing
      // depending on intersectionCenter (Vector3)
      const { currentBB, mesh: { name } } = current;
      const currentSize = new Vector3();
      currentBB.getSize(currentSize);
      const { x: centerX, y: centerY, z: centerZ } = intersectionCenter;

      // we could have use mesh position but don't forget that the origin of THREEJS Objects
      // are in the center which doesn't fit our model
      const { position: { x: currentPositionX, y: currentPositionY, z: currentPositionZ }, ptype: currentType } = window.panels[name];

      if (currentType === 'VDP') {
        // current Panel is either VDP or FP
        if (centerX > currentPositionX && centerX < currentPositionX + currentSize.x) {
          // current is P2
          return name;
        }
        // browsing is P2;
        return browsing.name;
      }

      if (currentType === 'FP') {
        // current Panel is either VDP or FP
        if (centerY > currentPositionY && centerY < currentPositionY + currentSize.y) {
          // current is P2
          return name;
        }
        // browsing is P2;
        return browsing.name;
      }

      // is VP
      if (centerZ > currentPositionZ && centerZ < currentPositionZ + currentSize.z) {
        // current is P2
        return name;
      }
      // browsing is P2;
      return browsing.name;
    },
    generateDefaultConnections(recalcAll = false) {
      const panels = Object.values(window.panels);
      const panelInsts = panels.map(p => p.$refs.panel.inst);
      let defaultConnections = [];
      const selectedObject = this.selectedObject3D ? this.selectedObject3D.object3d : null;
      let selectedIDs = null;

      if (!recalcAll && selectedObject && window.groups[selectedObject.name]) {
        selectedIDs = selectedObject.isGroup ? window.groups[selectedObject.name].getAllChildPanelIDs() : [selectedObject.name.split('_')[0]];
      }
      if (selectedIDs) {
        defaultConnections = this.connections.filter(c => !selectedIDs.map(id => c.containsPanel(id)).includes(true));
      }

      for (let i = 0; i < panels.length; i += 1) {
        const currentBB = panels[i].getBoundingBox();

        for (let y = i + 1; y < panels.length; y += 1) {
          if (!selectedIDs || selectedIDs.includes(panelInsts[i].name) || selectedIDs.includes(panelInsts[y].name)) {
            const browsingBB = panels[y].getBoundingBox();

            if (browsingBB.intersectsBox(currentBB)) {
              // get intersect of the two boundingBox (don't forget to clone currentBB before intersect)
              const intersectBB = currentBB.clone().intersect(browsingBB);
              const intersectCenter = new Vector3();
              intersectBB.getCenter(intersectCenter);
              const isize = new Vector3();
              intersectBB.getSize(isize);

              // determine which Panel is P2
              const p2name = this.getFemalePanelName({ currentBB, mesh: panelInsts[i] }, panelInsts[y], intersectCenter);
              const newConnection = new Connection({
                p1: panelInsts[i].name === p2name ? panelInsts[y].name : panelInsts[i].name,
                p2: p2name,
                center: intersectCenter,
                ilength: Math.max(...isize.toArray()),
              });
              if (this.$store.state.User.isAdesigner && this.init) {
                newConnection.setAsFreeConnection(); // black
              } else {
                newConnection.setAsUndefinedConnection(); // red
              }
              defaultConnections.push(newConnection);
            }
          }
        }
      }
      this.init = false;
      return defaultConnections;
    },
    generateAllConnections(recalcAll = false, connections = this.connections) {
      const defaultConnections = this.generateDefaultConnections(recalcAll);
      const newConnections = new Array(defaultConnections.length);
      for (let i = 0; i < defaultConnections.length; i += 1) {
        const dConnection = defaultConnections[i];
        const connection = connections.find(c => c.softEquals(dConnection));
        if (connection) {
          // connection already exist, override center & intersection length
          newConnections[i] = new Connection({
            ...connection,
            center: dConnection.center,
            ilength: dConnection.ilength,
            p1: dConnection.p1,
            p2: dConnection.p2,
            isHidden: false,
          });
        } else {
          newConnections[i] = dConnection;
        }
      }
      return newConnections;
    },
    async setConnections(recalcAll = false) {
      // use for re-calculate the center position of each connections
      // also set free connections
      await this.$nextTick();
      this.$store.commit('Panels/setConnections', { connlist: this.generateAllConnections(recalcAll) });
    },
  },
};
</script>
