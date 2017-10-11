/* eslint-disable camelcase,no-undef,no-console */
import Vue from 'vue';
import ColorModuleStore from './Colors';

const state = {
  materials: [],
  invalidMaterials: [],
  modifiedMaterials: [],
  missingColors: [],
  materialsReady: false,
};

const getters = {
  // get material based on the ID
  IDToMaterial: s => id => s.materials.find(material => material.id === id),
  // convert a materialID to a Color
  materialIDToColor: (s, g) => (id) => {
    const material = g.IDToMaterial(parseInt(id, 10));
    if (material) return g.materialToColor(material);
    return undefined;
  },
  materialToColor: (s, g) => (material) => {
    if (material.finish != null) {
      return g['colors/getColorByCodeAndFinish']({ color_code: material.ref, finish: material.finish });
    }
    return g['colors/getColorByCode'](material.ref);
  },
  // get materials that are colors (id > 0)
  getColorsMaterials: s => s.materials.filter(material => material.id > 0),
  // same as getColorsMaterials but with just the ID
  getColorsMaterialsID: (s, g) => g.getColorsMaterials.map(material => material.id),
  // tells if a Color is in materials (true/false)
  isColorInMaterials: s => color => s.materials.some(material => material.ref === (color.color_code || '')),
  // convert a Color to a material
  colorToMaterial: s => color => s.materials.find((material) => {
    if (material.finish != null) {
      return color.color_code === material.ref && color.finish === material.finish;
    }
    return color.color_code === material.ref;
  }),
  // get the biggest ID in materials (min: 0)
  getMaxMaterialsID: s => Math.max(...s.materials.map(material => material.id), 0),
  // get all materials (just the ID) that are back panel color
  getBackPanelMaterials: (s, g) => {
    const BPMaterial = g.IDToMaterial(0); // Back material is in array at position 0
    if (BPMaterial) return [BPMaterial];
    return [];
  },
  // get all materials (just the ID) that are step color
  getStepMaterials: (s, g) => {
    const SMaterial = g.IDToMaterial(-1); // Step material is in array at position -1
    if (SMaterial) return [SMaterial];
    return [];
  },
  isMaterialsValid(s) {
    return s.invalidMaterials.length === 0;
  },
  isMaterialsReady(s, g) {
    return g.isMaterialsValid && s.materialsReady && g['colors/isColorsInitialized'];
  },
  hasModifiedMaterials(s) {
    return s.modifiedMaterials.length !== 0;
  },
  filteredMissingColors(s) {
    // exclude White16 from missing Colors
    return s.missingColors.filter(missingColor => missingColor.id >= 0 || missingColor.id === -1);
  },
  serializeMaterials(s) {
    const serializeMaterials = JSON.parse(JSON.stringify(s.materials));
    serializeMaterials.forEach((m, index) => {
      // delete extra materials info
      delete serializeMaterials[index].proposed;
      delete serializeMaterials[index].modified;
      delete serializeMaterials[index].error;
    });
    return serializeMaterials;
  },
};

const mutations = {
  setMaterials(s, materials) {
    // basic materials setter, can be dangerous
    Vue.set(s, 'materials', materials);
  },
  // a material must be set with a color
  addNewMaterial(s, material) {
    const tmp = { ...material };
    tmp.id = parseInt(tmp.id, 10);
    tmp.manufacturer = parseInt(tmp.manufacturer, 10);
    Vue.set(s.materials, s.materials.length, tmp);
  },
  removeMaterial(s, oldMaterialID) {
    // find index of a material to remove and remove it from materials
    const index = s.materials.findIndex(material => material.id === oldMaterialID);
    if (index >= 0) Vue.delete(s.materials, index);
  },
  updateMaterial(s, { oldMaterialID, newMaterialID }) {
    // oldMaterialID is just override by newMaterialID data however it keeps the same old ID
    const indexOldMaterial = s.materials.findIndex(material => material.id === oldMaterialID);
    const indexNewMaterial = s.materials.findIndex(material => material.id === newMaterialID);

    // deep copy of newMaterial to avoid pointer problems
    const tmp = JSON.parse(JSON.stringify((s.materials[indexNewMaterial])));
    tmp.id = oldMaterialID;
    Vue.set(s.materials, indexOldMaterial, tmp);
  },
  updateMaterialFromColor(s, { materialID, color }) {
    const indexOldMaterial = s.materials.findIndex(material => material.id === materialID);
    const tmp = { id: materialID };
    tmp.ref = color.color_code;
    if (color.finish) tmp.finish = color.finish;
    tmp.manufacturer = color.manufacturer;
    Vue.set(s.materials, indexOldMaterial, tmp);
  },
  emptyMaterials(s) { s.materials.splice(0, s.materials.length); },
  updateMaterialID(s, { id, newID }) {
    const materialIndex = s.materials.findIndex(m => m.id === id);
    if (materialIndex !== -1) {
      const updatedMaterial = JSON.parse(JSON.stringify(s.materials[materialIndex]));
      updatedMaterial.id = newID;
      Vue.set(s.materials, materialIndex, updatedMaterial);
    }
  },
  addInvalidMaterial(s, material) {
    Vue.set(s.invalidMaterials, s.invalidMaterials.length, JSON.parse(JSON.stringify(material)));
  },
  resetInvalidMaterial(s) {
    s.invalidMaterials.splice(0, s.invalidMaterials.length);
  },
  addMissingColor(s, { id, ref, finish = null }) {
    Vue.set(s.missingColors, s.missingColors.length, {
      id: parseInt(id, 10),
      reference: ref,
      finish,
    });
  },
  resetMissingColor(s) {
    s.missingColors.splice(0, s.missingColors.length);
  },
  setMaterialsStatus(s, status = false) {
    s.materialsReady = status;
  },
  addModifiedMaterial(s, material) {
    Vue.set(s.modifiedMaterials, s.modifiedMaterials.length, JSON.parse(JSON.stringify(material)));
  },
  resetModifiedMaterials(s) {
    s.modifiedMaterials.splice(0, s.modifiedMaterials.length);
  },
};

const actions = {
  // met à jour un Material à partir d'un autre (peut déclancher des subscribeAction)
  // si newMaterialID est null, il s'agit d'une suppression
  // UPDATE : on peut vouloir update un material à partir d'une couleur, rajout de l'argument color
  // qui agit comme newMaterialID
  updateMaterial(context, { oldMaterialID, newMaterialID, color }) {
    if (newMaterialID == null && color == null) {
      // delete oldMaterialID
      context.commit('removeMaterial', oldMaterialID);
    } else if (newMaterialID != null) {
      // update based on existing material
      // console.log('update material', context.state.materials);
      context.commit('updateMaterial', { oldMaterialID, newMaterialID });
    } else {
      // update based on color : color
      // console.log('update material from color', context.state.materials);
      context.commit('updateMaterialFromColor', { materialID: oldMaterialID, color });
    }
  },
  // Vérifie l'intégrité des Material reçu
  checkMaterials({ commit, getters: g }, materials) {
    materials.forEach((material) => {
      if (material.error) commit('addInvalidMaterial', material); // PHP returned an error (usually convert failed)
      else {
        if (material.proposed != null && material.proposed === 0) {
          commit('addMissingColor', material); // this color is not proposed and need to be ask specifically
        }
        if (material.modified) {
          commit('addModifiedMaterial', material); // this color has been modified, notify user !
        }
        if (g['colors/isColorsInitialized']) {
          // check for missing materials with already downloaded colors
          const color = material.finish != null ? g['colors/getColorByCodeAndFinish'](material) : g['colors/getColorByCode'](material);
          if (color == null) {
            // material is not in downloaded colors
            commit('addMissingColor', material);
          }
        }
      }
    });
  },
  // Applique une liste de Material au store
  setMaterials(context, materials = []) {
    return new Promise(async (resolve, reject) => {
      context.commit('setMaterialsStatus', false);
      context.commit('emptyMaterials'); // reset materials
      context.commit('resetInvalidMaterial');
      context.commit('resetMissingColor');
      context.commit('resetModifiedMaterials');

      // check new materials
      await context.dispatch('checkMaterials', materials);

      if (context.getters.isMaterialsValid) {
        materials.forEach(material => context.commit('addNewMaterial', material));
        console.info('[Materials] materials ready');
        try {
          await context.dispatch('colors/initColorsStore', context.getters.filteredMissingColors);
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        const invalidMaterialStr = context.state.invalidMaterials.reduce(
          (acc, current) => `${acc}(${current.id}:${current.ref}/${current.finish}/${current.manufacturer}) `, '',
        );
        const errorMsg = `[Materials] invalid materials: ${invalidMaterialStr}`;
        const error = new Error(errorMsg);
        console.error(error, context.state.invalidMaterials);
        // eslint-disable-next-line no-undef
        send_bug(errorMsg);
        reject(error);
      }
    });
  },
};

export default {
  namespaced: true,
  modules: { colors: ColorModuleStore },
  actions,
  mutations,
  getters,
  state,
};
