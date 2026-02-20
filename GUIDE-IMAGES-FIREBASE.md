# 📘 GUIDE COMPLET — Mourchid Entreprise
## Images locales + Backend Firebase

---

## 🗂️ PARTIE 1 — STRUCTURE DES DOSSIERS D'IMAGES

Crée ces dossiers **à côté de ton `index.html`** :

```
mourchid-entreprise/
│
├── index.html          ← fichier modifié (fourni)
├── style.css
├── app.js
├── firebase-config.js  ← fichier fourni
├── LOGO.png
│
└── images/             ← ✅ crée ce dossier
    ├── hero/           ← Fonds du slider principal
    │   ├── hero-cybersecurity.jpg   (1920×1080 recommandé)
    │   ├── hero-solar.jpg
    │   ├── hero-agriculture.jpg
    │   └── hero-fish.jpg
    │
    ├── poles/          ← Photos des 4 pôles d'expertise
    │   ├── tech.jpg           (800×400 recommandé)
    │   ├── energie.jpg
    │   ├── agriculture.jpg
    │   └── conseil.jpg
    │
    ├── produits/       ← Photos des produits en boutique
    │   ├── audit-securite.jpg       (600×400 recommandé)
    │   ├── kit-solaire.jpg
    │   ├── maintenance-info.jpg
    │   ├── bassin-piscicole.jpg
    │   ├── formation-cyber.jpg
    │   └── biogaz-digesteur.jpg
    │
    ├── projets/        ← Photos des réalisations (portfolio)
    │   ├── projet-cybersec.jpg      (800×500 recommandé)
    │   ├── projet-solaire.jpg
    │   ├── projet-maraicher.jpg
    │   ├── projet-biogaz.jpg
    │   └── projet-pisciculture.jpg
    │
    └── temoignages/    ← Photos des clients (optionnel)
        ├── adeola-koffi.jpg         (200×200 — visage)
        ├── fatou-mensah.jpg
        └── pierre-dossou.jpg
```

---

## 🖼️ COMMENT LE FALLBACK FONCTIONNE

Si une image est **absente ou manquante**, l'icône Font Awesome s'affiche automatiquement :

```html
<img src="images/produits/kit-solaire.jpg"
     onerror="this.style.display='none'"
     onload="this.classList.add('loaded')">
<div class="img-fallback"><i class="fa-solid fa-solar-panel"></i></div>
```

✅ Ton site ne "cassera" **jamais** à cause d'une image manquante.

---

## 📷 OÙ TROUVER DES IMAGES GRATUITES

| Site | Type d'images | Utilisation |
|------|--------------|-------------|
| [Unsplash.com](https://unsplash.com) | Photos HD libres | Gratuit sans attribution |
| [Pexels.com](https://pexels.com) | Photos/vidéos | Gratuit |
| [Pixabay.com](https://pixabay.com) | Photos + illustrations | Gratuit |
| [Freepik.com](https://freepik.com) | Visuels pro | Gratuit avec attribution |

**Mots-clés recommandés :**
- `cybersecurity network africa` (pôle tech)
- `solar panel installation benin` (énergie)
- `fish farming pond africa` (pisciculture)
- `hydroponic farm vegetables` (agriculture)
- `biogas digester rural` (biogaz)
- `business meeting training africa` (conseil)

---

## 🔥 PARTIE 2 — FIREBASE : INSTALLATION ÉTAPE PAR ÉTAPE

### Étape 1 — Créer le projet Firebase

1. Va sur → **https://console.firebase.google.com**
2. Clique **"Ajouter un projet"**
3. Nom : `mourchid-entreprise`
4. Désactive Google Analytics (optionnel)
5. Clique **Créer le projet**

---

### Étape 2 — Activer Firestore Database

1. Dans le menu gauche → **Firestore Database**
2. Clique **Créer une base de données**
3. Choisis **Mode production**
4. Région : `europe-west1` (le plus proche du Bénin)
5. Valide

**Règles de sécurité Firestore** (colle dans l'onglet "Règles") :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Tout le monde peut créer (formulaires publics)
    match /commandes/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null; // admin seulement
    }
    
    match /rendez_vous/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    match /messages/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    match /paiements/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

### Étape 3 — Récupérer ta configuration

1. Dans Firebase Console → ⚙️ **Paramètres du projet**
2. Descends jusqu'à **"Vos applications"**
3. Clique l'icône `</>`  (application Web)
4. Nom : `mourchid-site`
5. Copie le bloc `firebaseConfig` qui apparaît

Colle-le dans **firebase-config.js** en remplaçant :
```javascript
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",   // ← remplace ici
  authDomain:        "...",
  projectId:         "...",
  // etc.
};
```

---

### Étape 4 — Tester

Ouvre le site en local (via VS Code Live Server ou WAMP/XAMPP).

Remplis le formulaire RDV → vérifie dans **Firestore → rendez_vous** que le document apparaît.

---

## 📊 PARTIE 3 — VOIR LES DONNÉES (PANNEAU ADMIN)

### Option A — Console Firebase (gratuit, immédiat)

Va dans **Firestore Database → Données** dans la console Firebase.
Tu vois toutes les collections en temps réel.

### Option B — Créer une page admin dédiée

Crée un fichier `admin.html` dans ton projet :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Admin — Mourchid Entreprise</title>
  <script type="module">
    import { listenToOrders, listenToRDV, listenToMessages } 
      from './firebase-config.js';

    // Afficher les commandes en temps réel
    listenToOrders(orders => {
      const tbody = document.getElementById('orders-body');
      tbody.innerHTML = orders.map(o => `
        <tr>
          <td>${o.id.slice(0,8)}...</td>
          <td>${o.client?.nom}</td>
          <td>${o.total?.toLocaleString('fr-FR')} FCFA</td>
          <td>${o.statut}</td>
          <td>${o.modePaiement}</td>
          <td>${new Date(o.createdAt?.seconds*1000).toLocaleDateString('fr-FR')}</td>
        </tr>
      `).join('');
    });

    listenToRDV(rdvs => {
      document.getElementById('rdv-count').textContent = rdvs.length;
    });

    listenToMessages(msgs => {
      document.getElementById('msg-count').textContent = 
        msgs.filter(m => !m.lu).length;
    });
  </script>
</head>
<body>
  <h1>🏢 Admin — Mourchid Entreprise</h1>
  <p>RDV en attente : <strong id="rdv-count">0</strong></p>
  <p>Messages non lus : <strong id="msg-count">0</strong></p>
  
  <h2>Commandes</h2>
  <table border="1">
    <thead>
      <tr><th>ID</th><th>Client</th><th>Total</th><th>Statut</th><th>Paiement</th><th>Date</th></tr>
    </thead>
    <tbody id="orders-body"></tbody>
  </table>
</body>
</html>
```

> 💡 Pour sécuriser l'accès admin, active **Firebase Authentication** avec Email/Password.

---

## 💳 PARTIE 4 — INTÉGRER FEDAPAY (Mobile Money Bénin)

FedaPay est la solution de paiement Mobile Money locale (MTN, Moov, Orange).

### Installation

```html
<!-- Ajoute dans <head> de index.html -->
<script src="https://cdn.fedapay.com/checkout.js?v=1.1.7"></script>
```

### Code de paiement

Dans `app.js`, remplace la fonction `selectPayment('fedapay')` par :

```javascript
function payWithFedaPay(orderId, amount) {
  FedaPay.init({
    public_key: 'pk_live_VOTRE_CLE_PUBLIQUE',   // depuis dashboard.fedapay.com
    transaction: {
      amount:      amount,
      description: `Commande #${orderId} — Mourchid Entreprise`,
    },
    customer: {
      email: 'client@email.com',
    },
    onComplete: async function(object) {
      if (object.reason === FedaPay.DIALOG_DISMISSED) return;
      if (object.transaction.status === 'approved') {
        await savePaiement(orderId, 'fedapay', object.transaction.id, amount, 'réussi');
        showToast('✅ Paiement confirmé ! Merci pour votre commande.');
        cart = [];
        renderCart();
      }
    }
  }).open();
}
```

**Créer un compte FedaPay** → https://dashboard.fedapay.com/register
(entreprise béninoise, approbation ~48h)

---

## 📧 PARTIE 5 — RECEVOIR DES EMAILS (Notifications)

Pour recevoir un email à chaque commande/RDV, utilise **Firebase Extensions** :

1. Console Firebase → **Extensions**
2. Installe : **"Trigger Email from Firestore"**
3. Configure ton email SMTP (Gmail, SendGrid, etc.)
4. Chaque nouveau document dans `commandes` déclenchera un email automatique

---

## ✅ RÉCAPITULATIF — CHECKLIST

- [ ] Créer le dossier `images/` avec les sous-dossiers
- [ ] Ajouter les vraies photos dans chaque dossier
- [ ] Créer un projet Firebase sur console.firebase.google.com
- [ ] Activer Firestore Database
- [ ] Copier la config Firebase dans `firebase-config.js`
- [ ] Configurer les règles Firestore
- [ ] Tester les formulaires (RDV, Contact, Panier)
- [ ] Créer un compte FedaPay pour les paiements Mobile Money
- [ ] (Optionnel) Créer la page `admin.html`
- [ ] (Optionnel) Activer Firebase Auth pour sécuriser l'admin

---

## 🆘 SUPPORT

Des questions ? Toutes les collections Firestore apparaissent automatiquement dès la première soumission d'un formulaire — pas besoin de les créer manuellement.
