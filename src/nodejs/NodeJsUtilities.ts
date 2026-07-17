import * as vsts from "azure-devops-node-api/WebApi";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import * as readline from "node:readline";
import { defaultLogFileName } from "../common/Constants";
import { IConfigurationOptions, IRestClients } from "../common/Interfaces";
import { logger } from "../common/Logger";
import { Utility } from "../common/Utilities";
import { KnownError } from "../common/Errors";
import { ProcessApiAdapter } from "./ProcessApiAdapter";

export class NodeJsUtility extends Utility {
    public static async writeJsonToFile(exportFilename: string, payload: object): Promise<void> {
        const folder = dirname(exportFilename);
        if (!existsSync(folder)) {
            mkdirSync(folder, { recursive: true });
        }
        writeFileSync(exportFilename, JSON.stringify(payload, null, 2), { encoding: "utf-8", flag: "w" });
    }

    public static startCancellationListener(): void {
        const stdin = process.stdin;
        if (typeof stdin.setRawMode !== "function" || !stdin.isTTY) {
            logger.logInfo("Interactive cancellation is unavailable; use CTRL+C to stop the operation.");
            return;
        }

        stdin.setRawMode(true);
        readline.emitKeypressEvents(stdin);
        stdin.addListener("keypress", this._listener);
        logger.logVerbose("Keyboard listener added. Press Q to request cancellation.");
    }

    public static stopCancellationListener(): void {
        process.stdin.removeListener("keypress", this._listener);
        if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
            process.stdin.setRawMode(false);
        }
    }

    public static getLogFilePath(options: IConfigurationOptions = {}): string {
        return options.logFilename || defaultLogFileName;
    }

    public static async getRestClients(accountUrl: string, pat: string): Promise<IRestClients> {
        const authHandler = vsts.getPersonalAccessTokenHandler(pat);
        const webApi = new vsts.WebApi(accountUrl, authHandler);
        try {
            const witApi = await webApi.getWorkItemTrackingApi();
            const processApi = await webApi.getWorkItemTrackingProcessApi();
            const definitionsApi = await webApi.getWorkItemTrackingProcessDefinitionApi();
            return {
                witApi,
                witProcessApi: new ProcessApiAdapter(processApi, definitionsApi, witApi),
                witProcessDefinitionApi: definitionsApi
            };
        }
        catch {
            throw new KnownError(
                `Failed to connect to '${accountUrl}' with the provided personal access token. Check the URL, token and permissions.`
            );
        }
    }

    private static _listener = (_value: string, key: readline.Key): void => {
        if (key?.name?.toLowerCase() === "q") {
            logger.logVerbose("Cancellation requested by the user.");
            Utility.isCancelled = true;
        }
    };
}
