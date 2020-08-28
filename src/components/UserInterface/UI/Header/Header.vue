<template>
  <div class="and-middle-bandeau">
    <div class="and-wrapper-icon-navbar">
      <div>
        <div class="and-margin-icon">
          <div class="round-icon white"></div>
          <div class="and-text-under-icon">Ouvrir projet</div>
        </div>
        <div id="ard-2dzoomplus" class="and-margin-icon"></div>
      </div>
      <div v-if="this.$route.query.spufenb === 'true'">
        <div class="and-margin-icon" title="Importer un projet">
          <div class="round-icon white" @click="openImportRListBox()"><em class="el-icon-document-add"/></div>
          <div class="and-text-under-icon" >Un projet</div>
        </div>
        <div class="and-margin-icon"></div>
      </div>
      <div>
        <div class="and-margin-icon" title="Importez votre projet">
          <div class="round-icon white" @click="openImportProjectBox()"><em class="el-icon-folder-add"/></div>
          <div class="and-text-under-icon">Votre projet</div>
        </div>
        <div class="and-margin-icon"></div>
      </div>
    </div>
    <a href="/info" target="_blank" class="and-wrapper-icon-navbar w-inline-block">
      <div class="and-margin-icon">
        <div class="round-icon orange"></div>
        <div class="and-text-under-icon">Aide</div>
      </div>
      <div class="and-margin-icon"></div>
    </a>
    <div class="and-wrapper-icon-navbar">
      <div id="ard-undo" class="and-margin-icon" @click.stop="undo">
        <div class="round-icon grey-blue-hover"></div>
        <div class="and-text-under-icon">Annuler</div>
      </div>
      <div class="and-margin-icon" @click.stop="redo">
        <div class="round-icon grey-blue-hover"></div>
        <div class="and-text-under-icon">Refaire</div>
      </div>
    </div>
    <div class="and-wrapper-icon-navbar" @click="saveProject()">
      <div class="and-margin-icon">
        <div class="round-icon"></div>
        <div class="and-text-under-icon">Enregistrer</div>
      </div>
    </div>
    <div class="and-wrapper-icon-navbar">
      <div class="and-price">
        <div v-if="price !== '---'">
          <div class="price-title">{{ price }} €</div>
          <div class="and-price-info">TTC, livré en 6 sem.</div>
        </div>
        <div v-else>
          <el-link icon="el-icon-refresh" @click.once="updatePrice()" :underline="false">Mettre à jour le prix</el-link>
        </div>
      </div>
      <div class="and-margin-icon" @click="addToCart">
        <div class="eel-button basket-icon">
          <div class="fa-basket-icon"></div>
          <div>Ajouter au panier</div>
        </div>
      </div>
    </div>
    <ProjectsBox />
    <History />
    <ImportModel :show-import-dialog.sync="showImportBox"/>
  </div>
</template>

<script>
import { Icon, Link, MessageBox } from 'element-ui';
import { mapActions, mapState } from 'vuex';
import EventBus from '../../../EventBus/EventBus';
import ProjectsBox from './Plugins/ProjectsBox';
import History from './Plugins/History';
import ImportModel from '../ImportModel';

export default {
  name: 'Header',
  components: {
    ProjectsBox,
    History,
    ImportModel,
    [Icon.name]: Icon,
    [Link.name]: Link,
  },
  data() {
    return {
      showProjectBox: false,
      showImportBox: false,
    };
  },
  computed: {
    ...mapState('Panels', [
      'price',
    ]),
    ...mapState('User', {
      userID: 'id',
    }),
  },
  methods: {
    ...mapActions('Panels', [
      'addToCart',
    ]),
    openImportRListBox() {
      this.showImportBox = true;
    },
    openImportProjectBox() {
      EventBus.$emit('showImportProjectsList');
    },
    updatePrice() {
      this.$store.dispatch('Panels/requestGeneralData').catch(() => {
        console.error('requestGeneralData failed to return price');
        MessageBox.alert('Le serveur n\'a pas pu calculer le prix, contactez nous si le problème persiste.', {
          type: 'error',
          title: 'Erreur',
          confirmButtonText: 'Ok',
        });
      });
    },
    saveProject() {
      EventBus.$emit('showProjectsList');
    },
    redo() {
      EventBus.$emit('redo');
      this.$store.commit('Camera/selectObject3D');
    },
    undo() {
      EventBus.$emit('undo');
      this.$store.commit('Camera/selectObject3D');
    },
  },
};
</script>
