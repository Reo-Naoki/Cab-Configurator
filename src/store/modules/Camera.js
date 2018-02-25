import { Vector3, Spherical } from 'three';

const state = {
  far: 130000,
  fov: 60,
  near: 5,
  zoom: 1,
  target: new Vector3(0, 0, 0), // x, y, z
  position: new Spherical(33820, 1.098, 0), // radius, phi, theta
  enableOrbitControls: true,
  enableRotate: true,
  enablePan: true,
  selectedObject3D: null, // { object3d, faceIndex }
  hoveredObject3D: null, // { object3d, point }
};

const mutations = {
  zoom(s, radius) {
    s.radius += Math.min(s.far, Math.max(0, radius));
  },
  position(s, { radius, phi, theta }) {
    s.position.set(radius, phi, theta);
  },
  target(s, { x, y, z }) {
    s.target.set(x, y, z);
  },
  enableOrbitControls(s, isEnabled = true) {
    s.enableOrbitControls = isEnabled;
  },
  enableRotate(s, isEnabled = true) {
    s.enableRotate = isEnabled;
  },
  enablePan(s, isEnabled = true) {
    s.enablePan = isEnabled;
  },
  selectObject3D(s, data = null) {
    s.selectedObject3D = Object.freeze(data);
  },
  setHoverObject3D(s, data = null) {
    s.hoveredObject3D = Object.freeze(data);
  },
};

const actions = {
  targetTo(/* context, { x, y, z } */) {
    // TODO
  },
  rotateTo(/* context, { theta, phi } */) {
    // TODO
  },
};

export default {
  namespaced: true,
  actions,
  mutations,
  state,
};
