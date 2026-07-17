# Politique de sécurité

## Données sensibles

Les Personal Access Tokens Azure DevOps sont des secrets. Ils doivent être fournis au programme par les variables d’environnement `AZDO_SOURCE_PAT` et `AZDO_TARGET_PAT`, jamais enregistrés dans un fichier suivi par Git.

Les fichiers exportés sous `output/` peuvent contenir des noms de champs, règles, états, listes de choix et autres informations internes. Ils sont exclus du dépôt par défaut.

## Signaler une vulnérabilité

N’ouvre pas d’issue publique contenant un secret, un jeton ou des données d’organisation. Utilise la fonctionnalité **Security advisories** du dépôt GitHub pour transmettre le rapport de façon privée.

Inclure dans le rapport : la version concernée, les étapes de reproduction, l’impact estimé et, si possible, une proposition de correction.
