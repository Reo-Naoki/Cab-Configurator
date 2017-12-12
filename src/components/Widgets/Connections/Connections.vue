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
    generateDefaultConnections() {
      const panels = Object.values(window.panels).map(p => p.$refs.panel.inst);
      const defaultConnections = [];
      for (let i = 0; i < panels.length - 1; i += 1) {
        const currentPanel = panels[i];
        currentPanel.updateMatrixWorld();
        currentPanel.geometry.computeBoundingBox();
        const currentBB = currentPanel.geometry.boundingBox.clone();
        currentBB.setFromObject(currentPanel);

        for (let y = i + 1; y < panels.length; y += 1) {
          const browsingPanel = panels[y];
          browsingPanel.updateMatrixWorld();
          browsingPanel.geometry.computeBoundingBox();
          const browsingBB = browsingPanel.geometry.boundingBox.clone();
          browsingBB.setFromObject(browsingPanel);

          if (browsingBB.intersectsBox(currentBB)) {
            // get intersect of the two boundingBox (don't forget to clone currentBB before intersect)
            const intersectBB = currentBB.clone().intersect(browsingBB);
            const intersectCenter = new Vector3();
            intersectBB.getCenter(intersectCenter);
            const isize = new Vector3();
            intersectBB.getSize(isize);

            // determine which Panel is P2
            const p2name = this.getFemalePanelName({ currentBB, mesh: currentPanel }, browsingPanel, intersectCenter);
            const newConnection = new Connection({
              p1: currentPanel.name === p2name ? browsingPanel.name : currentPanel.name,
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
      this.init = false;
      return defaultConnections;
    },
    generateAllConnections(connections = this.connections) {
      const defaultConnections = this.generateDefaultConnections();
      const newConnections = [];
      defaultConnections.forEach(dConnection => {
        const connection = connections.find(c => c.softEquals(dConnection));
        if (connection) {
          // connection already exist, override center & intersection length
          newConnections.push(new Connection({
            ...connection,
            center: dConnection.center,
            ilength: dConnection.ilength,
            p1: dConnection.p1,
            p2: dConnection.p2,
          }));
        } else {
          newConnections.push(dConnection);
        }
      });
      return newConnections;
    },
    async setConnections() {
      // use for re-calculate the center position of each connections
      // also set free connections
      await this.$nextTick();
      this.$store.commit('Panels/setConnections', this.generateAllConnections());
    },
  },
};
</script>

<style scoped>

</style>
