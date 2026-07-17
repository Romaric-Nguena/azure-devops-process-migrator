# Azure DevOps Process Migrator CLI

CLI Node.js/TypeScript permettant d’exporter, d’importer et de migrer des **processus hérités Azure DevOps** entre plusieurs organisations.

> Ce projet est une modernisation du projet open source Microsoft [`process-migrator`](https://github.com/microsoft/process-migrator), distribué sous licence MIT. Il conserve le moteur de migration historique et ajoute une couche de compatibilité avec le SDK Azure DevOps actuel, des tests, une CI et une gestion plus sûre des secrets.

## Fonctionnalités

- Export d’un processus hérité vers un fichier JSON.
- Import d’un fichier de processus dans une organisation cible.
- Migration directe de la source vers la cible.
- Migration des types d’éléments de travail, champs, formulaires, états, règles, comportements et listes de choix.
- PAT fournis par variables d’environnement plutôt que stockés dans Git.
- Chemins compatibles Windows, Linux et macOS.
- Tests automatisés hors connexion.
- CI GitHub Actions sur Node.js 20, 22 et 24.
- Dependabot pour les dépendances npm et GitHub Actions.

## Limites

- Seuls les **Inherited Processes** sont pris en charge.
- Les processus XML hébergés ne sont pas pris en charge.
- Une extension utilisée par un formulaire source doit aussi exister dans l’organisation cible, sauf si `skipImportFormContributions` est activé.
- Les identités utilisées dans certaines règles ou valeurs par défaut doivent exister dans l’organisation cible.
- Les tests du dépôt ne contactent pas Azure DevOps. Une migration réelle doit être validée dans deux organisations de test avant utilisation en production.

## Prérequis

- Node.js 20 ou supérieur.
- npm.
- Un PAT pour chaque organisation concernée, avec les permissions Azure DevOps nécessaires pour lire et administrer les processus et les éléments de travail.
- Un processus source de type hérité.

## Installation depuis le code source

```bash
npm ci
npm run build
npm link
```

Deux commandes deviennent disponibles :

```bash
azdo-process-migrator --help
process-migrator --help
```

Sans installation globale :

```bash
node build/nodejs/Main.js --help
```

## Configuration

Copier le fichier d’exemple :

```bash
cp configuration.example.jsonc configuration.json
```

Sous PowerShell :

```powershell
Copy-Item configuration.example.jsonc configuration.json
```

Modifier uniquement les URL, les noms de processus et les options. Ne pas ajouter de PAT dans ce fichier.

### Secrets

macOS/Linux :

```bash
export AZDO_SOURCE_PAT="votre-pat-source"
export AZDO_TARGET_PAT="votre-pat-cible"
```

PowerShell :

```powershell
$env:AZDO_SOURCE_PAT = "votre-pat-source"
$env:AZDO_TARGET_PAT = "votre-pat-cible"
```

Les paramètres `--source-token` et `--target-token` restent disponibles, mais ils sont déconseillés, car les arguments peuvent apparaître dans l’historique du terminal ou dans la liste des processus.

## Utilisation

### Exporter un processus

Seul `AZDO_SOURCE_PAT` est nécessaire :

```bash
azdo-process-migrator --mode export --config configuration.json
```

Le fichier est créé par défaut dans `output/process.json`.

### Importer un export

Seul `AZDO_TARGET_PAT` est nécessaire :

```bash
azdo-process-migrator --mode import --config configuration.json
```

### Migrer directement

Les deux PAT sont nécessaires :

```bash
azdo-process-migrator --mode migrate --config configuration.json
```

Le mode `migrate` est utilisé par défaut :

```bash
azdo-process-migrator --config configuration.json
```

## Options CLI

```text
-m, --mode <migrate|export|import>  Mode d’exécution
-c, --config <path>                 Fichier JSONC de configuration
-s, --source-token <token>          PAT source, variable d’environnement recommandée
-t, --target-token <token>          PAT cible, variable d’environnement recommandée
-h, --help                          Affiche l’aide
-v, --version                       Affiche la version
```

## Options de configuration

| Option | Description |
|---|---|
| `processFilename` | Fichier JSON d’export ou d’import. |
| `logFilename` | Fichier de journal. |
| `logLevel` | `error`, `warning`, `information` ou `verbose`. |
| `overwritePicklist` | Remplace une liste de choix existante si nécessaire. |
| `continueOnRuleImportFailure` | Continue lorsqu’une règle ne peut pas être importée. |
| `continueOnIdentityDefaultValueFailure` | Continue si une valeur d’identité par défaut échoue. |
| `skipImportFormContributions` | Ignore les contributions de formulaires provenant d’extensions. |

## Développement et tests

```bash
npm ci
npm test
npm run check
```

`npm run check` effectue :

1. la compilation TypeScript ;
2. les tests Node.js ;
3. une simulation de création du package npm.

Les tests couvrent notamment le parseur CLI, la validation de configuration, les chemins multiplateformes, l’écriture de fichiers et l’adaptateur de compatibilité du SDK Azure DevOps.

## Publication sur GitHub

Le guide détaillé se trouve dans [`CODEX_GITHUB_GUIDE.md`](CODEX_GITHUB_GUIDE.md).

Avant le premier push, remplacer dans `package.json` :

- `YOUR_GITHUB_USERNAME` ;
- `YOUR NAME`.

Ne jamais ajouter au dépôt :

- `configuration.json` ;
- `.env` ;
- un PAT Azure DevOps ;
- le dossier `output/` ;
- des journaux ou exports contenant des données métier.

## Sécurité

Consulter [`SECURITY.md`](SECURITY.md). Si un PAT a déjà été copié dans une archive, un commit ou un message, le révoquer immédiatement et en créer un nouveau.

## Licence et attribution

Licence MIT. Le fichier [`LICENSE`](LICENSE) conserve la licence du projet d’origine Microsoft. Les changements de cette version sont décrits dans [`CHANGELOG.md`](CHANGELOG.md).
