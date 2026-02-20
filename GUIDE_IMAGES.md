# 📸 GUIDE D'AJOUT D'IMAGES — Mourchid Entreprise

## 📁 Structure des dossiers à respecter

Tous vos fichiers doivent être organisés comme suit :

```
votre-site/
├── index.html
├── style.css
├── app.js
├── logo.png          ← déjà en place
└── images/           ← CRÉER ce dossier, y mettre vos photos
    │
    ├── ── SECTION "NOS PÔLES D'EXPERTISE" ──
    ├── pole-tech.jpg          (Photo : ordinateur, réseau, cybersécurité)
    ├── pole-energie.jpg       (Photo : panneaux solaires, digesteur biogaz)
    ├── pole-agri.jpg          (Photo : champ, culture, ferme aquacole)
    ├── pole-conseil.jpg       (Photo : réunion, formation, tableau)
    │
    ├── ── SECTION "BOUTIQUE & SERVICES" ──
    ├── produit-audit.jpg      (Photo ou visuel : audit sécurité)
    ├── produit-solaire.jpg    (Photo : kit solaire, panneau)
    ├── produit-maintenance.jpg (Photo : technicien, ordinateur ouvert)
    ├── produit-bassin.jpg     (Photo : bassin piscicole, poissons)
    ├── produit-formation.jpg  (Photo : formation, salle, apprenant)
    ├── produit-biogaz.jpg     (Photo : digesteur, installation biogaz)
    │
    ├── ── SECTION "RÉALISATIONS / PROJETS PHARES" ──
    ├── projet-cybersec.jpg    (Photo d'un projet réel de cybersécurité)
    ├── projet-solaire.jpg     (Photo d'une installation solaire réelle)
    ├── projet-agriculture.jpg (Photo d'une ferme ou culture réalisée)
    ├── projet-biogaz.jpg      (Photo d'un digesteur installé)
    ├── projet-pisciculture.jpg (Photo d'un bassin ou ferme piscicole)
    │
    └── ── SECTION "TÉMOIGNAGES" ──
        ├── client-1.jpg       (Photo de Adeola Koffi — si disponible)
        ├── client-2.jpg       (Photo de Fatou Mensah — si disponible)
        └── client-3.jpg       (Photo de Pierre Dossou — si disponible)
```

---

## ✅ Règles pour les images

| Section        | Taille recommandée | Format       | Conseil                              |
|----------------|--------------------|--------------|--------------------------------------|
| Pôles          | 800 × 500 px       | JPG ou WebP  | Paysage, bien éclairé                |
| Produits       | 800 × 600 px       | JPG ou WebP  | Fond neutre ou contexte réel         |
| Projets phares | 1200 × 800 px      | JPG ou WebP  | Vraies photos terrain de préférence  |
| Clients        | 300 × 300 px       | JPG ou WebP  | Portrait carré, visage centré        |

---

## 🔄 Fonctionnement automatique (Fallback)

Si une image est **absente ou introuvable**, le site affiche automatiquement une icône colorée à la place. Votre site ne cassera jamais visuellement.

---

## 🛠️ Comment ajouter une image

1. Créez le dossier `images/` au même niveau que `index.html`
2. Copiez-y vos photos en respectant exactement les noms ci-dessus
3. Ouvrez `index.html` dans votre navigateur → vos images apparaissent

> Pour changer un nom d'image, cherchez dans `index.html` le commentaire `📁 images/nom.jpg` et modifiez le `src` de la balise `<img>` correspondante.

---

## 💡 Outils gratuits recommandés

- **Redimensionner** vos photos : [squoosh.app](https://squoosh.app)
- **Compresser** sans perte de qualité : [tinypng.com](https://tinypng.com)
- **Convertir en WebP** (plus rapide) : [cloudconvert.com](https://cloudconvert.com)
