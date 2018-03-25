<template>
  <div class="w-dyn-item"
       v-bind:class="{
        'selected': selected,
        'ard-palette-card': position === 'extended',
        'ard-palette-card-mini': position === 'vertical',
        'ard-palette-mini-horizontal': position === 'horizontal',
       }"
       v-if="isColorsInitialized"
  >
    <template v-if="position === 'mini'">
      <Thumbnail class="round-material-color"
                 :class="{ 'selected-color' : selected }"
                 :color="getActualColor"
      />
    </template>
    <template v-else-if="position !== 'extended'">
      <Thumbnail v-if="position === 'vertical'"
                 class="ard-palette-img-mini"
                 :color="getActualColor"
      />
      <div v-if="position !== 'vertical'" class="ard-img-overflow">
        <Thumbnail class="ard-img-overflow-inside" :color="getActualColor" />
      </div>
      <div class="ard-palette-text-card">{{getActualColor.reference_name}}</div>
      <div class="ard-palette-text-card">
        {{getActualColor.fullname}}
      </div>
      <div v-if="position === 'horizontal'"><em class="el-icon-caret-bottom"/></div>
    </template>
    <template v-else>
      <div class="flexbox-parents-no-margin ard-palette">
        <Thumbnail class="ard-color-size" :color="getActualColor" />
        <div class="children-flexbox">
          <div class="ard-palette-title">{{getActualColor.reference_name}}</div>
          <div>{{getActualColor.color_code}}</div>
          <div>Fournisseur: {{getActualColor.manufacturerName}}</div>
        </div>
        <div v-if="getActualColor.finish" class="children-flexbox">
          <div class="children-flexbox w-clearfix">
            <Finish :color="getActualColor" type="background" class="ard-texture-bg"/>
            <div class="ard-palette-title">Texture</div>
            <Finish class="ard-palette-texture-size" :color="getActualColor" />
          </div>
          <Finish :color="getActualColor" type="background" class="ard-texture-bg"/>
        </div>
      </div>
      <div class="ard-button-wrapper-palette" v-if="materialID != null && editable">
        <div class="button-margin">
          <a :href="getActualColor.linkURL"
             class="eel-button low-emphasis w-button"
             target="_blank"
          >
            {{t('learnmore')}}
          </a>
        </div>
        <el-button
          v-if="isDeletable"
          @click="deleteColor"
          plain
          icon="el-icon-delete"
          style="margin-right: 15px;"
          size="mini">
        </el-button>
        <a @click="showColorPicker = true" class="eel-button _w-icon w-button">
          {{t('editcolor')}}
        </a>
      </div>
      <color-picker
        :show-color-palette="showColorPicker"
        :selected-color="getMaterialID"
        :catalog="catalog"
        :force-full-listed="forceFullListed"
        name=""
        @show-dialog="showColorPicker = $event"
        @picked-color="updateColor"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Button } from 'element-ui';
import Thumbnail from './ColorImage/Thumbnail';
import Finish from './ColorImage/Finish';

export default {
  name: 'color',
  components: {
    ElButton: Button,
    Finish,
    Thumbnail,
    ColorPicker: () => import('./ColorPicker.vue'),
  },
  props: {
    materialID: { type: Number },
    color: { type: Object },
    selected: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: 'vertical',
    },
    editable: {
      type: Boolean,
      default: true,
    },
    deletable: {
      type: Boolean,
      default: true,
    },
    catalog: {
      type: Array,
      required: true,
    },
    forceFullListed: {
      // force all colors to be displayed and hide action button
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showColorPicker: false,
    };
  },
  computed: {
    isDeletable() {
      return this.materialID > 1 && this.deletable;
    },
    getMaterialID() {
      return this.materialID != null ? this.materialID : this.colorToMaterial(this.getActualColor).id;
    },
    getActualColor() {
      if (this.color || this.materialIDToColor(this.materialID)) return this.color || this.materialIDToColor(this.materialID);
      return {};
    },
    ...mapGetters('materials', [
      'colorToMaterial',
      'materialIDToColor',
    ]),
    ...mapGetters('materials/colors', [
      'isColorsInitialized',
    ]),
  },
  methods: {
    t(msg) {
      // eslint-disable-next-line no-undef
      return this.$t(msg);
    },
    updateColor(newMaterialID) {
      const toSend = {
        oldMaterialID: this.getMaterialID,
        newMaterialID,
      };
      this.$store.dispatch('materials/updateMaterial', toSend);
    },
    deleteColor() {
      const toSend = {
        oldMaterialID: this.getMaterialID,
        newMaterialID: null,
      };
      this.$store.dispatch('materials/updateMaterial', toSend);
    },
    positionBodyStyle() {
      if (this.position === 'inline') {
        return {
          padding: '1px',
          height: '50px',
          display: 'flex',
          flexFlow: 'row',
          alignItems: 'center',
        };
      }
      return {
        padding: '0px',
      };
    },
  },
};
</script>
