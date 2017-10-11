import Vue from 'vue';

class DisplayRules {
  constructor(args = {}) {
    this.setNewRules(args);
  }

  setNewRules(rules = {}) {
    Object.entries(rules).forEach(([key, value]) => {
      Vue.set(this, key, value);
    });
    return this;
  }

  setNewRulesWithValue(names = [], value = 1) {
    // set multiple rules to value
    const rules = names.reduce((acc, current) => {
      acc[current] = value;
      return acc;
    }, {});
    this.setNewRules(rules);
    return this;
  }
}

const state = {
  displayRules: (new DisplayRules()).setNewRulesWithValue(['stickers', 'dimension-arrows', 'edges-selector'], 0),
};

const getters = {
  /** Tells if item is Displayed (!0) */
  isItemDisplayed: s => itemName => (s.displayRules[itemName] != null ? s.displayRules[itemName] !== 0 : true),

  /** Tells if item is Usable (1) */
  isItemUsable: s => itemName => (s.displayRules[itemName] != null ? s.displayRules[itemName] === 1 : true),

  /** Tells if item is Disabled (2) */
  isItemDisabled: s => itemName => (s.displayRules[itemName] != null ? s.displayRules[itemName] === 2 : false),
};
const mutations = {
  /** set display rules. Key is the slug name, value is the display status (hide : 0, usable: 1, disabled: 2) */
  setDisplayRules(s, rules = {}) {
    s.displayRules.setNewRules(rules);
  },
  /** set display rules as an array of name with same value */
  setDisplayRulesWithValue(s, payload = {}) {
    const { names, value } = payload;
    s.displayRules.setNewRulesWithValue(names, value);
  },
};

const actions = {
  /** Disable all items listed in names */
  disableItems(context, names = []) {
    context.commit('setDisplayRulesWithValue', { names, value: 2 });
  },
  /** Hide all items listed in names */
  hideItems(context, names = []) {
    context.commit('setDisplayRulesWithValue', { names, value: 0 });
  },
  /** Show all items listed in names */
  showItems(context, names = []) {
    context.commit('setDisplayRulesWithValue', { names, value: 1 });
  },
};

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};
