<template>
  <div v-if="isColorsInitialized">
    <div v-if="size === 'mini'">
      <color-list
        name=""
        :selected-material="getCurrentSelectedMaterial"
        :materials="getCurrentMaterials()"
        :catalog="catalog"
        :editable="false"
        :position="size"
        :click2validate="true"
        :force-full-listed="true"
        @add-color="setNewSelectedMaterial"
        @open-picker="openColorPicker()" />
    </div>
    <el-dialog
      :fullscreen="false"
      :title="t('modifycolorelement')"
      :visible="showColorPalette"
      top="2vh"
      @close="resetColorPalette"
      width="90%"
      append-to-body
      custom-class="color-picker-dialog"
      v-else
    >
      <el-row :gutter="30">
        <el-col :sm="16">
          <color-list
            v-if="showCurrentColor"
            :name="t('yourrecentcolors')"
            :selected-material="getCurrentSelectedMaterial"
            :materials="getCurrentMaterials()"
            :catalog="catalog"
            :editable="false"
            :force-full-listed="true"
            @add-color="setNewSelectedMaterial"
          />
          <div v-for="(c, index) in catalog" :key="index">
            <p>{{ t(c.slug) }}</p>
            <color-list
              :selected-color="getCurrentSelectedColor"
              :name="name"
              :colors="c.catalog"
              :catalog="catalog"
              :force-full-listed="forceFullListed"
              @add-color="setNewSelectedColor"
            />
          </div>
        </el-col>
        <el-col :sm="8" v-if="getCurrentSelectedColor">
          <div class="ard-div-color-right">
            <div class="ard-palette-title margin">{{t('yourcolor')}}</div>
            <div class="ard-palette-title">
              {{
                getCurrentSelectedColor.reference_name
                + ' ('
                + getCurrentSelectedColor.fullname + ')'
              }}
            </div>
            <ColorMain :color="getCurrentSelectedColor" class="ard-palette-img-big-size"/>
          </div>
          <div class="ard-div-color-right" v-if="getCurrentSelectedColor.finish != null">
            <div class="ard-palette-title margin">
              {{t('texture') + ': ' + getCurrentSelectedColor.finish}}
            </div>
            <Finish :color="getCurrentSelectedColor" class="ard-palette-img-big-size texture"/>
            <p>{{ t(`${getCurrentSelectedColor.finish.toLowerCase()}-description`) }}</p>
          </div>
          <div class="ard-button-wrapper-palette">
            <div class="button-margin">
              <a :href="getCurrentSelectedColor.linkURL"
                 target="_blank"
                 class="eel-button low-emphasis w-button">
                {{t('learnmore')}}
              </a>
            </div>
          </div>
        </el-col>
      </el-row>
      <div slot="footer">
        <div @click="updateShowDialog(false)" class="eel-button white button-margin">{{t('cancel')}}</div>
        <div v-show="getCurrentSelectedColor != null" class="eel-button" @click="pickedColor">{{ t('ok') }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Dialog, Row, Col } from 'element-ui';
import ColorList from './ColorList';
import Finish from './ColorImage/Finish';
import ColorMain from './ColorImage/ColorMain';

export default {
  name: 'ColorPicker',
  components: {
    ColorMain, Finish, ColorList, ElDialog: Dialog, ElCol: Col, ElRow: Row,
  },
  props: {
    selectedColor: {
      type: Number,
    },
    showColorPalette: {
      type: Boolean,
      required: true,
    },
    catalog: {
      type: Array,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    showCurrentColor: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'dialog',
    },
    forceFullListed: {
      // force all colors to be displayed and hide action button
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      newSelectedColor: null, // Color
      newSelectedMaterial: null, // Material ID
    };
  },
  computed: {
    ...mapGetters('materials', [
      'isColorInMaterials',
      'getMaxMaterialsID',
      'colorToMaterial',
      'materialIDToColor',
      'getColorsMaterials',
    ]),
    ...mapGetters('materials/colors', [
      'isColorsInitialized',
    ]),
    getCurrentSelectedMaterial() {
      if (this.newSelectedMaterial) {
        return this.newSelectedMaterial;
      }
      if (this.newSelectedColor) {
        const t = this.colorToMaterial(this.newSelectedColor);
        return t == null ? t : t.id;
      }
      if (this.selectedColor) {
        return this.selectedColor;
      }
      return null;
    },
    getCurrentSelectedColor() {
      if (this.newSelectedMaterial != null) {
        return this.materialIDToColor(this.newSelectedMaterial);
      }
      if (this.newSelectedColor != null) {
        return this.newSelectedColor;
      }
      if (this.selectedColor) {
        return this.materialIDToColor(this.selectedColor);
      }
      return null;
    },
  },
  methods: {
    t(msg) {
      // eslint-disable-next-line no-undef
      return this.$t(msg);
    },
    updateShowDialog(bool) {
      this.$emit('show-dialog', bool);
      this.resetFields();
    },
    setNewColorToMaterials(color) {
      if (!this.isColorInMaterials(color)) {
        this.$store.commit('materials/addNewMaterial', {
          id: this.getMaxMaterialsID + 1,
          ref: color.color_code,
          manufacturer: color.manufacturer,
          finish: color.finish,
        });
      }
      const newMaterial = this.colorToMaterial(color);
      // eslint-disable-next-line no-undef
      // set3Dcolor(newMaterial);
      return newMaterial;
    },
    pickedColor() {
      const newMaterial = this.setNewColorToMaterials(this.getCurrentSelectedColor);
      this.updateShowDialog(false);
      this.resetFields();
      this.$emit('picked-color', newMaterial.id);
    },
    setNewSelectedColor(color) {
      this.newSelectedColor = color.item;
      this.newSelectedMaterial = null;
      if (color.confirm) {
        this.pickedColor();
      }
    },
    setNewSelectedMaterial(material) {
      this.newSelectedMaterial = material.item.id;
      this.newSelectedColor = null;
      if (material.confirm) {
        this.pickedColor();
      }
    },
    getNewSelectedColorID() {
      const material = this.colorToMaterial(this.newSelectedColor);
      return material == null ? '' : material.id;
    },
    resetColorPalette() {
      this.newSelectedColor = null;
      this.updateShowDialog(false);
    },
    getCurrentMaterials() {
      return this.getColorsMaterials;
    },
    resetFields() {
      this.newSelectedColor = null;
      this.newSelectedMaterial = null;
    },
    openColorPicker() {
      this.$emit('open-picker');
    },
  },
};
</script>
<style>
  .color-picker-dialog {
    display: flex;
    flex-flow: column;
    max-height: 96vh;
    margin-bottom: 0;
  }
  .color-picker-dialog .el-dialog__body {
    flex: 1 1 auto;
    overflow-x: auto;
    padding: 5px 20px;
  }
</style>
