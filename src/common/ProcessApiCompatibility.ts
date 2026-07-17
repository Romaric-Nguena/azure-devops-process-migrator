import * as WITProcessInterfaces from "azure-devops-node-api/interfaces/WorkItemTrackingProcessInterfaces";

/**
 * Small compatibility surface used by the original migration engine.
 * The implementation maps the current Azure DevOps SDK method names and models
 * to the models expected by this project.
 */
export interface IProcessApiCompatibility {
    getProcesses(): Promise<WITProcessInterfaces.ProcessModel[]>;
    getProcessById(processId: string): Promise<WITProcessInterfaces.ProcessModel>;
    getFields(processId: string): Promise<WITProcessInterfaces.FieldModel[]>;
    getBehaviors(processId: string): Promise<WITProcessInterfaces.WorkItemBehavior[]>;
    getWorkItemTypes(processId: string): Promise<any[]>;
    getWorkItemTypeRules(processId: string, workItemTypeReferenceName: string): Promise<WITProcessInterfaces.FieldRuleModel[]>;
    addWorkItemTypeRule(
        rule: WITProcessInterfaces.FieldRuleModel,
        processId: string,
        workItemTypeReferenceName: string
    ): Promise<WITProcessInterfaces.FieldRuleModel>;
    getStateDefinitions(processId: string, workItemTypeReferenceName: string): Promise<any[]>;
    deleteProcess(processId: string): Promise<void>;
    createProcess(createModel: WITProcessInterfaces.CreateProcessModel): Promise<WITProcessInterfaces.ProcessModel>;
}
