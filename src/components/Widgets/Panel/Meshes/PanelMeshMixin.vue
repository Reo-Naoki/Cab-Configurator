<!--suppress HtmlUnknownTag -->
<template>
  <vgl-group :rotation="boxRotation" :name="id + '_group'">
    <vgl-box-geometry :name="id + '_geometry'"
                      ref="geometry"
                      :width-segments="1"
                      :height-segments="1"
                      :depth-segments="1"
                      :width="isDoorPanel ? realDimensionByType.width : dimensionsByType.width"
                      :height="isDoorPanel ? realDimensionByType.height : dimensionsByType.height"
                      :depth="isHDFPanel ? 0.1 : (isDoorPanel ? realDimensionByType.depth : dimensionsByType.depth)" />
    <vgl-mesh ref='panel'
              :geometry="id + '_geometry'"
              :material="materials"
              :rotation="boxRotation"
              :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
              :name="id"
              :visible="!customGeometry && isPanelVisible" />

    <!-- VDPwithPoints(Shape Panel) -->
    <div v-if="customGeometry">
      <component :is="customGeometry" v-bind="customGeometryBinding()" />
      <vgl-mesh ref='leftPhysicalGeometry'
                :geometry="id + '_physicalGeometry'"
                :material="materials"
                :rotation="shapeSideRotation"
                :position="leftPanelPosition()"
                :name="id + '_left_physicalGeometry'"
                :visible="isPanelVisible" />
      <vgl-mesh ref='rightPhysicalGeometry'
                :geometry="id + '_physicalGeometry'"
                :material="materials"
                :rotation="shapeSideRotation"
                :position="rightPanelPosition()"
                :name="id + '_right_physicalGeometry'"
                :visible="isPanelVisible" />
      <div v-for="(height, index) in shapeHeights()" :key="`${id}_${index}_physicalGeometry`">
        <vgl-plane-geometry :width="shapeThick()"
                            :height="height"
                            :name="`${id}_${index}_physicalGeometry`" />
        <vgl-mesh :ref="`${index}_physicalGeometry`"
                  :geometry="`${id}_${index}_physicalGeometry`"
                  :material="materials[index + 1]"
                  :rotation="shapeRotations()[index]"
                  :position="shapePositions(index)"
                  :name="`${id}_${index}_physicalGeometry`"
                  :visible="isPanelVisible" />
        <vgl-geometry :name="`${id}_${index}_outline`"
                      :position-attribute="shapeSegmentLine(index)" />
        <vgl-line-segments :geometry="`${id}_${index}_outline`"
                       :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
                       material="outline" />
      </div>
      <div>
        <vgl-geometry :name="`${id}_outline`" :position-attribute="outline()" />
        <vgl-line-loop :geometry="`${id}_outline`"
                       :position="leftPanelPosition()"
                       material="outline" />
        <vgl-line-loop :geometry="`${id}_outline`"
                       :position="rightPanelPosition()"
                       material="outline" />
      </div>
    </div>
    <!-------------------------------->

    <!-- HDFPanel -->
    <vgl-group v-if="customGeometry == null && isHDFPanel">
       <!-- Magnetic Panel -->
      <vgl-box-geometry :name="id + '_boundingBox'"
                        :width-segments="1"
                        :height-segments="1"
                        :depth-segments="1"
                        :width="dimensionsByType.width"
                        :height="dimensionsByType.height"
                        :depth="dimensionsByType.depth + 5" />
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
                        :width="hdfPhysicalDimensions.width"
                        :height="hdfPhysicalDimensions.height"
                        :depth="hdfPhysicalDimensions.depth" />
      <vgl-mesh :geometry="id + '_physicalGeometry'"
                ref='physicalGeometry'
                :material="physicalPanelMaterials"
                :position="`${hdfPhysicalPosition.x} ${hdfPhysicalPosition.y} ${hdfPhysicalPosition.z}`"
                :name="id + '_physicalGeometry'"
                :visible="isPanelVisible" />
    </vgl-group>
    <!------------->

    <!-- DoorPanel -->
    <vgl-group v-else-if="customGeometry == null && isDoorPanel">
       <!-- Magnetic Panel -->
      <vgl-box-geometry :name="id + '_boundingBox'"
                        :width-segments="1"
                        :height-segments="1"
                        :depth-segments="1"
                        :width="dimensionsByType.width"
                        :height="dimensionsByType.height"
                        :depth="dimensionsByType.depth" />
      <vgl-mesh ref="magneticBoundingBox"
                :geometry="id + '_boundingBox'"
                :material="physicalPanelMaterials"
                :position="`${fixedPosition.x} ${fixedPosition.y} ${fixedPosition.z}`"
                :name="id + '_boundingBox'"
                :visible="false" />
    </vgl-group>
    <!--------------->

    <PlankVertices ref="vertices" :plank-position.sync="fixedPosition" :plank-dimension.sync="dimensionsByType" :plank-type="ptype" :plank-name="id" :plank-points.sync="shapePoints" :point-angles="shapePointAngles" :thick="thick" :works="drillWorks" :drill-positions="drillCenterPositions" />
    <PlankStickers :plank-position="position" :plank-dimension="dimensionsByType" :plank-type="ptype" :plank-name="id" v-if="showStickers" />
    <PlankEdges :plank-position="fixedPosition" :plank-dimension="dimensionsByType" :plank-type="ptype" :plank-edges.sync="edges" :plank-points.sync="shapePoints" :x="x" :y="y" v-if="showEdgesSelector" />
    <PlankCoordinate ref="coordinate" :plank-position.sync="fixedPosition" :plank-dimension.sync="dimensionsByType" :plank-type="ptype" :plank-name="id" v-if="showCoordinateArrows" />
    <PlankDimensions ref="dimensions" :plank-position.sync="fixedPosition" :plank-dimension.sync="dimensionsByType" :plank-type="ptype" :plank-name="id" :plank-points.sync="shapePoints" v-if="showDimensionArrows" />
    <PlankConnections ref="connections" :plank-position="fixedPosition" :plank-i-d="id" :connections="relatedConnections" v-if="showConnections" />
    <PlankExcentrique :plank-position="position" :plank-dimension="dimensionsByType" :plank-type="ptype" :plank-i-d="id" :connections="relatedConnections" v-if="visible" />
    <PlankDrill ref="drills" :plank-position="position" :plank-dimension="dimensionsByType" :plank-type="ptype" :plank-i-d="id" :works.sync="drillWorks" :drill-positions="drillPositions" :drill-center-positions="drillCenterPositions" />
    <ShapeLines :plank-position="fixedPosition" :plank-dimension="dimensionsByType" :plank-type="ptype" :plank-points.sync="shapePoints" v-if="enableShapeEdit && isSelected && shapePoints" />
    <component v-if="pluginComponent" :is="pluginComponent" v-bind="pluginBinding"/>

    <!-- Bounding Box for Magnetic Panel of DoorPanel -->
    <vgl-box-helper v-else-if="isDoorPanel" :object="id" color="#cccccc"/>
    <!-- Bounding Box for Magnetic Panel of HDFPanel -->
    <vgl-box-helper v-else-if="isHDFPanel" :object="id + '_boundingBox'" color="#3C3C3C"/>
    <!-- Bounding Box for Physical Panel -->
    <vgl-box-helper v-else :object="id" color="#3C3C3C"/>

    <!-- Bounding Box for Physical Panel of DoorPanel-->
    <vgl-box-helper v-if="isDoorPanel" :object="id + '_boundingBox'" color="#666666"/>

  </vgl-group>
</template>

<script>
import { Vector2, Vector3, Box3 } from 'three';
import { mapGetters, mapState } from 'vuex';
import PlankVertices from '../Plugins/PlankVertices';
import PlankStickers from '../Plugins/PlankStickers';
import PlankEdges from '../Plugins/PlankEdges';
import PlankCoordinate from '../Plugins/PlankCoordinate';
import PlankDimensions from '../Plugins/PlankDimensions';
import PlankConnections from '../Plugins/PlankConnections';
import PlankExcentrique from '../Plugins/PlankExcentrique';
import PlankDrill from '../Plugins/PlankDrill';
import ShapeLines from '../Plugins/ShapeLines';

export default {
  name: 'PlankMesh',
  components: {
    PlankVertices,
    PlankStickers,
    PlankEdges,
    PlankCoordinate,
    PlankDimensions,
    PlankConnections,
    PlankExcentrique,
    PlankDrill,
    ShapeLines,
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
    layer: {
      type: String,
      default: 'Structure',
    },
    points: {
      type: Array,
      required: false,
    },
    works: {
      type: Array,
      required: false,
    },
    groupName: {
      type: String,
      required: false,
    },
    groupType: {
      type: String,
      required: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    resizable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      currentBoundingBox: null,
      moving: false,
      collide: false,
      prevType: null,
    };
  },
  computed: {
    ...mapGetters('DisplayManager', [
      'isItemDisplayed',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
      'hoveredObject3D',
    ]),
    ...mapState('Panels', [
      'connections',
      'enableResizing',
      'enableMoving',
      'enableShapeEdit',
      'enableDrillEdit',
      'panelVisibleMode',
      'moveDirection',
      'prevPosition',
    ]),
    relatedConnections() {
      return this.connections.filter(c => c.containsPanel(this.id));
    },
    isSelected() {
      if (this.selectedObject3D) {
        const selectedObject = this.selectedObject3D.object3d;
        const { name } = selectedObject;
        if (this.enableShapeEdit || this.enableDrillEdit) {
          if ((selectedObject.isCoordinate || selectedObject.isDimension || selectedObject.isShapeVertex || selectedObject.isDrillGeometry) && name.split('_')[0] === this.id) {
            return true;
          }
        } else {
          if (selectedObject.isCoordinate && name.split('_coordinate')[0] === this.id) return true;
          if (selectedObject.isDimension && name.split('_dimensions')[0] === this.id) return true;
          if (selectedObject.isConnectionBubble && (name.split('_')[1] === this.id || name.split('_')[2] === this.id)) return true;
        }
        if (selectedObject.name === this.id) return true;
        if (selectedObject.name.split('_')[0] === this.id) return true;
      }
      return false;
    },
    isPanelVisible() {
      if (!this.visible) return false;
      if (!this.selectedObject3D) return true;
      if (this.panelVisibleMode === 'Normal') return true;
      if (this.panelVisibleMode === 'Self Hidden') return !this.isSelected;
      if (this.panelVisibleMode === 'Others Hidden') return this.isSelected;
      if (this.panelVisibleMode === 'All Hidden') return false;
      return true;
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
    topGroupName() {
      let { groupName } = this;
      if (!groupName) return null;

      while (groupName) {
        if (!window.groups[groupName].groupName) return groupName;
        ({ groupName } = window.groups[groupName]);
      }
      return null;
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
    centerPivotPos() {
      return {
        x: this.prevPosition.x + this.dimensionsByType.width / 2,
        y: this.prevPosition.y + this.dimensionsByType.height / 2,
        z: this.prevPosition.z + this.dimensionsByType.depth / 2,
      };
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
    shapePoints: {
      get() { return this.points; },
      set(val) { this.$emit('update:points', val); },
    },
    shapePointAngles() {
      if (this.points) {
        return this.points.map((p, index) => {
          const prevIndex = (index - 1 + this.points.length) % this.points.length;
          const nextIndex = (index + 1) % this.points.length;
          const prevVect = new Vector2(this.points[prevIndex][0] - p[0], this.points[prevIndex][1] - p[1]);
          const nextVect = new Vector2(this.points[nextIndex][0] - p[0], this.points[nextIndex][1] - p[1]);
          return Math.round((((prevVect.angle() - nextVect.angle()) / Math.PI * 180 + 360) % 360) * 100) / 100;
        });
      }
      return null;
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
    drillWorks: {
      get() { return this.works; },
      set(val) { this.$emit('update:works', val); },
    },
    drillPositions() {
      if (!this.works) return [];

      let { x, y } = this.position;
      const { width, height, depth } = this.dimensionsByType;
      const z = this.position.z + depth;
      const pos = this.works.map(work => {
        let posX = (work.x || 0) * 10;
        let posY = (work.y || 0) * 10;
        let posZ = (work.z || 0) * 10;
        const posOffset = work.di ? work.dp * 5 : -3;
        if (work.wt === 'H') {
          const sign = this.ptype === 'VP' ? -1 : 1;
          if (work.sd === 1) posZ += posOffset * sign;
          else posZ -= posOffset * sign;
        } else if (work.wt === 'HH') {
          if (work.dir === 'XP') posX += posOffset;
          else if (work.dir === 'XM') posX -= posOffset;
          else if (work.dir === 'YP') posY += posOffset;
          else if (work.dir === 'YM') posY -= posOffset;
        }
        return {
          x: posX,
          y: posY,
          z: posZ,
        };
      });

      switch (this.ptype) {
        case 'FP':
          y += height;
          return this.works.map((work, index) => {
            const workX = x + pos[index].x;
            const workY = work.wt === 'HT' ? y - (work.di ? height / 2 : -3) : (y - pos[index].z - (work.sd === 2 ? height : 0));
            const workZ = z - pos[index].y;
            return `${workX} ${workY} ${workZ}`;
          });
        case 'VP':
          return this.works.map((work, index) => {
            const workX = x + pos[index].x;
            const workY = y + pos[index].y;
            const workZ = work.wt === 'HT' ? z - (work.di ? depth / 2 : -3) : (z - pos[index].z - (work.sd === 1 ? depth : 0));
            return `${workX} ${workY} ${workZ}`;
          });
        case 'VDP':
          x += width;
          return this.works.map((work, index) => {
            const workX = work.wt === 'HT' ? x - (work.di ? width / 2 : -3) : (x - pos[index].z - (work.sd === 2 ? width : 0));
            const workY = y + pos[index].y;
            const workZ = z - pos[index].x;
            return `${workX} ${workY} ${workZ}`;
          });
        default:
          return [];
      }
    },
    drillCenterPositions() {
      const {
        ptype,
        dimensionsByType: { width, depth, height },
      } = this;

      return this.drillPositions.map((position, index) => {
        const [x, y, z] = position.split(' ').map(v => parseInt(v, 10));
        const centerPosition = new Vector3(x, y, z);
        const work = this.works[index];
        let offset = work.dp * 5;

        if (work.wt === 'HT') {
          if (ptype === 'FP') offset = height / 2;
          else if (ptype === 'VP') offset = depth / 2;
          else offset = width / 2;
        }

        if (!work.di) offset = 0;

        if (ptype === 'FP') {
          if (work.wt === 'HH') {
            if (work.dir.includes('X')) {
              if (work.dir === 'XM') centerPosition.add(new Vector3(offset, 0, 0));
              else centerPosition.add(new Vector3(-offset, 0, 0));
            } else if (work.dir === 'YM') {
              centerPosition.add(new Vector3(0, 0, -offset));
            } else {
              centerPosition.add(new Vector3(0, 0, offset));
            }
          } else if (work.wt === 'H') {
            if (work.sd === 1) centerPosition.add(new Vector3(0, offset, 0));
            else centerPosition.add(new Vector3(0, -offset, 0));
          } else if (work.wt === 'HT') {
            centerPosition.add(new Vector3(0, offset, 0));
          }
        } else if (ptype === 'VP') {
          if (work.wt === 'HH') {
            if (work.dir.includes('X')) {
              if (work.dir === 'XM') centerPosition.add(new Vector3(offset, 0, 0));
              else centerPosition.add(new Vector3(-offset, 0, 0));
            } else if (work.dir === 'YM') {
              centerPosition.add(new Vector3(0, offset, 0));
            } else {
              centerPosition.add(new Vector3(0, -offset, 0));
            }
          } else if (work.wt === 'H') {
            if (work.sd === 1) centerPosition.add(new Vector3(0, 0, -offset));
            else centerPosition.add(new Vector3(0, 0, offset));
          } else if (work.wt === 'HT') {
            centerPosition.add(new Vector3(0, 0, -offset));
          }
        } else if (ptype === 'VDP') {
          if (work.wt === 'HH') {
            if (work.dir.includes('X')) {
              if (work.dir === 'XM') centerPosition.add(new Vector3(0, 0, -offset));
              else centerPosition.add(new Vector3(0, 0, offset));
            } else if (work.dir === 'YM') {
              centerPosition.add(new Vector3(0, offset, 0));
            } else {
              centerPosition.add(new Vector3(0, -offset, 0));
            }
          } else if (work.wt === 'H') {
            if (work.sd === 1) centerPosition.add(new Vector3(offset, 0, 0));
            else centerPosition.add(new Vector3(-offset, 0, 0));
          } else if (work.wt === 'HT') {
            centerPosition.add(new Vector3(offset, 0, 0));
          }
        }

        return centerPosition;
      });
    },
    boundingBox() {
      const { x, y, z } = this.fixedPosition;
      const { width, height, depth } = this.dimensionsByType;

      return new Box3(new Vector3(x - width / 2, y - height / 2, z - depth / 2), new Vector3(x + width / 2, y + height / 2, z + depth / 2));
    },
    boxRotation() {
      return `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`;
    },
    physicalPanelMaterials() {
      if (!this.edges) return null;
      const formattedEdges = this.edges.split('-').map(edge => !!parseInt(edge, 10));
      if (this.collide) return 'red';
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
  },
  created() {
    window.panels[this.id] = this;
  },
  updated() {
    if (this.prevType !== this.ptype || this.isParentSelected) {
      const self = this;
      this.currentBoundingBox = this.boundingBox;
      this.$nextTick(() => self.updateColliding(true));
    }
    this.prevType = this.ptype;
  },
  beforeDestroy() {
    // eslint-disable-next-line no-underscore-dangle
    if (window.panels[this.id] && window.panels[this.id]._uid === this._uid) delete window.panels[this.id];
  },
  mounted() {
    this.setAsPanel();
    this.$emit('ready');
  },
  methods: {
    isChildOf(name) {
      let { groupName } = this;
      if (!groupName) return false;

      while (groupName) {
        if (groupName === name) return true;
        ({ groupName } = window.groups[groupName]);
      }
      return false;
    },
    getMouseScreenPoint(event) {
      const mouseScreenPoint = new Vector2();
      const rect = this.vglNamespace.renderers[0].inst.domElement.getBoundingClientRect();
      mouseScreenPoint.x = event.clientX - rect.left;
      mouseScreenPoint.y = event.clientY - rect.top;
      return mouseScreenPoint;
    },
    getBoundingBox() {
      if (this.currentBoundingBox) return this.currentBoundingBox;

      this.currentBoundingBox = this.boundingBox;
      return this.currentBoundingBox;
    },
    magnetize(translationVector) {
      this.setNewPosition(this.fixedPosition.add(translationVector));
    },
    setAsPanel() {
      // add in ThreeJS object a tag to identify the mesh as a Panel
      this.$refs.panel.inst.isPanel = true;
      if (this.$refs.physicalGeometry) this.$refs.physicalGeometry.inst.isPhysicalGeometry = true;
    },
    getAllPlanksInWorld() {
      const { vglNamespace, id } = this;
      // filter pour garder que les mesh, tous les objets sauf le courant (attention, les stickers et autres mesh ne sont pas exclu)
      return Object.values(vglNamespace.object3ds)
        .filter(obj3D => (obj3D.isMesh === true && obj3D.name !== id && obj3D.isPanel));
    },
    setNewPosition(position) {
      // unfix origin position
      this.fixedPosition = position;
    },
    move(event, position, mesh, magnetism) {
      this.collide = false;
      const mouseScreenPoint = this.getMouseScreenPoint(event);
      // if (!this.moving) this.$store.dispatch('Panels/deletePanelConnections', { id: this.id });

      if (this.enableShapeEdit || this.enableDrillEdit) {
        this.moving = true;
        const closestVertex = this.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint);
        if (this.enableShapeEdit) window.verticeCoordinates[mesh.name.split('_coordinate')[0]].move(mesh.name, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
        if (this.enableDrillEdit) window.drillCoordinates[mesh.name.split('_coordinate')[0]].move(mesh.name, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
        return;
      }

      if (mesh.isDimension || mesh.isCoordinate) {
        this.moving = true;
        const closestVertex = this.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint, [this.id]);
        this.resize(mesh, position, closestVertex ? closestVertex.vertex.position : false, magnetism);
      } else if (mesh.isPanel) {
        this.moving = true;

        if (magnetism) {
          /** MAGNETISM */
          this.$refs.vertices.showNearestVertices(mouseScreenPoint);

          const closestVertex = this.$refs.vertices.closestVisibleVertex(mouseScreenPoint);
          if (closestVertex && this.$refs.vertices.magnetize(closestVertex.vertex, mouseScreenPoint)) return;
        } else {
          this.$refs.vertices.resetAllVerticesVisibility();
        }

        const { x, y, z } = this.centerPivotPos;
        const newOrigin = new Vector3(x, y, z);
        if (!this.moveDirection || this.moveDirection === 'x') newOrigin.setX(position.x);
        if (!this.moveDirection || this.moveDirection === 'y') newOrigin.setY(position.y);
        if (!this.moveDirection || this.moveDirection === 'z') newOrigin.setZ(position.z);
        this.setNewPosition(newOrigin);
      }
    },
    setRuler(event, rulerPoint = null, move = true) {
      const mouseScreenPoint = this.getMouseScreenPoint(event);
      const closestVertex = this.$refs.vertices.getNearestVerticeInWorld(mouseScreenPoint);
      if (closestVertex) this.$store.commit('Panels/setRulerPoint', { point: closestVertex.vertex.position, move });
      else this.$store.commit('Panels/setRulerPoint', { point: rulerPoint, move });
    },
    createPoint(point) {
      this.$refs.vertices.createPoint(point);
    },
    createDrill(point) {
      this.$refs.drills.createDrill(point);
    },
    resize(mesh, position, newVector, magnetism) {
      if (mesh.isDimension) this.$refs.dimensions.resize(mesh.name, position, newVector, magnetism);
      else this.$refs.coordinate.resize(mesh.name, position, newVector, magnetism);
    },
    select(isSelected) {
      const { object3d } = this.hoveredObject3D ? this.hoveredObject3D : this.selectedObject3D || {};
      if (object3d && object3d.isPanel) {
        if (isSelected) {
          this.$refs.vertices.setNearestVerticeVisible(this.hoveredObject3D);
        } else if (!this.groupName || !this.hoveredObject3D || this.hoveredObject3D.object3d.name !== this.id) {
          this.$refs.vertices.resetVerticesVisibility();
          this.moving = false;
        }
      } else {
        this.$refs.vertices.resetVerticesVisibility();
        this.moving = false;
      }
    },
    setDragging(isSelected) {
      if (!isSelected) {
        this.$refs.vertices.resetAllVerticesVisibility();
        this.moving = false;
      }
      const selectedObject = this.selectedObject3D.object3d;
      const { name } = selectedObject;

      if (this.enableShapeEdit) {
        if (selectedObject.isCoordinate && isSelected) window.verticeCoordinates[name.split('_coordinate')[0]].select(selectedObject);
        else if (selectedObject.isCoordinate) window.verticeCoordinates[name.split('_coordinate')[0]].select(null);
        return;
      }
      if (this.enableDrillEdit) {
        if (selectedObject.isCoordinate && isSelected) window.drillCoordinates[name.split('_coordinate')[0]].select(selectedObject);
        else if (selectedObject.isCoordinate) window.drillCoordinates[name.split('_coordinate')[0]].select(null);
        return;
      }

      if (selectedObject.isCoordinate && isSelected) this.$refs.coordinate.select(selectedObject);
      else if (selectedObject.isDimension && isSelected) this.$refs.dimensions.select(selectedObject);
      else if (selectedObject.isCoordinate) this.$refs.coordinate.select(null);
      else if (selectedObject.isDimension) this.$refs.dimensions.select(null);
    },
    autoEdgeApply(applyMode) {
      if (!this.edges) return;

      let newEdges = this.edges.split('-');
      if (applyMode === 'all') {
        newEdges = newEdges.map(() => '0');
      }

      const panelConnections = this.relatedConnections.filter(c => c.p2.toString() === this.id);
      newEdges = newEdges.map((edge, index) => {
        if (edge === '0' && !this.findEdgeConnection(panelConnections, index)) {
          return this.isDoorPanel ? '20' : '6';
        }
        return edge;
      });

      this.edges = newEdges.join('-');
    },
    findEdgeConnection(connections, index) {
      const {
        position,
        fixedPosition,
        dimensionsByType,
      } = this;

      if (this.ptype === 'FP') {
        return connections.find((c) => {
          if (index === 0 && c.center.x === position.x && c.center.y === fixedPosition.y && c.center.z === fixedPosition.z) return true;
          if (index === 1 && c.center.x === fixedPosition.x && c.center.y === fixedPosition.y && c.center.z === position.z + dimensionsByType.depth) return true;
          if (index === 2 && c.center.x === position.x + dimensionsByType.width && c.center.y === fixedPosition.y && c.center.z === fixedPosition.z) return true;
          if (index === 3 && c.center.x === fixedPosition.x && c.center.y === fixedPosition.y && c.center.z === position.z) return true;
          return false;
        });
      }
      if (this.ptype === 'VP') {
        return connections.find((c) => {
          if (index === 0 && c.center.x === fixedPosition.x && c.center.y === position.y && c.center.z === fixedPosition.z) return true;
          if (index === 1 && c.center.x === position.x + dimensionsByType.width && c.center.y === fixedPosition.y && c.center.z === fixedPosition.z) return true;
          if (index === 2 && c.center.x === fixedPosition.x && c.center.y === position.y + dimensionsByType.height && c.center.z === fixedPosition.z) return true;
          if (index === 3 && c.center.x === position.x && c.center.y === fixedPosition.y && c.center.z === fixedPosition.z) return true;
          return false;
        });
      }
      if (this.ptype === 'VDP') {
        return connections.find((c) => {
          if (index === 0 && c.center.x === fixedPosition.x && c.center.y === position.y && c.center.z === fixedPosition.z) return true;
          if (index === 1 && c.center.x === fixedPosition.x && c.center.y === fixedPosition.y && c.center.z === position.z + dimensionsByType.depth) return true;
          if (index === 2 && c.center.x === fixedPosition.x && c.center.y === position.y + dimensionsByType.height && c.center.z === fixedPosition.z) return true;
          if (index === 3 && c.center.x === fixedPosition.x && c.center.y === fixedPosition.y && c.center.z === position.z) return true;
          return false;
        });
      }
      return null;
    },
    setCollide(value) {
      this.collide = value;
    },
    getCollide() {
      return this.collide;
    },
    async updateColliding(checkOthers = false) {
      // if (!checkOthers || checkOthers) return null;
      return new Promise(resolve => {
        const currentBox = this.getBoundingBox();
        this.collide = Object.values(window.panels)
          .filter(panel => panel.id !== this.id)
          .filter(c => c != null)
          .reduce((isColliding, c) => {
            const box = c.getBoundingBox();
            if (currentBox.intersectsBox(box)) {
              const size = new Vector3();
              currentBox.clone().intersect(box).getSize(size);
              const isBoxCollide = !Object.values(size).includes(0);
              if (isBoxCollide) c.setCollide(isBoxCollide);
              if (c.getCollide() && !isBoxCollide && checkOthers) c.updateColliding();
              return isColliding || isBoxCollide;
            }
            if (c.getCollide() && checkOthers) c.updateColliding();
            return isColliding;
          }, false);
        resolve();
      });
    },
  },
  watch: {
    ptype(newType, oldType) {
      if (newType !== oldType) {
        this.$store.dispatch('Panels/deletePanelConnections', { id: this.id });
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
