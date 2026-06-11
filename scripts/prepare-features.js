#!/usr/bin/env node
/**
 * prepare-features
 * ----------------
 * Teslim/paylaşım formatı `.feature.txt`; Cucumber ise `.feature` ister.
 * Bu script çalıştırmadan ÖNCE features/**\/*.feature.txt dosyalarının yanına
 * aynı içerikli `.feature` üretir. Tek kaynak `.txt` kalır, runner her zaman
 * güncel `.feature` görür.
 *
 * Cross-platform (saf Node, shell one-liner yok). pretest/pretest:dry/
 * pretest:cross-channel hook'larından otomatik çalışır.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FEATURES_DIR = path.join(__dirname, '..', 'features');
const SUFFIX = '.feature.txt';

/** Verilen dizini özyinelemeli gezip tüm *.feature.txt yollarını toplar. */
function collectTxtFeatures(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectTxtFeatures(full));
    } else if (entry.isFile() && entry.name.endsWith(SUFFIX)) {
      found.push(full);
    }
  }
  return found;
}

function main() {
  const txtFiles = collectTxtFeatures(FEATURES_DIR);
  let written = 0;

  for (const txtPath of txtFiles) {
    const featurePath = txtPath.slice(0, -'.txt'.length); // foo.feature.txt -> foo.feature
    const source = fs.readFileSync(txtPath);

    // Yalnızca içerik değiştiyse yaz — gereksiz mtime değişikliği yok.
    const upToDate =
      fs.existsSync(featurePath) && fs.readFileSync(featurePath).equals(source);
    if (!upToDate) {
      fs.writeFileSync(featurePath, source);
      written += 1;
    }
  }

  console.log(
    `[prepare-features] ${txtFiles.length} .feature.txt bulundu, ${written} .feature güncellendi.`,
  );
}

main();
