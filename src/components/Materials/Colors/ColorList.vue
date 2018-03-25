<template>
  <div v-if="isColorsInitialized">
    <h4>{{ name }}</h4>
    <span>{{desc}}</span>
    <div class="flexbox-parents-no-margin w-dyn-items"
         v-bind:class="{
          'ard-palette-overall': position !== 'extended',
          'colorlist-overflow': overflow,
         }"
    >
      <color
        v-for="(color, index) in displayedColors"
        :color="color"
        :position="position"
        :catalog="catalog"
        :selected="isColorSelected(color)"
        :key="`${color.color_code}/${index}`"
        :force-full-listed="forceFullListed"
        @dblclick.native="setNewSelectedColor(color, true)"
        :deletable="deletable"
        @click.native="setNewSelectedColor(color, false)"
      />
      <color
        v-for="(material, index) in materials"
        :key="`${material.ref}/${index}`"
        :material-i-d="material.id"
        :catalog="catalog"
        :editable="editable"
        :position="position"
        :force-full-listed="forceFullListed"
        :selected="isMaterialSelected(material)"
        :deletable="deletable"
        @dblclick.native="setNewSelectedMaterial(material, true)"
        @click.native="setNewSelectedMaterial(material)"
      />
      <div class="new-round-material-color round-material-color"
           @click="openColorPicker()"
           v-if="position === 'mini' && materials.length">
        <em class="el-icon-plus" style="flex-grow: 1;"/>
      </div>
      <div class="colorlist-button eel-button white" v-if="!forceFullListed && !hideShowMoreColors">
        <el-checkbox :value="!showShortList"
                     @change="showShortList = !showShortList"
        >
          {{ t('showmorecolors') }}
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Checkbox } from 'element-ui';
import Color from './Color';

export default {
  components: { Color, ElCheckbox: Checkbox },
  props: {
    name: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: 'vertical',
    },
    overflow: {
      type: Boolean,
      default: false,
    },
    materials: {
      type: Array,
      default() {
        return [];
      },
    },
    colors: {
      type: Array,
      default() {
        return [];
      },
    },
    catalog: {
      type: Array,
      required: true,
    },
    selectedColor: { type: Object },
    selectedMaterial: { type: Number },
    editable: {
      type: Boolean,
      default: true,
    },
    selectable: {
      type: Boolean,
      default: true,
    },
    forceFullListed: {
      // force all colors to be displayed and hide action button
      type: Boolean,
      default: false,
    },
    hideShowMoreColors: {
      type: Boolean,
      default: false,
    },
    click2validate: {
      type: Boolean,
      default: false,
    },
    deletable: {
      type: Boolean,
      default: true,
    },
  },
  name: 'color-list',
  data() {
    return {
      showShortList: true,
      newSelectedColor: null,
      newSelectedMaterial: null,
    };
  },
  computed: {
    displayedColors() {
      return this.colors
      // eslint-disable-next-line max-len
        .filter((color) => {
          if (this.forceFullListed) return true;
          if (!this.showShortList) return true;
          return this.showShortList && !!color.shortlist;
        });
    },
    ...mapGetters('materials/colors', [
      'isColorsInitialized',
    ]),
  },
  methods: {
    t(msg) {
      // eslint-disable-next-line no-undef
      return this.$t(msg);
    },
    isColorSelected(color) {
      if (!this.selectable) return false;
      if (this.newSelectedColor) {
        return color.id === this.newSelectedColor.id;
      }
      if (this.selectedColor) {
        return color.id === this.selectedColor.id;
      }
      return false;
    },
    isMaterialSelected(material) {
      if (!this.selectable) return false;
      if (this.newSelectedMaterial) {
        return material.id === this.newSelectedMaterial.id;
      }
      if (this.selectedMaterial) {
        return material.id === this.selectedMaterial;
      }
      return false;
    },
    setNewSelectedColor(color, validate) {
      this.newSelectedColor = color;
      const toSend = {
        item: color,
        confirm: this.click2validate || validate,
      };
      this.$emit('add-color', toSend);
      this.newSelectedColor = null;
    },
    setNewSelectedMaterial(material, validate) {
      this.newSelectedMaterial = material;
      const toSend = {
        item: material,
        // ask the parent to force validation (double tap to validate)
        // this feature is enabled if click2validate is trues
        confirm: this.click2validate || validate,
      };
      this.$emit('add-color', toSend);
      this.newSelectedMaterial = null;
    },
    openColorPicker() {
      this.$emit('open-picker');
    },
  },
};

</script>
<style scoped>
.new-round-material-color {
  display: flex;
  text-align: center;
  align-items: center;
}

.colorlist-button {
  margin-top: auto;
}

.colorlist-overflow {
  height: 100%;
  overflow-y: auto;
}
</style>
