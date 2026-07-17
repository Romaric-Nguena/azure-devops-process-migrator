import { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import { IWorkItemTrackingProcessApi } from "azure-devops-node-api/WorkItemTrackingProcessApi";
import { IWorkItemTrackingProcessDefinitionsApi } from "azure-devops-node-api/WorkItemTrackingProcessDefinitionsApi";
import * as WITInterfaces from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import * as WITProcessDefinitionsInterfaces from "azure-devops-node-api/interfaces/WorkItemTrackingProcessDefinitionsInterfaces";
import * as WITProcessInterfaces from "azure-devops-node-api/interfaces/WorkItemTrackingProcessInterfaces";
import { IProcessApiCompatibility } from "../common/ProcessApiCompatibility";

export class ProcessApiAdapter implements IProcessApiCompatibility {
    constructor(
        private readonly processApi: IWorkItemTrackingProcessApi,
        private readonly definitionsApi: IWorkItemTrackingProcessDefinitionsApi,
        private readonly witApi: IWorkItemTrackingApi
    ) {}

    public async getProcesses(): Promise<WITProcessInterfaces.ProcessModel[]> {
        const processes = await this.processApi.getListOfProcesses();
        return processes.map((process) => this.toProcessModel(process));
    }

    public async getProcessById(processId: string): Promise<WITProcessInterfaces.ProcessModel> {
        return this.toProcessModel(await this.processApi.getProcessByItsId(processId));
    }

    public async getFields(processId: string): Promise<WITProcessInterfaces.FieldModel[]> {
        const workItemTypes = await this.definitionsApi.getWorkItemTypes(processId);
        const fieldReferenceNames = new Set<string>();

        await Promise.all(workItemTypes.map(async (workItemType) => {
            if (!workItemType.id) {
                return;
            }
            const fields = await this.definitionsApi.getWorkItemTypeFields(processId, workItemType.id);
            for (const field of fields) {
                if (field.referenceName) {
                    fieldReferenceNames.add(field.referenceName);
                }
            }
        }));

        const collectionFields = await this.witApi.getFields();
        return collectionFields
            .filter((field) => Boolean(field.referenceName && fieldReferenceNames.has(field.referenceName)))
            .map((field) => this.toFieldModel(field));
    }

    public async getBehaviors(processId: string): Promise<WITProcessInterfaces.WorkItemBehavior[]> {
        const behaviors = await this.definitionsApi.getBehaviors(processId);
        return behaviors.map((behavior) => ({
            abstract: behavior.abstract,
            color: behavior.color,
            description: behavior.description,
            id: behavior.id,
            inherits: behavior.inherits,
            name: behavior.name,
            overriden: behavior.overridden,
            rank: behavior.rank,
            url: behavior.url
        }));
    }

    public getWorkItemTypes(processId: string): Promise<WITProcessDefinitionsInterfaces.WorkItemTypeModel[]> {
        return this.definitionsApi.getWorkItemTypes(processId);
    }

    public async getWorkItemTypeRules(
        processId: string,
        workItemTypeReferenceName: string
    ): Promise<WITProcessInterfaces.FieldRuleModel[]> {
        const rules = await this.processApi.getProcessWorkItemTypeRules(processId, workItemTypeReferenceName);
        return rules.map((rule) => ({
            actions: rule.actions as any,
            conditions: rule.conditions as any,
            friendlyName: rule.name,
            id: rule.id,
            isDisabled: rule.isDisabled,
            isSystem: rule.customizationType === WITProcessInterfaces.CustomizationType.System
        }));
    }

    public async addWorkItemTypeRule(
        rule: WITProcessInterfaces.FieldRuleModel,
        processId: string,
        workItemTypeReferenceName: string
    ): Promise<WITProcessInterfaces.FieldRuleModel> {
        const created = await this.processApi.addProcessWorkItemTypeRule(
            {
                actions: rule.actions as any,
                conditions: rule.conditions as any,
                isDisabled: rule.isDisabled,
                name: rule.friendlyName
            },
            processId,
            workItemTypeReferenceName
        );

        return {
            actions: created.actions as any,
            conditions: created.conditions as any,
            friendlyName: created.name,
            id: created.id,
            isDisabled: created.isDisabled,
            isSystem: created.customizationType === WITProcessInterfaces.CustomizationType.System
        };
    }

    public getStateDefinitions(processId: string, workItemTypeReferenceName: string): Promise<any[]> {
        return this.processApi.getStateDefinitions(processId, workItemTypeReferenceName);
    }

    public deleteProcess(processId: string): Promise<void> {
        return this.processApi.deleteProcessById(processId);
    }

    public async createProcess(
        createModel: WITProcessInterfaces.CreateProcessModel
    ): Promise<WITProcessInterfaces.ProcessModel> {
        return this.toProcessModel(await this.processApi.createNewProcess(createModel));
    }

    private toProcessModel(process: WITProcessInterfaces.ProcessInfo): WITProcessInterfaces.ProcessModel {
        return {
            description: process.description,
            name: process.name,
            projects: process.projects,
            referenceName: process.referenceName,
            typeId: process.typeId,
            properties: {
                class: this.toProcessClass(process.customizationType),
                isDefault: process.isDefault,
                isEnabled: process.isEnabled,
                parentProcessTypeId: process.parentProcessTypeId
            }
        };
    }

    private toProcessClass(customizationType: WITProcessInterfaces.CustomizationType): WITProcessInterfaces.ProcessClass {
        switch (customizationType) {
            case WITProcessInterfaces.CustomizationType.System:
                return WITProcessInterfaces.ProcessClass.System;
            case WITProcessInterfaces.CustomizationType.Custom:
                return WITProcessInterfaces.ProcessClass.Custom;
            case WITProcessInterfaces.CustomizationType.Inherited:
            default:
                return WITProcessInterfaces.ProcessClass.Derived;
        }
    }

    private toFieldModel(field: WITInterfaces.WorkItemField): WITProcessInterfaces.FieldModel {
        return {
            description: field.description,
            id: field.referenceName,
            isIdentity: field.isIdentity,
            name: field.name,
            type: field.type as unknown as WITProcessInterfaces.FieldType,
            url: field.url
        };
    }
}
