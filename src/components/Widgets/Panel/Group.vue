<template>
  <vgl-group>
    <vgl-box-geometry :name='`${name}_group_geometry`'
                      :width-segments="1"
                      :height-segments="1"
                      :depth-segments="1"
                      :width="dimension.width + 0.5"
                      :height="dimension.height + 0.5"
                      :depth="dimension.depth + 0.5" />
    <vgl-mesh ref='group'
              :geometry='`${name}_group_geometry`'
              :name="name"
              :position="`${position.x} ${position.y} ${position.z}`"
              :visible="false" />
    <vgl-box-helper v-if="isSelected" :object="name" color="#bb4444" />

    <PlankCoordinate ref="coordinate"
                     :plank-dimension.sync="dimension"
                     :plank-position.sync="position"
                     plank-type='FP'
                     :plank-name="name"
                     :is-group-arrow="true"
                     :group-name="name"
                     v-if="showCoordinateArrows" />
    <PlankDimensions ref="dimensions"
                     :plank-dimension.sync="dimension"
                     :plank-position.sync="position"
                     plank-type='FP'
                     :plank-name="name"
                     :is-group-arrow="true"
                     :group-name="name"
                     v-if="showDimensionArrows" />
  </vgl-group>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { Vector2, Vector3 } from 'three';
import EventBus from '../../EventBus/EventBus';
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
      moving: false,
      isGroup: true,
    };
  },
  inject: ['vglNamespace'],
  props: ['index', 'name', 'ptype', 'rlist', 'groupName', 'groupType'],
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
      'moveDirection',
      'prevPosition',
    ]),
    dimension: {
      get() {
        if (!this.isSelected) return { width: 0, height: 0, depth: 0 };
        const size = new Vector3(0, 0, 0);
        this.boundingBox.getSize(size);
        return { width: size.x, height: size.y, depth: size.z };
      },
      set({ width, height, depth }) {
        const { boundingBox } = this;
        const direction = this.selectedObject3D.object3d.isDimension ? this.selectedObject3D.object3d.name.split('_dimensions_arrow_')[1] : 'right';
        const minWidth = Math.min(15000, Math.max(2800, width));
        const minHeight = Math.min(15000, Math.max(1000, height));
        const minDepth = Math.min(15000, Math.max(3200, depth));
        const dimensionOffset = {
          width: minWidth - this.dimension.width,
          height: minHeight - this.dimension.height,
          depth: minDepth - this.dimension.depth,
        };
        const newPosition = {
          x: this.position.x + (direction === 'left' ? -dimensionOffset.width / 2 : dimensionOffset.width / 2),
          y: this.position.y + dimensionOffset.height / 2,
          z: this.position.z + (direction === 'upper' ? -dimensionOffset.depth / 2 : dimensionOffset.depth / 2),
        };

        this.getChildPanelIDs().forEach((id) => {
          const { x: px, y: py, z: pz } = window.panels[id].position;
          const { width: pWidth, height: pHeight, depth: pDepth } = window.panels[id].dimensionsByType;
          const panelType = window.panels[id].ptype;
          // const { resizable } = window.panels[id];
          const newPanelPosition = {
            x: px < this.position.x ? (newPosition.x - minWidth / 2 + px - boundingBox.min.x) : (newPosition.x + minWidth / 2 + px - boundingBox.max.x),
            y: py < this.position.y ? (newPosition.y - minHeight / 2 + py - boundingBox.min.y) : (newPosition.y + minHeight / 2 + py - boundingBox.max.y),
            z: pz < this.position.z ? (newPosition.z - minDepth / 2 + pz - boundingBox.min.z) : (newPosition.z + minDepth / 2 + pz - boundingBox.max.z),
          };

          window.panels[id].position = {
            x: (panelType !== 'VDP') ? px - (direction === 'left' ? dimensionOffset.width : 0) : newPanelPosition.x,
            y: (panelType !== 'FP') ? py - (direction === 'left' ? dimensionOffset.height : 0) : newPanelPosition.y,
            z: (panelType !== 'VP') ? pz - (direction === 'upper' ? dimensionOffset.depth : 0) : newPanelPosition.z,
          };

          const newDimension = {
            width: panelType !== 'VDP' ? pWidth + dimensionOffset.width : pWidth,
            height: panelType !== 'FP' ? pHeight + dimensionOffset.height : pHeight,
            depth: panelType !== 'VP' ? pDepth + dimensionOffset.depth : pDepth,
          };
          if (window.panels[id].shapePoints) {
            const maxX = Math.max(...window.panels[id].shapePoints.map(p => p[0]));
            const maxY = Math.max(...window.panels[id].shapePoints.map(p => p[1]));
            const minX = Math.min(...window.panels[id].shapePoints.map(p => p[0]));
            const minY = Math.min(...window.panels[id].shapePoints.map(p => p[1]));
            const newPoints = window.panels[id].shapePoints.map(point => (this.isResizablePoint(point, maxX, maxY) ? this.resizePoint(point, newDimension, minX, minY, maxX, maxY, panelType) : point));
            window.panels[id].shapePoints = newPoints;
          }
          window.panels[id].dimensionsByType = newDimension;
        });
      },
    },
    position: {
      get() {
        if (!this.isSelected) return { x: 0, y: 0, z: 0 };
        const center = new Vector3(0, 0, 0);
        this.boundingBox.getCenter(center);
        return center;
      },
      set({ x, y, z }) {
        const offset = new Vector3(x, y, z).sub(this.position);
        this.getAllChildPanelIDs().forEach((id) => {
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
    isParentSelected() {
      if (this.isSelected) return true;
      let { groupName } = this;
      while (groupName) {
        if (window.groups[groupName].isSelected) return true;
        ({ groupName } = window.groups[groupName]);
      }
      return false;
    },
    boundingBox() {
      const childPanels = this.getAllChildPanels().map(panel => panel.getBoundingBox());
      const boundingBox = childPanels[0].clone();
      childPanels.forEach((panel) => {
        boundingBox.expandByPoint(panel.min);
        boundingBox.expandByPoint(panel.max);
      });

      return boundingBox;
    },
  },
  created() {
    window.groups[this.name] = this;
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
    getAllChildPanels() {
      let panels = Object.values(window.panels).filter(panel => panel.groupName === this.name);
      this.getChildGroups().forEach(group => { panels = panels.concat(group.getAllChildPanels()); });
      return panels;
    },
    getChildGroups() {
      return Object.values(window.groups).filter(group => group.groupName === this.name);
    },
    getChildPanelIDs(exceptID = null) {
      return this.getChildPanels().map(panel => panel.id.split('-')[0]).filter(id => id !== exceptID);
    },
    getAllChildPanelIDs(exceptID = null) {
      return this.getAllChildPanels().map(panel => panel.id.split('-')[0]).filter(id => id !== exceptID);
    },
    getChildGroupNames(exceptName = null) {
      return this.getChildGroups().map(group => group.name).filter(name => name !== exceptName);
    },
    isResizablePoint(point, maxX, maxY) {
      return point[0] === maxX || point[1] === maxY || point[0] === 0 || point[1] === 0;
    },
    resizePoint(point, dimension, minX, minY, maxX, maxY, plankType) {
      if (plankType === 'FP') {
        return [point[0] === maxX ? Math.max(minX + 1, dimension.depth / 10) : point[0],
          point[1] === maxY ? Math.max(minY + 1, dimension.width / 10) : point[1]];
      }
      if (plankType === 'VP') {
        return [point[0] === maxX ? Math.max(minX + 1, dimension.width / 10) : point[0],
          point[1] === maxY ? Math.max(minY + 1, dimension.height / 10) : point[1]];
      }
      if (plankType === 'VDP') {
        return [point[0] === maxX ? Math.max(minX + 1, dimension.depth / 10) : point[0],
          point[1] === maxY ? Math.max(minY + 1, dimension.height / 10) : point[1]];
      }
      return null;
    },
    select(isSelected) {
      const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};

      if (object3d && object3d.isPanel) {
        if (isSelected) {
          let { groupName } = window.panels[object3d.name];
          let included = false;
          while (groupName) {
            if (groupName === this.name) {
              included = true;
              break;
            }
            ({ groupName } = window.groups[groupName]);
          }
          if (!included) return;

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
        if (!this.moving) this.hideConnections();
        this.moving = true;

        const closestVertex = childPanel.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint, this.getAllChildPanelIDs());

        this.resize(mesh, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
      } else if (mesh.isGroup) {
        if (!this.moving) this.hideConnections();
        this.moving = true;

        if (magnetism) {
          /** MAGNETISM */
          const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};
          const selectedPanelVertices = window.panels[object3d.name].$refs.vertices;
          selectedPanelVertices.showNearestVertices(mouseScreenPoint, this.getAllChildPanelIDs());

          const closestVertex = selectedPanelVertices.closestVisibleVertex(mouseScreenPoint);
          if (closestVertex && selectedPanelVertices.magnetize(closestVertex.vertex, mouseScreenPoint, true)) {
            return;
          }
        } else {
          childPanel.$refs.vertices.resetAllVerticesVisibility();
        }

        const { x, y, z } = this.prevPosition;
        const newOrigin = new Vector3(x, y, z);
        if (!this.moveDirection || this.moveDirection === 'x') newOrigin.setX(position.x);
        if (!this.moveDirection || this.moveDirection === 'y') newOrigin.setY(position.y);
        if (!this.moveDirection || this.moveDirection === 'z') newOrigin.setZ(position.z);
        this.position = newOrigin;
      }
    },
    moveByOffset(offset) {
      const { x, y, z } = this.position;
      const newOrigin = new Vector3(x, y, z);
      newOrigin.add(offset);
      this.position = newOrigin;
      window.connections.setConnections().then(() => EventBus.$emit('save'));
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
    hideConnections() {
      this.rlist.forEach((p) => {
        if (p.ptype.startsWith('group_')) {
          window.groups[p.name].hideConnections();
        } else {
          this.$store.dispatch('Panels/hidePanelConnections', { id: p.id.split('-')[0] });
        }
      });
    },
  },
  watch: {
    moving(isMoving, wasMoving) {
      if (isMoving && !wasMoving) {
        this.hideConnections();
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
