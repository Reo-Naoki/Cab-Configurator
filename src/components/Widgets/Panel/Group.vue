<template>
  <vgl-group>
    <vgl-box-geometry :name='`${name}_group_geometry`'
                      :width-segments="1"
                      :height-segments="1"
                      :depth-segments="1"
                      :width="dimension.width"
                      :height="dimension.height"
                      :depth="dimension.depth" />
    <vgl-mesh ref='group'
              :geometry='`${name}_group_geometry`'
              :name="name"
              :position="`${position.x} ${position.y} ${position.z}`"
              :visible="false" />
    <vgl-box-helper v-if="isSelected" :object="name" color="#888888"/>

    <PlankCoordinate ref="coordinate"
                     :plank-dimension.sync="dimension"
                     :plank-position.sync="position"
                     plank-type='FP'
                     :plank-name="name"
                     :is-group-arrow="true"
                     v-if="showCoordinateArrows" />
    <PlankDimensions ref="dimensions"
                     :plank-dimension.sync="dimension"
                     :plank-position.sync="position"
                     plank-type='FP'
                     :plank-name="name"
                     :is-group-arrow="true"
                     v-if="showDimensionArrows" />
  </vgl-group>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { Vector2, Vector3, Box3 } from 'three';
import PlankCoordinate from './Plugins/PlankCoordinate';
import PlankDimensions from './Plugins/PlankDimensions';

export default {
  name: 'Group',
  components: {
    PlankCoordinate,
    PlankDimensions,
  },
  inheritAttrs: false,
  data() {
    return {
      currentBoundingBox: null,
      moving: false,
      isGroup: true,
    };
  },
  inject: ['vglNamespace'],
  props: ['index', 'name', 'ptype', 'rlist'],
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
      'hoveredObject3D',
    ]),
    ...mapState('Panels', [
      'panels',
      'connections',
      'enableResizing',
      'enableMoving',
    ]),
    dimension: {
      get() {
        if (!this.currentBoundingBox) return { width: 0, height: 0, depth: 0 };
        const boundingBox = this.getBoundingBox();
        return {
          width: boundingBox.max.x - boundingBox.min.x,
          height: boundingBox.max.y - boundingBox.min.y,
          depth: boundingBox.max.z - boundingBox.min.z,
        };
      },
      set({ width, height, depth }) {
        const boundingBox = this.getBoundingBox();
        const direction = this.selectedObject3D.object3d.isDimension ? this.selectedObject3D.object3d.name.split('_dimensions_arrow_')[1] : 'right';
        const offset = {
          width: width - this.dimension.width,
          height: height - this.dimension.height,
          depth: depth - this.dimension.depth,
        };
        const newPosition = {
          x: this.position.x + (direction === 'left' ? -offset.width / 2 : offset.width / 2),
          y: this.position.y + (direction === 'left' ? -offset.height / 2 : offset.height / 2),
          z: this.position.z + (direction === 'upper' ? -offset.depth / 2 : offset.depth / 2),
        };

        this.getChildPanelIDs().forEach((id) => {
          const { x: px, y: py, z: pz } = window.panels[id].position;
          const { width: pWidth, height: pHeight, depth: pDepth } = window.panels[id].dimensionsByType;
          const panelType = window.panels[id].ptype;
          const newPanelPosition = {
            x: px < this.position.x ? (newPosition.x - width / 2 + px - boundingBox.min.x) : (newPosition.x + width / 2 + px - boundingBox.max.x),
            y: py < this.position.y ? (newPosition.y - height / 2 + py - boundingBox.min.y) : (newPosition.y + height / 2 + py - boundingBox.max.y),
            z: pz < this.position.z ? (newPosition.z - depth / 2 + pz - boundingBox.min.z) : (newPosition.z + depth / 2 + pz - boundingBox.max.z),
          };

          window.panels[id].position = {
            x: panelType !== 'VDP' ? px - (direction === 'left' ? offset.width : 0) : newPanelPosition.x,
            y: panelType !== 'FP' ? py - (direction === 'left' ? offset.height : 0) : newPanelPosition.y,
            z: panelType !== 'VP' ? pz - (direction === 'upper' ? offset.depth : 0) : newPanelPosition.z,
          };
          window.panels[id].dimensionsByType = {
            width: panelType !== 'VDP' ? pWidth + offset.width : pWidth,
            height: panelType !== 'FP' ? pHeight + offset.height : pHeight,
            depth: panelType !== 'VP' ? pDepth + offset.depth : pDepth,
          };
        });
      },
    },
    position: {
      get() {
        if (!this.currentBoundingBox) return { x: 0, y: 0, z: 0 };
        const boundingBox = this.getBoundingBox();
        return {
          x: (boundingBox.min.x + boundingBox.max.x) / 2,
          y: (boundingBox.min.y + boundingBox.max.y) / 2,
          z: (boundingBox.min.z + boundingBox.max.z) / 2,
        };
      },
      set({ x, y, z }) {
        const offset = new Vector3(x, y, z).sub(this.position);
        this.getChildPanelIDs().forEach((id) => {
          const { x: px, y: py, z: pz } = window.panels[id].position;
          const panelPos = new Vector3(px, py, pz).add(offset);
          window.panels[id].position = { x: panelPos.x, y: panelPos.y, z: panelPos.z };
        });
      },
    },
    showCoordinateArrows() {
      return this.isSelected && this.isItemDisplayed('dimension-arrows') && this.enableMoving;
    },
    showDimensionArrows() {
      return this.isSelected && this.isItemDisplayed('dimension-arrows') && this.enableResizing;
    },
    isSelected() {
      if (this.selectedObject3D) {
        const selectedObject = this.selectedObject3D.object3d;
        if (selectedObject.isCoordinate && selectedObject.name.split('_coordinate')[0] === this.name) return true;
        if (selectedObject.isDimension && selectedObject.name.split('_dimensions')[0] === this.name) return true;
        if (selectedObject.name === this.name) return true;
      }
      return false;
    },
  },
  created() {
    window.groups[this.name] = this;
  },
  updated() {
    if (this.isSelected) {
      this.$nextTick(() => {
        this.getChildPanels().forEach(panel => panel.updateColliding(true));
      });
    }
  },
  beforeDestroy() {
    // eslint-disable-next-line no-underscore-dangle
    if (window.groups[this.name]._uid === this._uid) delete window.groups[this.name];
  },
  mounted() {
    this.$refs.group.inst.isGroup = true;
  },
  methods: {
    getChildPanels() {
      return Object.values(window.panels).filter(panel => panel.groupName === this.name);
    },
    getChildPanelIDs(exceptID = null) {
      return this.getChildPanels().map(panel => panel.id.split('-')[0]).filter(id => id !== exceptID);
    },
    getBoundingBox() {
      const childPanels = this.getChildPanels().map(panel => panel.$refs.panel.inst);
      const boundingBox = new Box3();
      boundingBox.setFromObject(childPanels[0]);
      childPanels.forEach(panel => boundingBox.expandByObject(panel));

      return boundingBox;
    },
    updateBoundingBox() {
      this.currentBoundingBox = this.getBoundingBox();
    },
    select(isSelected) {
      const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};

      if (!object3d) {
        // nothing selected.. unselect just in case
        this.getChildPanels().forEach(panel => panel.$refs.vertices.resetAllVerticesVisibility());
        this.moving = false;
      } else if (object3d.isPanel) {
        if (isSelected) {
          const mouseScreenPoint = new Vector2();
          const rect = this.vglNamespace.renderers[0].inst.domElement.getBoundingClientRect();
          mouseScreenPoint.x = window.event.clientX - rect.left;
          mouseScreenPoint.y = window.event.clientY - rect.top;

          this.getChildPanels().forEach(panel => panel.$refs.vertices.resetVerticesVisibility());
          window.panels[object3d.name].$refs.vertices.setNearestVerticeVisible(this.hoveredObject3D);
        }
      } else {
        this.getChildPanels().forEach(panel => panel.$refs.vertices.resetAllVerticesVisibility());
        this.moving = false;
      }
    },
    move(event, position, mesh, magnetism) {
      const childPanel = Object.values(window.panels)[0];

      const mouseScreenPoint = new Vector2();
      const rect = this.vglNamespace.renderers[0].inst.domElement.getBoundingClientRect();
      mouseScreenPoint.x = event.clientX - rect.left;
      mouseScreenPoint.y = event.clientY - rect.top;

      if (mesh.isDimension || mesh.isCoordinate) {
        if (!this.moving) this.deleteConnections();
        this.moving = true;

        const closestVertex = childPanel.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint, this.getChildPanelIDs());

        this.resize(mesh, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
      } else if (mesh.isGroup) {
        if (!this.moving) this.deleteConnections();
        this.moving = true;

        if (magnetism) {
          /** MAGNETISM */
          const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};
          const selectedPanelVertices = window.panels[object3d.name].$refs.vertices;
          selectedPanelVertices.showNearestVertices(mouseScreenPoint, this.getChildPanelIDs());

          const closestVertex = selectedPanelVertices.closestVisibleVertex(mouseScreenPoint);
          if (closestVertex && selectedPanelVertices.magnetize(closestVertex.vertex, mouseScreenPoint, this.getChildPanelIDs(object3d.name))) return;
        } else {
          childPanel.$refs.vertices.resetAllVerticesVisibility();
        }

        this.position = position;
      }
    },
    resize(mesh, position, newVector, magnetism) {
      if (mesh.isDimension) this.$refs.dimensions.resize(mesh.name, position, newVector, magnetism);
      else this.$refs.coordinate.resize(mesh.name, position, newVector, magnetism);
    },
    setDragging(isSelected) {
      if (!isSelected) this.moving = false;
      if (this.selectedObject3D.object3d.isCoordinate && isSelected) this.$refs.coordinate.select(this.selectedObject3D.object3d);
      else if (this.selectedObject3D.object3d.isDimension && isSelected) this.$refs.dimensions.select(this.selectedObject3D.object3d);
      else if (this.selectedObject3D.object3d.isCoordinate) this.$refs.coordinate.select(null);
      else if (this.selectedObject3D.object3d.isDimension) this.$refs.dimensions.select(null);
    },
    deleteConnections() {
      this.rlist.forEach(p => this.$store.dispatch('Panels/deletePanelConnections', { id: p.id.split('-')[0], exceptPanelIDs: this.getChildPanelIDs() }));
    },
  },
  watch: {
    moving(isMoving, wasMoving) {
      if (isMoving && !wasMoving) {
        this.deleteConnections();
      }
    },
    hoveredObject3D: {
      handler() {
        this.select(this.isSelected);
      },
    },
  },
};
</script>
