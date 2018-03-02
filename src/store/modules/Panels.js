import Vue from 'vue';
import { Message, Notification, MessageBox } from 'element-ui';
import { Box3, Vector3 } from 'three';
import callDajax from '../../api/dajax';
import EventBus from '../../components/EventBus/EventBus';
import { sendMessage } from '../../api/postMessage';
import PlanksDimensions from '../../components/Widgets/Panel/Models/PlanksDimensions';
import Connection from '../../components/Widgets/Connections/Models/Connection';

const state = {
  panels: [],
  groups: [],
  connections: [],
  panelsHistory: [],
  layers: [],
  enableMoving: false,
  enableResizing: false,
  moveDirection: null,
  price: '---',
  prevPosition: null,
  prevDimension: null,
};

const getters = {
  connections: s => s.connections.reduce((acc, current) => {
    // transform connections Array into an HashMap like this:
    // { 1: [conn1, conn2], 2: [], 3: [] }
    // or more explicitly { p1: [{connection with pp2}, {connection with p4}, etc] }
    // { each connection contains p2, p2side, center
    const { p1, ...other } = current;
    return { ...acc, [current.p1]: [...(acc[current.p1] || []), other] };
  }, {}),
  serializeConnections: s => s.connections.reduce((acc, current) => {
    const serialized = current.serialize; // return a serialized connection or undefined if useless for serialize
    if (serialized) return [...acc, serialized];
    return acc;
  }, []),
  maxID: s => s.panels.reduce((acc, current) => (acc > Number(current.id) ? acc : Number(current.id)), 0),
  isMaterialInPanel: s => id => s.panels.some(p => p.material === String(id)),
  serialize: (s, g, rootState) => {
    const { panels } = s;
    const { groups } = s;

    const newPanels = panels.map((p) => {
      const panel = p;
      const { resizable } = panel;
      // delete panel.groupName;
      // delete panel.groupType;
      // delete panel.resizable;
      // if (panel.layer === 'Structure') delete panel.layer;
      return {
        ...panel,
        x: panel.x,
        y: panel.y,
        thick: panel.thick,
        ptype: resizable ? panel.ptype : `Hard-${panel.ptype}`,
        name: panel.name,
        pos: panel.pos,
        material: panel.material,
        id: panel.id,
      };
    });
    groups.forEach(group => newPanels.push(group));

    const { materials } = rootState.materials;
    return {
      rlist: newPanels,
      connlist: g.serializeConnections,
      materials,
      modele: 'VglDesigner',
      version: process.env.PACKAGE_VERSION,
    };
  },
};

const mutations = {
  setPanels(s, panels) {
    s.panels = [];
    s.groups = [];
    panels.forEach((p) => {
      if (p.ptype !== 'group_stddrawer') {
        const resizable = !p.ptype.includes('Hard');
        s.panels.push({
          ...p,
          ptype: resizable ? p.ptype : p.ptype.split('-')[1],
          id: p.id.split('-')[0],
          material: p.material.toString(),
          layer: p.layer ? p.layer : 'Structure',
          resizable,
        });
      }
    });
    panels.forEach((p) => {
      if (p.ptype === 'group_stddrawer') {
        s.groups.push({ ...p, resizable: true });
      }
    });
    panels.forEach((p) => {
      if (p.ptype === 'group_stddrawer') {
        let groupChildCount = 0;
        let panelChildCount = 0;

        p.rlist.forEach((list) => {
          if (list.ptype === 'group_stddrawer') {
            const groupIndex = s.groups.findIndex(group => group.name === list.name);
            s.groups[groupIndex].groupName = p.name;
            s.groups[groupIndex].groupType = p.ptype;
            groupChildCount += 1;
          } else {
            const panelIndex = s.panels.findIndex(panel => panel.id === list.id.split('-')[0]);
            s.panels[panelIndex].groupName = p.name;
            s.panels[panelIndex].groupType = p.ptype;
            panelChildCount += 1;
          }
        });

        if ((groupChildCount > 0) && (groupChildCount + panelChildCount > 1)) {
          const groupIndex = s.groups.findIndex(group => group.name === p.name);
          s.groups[groupIndex].resizable = false;
        }
      }
    });
  },
  addPanel(s, p) {
    Vue.set(s.panels, s.panels.length, {
      ...p,
      id: p.id.split('-')[0],
      material: p.material.toString(),
      layer: 'Structure',
      resizable: true,
    });
  },
  setLayers(s, data) {
    s.layers = data;
  },
  setPrevPosition(s, prevPosition) {
    s.prevPosition = prevPosition;
  },
  setPrevDimension(s, prevDimension) {
    s.prevDimension = prevDimension;
  },
  setPanelData(s, { index, key, data }) {
    if (index >= s.panels.length || index < 0) return;

    let newData = data;
    // check data integrity
    if (key === 'x' || key === 'y') {
      const x = key === 'x' ? data : s.panels[index].x;
      const y = key === 'y' ? data : s.panels[index].y;
      const dimensions = new PlanksDimensions({ x, y, thick: null });
      if (!dimensions.isValid) {
        dimensions.makeValid(key);
        newData = dimensions[key];
      }
    } else if (key === 'ptype') {
      this.dispatch('Panels/deletePanelConnections', { id: s.panels[index].id });
    }

    s.panels[index][key] = newData;
    // Vue.set(s.panels[index], key, newData);
  },
  deletePanel(s, { id, save = false }) {
    const index = s.panels.findIndex(p => String(p.id) === String(id));
    if (index >= 0) {
      Vue.delete(s.panels, index);
      if (save) EventBus.$emit('save');
    }
  },
  deleteGroup(s, { name, save = false }) {
    const index = s.groups.findIndex(group => group.name === name);
    if (index >= 0) {
      Vue.delete(s.groups, index);
      if (save) EventBus.$emit('save');
    }
  },
  enableMoving(s, isEnable = true) {
    s.enableMoving = isEnable;
    s.moveDirection = null;
  },
  enableResizing(s, isEnable = true) {
    s.enableResizing = isEnable;
  },
  setMoveDirection(s, direction = null) {
    s.moveDirection = direction;
  },
  setConnections(s, data) {
    s.connections = null;
    if (data.connlist && data.createNew) {
      s.connections = data.connlist.map((c) => new Connection(c));
    } else {
      s.connections = data.connlist;
    }

    for (let i = 0; i < s.connections.length; i += 1) {
      if (s.connections[i].type === 'hinged') {
        const c = s.connections[i];
        const p1HasRealConnection = s.connections.some(conn => c.p1Neighbour(conn) && conn.isRealConnection);
        const p2HasRealConnection = s.connections.some(conn => c.p2Neighbour(conn) && conn.isRealConnection);

        if (p1HasRealConnection && !p2HasRealConnection) {
          for (let conni = 0; conni < s.connections.length; conni += 1) {
            const conn = s.connections[conni];
            if (c.p2Neighbour(conn) && conn.type !== 'hdfgrove') {
              s.connections[conni] = new Connection({ ...s.connections[conni], type: 'free' });
            }
          }
          s.connections[i] = new Connection({ ...c, p1: c.p2, p2: c.p1 });
        } else if (!p1HasRealConnection && p2HasRealConnection) {
          for (let conni = 0; conni < s.connections.length; conni += 1) {
            const conn = s.connections[conni];
            if (c.p1Neighbour(conn) && conn.type !== 'hdfgrove') {
              s.connections[conni] = new Connection({ ...s.connections[conni], type: 'free' });
            }
          }
        } else s.connections[i] = new Connection({ ...s.connections[i], type: 'undefined' });
      } else if (s.panels.find(panel => panel.id === s.connections[i].p1.toString()).thick === 4
              || s.panels.find(panel => panel.id === s.connections[i].p2.toString()).thick === 4) {
        s.connections[i] = new Connection({ ...s.connections[i], type: 'hdfgrove' });
      }
    }
  },
  addConnection(s, connection) {
    Vue.set(s.connections, s.connections.length, new Connection(connection));
  },
  updateConnection(s, { index = -1, value }) {
    if (index >= 0) Vue.set(s.connections, index, new Connection(value));

    for (let i = 0; i < s.connections.length; i += 1) {
      const connIndex = (index + i) % s.connections.length;
      if (s.connections[connIndex].type === 'hinged') {
        const c = s.connections[connIndex];
        const p1HasRealConnection = s.connections.some(conn => c.p1Neighbour(conn) && conn.isRealConnection && !conn.isHingedConnection);
        const p2HasRealConnection = s.connections.some(conn => c.p2Neighbour(conn) && conn.isRealConnection && !conn.isHingedConnection);

        if (p1HasRealConnection && !p2HasRealConnection) {
          for (let conni = 0; conni < s.connections.length; conni += 1) {
            const conn = s.connections[conni];
            if (c.p2Neighbour(conn) && conn.type !== 'hdfgrove') {
              s.connections[conni] = new Connection({ ...s.connections[conni], type: 'free' });
            }
          }
          s.connections[connIndex] = new Connection({ ...c, p1: c.p2, p2: c.p1 });
        } else if (!p1HasRealConnection && p2HasRealConnection) {
          for (let conni = 0; conni < s.connections.length; conni += 1) {
            const conn = s.connections[conni];
            if (c.p1Neighbour(conn) && conn.type !== 'hdfgrove') {
              s.connections[conni] = new Connection({ ...s.connections[conni], type: 'free' });
            }
          }
        } else s.connections[connIndex] = new Connection({ ...s.connections[connIndex], type: 'undefined' });
      }
    }
  },
  deleteConnection(s, { p1, p2 }) {
    const index = s.connections.findIndex(e => String(e.p1) === String(p1) && String(e.p2) === String(p2));
    if (index < 0) return;
    Vue.delete(s.connections, index);
  },
  setPrice(s, price = '---') {
    s.price = String(price);
  },
};

const actions = {
  deserialize(context, data) {
    // use on initial loading, and undo/redo
    return new Promise(async (resolve, reject) => {
      const {
        rlist = [], connlist = [], materials = [], options = {},
      } = data;
      const { initMaterials = false } = options;
      if (initMaterials) {
        // setMaterials will request for colors, we should only use it during initial loading
        // or explicit occasion
        try {
          await context.dispatch('materials/setMaterials', materials, { root: true });
        } catch (e) {
          reject(e);
          return;
        }
      } else {
        // set materials only (no colors handling)
        context.commit('materials/setMaterials', materials, { root: true });
      }
      context.commit('setPanels', rlist);
      context.commit('setConnections', { connlist, createNew: true });
      resolve();
    });
  },
  importRlist(context, data) {
    // console.log = () => { };
    // console.warn = () => { };
    // console.error = () => { };
    return new Promise(async (resolve) => {
      // use on importing new cabinet
      const serializedData = context.getters.serialize;
      const panelIDs = serializedData.rlist.filter(list => list.ptype !== 'group_stddrawer').map(list => Number(list.id));
      const panelPosXs = serializedData.rlist.filter(list => list.ptype !== 'group_stddrawer').map(list => list.pos[0]);
      const materialIDs = serializedData.materials.map(material => Number(material.id));
      const newStartPID = Math.max(...panelIDs) + 1;
      const newStartPosX = Math.max(...panelPosXs);
      const newStartMID = Math.max(...materialIDs) + 1;
      const newRlist = serializedData.rlist;
      const newConnlist = serializedData.connlist;
      const newMaterials = serializedData.materials;
      const newNameTable = {};

      let newGroupIDs = [];
      let newGroup = {};
      let newGroupStartNID = -1;
      let newGroupName = 'Cabinet';
      let groupedPanels = [];
      let isValid = false;

      // Create group name table
      newRlist.forEach((list) => {
        if (list.ptype === 'group_stddrawer') {
          const { name } = list;
          newNameTable[name] = name;
          list.rlist.filter(p => p.id).forEach(p => groupedPanels.push(p));
        }
      });

      // Create name for new group of an existing cabinet
      newGroupIDs = Object.values(newNameTable).map((value) => {
        const id = Number(value.split('Cabinet')[1]);
        if (id) return id;
        return 0;
      });
      newGroupStartNID = newGroupIDs.length > 0 ? Math.max(...newGroupIDs) + 1 : -1;
      newGroupName = newGroupStartNID > 0 ? (String('Cabinet') + newGroupStartNID) : 'Cabinet';
      newNameTable[newGroupName] = newGroupName;

      // Process creating new group data for an existing cabinet
      newGroup = {};
      newGroup.name = newGroupName;
      newGroup.ptype = 'group_stddrawer';
      newGroup.rlist = [];
      isValid = false;
      newRlist.forEach((list) => {
        if (list.ptype === 'group_stddrawer') {
          newGroup.rlist.push({ name: list.name, ptype: list.ptype });
        } else if (!groupedPanels.find(panel => panel.id.split('-')[0] === list.id.split('-')[0])) {
          newGroup.rlist.push(list);
          isValid = true;
        }
      });
      if (isValid) newRlist.push(newGroup);


      // Get panels info from imported data
      const {
        rlist = [], connlist = [], materials = [], options = {},
      } = data;

      // Get groupedPanels of an imported cabinet
      groupedPanels = [];
      rlist.forEach((list) => {
        if (list.ptype === 'group_stddrawer') {
          list.rlist.filter(p => p.id).forEach(p => groupedPanels.push(p));
        }
      });

      // Create name for new group of an imported cabinet
      newGroupIDs = Object.values(newNameTable).map((value) => {
        const id = Number(value.split('Cabinet')[1]);
        if (id) return id;
        return 0;
      });
      newGroupStartNID = newGroupIDs.length > 0 ? Math.max(...newGroupIDs) + 1 : -1;
      newGroupName = newGroupStartNID > 0 ? (String('Cabinet') + newGroupStartNID) : 'Cabinet';
      newNameTable[newGroupName] = newGroupName;

      // Process creating new group data for an imported cabinet
      newGroup = {};
      newGroup.name = newGroupName;
      newGroup.ptype = 'group_stddrawer';
      newGroup.rlist = [];
      isValid = false;
      rlist.forEach((list) => {
        if (list.ptype === 'group_stddrawer') {
          newGroup.rlist.push({ name: list.name, ptype: list.ptype });
        } else if (!groupedPanels.find(panel => panel.id.split('-')[0] === list.id.split('-')[0])) {
          newGroup.rlist.push(list);
          isValid = true;
        }
      });
      if (isValid) rlist.push(newGroup);

      // Process Panels of imported cabinet
      rlist.forEach((p) => {
        if (p.ptype !== 'group_stddrawer') {
          newRlist.push({
            ...p,
            id: (Number(p.id.split('-')[0]) + newStartPID).toString(),
            material: Number(p.material) > 0 ? (Number(p.material) + newStartMID).toString() : p.material,
            pos: [p.pos[0] + newStartPosX + 500, p.pos[1], p.pos[2]],
          });
        }
      });
      // Process Renaming groups of imported cabinet
      rlist.forEach((p) => {
        if (p.ptype === 'group_stddrawer') {
          const { name } = p;
          const nameIDs = Object.values(newNameTable).map((value) => {
            const id = Number(value.split(name)[1]);
            if (id) return id;
            return 0;
          });
          const newStartNID = nameIDs.length > 0 ? Math.max(...nameIDs) + 1 : -1;
          newNameTable[name] = newStartNID > 0 ? (name + newStartNID) : name;
        }
      });
      // Process Groups of imported cabinet
      rlist.forEach((p) => {
        if (p.ptype === 'group_stddrawer') {
          newRlist.push({
            ...p,
            name: newNameTable[p.name],
            rlist: p.rlist.map((groupP) => {
              if (groupP.ptype === 'group_stddrawer') {
                return {
                  ...groupP,
                  name: newNameTable[groupP.name],
                };
              }
              return newRlist.find(list => list.id === (Number(groupP.id.split('-')[0]) + newStartPID).toString());
            }),
          });
        }
      });

      // Process connections of imported cabinet
      connlist.forEach((conn) => {
        newConnlist.push({
          ...conn,
          p1: conn.p1 + newStartPID,
          p2: conn.p2 + newStartPID,
        });
      });

      // Process materials of imported cabinet
      materials.forEach((material) => {
        newMaterials.push({
          ...material,
          id: material.id > 0 ? material.id + newStartMID : material.id,
        });
      });

      await context.dispatch('deserialize', {
        rlist: newRlist,
        connlist: newConnlist,
        materials: newMaterials,
        options,
      }).then(() => EventBus.$emit('save'));
      resolve();
    });
  },
  refreshPaletteIndexes(context) {
    return new Promise(async (resolve) => {
      let index = 1;
      // get a list of materialsID from 1 ... n sorted
      const tab = context.rootGetters['materials/getColorsMaterialsID'].sort();
      const promises = [];
      // flat the materialsID in project
      for (let i = 0; i < tab.length; i += 1) {
        const materialID = tab[i];
        if (materialID !== index) {
          promises.push(context.dispatch('replaceMaterialInPanels', { oldMaterial: materialID, newMaterial: index }));
          this.$store.commit('materials/updateMaterialID', { id: materialID, newID: index });
        }
        index += 1;
      }
      await Promise.all(promises); // wait for all promise in for loop to finish
      resolve();
    });
  },
  replaceMaterialInPanels(context, { oldMaterial, newMaterial }) {
    context.state.panels.forEach((p, index) => {
      if (p.material === String(oldMaterial)) {
        context.commit('setPanelData', {
          index,
          key: 'material',
          data: String(newMaterial),
        });
      }
    });
  },
  deletePanelConnections(context, { id, exceptPanelIDs = null }) {
    // delete every connections related to the ID panel
    const { state: s, commit } = context;
    const idStr = id.toString();
    let panelConnections;
    if (exceptPanelIDs) {
      panelConnections = s.connections.filter(e => (e.p1.toString() === idStr && !exceptPanelIDs.includes(e.p2.toString())) || (e.p2.toString() === idStr && !exceptPanelIDs.includes(e.p1.toString())));
    } else {
      panelConnections = s.connections.filter(e => e.p1.toString() === idStr || e.p2.toString() === idStr);
    }

    panelConnections.forEach(c => commit('deleteConnection', c));
  },
  deletePanel(context, id) {
    // deleting panels means also removing related connections
    return new Promise(async (resolve, reject) => {
      try {
        await context.dispatch('deletePanelConnections', { id });
        context.commit('deletePanel', id);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  deleteGroup(context, name) {
    // deleting panels means also removing related connections
    return new Promise(async (resolve, reject) => {
      try {
        context.commit('deleteGroup', name);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  updateConnection(context, updatedConnection) {
    const index = context.state.connections.findIndex(c => c.softEquals(updatedConnection));
    context.commit('updateConnection', { index, value: updatedConnection });
  },
  addPanel(context) {
    const panelPosition = new Vector3();
    if (window.root) {
      // root is the global group ThreeJS object
      const worldBB = new Vector3();
      ((new Box3()).setFromObject(window.root.inst)).getSize(worldBB);
      panelPosition.setZ(worldBB.z / 10); // don't forget to downscale to mm
    }
    context.commit('addPanel', {
      x: 350,
      y: 450,
      thick: 18,
      ptype: 'FP',
      name: '',
      pos: [panelPosition.z, 0, 0],
      material: '1',
      id: String(context.getters.maxID + 1),
      edges: '0-0-0-0',
    });
  },
  save(context, data) {
    // save project
    return new Promise(async (resolve, reject) => {
      const { name, saveAsNew = false } = data;
      try {
        await context.dispatch('requestGeneralData');
        const serializedData = context.getters.serialize;
        const payload = {
          design: serializedData,
          modele: 'VglDesigner',
          name: name || `VglDesigner ${(new Date()).toLocaleString()}`,
          img: window.renderer.domElement.toDataURL('image/png'),
          price: context.state.price,
          id: saveAsNew ? 0 : context.rootState.User.currentProjectID || 0,
        };
        callDajax('saveproject', payload)
          .then((response) => {
            context.dispatch('Panels/projectSaved', response);
            resolve();
          }).catch(error => {
            console.error('Dajax error ', error);
            reject(error);
          });
      } catch (e) {
        reject(e);
      }
    });
  },
  projectSaved(context, response) {
    // handler saved project
    if (response.name && response.success) {
      Notification({
        type: 'success',
        message: `Projet "${response.name}" enregistré sur le serveur.`,
      });
      // if (typeof resetUndo === 'function') resetUndo(); TODO
      if (context.rootState.User.currentProjectID !== Number(response.id)) {
        context.commit('User/setCurrentProjectID', Number(response.id), { root: true });
      }
      EventBus.$emit('updateProjectsList');
      EventBus.$emit('hideProjectsList');
      EventBus.$emit('saveAndReset');
    }
    if (!response.success) {
      if (response.locked) {
        MessageBox.alert('Le projet enregistré ne peut être modifié car il a déjà été ajouté au panier. Enregistrez sous un nouveau nom.', {
          type: 'error',
          title: 'Erreur',
          confirmButtonText: 'Ok',
        });
      } else {
        MessageBox.alert("Erreur lors de l'enregistrement du projet. Réessayez et contactez nous si le problème persiste.", {
          type: 'error',
          title: 'Erreur',
          confirmButtonText: 'Ok',
        });
      }
    }
  },
  addToCart(context) {
    const { state: s } = context;
    const panelsConnections = s.connections;
    if (!context.rootState.User.isLogged) {
      sendMessage('login');
      return;
    }
    if (panelsConnections.length >= 1 && panelsConnections.filter(connection => connection.type === 'undefined').length >= 1) {
      MessageBox.alert('Le projet comporte des problèmes de connections entre une ou plusieurs planches. Veuillez régler les soucis avant de mettre au panier.', {
        type: 'error',
        title: 'Erreur',
        confirmButtonText: 'Ok',
      });
      return;
    }
    const payload = {
      design: context.getters.serialize,
      modele: 'VglDesigner',
      name: context.rootGetters['User/currentProject'] ? context.rootGetters['User/currentProject'].name : '',
      newname: `VglDesigner ${(new Date()).toLocaleString()}`,
      img: window.renderer.domElement.toDataURL('image/png'),
      id: context.rootState.User.currentProjectID || 0,
    };
    callDajax('saveandcart', payload)
      .then((response) => { context.dispatch('Panels/addedToCart', response); });
  },
  addedToCart(context, data) {
    if (data.success) {
      sendMessage('redirect', '/quick-order');
    } else {
      Message.error('Erreur, contactez le service client');
    }
  },
  requestGeneralData(context) {
    // ask for price
    return new Promise(async (resolve, reject) => {
      context.commit('setPrice');
      callDajax('sendrlist', context.getters.serialize)
        .then((response) => {
          console.log('sendrlist returned result');
          if (response.heroresult) {
            const result = JSON.parse(response.heroresult);
            context.commit('setPrice', result.price);
          }
          resolve();
        })
        .catch(error => {
          console.error('Dajax error when trying to get price', error);
          reject(error);
        });
    });
  },
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};
