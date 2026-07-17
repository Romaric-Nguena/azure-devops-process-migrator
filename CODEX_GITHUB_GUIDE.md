# Publier ce projet sur GitHub avec Codex

Ce guide utilise Codex CLI pour contrôler le dépôt local, exécuter les tests, relire les changements et lancer les commandes Git/GitHub. Les opérations de publication restent visibles et doivent être approuvées.

## 1. Préparer les outils

Installer Git, Node.js et GitHub CLI (`gh`), puis se connecter à GitHub :

```bash
gh auth login
gh auth status
```

Installer Codex CLI :

```bash
npm install -g @openai/codex
```

Lancer la connexion :

```bash
codex login
```

Vérifier la session :

```bash
codex login status
```

## 2. Ouvrir le projet dans Codex

```bash
cd azure-devops-process-migrator
codex
```

Codex lit automatiquement le fichier `AGENTS.md`, qui contient les règles de test et de sécurité du dépôt.

Dans Codex, commencer par :

```text
Analyse ce dépôt. Vérifie qu’aucun PAT, secret, fichier configuration.json, fichier .env ou contenu du dossier output n’est suivi par Git. Exécute npm ci puis npm run check. Ne modifie rien avant de me présenter les risques détectés.
```

Examiner les résultats et les commandes proposées.

## 3. Demander la préparation du dépôt

Après avoir remplacé les valeurs `YOUR_GITHUB_USERNAME` et `YOUR NAME` dans `package.json`, utiliser ce prompt :

```text
Prépare ce projet pour une première publication GitHub.

Contraintes :
- conserve la licence et l’attribution Microsoft ;
- ne publie aucun secret ou export Azure DevOps ;
- vérifie .gitignore ;
- exécute npm run check ;
- affiche git status et git diff --check ;
- crée un dépôt Git propre sur la branche main si nécessaire ;
- prépare un commit nommé "Initial secure release" ;
- ne pousse rien avant de me montrer le résumé final et de demander mon approbation.
```

Codex peut modifier les fichiers et lancer les tests dans le dossier sélectionné. Utiliser `/review` avant le commit pour demander une relecture des changements non validés.

## 4. Créer et publier le dépôt

Une fois le résumé vérifié, demander à Codex :

```text
Crée sur mon compte GitHub un dépôt public nommé azure-devops-process-migrator, avec la description du README. Ne crée pas automatiquement un nouveau README, .gitignore ou LICENSE sur GitHub. Ajoute le remote origin, pousse la branche main, puis affiche l’URL du dépôt et l’état de la CI.
```

Codex exécutera normalement une séquence équivalente à :

```bash
git init
git branch -M main
git add .
git commit -m "Initial secure release"
gh repo create azure-devops-process-migrator \
  --public \
  --source=. \
  --remote=origin \
  --description "Secure Node.js/TypeScript CLI to export, import and migrate inherited Azure DevOps processes between organizations." \
  --push
```

Pour un dépôt privé, remplacer `--public` par `--private`.

## 5. Vérifier la publication

```bash
gh repo view --web
gh run list --limit 5
git status
```

Dans GitHub :

1. vérifier que la CI est verte ;
2. activer Secret scanning et Push protection si ces fonctions sont disponibles ;
3. vérifier que Dependabot est actif ;
4. ajouter les topics du dépôt ;
5. protéger la branche `main` si plusieurs personnes contribuent.

Topics conseillés :

```text
azure-devops azure-boards nodejs typescript cli process-migration inherited-process work-items
```

## 6. Utiliser Codex pour les futures pull requests

Créer une branche :

```bash
git switch -c fix/nom-du-correctif
codex
```

Prompt conseillé :

```text
Corrige le problème décrit. Respecte AGENTS.md, ajoute les tests nécessaires, exécute npm run check et prépare une pull request. Ne pousse rien avant ma validation du diff.
```

Après validation :

```bash
git push -u origin HEAD
gh pr create --fill
```

Si Codex Code Review est activé pour le dépôt, commenter dans la pull request :

```text
@codex review
```

## Attention

- Ne donner aucun PAT Azure DevOps à Codex dans un prompt ou un fichier suivi par Git.
- Ne pas utiliser les options qui contournent toutes les validations et le bac à sable pour un dépôt contenant des secrets.
- Examiner chaque `git diff`, commande `git push`, création de dépôt et modification de permissions avant approbation.
