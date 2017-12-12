import { Vector3 } from 'three';

export default class {
  constructor(args) {
    this.set(args);
  }

  set(args) {
    const {
      p1, p2, p2side = 1, type = null, data = null, center = new Vector3(), ilength = null, ...others
    } = args;
    if (!p1 || !p2 || Number.isNaN(Number(p1)) || Number.isNaN(Number(p2))) {
      throw new TypeError('invalid args, p1 and p2 required');
    }
    Object.assign(this, {
      p1: Number(p1),
      p2: Number(p2),
      p2side,
      center,
      ilength,
      ...(type && { type }),
      ...(data && { data }),
      ...others,
    });
    return this;
  }

  setAsUndefinedConnection() {
    this.type = 'undefined';
  }

  setAsFreeConnection() {
    this.type = 'free';
  }

  setAsAdjustableShelf() {
    this.type = 'holeline32';
  }

  setAsHDF() {
    this.type = 'hdfgrove';
  }

  setAsDoor() {
    this.type = 'hinged';
  }

  equals({ p1, p2 }) {
    return Number(p1) === this.p1 && Number(p2) === this.p2;
  }

  softEquals({ p1, p2 }) {
    // { p1, p2} === { p1: p2, p2: p1}
    return (Number(p1) === this.p1 && Number(p2) === this.p2)
      || (Number(p2) === this.p1 && Number(p1) === this.p2);
  }

  containsPanel(panelID) {
    return (Number(panelID) === this.p1 || Number(panelID) === this.p2);
  }

  get isUndefinedConnection() {
    return this.type === 'undefined';
  }

  get isFreeConnection() {
    return this.type === 'free';
  }

  get isHDFConnection() {
    return this.type === 'hdfgrove';
  }

  get isDefaultConnection() {
    return this.type == null;
  }

  get serialize() {
    if (this.type && this.type === 'undefined') return null;
    const { center, ...serialize } = this;
    return serialize;
  }

  clone() {
    return new this.constructor(this);
  }
}
