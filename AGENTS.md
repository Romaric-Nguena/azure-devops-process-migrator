# Repository instructions for Codex

## Goal
Maintain a secure, cross-platform Node.js CLI that exports, imports and migrates inherited Azure DevOps processes.

## Required checks
Before proposing or committing a change, run:

```bash
npm ci
npm run check
```

## Security rules
- Never commit Azure DevOps PATs, `.env`, `configuration.json`, logs, or files under `output/`.
- Keep `configuration.example.jsonc` free of credentials.
- Do not print PAT values in logs or error messages.
- Treat exported process JSON as potentially confidential.

## Compatibility rules
- Support Node.js 20, 22 and 24.
- Preserve both CLI command names: `azdo-process-migrator` and `process-migrator`.
- Keep the compatibility adapter when updating `azure-devops-node-api`; add or update adapter tests for renamed SDK methods.
- Do not claim a live Azure DevOps migration is validated unless an integration test was actually run with dedicated test organizations.

## Review guidelines
- Flag any secret exposure as a highest-priority issue.
- Verify Linux and Windows path handling.
- Verify configuration validation and non-zero exit codes on failures.
- Require tests for changes to CLI parsing, API model mapping, or file output.
