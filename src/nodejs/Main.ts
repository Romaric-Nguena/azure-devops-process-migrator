#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { normalize, resolve } from "node:path";
import { appVersion, defaultEncoding, defaultProcessFilename } from "../common/Constants";
import { Engine } from "../common/Engine";
import { ImportError, KnownError } from "../common/Errors";
import { IConfigurationOptions, IProcessPayload, LogLevel, Modes } from "../common/Interfaces";
import { logger } from "../common/Logger";
import { ProcessExporter } from "../common/ProcessExporter";
import { ProcessImporter } from "../common/ProcessImporter";
import { cliUsage, parseCommandLine, ProcessConfigurationFile } from "./ConfigurationProcessor";
import { InitializeFileLogger } from "./FileLogger";
import { NodeJsUtility } from "./NodeJsUtilities";

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
    const startedAt = Date.now();

    try {
        const parsed = parseCommandLine(argv);
        if (parsed.showHelp) {
            console.log(cliUsage);
            return 0;
        }
        if (parsed.showVersion) {
            console.log(appVersion);
            return 0;
        }

        const commandLineOptions = parsed.options;
        if (!commandLineOptions) {
            throw new KnownError("No command-line options were produced.");
        }

        const configuration = await ProcessConfigurationFile(commandLineOptions);
        const userOptions: IConfigurationOptions = configuration.options || {};
        configuration.options = userOptions;

        const configuredLogLevel = userOptions.logLevel?.toLowerCase();
        const maxLogLevel = configuredLogLevel && LogLevel[configuredLogLevel] !== undefined
            ? LogLevel[configuredLogLevel]
            : LogLevel.information;
        const logFile = NodeJsUtility.getLogFilePath(userOptions);
        InitializeFileLogger(logFile, maxLogLevel);
        logger.logInfo(`Full log: '${resolve(logFile)}'.`);

        NodeJsUtility.startCancellationListener();

        const mode = commandLineOptions.mode;
        let processPayload: IProcessPayload;

        if (mode === Modes.export || mode === Modes.migrate) {
            const sourceRestClients = await Engine.Task(
                () => NodeJsUtility.getRestClients(configuration.sourceAccountUrl, configuration.sourceAccountToken),
                `Connect to source organization '${configuration.sourceAccountUrl}'`
            );
            const exporter = new ProcessExporter(sourceRestClients, configuration);
            processPayload = await exporter.exportProcess();

            const exportFilename = userOptions.processFilename || normalize(defaultProcessFilename);
            await Engine.Task(
                () => NodeJsUtility.writeJsonToFile(exportFilename, processPayload),
                "Write process payload to file"
            );
            logger.logInfo(`Export completed successfully: '${resolve(exportFilename)}'.`);
        }

        if (mode === Modes.import || mode === Modes.migrate) {
            if (mode === Modes.import) {
                const processFilename = userOptions.processFilename || normalize(defaultProcessFilename);
                if (!existsSync(processFilename)) {
                    throw new ImportError(`Process payload file '${processFilename}' does not exist.`);
                }
                logger.logVerbose(`Reading process payload from '${processFilename}'.`);
                processPayload = JSON.parse(readFileSync(processFilename, defaultEncoding));
            }

            const targetRestClients = await Engine.Task(
                () => NodeJsUtility.getRestClients(configuration.targetAccountUrl, configuration.targetAccountToken),
                `Connect to target organization '${configuration.targetAccountUrl}'`
            );
            const importer = new ProcessImporter(targetRestClients, configuration, commandLineOptions);
            await importer.importProcess(processPayload);
        }

        logger.logInfo(`Total elapsed time: ${(Date.now() - startedAt) / 1000} seconds.`);
        return 0;
    }
    catch (error) {
        if (error instanceof KnownError) {
            logger.logError(error.message);
        }
        else if (error instanceof Error) {
            logger.logException(error);
            logger.logError("Unexpected error. Review the log file for details.");
        }
        else {
            logger.logError(`Unexpected error: ${String(error)}`);
        }
        return 1;
    }
    finally {
        NodeJsUtility.stopCancellationListener();
    }
}

if (require.main === module) {
    void run().then((exitCode) => {
        process.exitCode = exitCode;
    });
}
