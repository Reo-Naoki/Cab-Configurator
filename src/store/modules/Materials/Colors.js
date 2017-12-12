/* eslint-disable camelcase,no-console  */
import Vue from 'vue';
import fabAPI from '@/api/fab';

class Color {
  constructor(args = {}) {
    Object.assign(this, args);
  }

  get fullname() {
    if (this.finish) { return `${this.color_code}-${this.finish}`; }
    return `${this.color_code}`;
  }

  get linkURL() {
    return `/couleurs/echantillons/${this.color_code}${this.finish != null && this.finish.length !== 0 ? `/${this.finish}` : ''}`;
  }

  get manufacturerName() {
    switch (this.manufacturer) {
      case 1: return 'Kronospan';
      case 2: return 'Pfleiderer';
      case 3: return 'HDF';
      case 4: return 'Thermopal';
      case 5: return 'HPL';
      case 6: return 'Egger';
      default: return 'n/c';
    }
  }
}

function compareColor(a, b) {
  if (!a.reference_name) return -1;
  return a.reference_name.localeCompare(b.reference_name);
}

const state = {
  colors: [],
  colors_hdf: [],
  colors_hpl: [],
  colorsDownloaded: false,
};

const getters = {
  defaultBackPanelColorCode: () => 'D2201',
  // concat all colors in a single array
  getAllColors: s => [...s.colors, ...s.colors_hdf, ...s.colors_hpl],
  // get Color based in ID
  getColorByID: (s, g) => id => g.getAllColors.find(color => color.id === id),
  // get Color based on color_code and finish
  // eslint-disable-next-line max-len
  getColorByCodeAndFinish: (s, g) => ({ color_code, finish }) => g.getAllColors.find(color => color.color_code === color_code && color.finish === finish),
  // get Color based on color_code
  // eslint-disable-next-line max-len
  getColorByCode: (s, g) => color_code => g.getAllColors.find(color => color.color_code === color_code),
  // tells if colors are initialized (not empty)
  isColorsInitialized: (s, g) => !!g.getAllColors.length && s.colorsDownloaded,
};

const mutations = {
  // set store colors as Colors
  setColors(s, colors = []) {
    Vue.set(s, 'colors', colors.map(color => new Color(color)));
  },
  setHDFColors(s, colors = []) {
    Vue.set(s, 'colors_hdf', colors.map(color => new Color(color)));
  },
  setHPLColors(s, colors = []) {
    Vue.set(s, 'colors_hpl', colors.map(color => new Color(color)));
  },
  addColorInColors(s, color) {
    Vue.set(s.colors, s.colors.length, new Color(color));
  },
  addColorInHPL(s, color_hpl) {
    Vue.set(s.colors_hpl, s.colors_hpl.length, new Color(color_hpl));
  },
  addColorInHDF(s, color_hdf) {
    Vue.set(s.colors_hdf, s.colors_hdf.length, new Color(color_hdf));
  },
  setColorsDownloaded(s, value = false) {
    Vue.set(s, 'colorsDownloaded', value);
  },
};

const actions = {
  setAllColors(context, { colors, colors_hpl, colors_hdf }) {
    console.info('setting colors...');
    context.commit('setColors', colors.sort(compareColor));
    context.commit('setHDFColors', colors_hdf.sort(compareColor));
    context.commit('setHPLColors', colors_hpl.sort(compareColor));
  },
  addAllColors(context, { colors, colors_hpl, colors_hdf }) {
    console.info('adding colors...');
    colors.forEach(color => context.commit('addColorInColors', color));
    colors_hdf.forEach(color_hdf => context.commit('addColorInHDF', color_hdf));
    colors_hpl.forEach(color_hpl => context.commit('addColorInHPL', color_hpl));
  },
  setColorsFromAPI(context, specificColors = []) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: receivedColors } = await fabAPI.post('', specificColors, {
          params: { route: 'colors' },
        });
        // if (receivedColors.error) reject(new Error('specific color not found'));
        await context.dispatch('setAllColors', receivedColors);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  initColorsStore(context, specificColors = []) {
    return new Promise(async (resolve, reject) => {
      context.commit('setColorsDownloaded', false);
      try {
        await context.dispatch('setColorsFromAPI', specificColors);
        context.commit('setColorsDownloaded', true);
        console.info('[Colors] colors ready');
        resolve();
      } catch (e) {
        console.error('[Colors] colors failed', e);
        reject(specificColors.map(color => color.reference.toString()).join(' '));
      }
    });
  },
};

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};
