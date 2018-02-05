<!--suppress HtmlUnknownTag -->
<template>
  <vgl-group :rotation="boxRotation" :name="id + '_group'">
    <vgl-box-geometry v-if="customGeometry == null"
                      :name="id + '_geometry'"
                      ref="geometry"
                      :width-segments="2"
                      :height-segments="2"
                      :depth-segments="2"
                      :width="isDoorPanel ? this.realDimensionByType.width : dimensionsByType.width"
                      :height="isDoorPanel ? this.realDimensionByType.height : dimensionsByType.height"
                      :depth="isHDFPanel ? 0.1 : (isDoorPanel ? this.realDimensionByType.depth : dimensionsByType.depth)" />
    <component v-else :is="customGeometry" v-bind="customGeometryBinding" />
    <vgl-mesh ref="panel"
              :geometry="id + '_geometry'"
              :material="materials"
              :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
              :name="id"
              :visible="true" />

    <!-- HDFPanel -->
    <vgl-group v-if="customGeometry == null && isHDFPanel">
       <!-- Magnetic Panel -->
      <vgl-box-geometry :name="id + '_boundingBox'"
                        ref="geometry"
                        :width-segments="1"
                        :height-segments="1"
                        :depth-segments="1"
                        :width="dimensionsByType.width"
                        :height="dimensionsByType.height"
                        :depth="dimensionsByType.depth + 10" />
      <vgl-mesh :geometry="id + '_boundingBox'"
                :material="physicalPanelMaterials"
                :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
                :name="id + '_boundingBox'"
                :visible="false" />
      <!-- Physical Panel -->
      <vgl-box-geometry :name="id + '_physicalGeometry'"
                        :width-segments="1"
                        :height-segments="1"
                        :depth-segments="1"
                        :width="dimensionsByType.width + (this.hasFeuillure.left ? this.dimensionsMarginLeft : 0) + (this.hasFeuillure.right ? this.dimensionsMarginRight : 0)"
                        :height="dimensionsByType.height + (this.hasFeuillure.top ? this.dimensionsMarginTop : 0) + (this.hasFeuillure.bottom ? this.dimensionsMarginBottom : 0)"
                        :depth="dimensionsByType.depth + 5" />
      <vgl-mesh :geometry="id + '_physicalGeometry'"
                :material="physicalPanelMaterials"
                :position="`${fixedPosition.x - (this.hasFeuillure.left ? this.dimensionsMarginLeft / 2 : 0) + (this.hasFeuillure.right ? this.dimensionsMarginRight / 2 : 0)} `
                            + `${fixedPosition.y - (this.hasFeuillure.bottom ? this.dimensionsMarginBottom / 2 : 0) + (this.hasFeuillure.top ? this.dimensionsMarginTop / 2 : 0)} `
                            + `${fixedPosition.z}`"
                :name="id + '_physicalGeometry'" />
    </vgl-group>
    <!-- DoorPanel -->
    <vgl-group v-else-if="customGeometry == null && isDoorPanel">
       <!-- Magnetic Panel -->
      <vgl-box-geometry :name="id + '_boundingBox'"
                        ref="geometry"
                        :width-segments="1"
                        :height-segments="1"
                        :depth-segments="1"
                        :width="dimensionsByType.width"
                        :height="dimensionsByType.height"
                        :depth="dimensionsByType.depth" />
      <vgl-mesh :geometry="id + '_boundingBox'"
                :material="physicalPanelMaterials"
                :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
                :name="id + '_boundingBox'"
                :visible="false" />
    </vgl-group>

    <PlankVertices ref="vertices" :plank-position.sync="fixedPosition" :plank-dimension="dimensionsByType" :plank-name="id" :plank-type="ptype"/>
    <PlankStickers :plank-position="position" :plank-dimension="dimensionsByType" :plank-name="id" :plank-type="ptype" v-if="showStickers"/>
    <PlankExcentrique :plank-position="position" :plank-dimension="dimensionsByType" :plank-i-d="id" :plank-type="ptype" :connections="relatedConnections" v-if="showConnections" />
    <PlankEdges :plank-dimension="dimensionsByType" :plank-position="fixedPosition" :plank-type="ptype" :plank-edges.sync="edges" v-if="showEdgesSelector"/>
    <PlankCoordinate ref="coordinate" :plank-dimension.sync="dimensionsByType" :plank-position.sync="fixedPosition" :plank-type="ptype" :plank-name="id" :visible="showCoordinateArrows" />
    <PlankDimensions ref="dimensions" :plank-dimension.sync="dimensionsByType" :plank-position.sync="fixedPosition" :plank-type="ptype" :plank-name="id" :visible="showDimensionArrows" />
    <PlankConnections ref="connections" :plank-position="fixedPosition" :plank-i-d="id" :connections="relatedConnections" v-if="showConnections" />
    <component v-if="pluginComponent" :is="pluginComponent" v-bind="pluginBinding"/>

    <!-- Bounding Box for Magnetic Panel of DoorPanel -->
    <vgl-box-helper v-if="isDoorPanel" :object="id" color="#cccccc"/>
    <!-- Bounding Box for Magnetic Panel of HDFPanel -->
    <vgl-box-helper v-else-if="isHDFPanel" :object="id + '_boundingBox'" color="#3C3C3C"/>
    <!-- Bounding Box for Physical Panel -->
    <vgl-box-helper v-else :object="id" color="#3C3C3C"/>

    <!-- Bounding Box for Physical Panel of DoorPanel-->
    <vgl-box-helper v-if="isDoorPanel" :object="id + '_boundingBox'" color="#666666"/>
    <!-- <vgl-axes-helper :position="`${position.x} ${position.y} ${position.z}`" :size="2999999" :visible="isSelected"/> -->
  </vgl-group>
</template>

<script>
import {
  Vector2, Vector3, Box3,
} from 'three';
import { mapGetters, mapState } from 'vuex';
import PlankVertices from '../Plugins/PlankVertices';
import PlankStickers from '../Plugins/PlankStickers';
import PlankEdges from '../Plugins/PlankEdges';
import PlankCoordinate from '../Plugins/PlankCoordinate';
import PlankDimensions from '../Plugins/PlankDimensions';
import PlankConnections from '../Plugins/PlankConnections';
import PlankExcentrique from '../Plugins/PlankExcentrique';

export default {
  name: 'PlankMesh',
  components: {
    PlankExcentrique,
    PlankConnections,
    PlankCoordinate,
    PlankDimensions,
    PlankEdges,
    PlankStickers,
    PlankVertices,
  },
  inject: ['vglNamespace'],
  props: {
    pos: {
      type: Array,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      default: '1',
    },
    rotation: {
      type: Object,
      default: () => ({ x: 0, y: 0, z: 0 }),
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    thick: {
      type: Number,
      required: true,
    },
    ptype: {
      type: String,
      default: 'FP',
    },
  },
  data() {
    return {
      moving: false,
      collide: false,
      /* collide: {
        left: false,
        right: false,
        lower: false,
        upper: false,
        front: false,
        back: false,
      }, */
    };
  },
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
      'hoveredObject3D',
      'dragging',
    ]),
    ...mapState('Panels', [
      'connections',
      'enableResizing',
      'enableMoving',
    ]),
    relatedConnections() {
      return this.connections.filter(c => c.containsPanel(this.id));
    },
    isSelected() {
      if (this.selectedObject3D && this.selectedObject3D.object3d) return this.selectedObject3D.object3d.name.split('_').includes(this.id.toString());
      return false;
    },
    showStickers() {
      return this.isItemDisplayed('stickers');
    },
    showConnections() {
      return this.isItemDisplayed('connections');
    },
    showEdgesSelector() {
      return this.isSelected && this.isItemDisplayed('edges-selector');
    },
    showCoordinateArrows() {
      return this.isSelected && this.isItemDisplayed('dimension-arrows') && this.enableMoving;
    },
    showDimensionArrows() {
      return this.isSelected && this.isItemDisplayed('dimension-arrows') && this.enableResizing;
    },
    dimension: {
      get() {
        return {
          x: this.x * 10.0,
          y: this.y * 10.0,
          thick: this.thick * 10.0,
        };
      },
      set({ x, y, thick }) {
        if (x !== this.dimension.x) this.$emit('update:x', x / 10.0);
        if (y !== this.dimension.y) this.$emit('update:y', y / 10.0);
        if (thick !== this.dimension.thick) this.$emit('update:thick', thick / 10.0);
      },
    },
    position: {
      get() {
        const [x, y, z] = this.pos.map(p => p * 10.0);
        return { x: y, y: z, z: x };
      },
      set({ x, y, z }) {
        this.$emit('update:pos', [z / 10.0, x / 10.0, y / 10.0]);
      },
    },
    edges: {
      get() { return this.$attrs.edges; },
      set(val) { this.$emit('update:edges', val); },
    },

    dimensionsByType() {
      return {};
    },
    fixedPosition: {
      get() {
        return new Vector3(
          this.position.x + (this.dimensionsByType.width / 2),
          this.position.y + (this.dimensionsByType.height / 2),
          this.position.z + (this.dimensionsByType.depth / 2),
        );
      },
      set({ x, y, z }) {
        this.position = {
          x: x - (this.dimensionsByType.width / 2),
          y: y - (this.dimensionsByType.height / 2),
          z: z - (this.dimensionsByType.depth / 2),
        };
      },
    },
    boxRotation() {
      return `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`;
    },
    physicalPanelMaterials() {
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      return [
        formattedEdges[1] ? this.material.toString() : 'raw',
        formattedEdges[3] ? this.material.toString() : 'raw',
        formattedEdges[2] ? this.material.toString() : 'raw',
        formattedEdges[0] ? this.material.toString() : 'raw',
        this.isSelected ? 'selected' : this.material.toString(),
        this.isSelected ? 'selected' : 'raw',
      ];
    },
    materials() {
      return [];
    },
    pluginComponent() {
      return null;
    },
    pluginBinding() {
      return [];
    },
    customGeometry() {
      return null;
    },
    isHDFPanel() {
      return false;
    },
    isDoorPanel() {
      return false;
    },
    customGeometryBinding() {
      return [];
    },
  },
  created() {
    window.panels[this.id] = this;
  },
  beforeDestroy() {
    // eslint-disable-next-line no-underscore-dangle
    if (window.panels[this.id]._uid === this._uid) delete window.panels[this.id];
  },
  mounted() {
    this.setAsPanel();
    this.$emit('ready');
  },
  methods: {
    magnetize(translationVector) {
      this.setNewPosition(this.fixedPosition.add(translationVector));
    },
    setAsPanel() {
      // add in ThreeJS object a tag to identify the mesh as a Panel
      this.$refs.panel.inst.isPanel = true;
    },
    getAllPlanksInWorld() {
      const { vglNamespace, id } = this;
      // filter pour garder que les mesh, tous les objets sauf le courant (attention, les stickers et autres mesh ne sont pas exclu)
      return Object.values(vglNamespace.object3ds)
        .filter(obj3D => (obj3D.isMesh === true && obj3D.name !== id && obj3D.isPanel));
    },
    intersects(object) {
      // check intersection of object or current if no args
      // should use window.panels instead
      const { vglNamespace: { object3ds }, id } = this;
      const currentBoundingBox = new Box3();
      currentBoundingBox.setFromObject(object || object3ds[id]);
      const planks = Object.values(object3ds).filter(o => o.isPanel && o.name !== id);

      return planks
        .filter((mesh) => {
          const meshBB = new Box3();
          meshBB.setFromObject(mesh);
          return currentBoundingBox.intersectsBox(meshBB) === true;
        });
    },
    getSideCollide() {
      this.resetColide();
      const currentBoundingBox = new Box3();
      currentBoundingBox.setFromObject(this.vglNamespace.object3ds[this.id]);

      this.intersects().forEach((mesh) => {
        this.getSideCollideWithMesh(currentBoundingBox, mesh);
      });

      return this.collide;
    },
    getSideCollideWithMesh(currentBoundingBox, mesh) {
      mesh.geometry.computeBoundingBox();
      const meshBB = new Box3();
      meshBB.setFromObject(mesh);
      this.collide.left = this.collide.left || !currentBoundingBox.clone().translate(new Vector3(1, 0, 0)).intersectsBox(meshBB);
      this.collide.right = this.collide.right || !currentBoundingBox.clone().translate(new Vector3(-1, 0, 0)).intersectsBox(meshBB);
      this.collide.upper = this.collide.upper || !currentBoundingBox.clone().translate(new Vector3(0, -1, 0)).intersectsBox(meshBB);
      this.collide.lower = this.collide.lower || !currentBoundingBox.clone().translate(new Vector3(0, 1, 0)).intersectsBox(meshBB);
      this.collide.front = this.collide.front || !currentBoundingBox.clone().translate(new Vector3(0, 0, -1)).intersectsBox(meshBB);
      this.collide.back = this.collide.back || !currentBoundingBox.clone().translate(new Vector3(0, 0, 1)).intersectsBox(meshBB);
    },
    resetCollide() {
      // eslint-disable-next-line no-return-assign
      Object.keys(this.collide).forEach(k => (this.collide[k] = false));
    },
    setNewPosition(position) {
      // unfix origin position
      this.fixedPosition = position;
    },
    move(event, position, mesh, faceIndex, magnetism) {
      this.collide = false;

      const mouseScreenPoint = new Vector2();
      const rect = this.vglNamespace.renderers[0].inst.domElement.getBoundingClientRect();
      mouseScreenPoint.x = event.clientX - rect.left;
      mouseScreenPoint.y = event.clientY - rect.top;

      if (mesh.isDimension || mesh.isCoordinate) {
        const mouse = new Vector2();
        mouse.x = (mouseScreenPoint.x / rect.width) * 2 - 1;
        mouse.y = -(mouseScreenPoint.y / rect.height) * 2 + 1;

        const closestVertex = this.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint);

        this.resize(mesh, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
      } else if (mesh.isPanel) {
        this.$store.dispatch('Panels/deletePanelConnections', this.id);
        this.moving = true;
        if (magnetism) {
          /** MAGNETISM */
          this.$refs.vertices.showNearestVertices();
          const closestVertex = this.$refs.vertices.closestVisibleVertex(mouseScreenPoint);

          if (closestVertex && this.$refs.vertices.magnetize(closestVertex.vertex)) return;
        } else {
          this.$refs.vertices.resetAllVerticesVisibility();
        }

        const newOrigin = this.fixedPosition.clone();
        newOrigin.setX(position.x);
        newOrigin.setY(position.y);
        newOrigin.setZ(position.z);
        this.setNewPosition(newOrigin);
      }
    },
    resize(mesh, position, newVector, magnetism) {
      if (mesh.isDimension) this.$refs.dimensions.resize(mesh.name, position, newVector, magnetism);
      else this.$refs.coordinate.resize(mesh.name, position, newVector, magnetism);
    },
    select(isSelected) {
      const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};
      if (!object3d) {
        // nothing selected.. unselect just in case
        this.$refs.vertices.resetAllVerticesVisibility();
        this.moving = false;
      } else if (object3d.isPanel) {
        if (isSelected) {
          this.$refs.vertices.setNearestVerticeVisible(this.hoveredObject3D);
        } else {
          this.$refs.vertices.resetVerticesVisibility();
        }
      } else this.$refs.vertices.resetVerticesVisibility();
    },
    setDragging(isSelected) {
      if (this.selectedObject3D.object3d.isCoordinate && isSelected) this.$refs.coordinate.select(this.selectedObject3D.object3d);
      else if (this.selectedObject3D.object3d.isDimension && isSelected) this.$refs.dimensions.select(this.selectedObject3D.object3d);
      else if (this.selectedObject3D.object3d.isCoordinate) this.$refs.coordinate.select(null);
      else if (this.selectedObject3D.object3d.isDimension) this.$refs.dimensions.select(null);
    },
    updateColliding() {
      const { [this.id]: current, ...others } = window.panels;
      const currentBox = new Box3();
      currentBox.setFromObject(this.$refs.panel.inst);

      this.collide = Object.values(others)
        .filter(c => c != null)
        .map(c => c.$refs.panel.inst)
        .reduce((isColliding, inst) => {
          const box = new Box3();
          box.setFromObject(inst);
          if (currentBox.intersectsBox(box)) {
            const size = new Vector3();
            currentBox.clone().intersect(box.clone()).getSize(size);
            return isColliding || !Object.values(size).includes(0);
          }
          return isColliding;
        }, false);
    },
  },
  watch: {
    moving(isMoving, wasMoving) {
      if (isMoving && !wasMoving) {
        if (this.relatedConnections.length) this.$store.dispatch('Panels/deletePanelConnections', this.id);
      }
    },
    ptype(newType, oldType) {
      if (newType !== oldType) {
        this.$store.dispatch('Panels/deletePanelConnections', this.id);
      }
    },
    selectedObject3D: {
      handler() {
        this.select(this.isSelected);
      },
    },
    hoveredObject3D: {
      handler() {
        this.select(this.isSelected);
      },
    },
  },
};
</script>

<style scoped>

</style>
