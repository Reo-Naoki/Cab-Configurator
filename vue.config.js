const { version } = require('./package.json');

module.exports = {
  publicPath: '/',
  runtimeCompiler: true,
  productionSourceMap: false,

  configureWebpack: {
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },

  devServer: {
    // https: true,
    proxy: {
      // eslint-disable-next-line no-useless-escape
      '^\/resources\/.*': {
        // every image not in adesigner is redirected if not found locally
        target: 'https://dessinetonmeuble.fr',
        changeOrigin: true,
        logLevel: 'debug',
      },
      /*
      '^\/modules\/.*': {
        target: 'https://dev.dessinetonmeuble.fr',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
      },*/
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'fr',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },

  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      // eslint-disable-next-line no-param-reassign
      definitions[0]['process.env'].PACKAGE_VERSION = JSON.stringify(version);
      return definitions;
    });
  },
};
