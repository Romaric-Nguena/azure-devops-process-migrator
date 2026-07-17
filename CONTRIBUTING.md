# Contribuer

## Environnement

- Node.js 20, 22 ou 24
- npm

## Installation

```bash
npm ci
npm run build
npm test
```

## Avant une pull request

```bash
npm run check
git diff --check
```

La pull request doit expliquer le problème corrigé, les changements apportés et les tests exécutés. Aucun PAT Azure DevOps, fichier `.env`, fichier `configuration.json`, journal ou export du dossier `output/` ne doit être ajouté.

Les changements liés au SDK `azure-devops-node-api` doivent conserver ou adapter les tests de `ProcessApiAdapter`.
