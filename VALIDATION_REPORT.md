# Rapport de validation

Date : 17 juillet 2026

## Environnement local

- Node.js : 22.16.0
- npm : 10.9.2
- TypeScript : 7.0.2
- `azure-devops-node-api` : 16.0.0

## Contrôles exécutés

### Installation reproductible

Une copie propre du dépôt, sans `node_modules/` ni `build/`, a été installée avec le `package-lock.json` public :

```bash
npm ci --offline --ignore-scripts
```

Résultat : 34 paquets installés, 35 paquets audités, 0 vulnérabilité signalée.

### Compilation et tests

```bash
npm test
```

Résultat :

- 13 tests exécutés ;
- 13 tests réussis ;
- 0 échec ;
- 0 test ignoré.

Les tests couvrent :

- le parseur de commandes ;
- l’aide CLI ;
- la lecture des PAT par variables d’environnement ;
- la validation des URL HTTPS et options booléennes ;
- les chemins multiplateformes ;
- la génération d’identifiants ;
- l’écriture JSON ;
- l’adaptateur de compatibilité avec le SDK Azure DevOps 16.

### Vérification du package npm

```bash
npm run check
```

Résultat : compilation, tests et `npm pack --dry-run` réussis. Le package simulé contient 47 fichiers pour environ 37,6 Ko compressés.

Le package réel a ensuite été installé dans un préfixe temporaire. Les commandes suivantes ont fonctionné :

```bash
azdo-process-migrator --version
azdo-process-migrator --help
```

### Contrôle Git

Un dépôt Git temporaire a été créé et tous les fichiers ont été indexés. Les éléments suivants ne sont pas suivis :

- `configuration.json` ;
- `.env` ;
- `output/` ;
- `node_modules/` ;
- `build/`.

Aucune URL du registre npm interne de l’environnement de génération ne subsiste dans `package-lock.json`.

## Limite de validation

Aucun appel réel n’a été effectué vers Azure DevOps. L’export, l’import et la migration doivent être testés dans des organisations Azure DevOps dédiées avant un usage en production.
