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

  setAsRafixConnection() {
    this.type = 'rafix';
  }

  setAsFreeConnection() {
    this.type = 'free';
  }

  setAsAdjustableShelf() {
    this.type = 'holeline32';
  }

  setAsHDFConnection() {
    this.type = 'hdfgrove';
  }

  setAsDoorConnection() {
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

  isP1Neighbour({ p1, p2 }) {
    return (Number(p1) === this.p1 && Number(p2) !== this.p2) || (Number(p2) === this.p1 && Number(p1) !== this.p2);
  }

  isP2Neighbour({ p1, p2 }) {
    return (Number(p1) === this.p2 && Number(p2) !== this.p1) || (Number(p2) === this.p2 && Number(p1) !== this.p1);
  }

  get isRealConnection() {
    return this.type !== 'undefined' && this.type !== 'free';
  }

  get isUndefinedConnection() {
    return this.type === 'undefined';
  }

  get isRafixConnection() {
    return this.type === 'rafix';
  }

  get isFreeConnection() {
    return this.type === 'free';
  }

  get isHDFConnection() {
    return this.type === 'hdfgrove';
  }

  get isHingedConnection() {
    return this.type === 'hinged';
  }

  get isDefaultConnection() {
    return this.type == null;
  }

  get serialize() {
    const { ...serialize } = this;
    delete serialize.isHidden;
    delete serialize.center;
    delete serialize.ilength;
    return serialize;
  }

  clone() {
    return new this.constructor(this);
  }
}
