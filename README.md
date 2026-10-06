# DGI DINER

Application de vote Roi/Reine avec deux modes de persistance:

- **`local`** (par défaut): mode démonstration 100% localStorage, sans backend.
- **`api`**: mode backend existant (Express/MySQL), compatible avec le comportement historique.

## Lancer une démo locale (sans Supabase / sans backend)

```bash
npm install
npm run dev
```

Le mode local est actif par défaut (`VITE_PERSISTENCE_MODE=local`).

### Compte admin de démo

- utilisateur: `admin`
- mot de passe: `admin123`

Ces identifiants sont aussi affichés sur la page de connexion en mode local.

### Données de démo disponibles

- candidats Roi/Reine préchargés
- votes d’exemple préchargés
- session admin locale

### Remise à zéro des données localStorage

Depuis l’interface:

1. Se connecter en admin
2. Aller dans **Paramètres de Vote**
3. Utiliser **Réinitialiser toutes les données de démo**

Cela recrée les comptes, candidats et votes de démonstration.

## Basculer de mode

Créer un fichier `.env.local` (non commité) à la racine:

```bash
# local (défaut)
VITE_PERSISTENCE_MODE=local

# ou backend API existant
# VITE_PERSISTENCE_MODE=api
# VITE_API_URL=http://localhost:3001/api
```

En mode `api`, lancer aussi le serveur:

```bash
npm run dev:all
```

## Déploiement Vercel

Le projet se déploie comme un projet Vite unique (mode démo `local`, sans backend).
`vercel.json` ajoute seulement le rewrite SPA vers `index.html` pour react-router.

Le serveur Express (`server/`) n'est pas déployé sur Vercel : il nécessite MySQL.
Pour l'utiliser, lancer `npm run dev:all` en local avec `VITE_PERSISTENCE_MODE=api`.
