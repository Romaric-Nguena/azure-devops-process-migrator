const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { defaultLogFileName, defaultProcessFilename } = require('../build/common/Constants.js');
const { Utility } = require('../build/common/Utilities.js');
const { NodeJsUtility } = require('../build/nodejs/NodeJsUtilities.js');

test('default output paths are platform independent', () => {
  assert.equal(defaultLogFileName, path.join('output', 'process-migrator.log'));
  assert.equal(defaultProcessFilename, path.join('output', 'process.json'));
});

test('generated identifiers contain 32 hexadecimal characters', () => {
  const value = Utility.createGuidWithoutHyphen();
  assert.match(value, /^[0-9a-f]{32}$/i);
});

test('writeJsonToFile creates parent directories', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'azdo-process-output-'));
  const output = path.join(temp, 'nested', 'process.json');
  try {
    await NodeJsUtility.writeJsonToFile(output, { process: 'demo' });
    assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), { process: 'demo' });
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
