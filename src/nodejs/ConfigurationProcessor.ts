import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import minimist from "minimist";
import { parse as jsoncParse, printParseErrorCode } from "jsonc-parser";
import {
    defaultConfiguration,
    defaultConfigurationFilename,
    defaultEncoding,
    paramConfig,
    paramMode,
    paramSourceToken,
    paramTargetToken,
    sourceTokenEnvironmentVariable,
    targetTokenEnvironmentVariable
} from "../common/Constants";
import { ICommandLineOptions, IConfigurationFile, Modes } from "../common/Interfaces";
import { KnownError } from "../common/Errors";
import { Utility } from "../common/Utilities";

export const cliUsage = `Azure DevOps Process Migrator

Usage:
  azdo-process-migrator [options]

Options:
  -m, --mode <migrate|export|import>  Operation mode (default: migrate)
  -c, --config <path>                 JSONC configuration file (default: configuration.json)
  -s, --source-token <token>          Source PAT; prefer AZDO_SOURCE_PAT
  -t, --target-token <token>          Target PAT; prefer AZDO_TARGET_PAT
  -h, --help                          Show help
  -v, --version                       Show version

Security:
  Store PATs in AZDO_SOURCE_PAT and AZDO_TARGET_PAT rather than in a tracked file.
`;

export interface IParsedCommandLine {
    options?: ICommandLineOptions;
    showHelp?: boolean;
    showVersion?: boolean;
}

export function parseCommandLine(argv: string[] = process.argv.slice(2)): IParsedCommandLine {
    const parsedArgs = minimist(argv, {
        string: ["mode", "config", "source-token", "target-token"],
        boolean: ["help", "version"],
        alias: {
            help: "h",
            version: "v",
            mode: "m",
            config: "c",
            "source-token": "s",
            "target-token": "t"
        },
        default: {
            mode: "migrate",
            config: normalize(defaultConfigurationFilename)
        },
        unknown: (argument) => {
            if (argument.startsWith("-")) {
                throw new KnownError(`Unknown command-line option '${argument}'.`);
            }
            return true;
        }
    });

    if (parsedArgs.help) {
        return { showHelp: true };
    }
    if (parsedArgs.version) {
        return { showVersion: true };
    }

    const modeName = String(parsedArgs.mode).toLowerCase();
    const mode = modeName === "export"
        ? Modes.export
        : modeName === "import"
            ? Modes.import
            : modeName === "migrate"
                ? Modes.migrate
                : undefined;

    if (mode === undefined) {
        throw new KnownError("Invalid mode. Allowed values are 'import', 'export' and 'migrate'.");
    }

    return {
        options: {
            mode,
            overwriteProcessOnTarget: false,
            config: String(parsedArgs.config),
            sourceToken: parsedArgs["source-token"] || parsedArgs.sourceToken,
            targetToken: parsedArgs["target-token"] || parsedArgs.targetToken
        }
    };
}

// Backward-compatible export for consumers of the original project.
export function ProcesCommandLine(): ICommandLineOptions {
    const parsed = parseCommandLine();
    if (!parsed.options) {
        throw new KnownError("Help or version output must be handled before reading command options.");
    }
    return parsed.options;
}

export async function ProcessConfigurationFile(commandLineOptions: ICommandLineOptions): Promise<IConfigurationFile> {
    const configFile = commandLineOptions.config;
    if (!existsSync(configFile)) {
        const defaultFile = normalize(defaultConfigurationFilename);
        if (!existsSync(defaultFile)) {
            writeFileSync(defaultFile, defaultConfiguration, { encoding: defaultEncoding, flag: "wx" });
        }
        throw new KnownError(
            `Cannot find configuration file '${configFile}'. A safe example was generated at '${defaultFile}'.`
        );
    }

    const parseErrors = [];
    const configuration = jsoncParse(
        readFileSync(configFile, defaultEncoding),
        parseErrors,
        { allowTrailingComma: true }
    ) as IConfigurationFile;

    if (parseErrors.length > 0 || !configuration || typeof configuration !== "object") {
        const details = parseErrors.map((error) => printParseErrorCode(error.error)).join(", ");
        throw new KnownError(`Invalid JSONC configuration in '${configFile}'${details ? `: ${details}` : ""}.`);
    }

    configuration.options = configuration.options || {};
    configuration.sourceAccountToken =
        commandLineOptions.sourceToken || process.env[sourceTokenEnvironmentVariable] || configuration.sourceAccountToken;
    configuration.targetAccountToken =
        commandLineOptions.targetToken || process.env[targetTokenEnvironmentVariable] || configuration.targetAccountToken;

    if (!Utility.validateConfiguration(configuration, commandLineOptions.mode)) {
        throw new KnownError("Configuration validation failed. Review the preceding validation messages.");
    }

    return configuration;
}
