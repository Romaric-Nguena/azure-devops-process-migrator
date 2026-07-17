const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { ProcessConfigurationFile } = require('../build/nodejs/ConfigurationProcessor.js');
const { Modes } = require('../build/common/Interfaces.js');
const { Utility } = require('../build/common/Utilities.js');

function commandOptions(config, mode = Modes.migrate) {
  return { config, mode, overwriteProcessOnTarget: false };
}

test('configuration reads PATs from environment variables', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'azdo-process-config-'));
  const configPath = path.join(temp, 'configuration.jsonc');
  fs.writeFileSync(configPath, JSON.stringify({
    sourceAccountUrl: 'https://dev.azure.com/source-org',
    targetAccountUrl: 'https://dev.azure.com/target-org',
    sourceProcessName: 'Agile Custom',
    options: {}
  }));

  const oldSource = process.env.AZDO_SOURCE_PAT;
  const oldTarget = process.env.AZDO_TARGET_PAT;
  process.env.AZDO_SOURCE_PAT = 'source-secret';
  process.env.AZDO_TARGET_PAT = 'target-secret';
  try {
    const configuration = await ProcessConfigurationFile(commandOptions(configPath));
    assert.equal(configuration.sourceAccountToken, 'source-secret');
    assert.equal(configuration.targetAccountToken, 'target-secret');
  } finally {
    if (oldSource === undefined) delete process.env.AZDO_SOURCE_PAT;
    else process.env.AZDO_SOURCE_PAT = oldSource;
    if (oldTarget === undefined) delete process.env.AZDO_TARGET_PAT;
    else process.env.AZDO_TARGET_PAT = oldTarget;
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('configuration validation rejects non-HTTPS organization URLs', () => {
  const valid = Utility.validateConfiguration({
    sourceAccountUrl: 'http://dev.azure.com/source-org',
    sourceAccountToken: 'secret',
    sourceProcessName: 'Process',
    options: {}
  }, Modes.export);
  assert.equal(valid, false);
});

test('configuration validation rejects non-boolean options', () => {
  const valid = Utility.validateConfiguration({
    targetAccountUrl: 'https://dev.azure.com/target-org',
    targetAccountToken: 'secret',
    options: { overwritePicklist: 'false' }
  }, Modes.import);
  assert.equal(valid, false);
});
