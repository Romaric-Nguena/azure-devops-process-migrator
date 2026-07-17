import { join } from "node:path";

export const appVersion = "1.0.0";
export const PICKLIST_NO_ACTION = "PICKLIST_NO_ACTION";
export const defaultEncoding = "utf-8";
export const defaultConfigurationFilename = "configuration.json";
export const defaultLogFileName = join("output", "process-migrator.log");
export const defaultProcessFilename = join("output", "process.json");
export const paramMode = "mode";
export const paramConfig = "config";
export const paramSourceToken = "sourceToken";
export const paramTargetToken = "targetToken";
export const paramOverwriteProcessOnTarget = "overwriteProcessOnTarget";
export const sourceTokenEnvironmentVariable = "AZDO_SOURCE_PAT";
export const targetTokenEnvironmentVariable = "AZDO_TARGET_PAT";

export const defaultConfiguration = `{
  "sourceAccountUrl": "https://dev.azure.com/source-organization",
  "targetAccountUrl": "https://dev.azure.com/target-organization",
  "sourceProcessName": "Source inherited process",
  "targetProcessName": "Imported inherited process",
  "options": {
    "processFilename": "output/process.json",
    "logFilename": "output/process-migrator.log",
    "logLevel": "information",
    "overwritePicklist": false,
    "continueOnRuleImportFailure": false,
    "continueOnIdentityDefaultValueFailure": false,
    "skipImportFormContributions": false
  }
}
`;

export const regexRemoveHyphen = /-/g;
