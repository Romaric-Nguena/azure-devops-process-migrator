const test = require('node:test');
const assert = require('node:assert/strict');
const { ProcessApiAdapter } = require('../build/nodejs/ProcessApiAdapter.js');
const { ProcessClass, CustomizationType } = require('azure-devops-node-api/interfaces/WorkItemTrackingProcessInterfaces');

function createAdapter() {
  const processApi = {
    getListOfProcesses: async () => [{
      typeId: 'process-id',
      name: 'Inherited Agile',
      parentProcessTypeId: 'parent-id',
      customizationType: CustomizationType.Inherited,
      isDefault: false,
      isEnabled: true
    }],
    getProcessByItsId: async () => ({
      typeId: 'process-id',
      name: 'Inherited Agile',
      parentProcessTypeId: 'parent-id',
      customizationType: CustomizationType.Inherited
    }),
    getProcessWorkItemTypeRules: async () => [{ id: 'rule-id', name: 'Required title', isDisabled: false }],
    addProcessWorkItemTypeRule: async (rule) => ({ ...rule, id: 'created-rule' }),
    getStateDefinitions: async () => [],
    deleteProcessById: async () => undefined,
    createNewProcess: async (model) => ({ ...model, typeId: 'created-process', customizationType: CustomizationType.Inherited })
  };
  const definitionsApi = {
    getWorkItemTypes: async () => [{ id: 'Custom.Bug' }],
    getWorkItemTypeFields: async () => [{ referenceName: 'Custom.Priority' }],
    getBehaviors: async () => [{ id: 'Custom.Requirement', name: 'Requirement' }]
  };
  const witApi = {
    getFields: async () => [
      { referenceName: 'Custom.Priority', name: 'Priority', description: 'Custom field', type: 2 },
      { referenceName: 'Unrelated.Field', name: 'Unrelated', type: 1 }
    ]
  };
  return new ProcessApiAdapter(processApi, definitionsApi, witApi);
}

test('adapter maps current ProcessInfo to the legacy process model', async () => {
  const [process] = await createAdapter().getProcesses();
  assert.equal(process.typeId, 'process-id');
  assert.equal(process.properties.class, ProcessClass.Derived);
  assert.equal(process.properties.parentProcessTypeId, 'parent-id');
});

test('adapter exports only fields used by the selected process', async () => {
  const fields = await createAdapter().getFields('process-id');
  assert.deepEqual(fields.map((field) => field.id), ['Custom.Priority']);
});

test('adapter maps rule names in both directions', async () => {
  const adapter = createAdapter();
  const [rule] = await adapter.getWorkItemTypeRules('process-id', 'Custom.Bug');
  assert.equal(rule.friendlyName, 'Required title');
  const created = await adapter.addWorkItemTypeRule(rule, 'process-id', 'Custom.Bug');
  assert.equal(created.id, 'created-rule');
  assert.equal(created.friendlyName, 'Required title');
});
