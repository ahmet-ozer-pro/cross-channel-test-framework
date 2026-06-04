/**
 * Cucumber JS yapılandırması.
 * - require-module ile ts-node devreye girer (TypeScript step'leri doğrudan çalışır).
 * - paths: feature dosyalarının yeri.
 * - require: support + step dosyalarının yeri (recursive).
 *
 * NOT: Bu iskelette feature dosyaları teslim kısıtı nedeniyle .txt uzantılı.
 * Çalıştırmadan önce .feature olarak yeniden adlandır (aşağıdaki glob .feature bekler).
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
    ],
    formatOptions: { snippetInterface: 'async-await' },
  },
};
