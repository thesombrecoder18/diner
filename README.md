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

## Déploiement Vercel (multi-services)

`vercel.json` déclare deux services :

- **`app`** (racine, Vite) : le frontend.
- **`server`** (`server/`, Node.js 22) : l'API Express, exposée sur `/api/*` et `/uploads/*`.

Le frontend appelle `/api` sur le même domaine en production. Pour utiliser le backend,
définir dans les variables d'environnement du projet Vercel :

```bash
VITE_PERSISTENCE_MODE=api
DB_HOST=...      # MySQL accessible depuis Internet
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=dgi_diner
JWT_SECRET=...   # générer avec: node server/key.js
```

Sans ces variables, l'app reste en mode démo `local` (localStorage).
Note : sur Vercel, les fichiers uploadés sont écrits dans `/tmp` et ne sont pas persistants.
