<template>
  <vgl-group>
    <div v-for="vertex in vertices" :key="vertex.name">
      <div v-if="vertex.visible">
        <vgl-sphere-geometry
          :name="`${vertex.name}vertex-geometry`"
          :radius="sizeByDistanceToCamera(vertex.position)"
          :width-segments="6"
          :height-segments="6" />
        <vgl-mesh ref="vertices" :geometry="`${vertex.name}vertex-geometry`" v-bind="vertex" />
        <VerticeCoordinate v-if="showCoordinateArrows(vertex.name)"
          :vertice-name="vertex.name"
          :plank-position.sync="position"
          :plank-dimension.sync="dimensionsByType"
          :plank-type="plankType"
          :vertice-position="vertex.position"
          :shape-points.sync="shapePoints" />
      </div>
    </div>
  </vgl-group>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import { Vector3 } from 'three';
import EventBus from '../../../EventBus/EventBus';
import VerticeCoordinate from './VerticeCoordinate';

export default {
  name: 'PlankVertices',
  components: {
    VerticeCoordinate,
  },
  inject: ['vglNamespace'],
  props: {
    plankName: {
      type: String,
      required: true,
    },
    plankPosition: {
      type: Object,
      required: true,
    },
    plankDimension: {
      type: Object,
      required: true,
    },
    plankType: {
      type: String,
      required: true,
    },
    plankPoints: {
      type: Array,
      required: false,
    },
    radius: {
      type: Number,
      default: 1,
    },
  },
  mounted() {
    EventBus.$on('vertices', this.setVertexVisibility);
    EventBus.$on('vertices-near', this.handlerVerticesNear);
    EventBus.$on('vertices-reset', this.resetVerticesVisibility);
    EventBus.$on('vertices-all', this.setAllVerticesVisible);
  },
  data() {
    return {
      showVertices: {},
      nearRange: 200,
      magnetRange: 50,
    };
  },
  computed: {
    ...mapState('Panels', [
      'enableShapeEdit',
      'moveDirection',
      'prevPosition',
    ]),
    ...mapState('Camera', [
      'selectedObject3D',
    ]),
    vertices() {
      const {
        plankName,
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
        showVertices,
        plankType,
      } = this;
      const namePrefix = `${plankName}_vertex`;
      const pointVertice = [];
      if (this.plankPoints) {
        this.plankPoints.forEach((point, index) => {
          pointVertice.push({
            side: `SHAPE${index}M`,
            name: `${namePrefix}_SHAPE${index}M`,
            position: this.shapePointPosition(0, point),
            visible: this.showShapeVertice || (`SHAPE${index}M` in showVertices ? showVertices[`SHAPE${index}M`] : false),
          });
          pointVertice.push({
            side: `SHAPE${index}L`,
            name: `${namePrefix}_SHAPE${index}L`,
            position: this.shapePointPosition(-1, point),
            visible: `SHAPE${index}L` in showVertices ? showVertices[`SHAPE${index}L`] : false,
          });
          pointVertice.push({
            side: `SHAPE${index}R`,
            name: `${namePrefix}_SHAPE${index}R`,
            position: this.shapePointPosition(1, point),
            visible: `SHAPE${index}R` in showVertices ? showVertices[`SHAPE${index}R`] : false,
          });
        });
      }
      return [
        ...pointVertice,
        { // UpperFrontLeft
          side: 'UFL', name: `${namePrefix}_UFL`, position: `${px - width / 2} ${py + height / 2} ${pz + depth / 2}`, visible: 'UFL' in showVertices ? showVertices.UFL : false,
        },
        { // UpperFrontRight
          side: 'UFR', name: `${namePrefix}_UFR`, position: `${px + width / 2} ${py + height / 2} ${pz + depth / 2}`, visible: 'UFR' in showVertices ? showVertices.UFR : false,
        },
        { // LowerFrontLeft
          side: 'LFL', name: `${namePrefix}_LFL`, position: `${px - width / 2} ${py - height / 2} ${pz + depth / 2}`, visible: 'LFL' in showVertices ? showVertices.LFL : false,
        },
        { // LowerFrontRight
          side: 'LFR', name: `${namePrefix}_LFR`, position: `${px + width / 2} ${py - height / 2} ${pz + depth / 2}`, visible: 'LFR' in showVertices ? showVertices.LFR : false,
        },
        { // UpperBackLeft
          side: 'UBL', name: `${namePrefix}_UBL`, position: `${px - width / 2} ${py + height / 2} ${pz - depth / 2}`, visible: 'UBL' in showVertices ? showVertices.UBL : false,
        },
        { // UpperBackRight
          side: 'UBR', name: `${namePrefix}_UBR`, position: `${px + width / 2} ${py + height / 2} ${pz - depth / 2}`, visible: 'UBR' in showVertices ? showVertices.UBR : false,
        },
        { // LowerBackLeft
          side: 'LBL', name: `${namePrefix}_LBL`, position: `${px - width / 2} ${py - height / 2} ${pz - depth / 2}`, visible: 'LBL' in showVertices ? showVertices.LBL : false,
        },
        { // LowerBackRight
          side: 'LBR', name: `${namePrefix}_LBR`, position: `${px + width / 2} ${py - height / 2} ${pz - depth / 2}`, visible: 'LBR' in showVertices ? showVertices.LBR : false,
        },
        { // UpperFrontMiddle
          side: 'UFM', name: `${namePrefix}_UFM`, position: `${px} ${py + height / 2} ${pz + depth / 2}`, visible: 'UFM' in showVertices ? showVertices.UFM : false,
        },
        { // UpperBackMiddle
          side: 'UBM', name: `${namePrefix}_UBM`, position: `${px} ${py + height / 2} ${pz - depth / 2}`, visible: 'UBM' in showVertices ? showVertices.UBM : false,
        },
        { // LowerFrontMiddle
          side: 'LFM', name: `${namePrefix}_LFM`, position: `${px} ${py - height / 2} ${pz + depth / 2}`, visible: 'LFM' in showVertices ? showVertices.LFM : false,
        },
        { // LowerBackMiddle
          side: 'LBM', name: `${namePrefix}_LBM`, position: `${px} ${py - height / 2} ${pz - depth / 2}`, visible: 'LBM' in showVertices ? showVertices.LBM : false,
        },
        { // MiddleFrontLeft
          side: 'MFL',
          name: `${namePrefix}_MFL`,
          position: plankType === 'FP'
            ? `${px - width / 2} ${py + height / 2} ${pz}`
            : `${px - width / 2} ${py} ${pz + depth / 2}`,
          visible: 'MFL' in showVertices ? showVertices.MFL : false,
        },
        { // MiddleBackLeft
          side: 'MBL',
          name: `${namePrefix}_MBL`,
          position: plankType === 'FP'
            ? `${px - width / 2} ${py - height / 2} ${pz}`
            : `${px - width / 2} ${py} ${pz - depth / 2}`,
          visible: 'MBL' in showVertices ? showVertices.MBL : false,
        },
        { // MiddleFrontRight
          side: 'MFR',
          name: `${namePrefix}_MFR`,
          position: plankType === 'FP'
            ? `${px + width / 2} ${py + height / 2} ${pz}`
            : `${px + width / 2} ${py} ${pz + depth / 2}`,
          visible: 'MFR' in showVertices ? showVertices.MFR : false,
        },
        { // MiddleBackRight
          side: 'MBR',
          name: `${namePrefix}_MBR`,
          position: plankType === 'FP'
            ? `${px + width / 2} ${py - height / 2} ${pz}`
            : `${px + width / 2} ${py} ${pz - depth / 2}`,
          visible: 'MBR' in showVertices ? showVertices.MBR : false,
        },
      ];
    },
    activeVertices() {
      return this.vertices.filter((v) => {
        const type = v.name.split('_')[2];
        return type in this.showVertices ? this.showVertices[type] : false;
      });
    },
    position: {
      get() { return this.plankPosition; },
      set(val) { this.$emit('update:plankPosition', val); },
    },
    dimensionsByType: {
      get() { return this.plankDimension; },
      set(val) { this.$emit('update:plankDimension', val); },
    },
    shapePoints: {
      get() { return this.plankPoints; },
      set(val) { this.$emit('update:plankPoints', val); },
    },
    showShapeVertice() {
      return this.enableShapeEdit && this.selectedObject3D && this.selectedObject3D.object3d.name.split('_')[0] === this.plankName;
    },
    domElement() {
      return this.vglNamespace.renderers[0].inst.domElement;
    },
    cameraInst() {
      return this.vglNamespace.cameras.camera1;
    },
  },
  updated() {
    this.setAsPlankVertice();
  },
  methods: {
    shapePointPosition(type, point) {
      const {
        plankPosition: { x: px, y: py, z: pz },
        plankDimension: { width, depth, height },
      } = this;
      if (this.plankType === 'FP') return `${px + point[1] * 10 - width / 2} ${py - height / 2 * type} ${pz + point[0] * 10 - depth / 2}`;
      if (this.plankType === 'VP') return `${px + point[0] * 10 - width / 2} ${py + point[1] * 10 - height / 2} ${pz - depth / 2 * type}`;
      if (this.plankType === 'VDP') return `${px + width / 2 * type} ${py + point[1] * 10 - height / 2} ${pz + point[0] * 10 - depth / 2}`;
      return null;
    },
    showCoordinateArrows(name) {
      if (!this.enableShapeEdit || !this.selectedObject3D || !this.selectedObject3D.object3d.name.includes('SHAPE')) return false;
      if (!this.selectedObject3D.object3d.name.includes(name)) return false;
      return true;
    },
    verticesInWorld() {
      return Object.values(window.panels)
        .filter(panel => panel.id !== this.plankName)
        .filter(c => c != null) // filter possible removed panels (window.panels might now be accurate)
        .flatMap(c => c.$refs.vertices.$refs.vertices) // flatMap and get a list of every vgl-mesh vertex components
        .map(c => (c ? c.inst : {})) // get only ThreeJS instance of those component
        .filter(inst => inst.visible); // get only visible vertices
    },
    otherVertices(exceptPanels = null) {
      const optherPanels = Object.values(window.panels).filter((panel) => {
        if (exceptPanels && exceptPanels.includes(panel.id)) return false;
        return true;
      });
      return optherPanels
        .filter(c => c != null) // filter possible removed panels (window.panels might now be accurate)
        .flatMap(c => c.$refs.vertices.vertices) // flatMap and get a list of every vgl-mesh vertex components
        .map(c => c); // get only ThreeJS instance of those component
    },
    sizeByDistanceToCamera(vertexPosition) {
      if (this.enableShapeEdit && this.selectedObject3D.object3d.name.split('_')[0] === this.plankName) {
        if (this.plankType === 'FP') return this.plankDimension.height / 3;
        if (this.plankType === 'VP') return this.plankDimension.depth / 3;
        if (this.plankType === 'VDP') return this.plankDimension.width / 3;
      }
      const [x, y, z] = vertexPosition.split(' ').map(v => parseInt(v, 10));
      const p = new Vector3(x, y, z);
      return p.distanceTo(this.cameraInst.position) / 120;
    },
    projectVectorTo2D(x, y, z) {
      const p = new Vector3(x, y, z);
      const vector = p.project(this.cameraInst);
      vector.x = (vector.x + 1) / 2 * this.domElement.width;
      vector.y = -(vector.y - 1) / 2 * this.domElement.height;

      return vector;
    },
    setAsPlankVertice() {
      const { vertices } = this.$refs;
      if (vertices == null) return;
      for (let i = 0; i < vertices.length; i += 1) {
        if (vertices[i].name.includes('SHAPE')) vertices[i].inst.isShapeVertex = true;
        else vertices[i].inst.isVertex = true;
      }
    },
    setVertexVisibility(name, bool, plankName = null) {
      if (plankName) this.resetVerticesVisibility();
      if ((plankName && plankName === this.plankName) || !plankName) Vue.set(this.showVertices, name, bool);
    },
    resetVerticesVisibility() {
      this.showVertices = {};
    },
    setAllVerticesVisible() {
      this.vertices.forEach((v) => {
        Vue.set(this.showVertices, v.side, true);
      });
    },
    setNearestVerticeVisible(hoveredObject3D, mouse = null) {
      this.resetVerticesVisibility();

      if (!hoveredObject3D && !mouse) return;

      let nearestRange = mouse ? this.nearRange : 1000;

      this.vertices.filter(vertice => !vertice.side.includes('SHAPE')).forEach((v) => {
        const [x, y, z] = v.position.split(' ').map(pos => parseInt(pos, 10));
        const distance = mouse
          ? mouse.distanceTo(this.projectVectorTo2D(x, y, z))
          : hoveredObject3D.point.distanceTo(new Vector3(x, y, z));

        if (distance < nearestRange) {
          this.resetVerticesVisibility();
          nearestRange = distance;
          Vue.set(this.showVertices, v.side, true);
        }
      });
    },
    resetAllVerticesVisibility() {
      EventBus.$emit('vertices-reset');
    },
    setVertexVisibilityFromFaceIndex(faceIndex, reset = true) {
      if (reset) this.resetVerticesVisibility();
      switch (faceIndex) {
        case 10:
        case 11:
        case 20:
        case 21:
        case 32:
        case 33:
          this.setVertexVisibility('UFL', true);
          break;
        case 0:
        case 1:
        case 22:
        case 23:
        case 34:
        case 35:
          this.setVertexVisibility('UFR', true);
          break;
        case 14:
        case 15:
        case 24:
        case 25:
        case 36:
        case 37:
          this.setVertexVisibility('LFL', true);
          break;
        case 4:
        case 5:
        case 26:
        case 27:
        case 38:
        case 39:
          this.setVertexVisibility('LFR', true);
          break;
        case 8:
        case 9:
        case 42:
        case 43:
        case 16:
        case 17:
          this.setVertexVisibility('UBL', true);
          break;
        case 2:
        case 3:
        case 18:
        case 19:
        case 40:
        case 41:
          this.setVertexVisibility('UBR', true);
          break;
        case 12:
        case 13:
        case 28:
        case 29:
        case 46:
        case 47:
          this.setVertexVisibility('LBL', true);
          break;
        default:
          this.setVertexVisibility('LBR', true);
      }
    },
    magnetismRules(moving, targetType) {
      // TODO add middle vertices rules
      const { side, type } = moving; // moving plank with active vertex name and type of the plank
      switch (type) {
        case 'VP':
          switch (targetType) {
            case 'FP':
              switch (side) {
                case 'LBL':
                  return ['UBL', 'LFL', 'MFL'];
                case 'UFL':
                  return ['UBL', 'LFL'];
                case 'UBR':
                  return ['LBR', 'UFR'];
                case 'LFR':
                  return ['LBR', 'UFR', 'MFR'];
                case 'UFR':
                  return ['UBR', 'LFR'];
                case 'LBR':
                  return ['UBR', 'LFR', 'MFR'];
                case 'UBL':
                  return ['UFL', 'LBL'];
                case 'LFL':
                  return ['UFL', 'LBL', 'MFL'];
                default:
                  return [];
              }
            case 'VDP':
              switch (side) {
                case 'LBL':
                case 'LFR':
                  return ['LBR', 'LFL'];
                case 'LBR':
                case 'LFL':
                  return ['LBL', 'LFR'];
                case 'UBL':
                case 'UFR':
                  return ['UBR', 'UFL'];
                case 'UBR':
                case 'UFL':
                  return ['UBL', 'UFR'];
                default:
                  return [];
              }
            default:
              // case VP with VP isn't supported
              return [];
          }
        case 'FP':
          switch (targetType) {
            case 'VDP':
              switch (side) {
                case 'UBR':
                case 'LBL':
                  return ['LBR', 'UBL'];
                case 'LFR':
                case 'UFL':
                  return ['UFR', 'LFL'];
                case 'LFL':
                case 'UFR':
                  return ['UFL', 'LFR'];
                case 'UBL':
                case 'LBR':
                  return ['LBL', 'UBR'];
                default:
                  // non existing side
                  return [];
              }
            case 'VP':
              switch (side) {
                case 'LFR':
                case 'UBR':
                  return ['UFR', 'LBR'];
                case 'UFL':
                case 'LBL':
                  return ['LFL', 'UBL'];
                case 'UBL':
                case 'LFL':
                  return ['UFL', 'LBL'];
                case 'LBR':
                case 'UFR':
                  return ['UBR', 'LFR'];
                default:
                  // non existing side
                  return [];
              }
            default:
              // case FP with FP isn't supported
              return [];
          }
        case 'VDP':
          switch (targetType) {
            case 'FP':
              switch (side) {
                case 'LBL':
                  return ['UBL', 'LBR', 'MFL', 'UBM'];
                case 'UBR':
                  return ['UBL', 'LBR'];
                case 'UFL':
                  return ['UFR', 'LFL'];
                case 'LFR':
                  return ['UFR', 'LFL', 'MFR', 'UFM'];
                case 'UFR':
                  return ['UFL', 'LFR'];
                case 'LFL':
                  return ['UFL', 'LFR', 'MFL', 'UFM'];
                case 'UBL':
                  return ['UBR', 'LBL'];
                case 'LBR':
                  return ['UBR', 'LBL', 'MFR', 'UBM'];
                default:
                  // non existing side
                  return [];
              }
            case 'VP':
              switch (side) {
                case 'LBL':
                case 'LFR':
                  return ['LBR', 'LFL'];
                case 'UBR':
                case 'UFL':
                  return ['UFR', 'UBL'];
                case 'UFR':
                case 'UBL':
                  return ['UFL', 'UBR'];
                case 'LFL':
                case 'LBR':
                  return ['LFR', 'LBL'];
                default:
                  // non existing side
                  return [];
              }
            default:
              // case VDP on VDP is not supported
              return [];
          }
        default:
          // non existing type
          return [];
      }
    },
    // eslint-disable-next-line no-unused-vars
    magnetizableVertices(side, type, direction) {
      // return all the context vertex that can be magnetize with side depending on type
      // side and type are reference to the moving part
      // if (direction) return this.magnetismRulesDirection({ side, type }, this.plankType, direction);
      return this.magnetismRules({ side, type }, this.plankType);
    },
    handlerVerticesNear(activeVertex, plankType, direction, mouse, exceptPanels = null) {
      if (exceptPanels && exceptPanels.includes(this.plankName)) return;

      const { side, name, position } = activeVertex;

      // forbid the active vertex to trigger it's own plank vertices
      const [plankName] = name.split('_');
      if (plankName === this.plankName) return;

      // get position of active vertex as Vector3 object
      const [ax, ay, az] = position.split(' ').map(v => parseInt(v, 10));
      const vertexVector = new Vector3(ax, ay, az);

      // get the name of magnetizable vertices
      const magnetizableVertices = this.magnetizableVertices(side, plankType, direction);

      // safety reset for vertices visibility
      this.resetVerticesVisibility();

      this.vertices.forEach(({ side: currentSide, position: currentPosition }) => {
        const [x, y, z] = currentPosition.split(' ').map(v => parseInt(v, 10));
        const current = new Vector3(x, y, z);
        const current2D = this.projectVectorTo2D(x, y, z);
        if (mouse.distanceTo(current2D) <= this.nearRange) {
          // check distance between current vertex and active vertex
          if (!magnetizableVertices.includes(currentSide)) return;
          if (direction && !this.checkValidVerticesByDirection(plankType, direction, current, vertexVector)) return;
          this.setVertexVisibility(currentSide, true);
        }
      });
    },
    checkValidVerticesByDirection(plankType, direction, current, position) {
      if (plankType === 'FP') {
        if (direction === 'right') {
          if (current.x >= position.x) return true;
        } else if (direction === 'left') {
          if (current.x <= position.x) return true;
        } else if (direction === 'upper') {
          if (current.y <= position.y) return true;
        } else if (direction === 'lower') {
          if (current.y <= position.y) return true;
        }
      } else if (plankType === 'VDP') {
        if (direction === 'right') {
          if (current.y >= position.y) return true;
        } else if (direction === 'left') {
          if (current.y <= position.y) return true;
        } else if (direction === 'upper') {
          if (current.z <= position.z) return true;
        } else if (direction === 'lower') {
          if (current.z <= position.z) return true;
        }
      }
      return false;
    },
    getNearestVerticeInWorld(mouse, exceptPanels = null) {
      // safety reset for vertices visibility
      this.resetVerticesVisibility();

      const nearestVertex = this.otherVertices(exceptPanels).reduce((acc, current) => {
        const [x, y, z] = current.position.split(' ').map(v => parseInt(v, 10));
        const currentVector = this.projectVectorTo2D(x, y, z);
        const currentDistance = mouse.distanceTo(currentVector);
        if (acc == null && currentDistance) {
          return currentDistance <= this.nearRange ? { vertex: { name: current.name, position: { x, y, z } }, distance: currentDistance } : null;
        }
        const { distance } = acc;
        return currentDistance < distance ? { vertex: { name: current.name, position: { x, y, z } }, distance: currentDistance } : acc;
      }, null);

      if (nearestVertex) {
        EventBus.$emit('vertices', nearestVertex.vertex.name.split('_')[2], true, nearestVertex.vertex.name.split('_')[0]);
        if (nearestVertex.distance <= this.magnetRange) return nearestVertex;
      }

      return null;
    },
    showNearestVertices(mouse, exceptPanels = null) {
      const [activeVertex] = this.activeVertices;
      if (!activeVertex) return;
      EventBus.$emit('vertices-near', activeVertex, this.plankType, null, mouse, exceptPanels);
    },
    magnetize(targetVertex, mouse, isGroup = false) {
      const { x: tx, y: ty, z: tz } = targetVertex.position;
      const targetVector = new Vector3(tx, ty, tz);
      const targetVector2D = this.projectVectorTo2D(targetVector.x, targetVector.y, targetVector.z);
      const [activeVertex] = this.activeVertices;

      if (!activeVertex) return false;

      const [ax, ay, az] = activeVertex.position.split(' ').map(v => parseFloat(v, 10));

      if (mouse.distanceTo(targetVector2D) <= this.magnetRange) {
        const offset = new Vector3(0, 0, 0);
        if (!this.moveDirection || this.moveDirection === 'x') offset.setX(tx - ax);
        if (!this.moveDirection || this.moveDirection === 'y') offset.setY(ty - ay);
        if (!this.moveDirection || this.moveDirection === 'z') offset.setZ(tz - az);
        if (isGroup) {
          const groupPosition = window.groups[this.selectedObject3D.object3d.name].position;
          window.groups[this.selectedObject3D.object3d.name].position = {
            x: groupPosition.x + offset.x,
            y: groupPosition.y + offset.y,
            z: groupPosition.z + offset.z,
          };
        } else this.position = this.position.add(offset);
        return true;
      }
      return false;
    },
    closestVisibleVertex(mouse) {
      // const [activeVertex] = this.activeVertices;
      // if (!activeVertex) return null;
      // const activeVector = activeVertex.position.split(' ').map(v => parseInt(v, 10));
      return this.verticesInWorld().reduce((acc, current) => {
        const currentVector = this.projectVectorTo2D(current.position.x, current.position.y, current.position.z);
        const currentDistance = mouse.distanceTo(currentVector);
        if (acc == null && currentDistance) {
          return currentDistance <= this.magnetRange ? { vertex: current, distance: currentDistance } : null;
        }
        const { distance } = acc;
        return currentDistance < distance ? { vertex: current, distance: currentDistance } : acc;
      }, null);
    },
    createPoint(point) {
      const points = this.vertices.filter(v => v.side.includes('SHAPE') && v.side.endsWith('M'))
        .map(vertice => vertice.position.split(' ').map(pos => parseFloat(pos))).map(p => new Vector3(p[0], p[1], p[2]));
      let minDistance = 100000;
      let minIndex = -1;
      points.forEach((p, index) => {
        const nextIndex = (index + 1) % points.length;
        const lineLength = p.distanceTo(points[nextIndex]);
        if (point.distanceTo(p) > lineLength || point.distanceTo(points[nextIndex]) > lineLength) return;

        const D = points[nextIndex].clone().sub(p).normalize();
        const d = point.clone().sub(p).dot(D);
        const X = p.clone().add(D.clone().multiplyScalar(d));
        const distance = point.distanceTo(X);

        if (distance < minDistance) {
          minIndex = nextIndex;
          minDistance = distance;
        }
      });

      if (minIndex > -1) {
        const {
          plankName,
          plankPosition: { y: py, z: pz },
          plankDimension: { depth, height },
        } = this;

        const shapePoints = Array.from(window.panels[plankName].shapePoints);
        const edges = Array.from(window.panels[plankName].edges.split('-'));
        shapePoints.splice(minIndex, 0, [parseInt((point.z + depth / 2 - pz) / 10, 10), parseInt((point.y + height / 2 - py) / 10, 10)]);
        edges.splice(minIndex, 0, '0');
        window.panels[plankName].shapePoints = shapePoints;
        window.panels[plankName].edges = edges.join('-');
        this.$store.commit('Camera/selectObject3D', { object3d: { ...window.panels[plankName], name: plankName, isPanel: true } });
      }
    },
  },
};
</script>
