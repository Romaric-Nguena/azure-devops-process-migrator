const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCommandLine } = require('../build/nodejs/ConfigurationProcessor.js');
const { run } = require('../build/nodejs/Main.js');
const { Modes } = require('../build/common/Interfaces.js');

async function captureConsole(action) {
  const messages = [];
  const original = console.log;
  console.log = (message) => messages.push(String(message));
  try {
    const result = await action();
    return { result, output: messages.join('\n') };
  } finally {
    console.log = original;
  }
}

test('parseCommandLine uses migrate by default', () => {
  const parsed = parseCommandLine([]);
  assert.equal(parsed.options.mode, Modes.migrate);
  assert.equal(parsed.options.config, 'configuration.json');
});

test('parseCommandLine accepts export and a custom config', () => {
  const parsed = parseCommandLine(['--mode', 'export', '--config', 'custom.jsonc']);
  assert.equal(parsed.options.mode, Modes.export);
  assert.equal(parsed.options.config, 'custom.jsonc');
});

test('parseCommandLine rejects invalid modes', () => {
  assert.throws(() => parseCommandLine(['--mode', 'copy']), /Invalid mode/);
});

test('CLI help works without a configuration file', async () => {
  const { result, output } = await captureConsole(() => run(['--help']));
  assert.equal(result, 0);
  assert.match(output, /Azure DevOps Process Migrator/);
  assert.match(output, /AZDO_SOURCE_PAT/);
});
