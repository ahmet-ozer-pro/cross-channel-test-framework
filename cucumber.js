const os = require('node:os');

/**
 * Cucumber JS yapılandırması.
 * Raporlama: geliştirici için HTML/JSON, paydaş/CI için Allure.
 * NOT: feature dosyaları teslimde .txt; çalıştırmadan önce .feature yap.
 */
module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
      environmentInfo: {
        os_platform: os.platform(),
        node_version: process.version,
      },
    },
  },
};
