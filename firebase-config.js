/* ═══════════════════════════════════════════════════════════════════
   MOURCHID ENTREPRISE — firebase-config.js
   Backend : Commandes, Paiements, Rendez-vous, Messages Contact
   
   ⚠️  ÉTAPES D'INSTALLATION (lire avant tout) :
   1. Aller sur https://console.firebase.google.com
   2. Créer un projet : "mourchid-entreprise"
   3. Activer Firestore Database (mode production)
   4. Activer Authentication (optionnel, pour admin)
   5. Remplacer les valeurs firebaseConfig ci-dessous
   6. Déployer avec : firebase deploy
═══════════════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── 🔧 CONFIGURATION — REMPLACER PAR VOS VRAIES VALEURS ── */
/* Trouvez-les dans : Console Firebase → Paramètres projet → Vos applications */
const firebaseConfig = {
  apiKey: "AIzaSyAWaAVvGcgubpCt8Jij8bfrWGJc6_5JDVM",
  authDomain: "mourchid-entreprise.firebaseapp.com",
  projectId: "mourchid-entreprise",
  storageBucket: "mourchid-entreprise.firebasestorage.app",
  messagingSenderId: "442503886264",
  appId: "1:442503886264:web:695501a30757c9424dcb4d"
};

/* ── INITIALISATION ── */
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ══════════════════════════════════════════════════════════════════
   📦 COMMANDES (panier → Firestore)
   Collection : "commandes"
   Appelé depuis app.js quand l'utilisateur valide le panier
══════════════════════════════════════════════════════════════════ */

/**
 * Sauvegarde une commande dans Firestore
 * @param {Array}  cartItems  - Tableau des articles [{name, price, qty}]
 * @param {string} method     - Méthode de paiement ("stripe"|"paypal"|"fedapay")
 * @param {Object} clientInfo - Infos client (optionnel si non connecté)
 * @returns {string}          - ID de la commande créée
 */
export async function saveOrder(cartItems, method, clientInfo = {}) {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const orderData = {
    /* Produits commandés */
    articles: cartItems.map(i => ({
      nom:      i.name,
      prix:     i.price,
      quantite: i.qty,
      sousTotal: i.price * i.qty
    })),

    /* Résumé financier */
    total,          // en FCFA
    devise: "FCFA",

    /* Paiement */
    modePaiement: method,
    statut: "en_attente",  // en_attente → payé → livré → annulé

    /* Client */
    client: {
      nom:       clientInfo.nom   || "Anonyme",
      email:     clientInfo.email || "",
      telephone: clientInfo.tel   || "",
    },

    /* Métadonnées */
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
    source:     "site_web",
  };

  try {
    const ref = await addDoc(collection(db, "commandes"), orderData);
    console.log("✅ Commande sauvegardée — ID :", ref.id);
    return ref.id;
  } catch (err) {
    console.error("❌ Erreur sauvegarde commande :", err);
    throw err;
  }
}

/* ══════════════════════════════════════════════════════════════════
   📅 RENDEZ-VOUS (formulaire RDV → Firestore)
   Collection : "rendez_vous"
══════════════════════════════════════════════════════════════════ */

/**
 * Sauvegarde une demande de RDV
 * @param {Object} formData - Données du formulaire #rdvForm
 */
export async function saveRDV(formData) {
  const rdvData = {
    nom:         formData.nom,
    email:       formData.email,
    telephone:   formData.tel,
    pole:        formData.pole,
    date:        formData.date,
    heure:       formData.heure,
    description: formData.description || "",
    statut:      "nouveau",          // nouveau → confirmé → terminé → annulé
    createdAt:   serverTimestamp(),
    source:      "site_web",
  };

  try {
    const ref = await addDoc(collection(db, "rendez_vous"), rdvData);
    console.log("✅ RDV sauvegardé — ID :", ref.id);
    return ref.id;
  } catch (err) {
    console.error("❌ Erreur sauvegarde RDV :", err);
    throw err;
  }
}

/* ══════════════════════════════════════════════════════════════════
   ✉️  MESSAGES CONTACT (formulaire → Firestore)
   Collection : "messages"
══════════════════════════════════════════════════════════════════ */

/**
 * Sauvegarde un message de contact
 * @param {Object} formData - Données du formulaire #contactForm
 */
export async function saveMessage(formData) {
  const msgData = {
    nom:       formData.nom,
    email:     formData.email,
    sujet:     formData.sujet || "(sans sujet)",
    message:   formData.message,
    lu:        false,             // false → true quand l'admin lit
    createdAt: serverTimestamp(),
    source:    "site_web",
  };

  try {
    const ref = await addDoc(collection(db, "messages"), msgData);
    console.log("✅ Message sauvegardé — ID :", ref.id);
    return ref.id;
  } catch (err) {
    console.error("❌ Erreur sauvegarde message :", err);
    throw err;
  }
}

/* ══════════════════════════════════════════════════════════════════
   💳 PAIEMENTS (enregistrement d'une transaction)
   Collection : "paiements"
   Appelé après confirmation FedaPay / Stripe / PayPal
══════════════════════════════════════════════════════════════════ */

/**
 * Enregistre un paiement reçu
 * @param {string} commandeId   - ID Firestore de la commande
 * @param {string} method       - "stripe"|"paypal"|"fedapay"
 * @param {string} transactionId- ID fourni par le processeur de paiement
 * @param {number} montant      - Montant en FCFA
 * @param {string} statut       - "réussi"|"échoué"|"en_attente"
 */
export async function savePaiement(commandeId, method, transactionId, montant, statut = "réussi") {
  const paiementData = {
    commandeId,
    methode:       method,
    transactionId, // ID Stripe / PayPal / FedaPay
    montant,
    devise:        "FCFA",
    statut,
    createdAt:     serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, "paiements"), paiementData);

    // Mettre à jour le statut de la commande liée
    await updateDoc(doc(db, "commandes", commandeId), {
      statut:    statut === "réussi" ? "payé" : "paiement_échoué",
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Paiement enregistré — ID :", ref.id);
    return ref.id;
  } catch (err) {
    console.error("❌ Erreur enregistrement paiement :", err);
    throw err;
  }
}

/* ══════════════════════════════════════════════════════════════════
   🔄 ÉCOUTE EN TEMPS RÉEL (pour le panneau admin)
   Exemple d'utilisation dans admin.js :
     listenToOrders(orders => renderAdminTable(orders));
══════════════════════════════════════════════════════════════════ */

/**
 * Écoute les nouvelles commandes en temps réel
 * @param {Function} callback - fn(commandes[]) appelée à chaque mise à jour
 */
export function listenToOrders(callback) {
  const q = query(collection(db, "commandes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

/**
 * Écoute les nouveaux RDV en temps réel
 */
export function listenToRDV(callback) {
  const q = query(collection(db, "rendez_vous"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snapshot => {
    const rdvs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rdvs);
  });
}

/**
 * Écoute les nouveaux messages en temps réel
 */
export function listenToMessages(callback) {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snapshot => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

/* ══════════════════════════════════════════════════════════════════
   🔌 CONNEXION AUX FORMULAIRES DU SITE
   Ces listeners remplacent / complètent ceux dans app.js
══════════════════════════════════════════════════════════════════ */

// Attendre le DOM
document.addEventListener("DOMContentLoaded", () => {

  /* ── Formulaire RDV ── */
  const rdvForm = document.getElementById("rdvForm");
  if (rdvForm) {
    rdvForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(rdvForm));
      try {
        await saveRDV(fd);
        if (window.showToast) showToast("📅 RDV confirmé ! Nous vous contactons sous 24h.");
        rdvForm.reset();
      } catch {
        if (window.showToast) showToast("❌ Erreur envoi. Contactez-nous directement.");
      }
    });
  }

  /* ── Formulaire Contact ── */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(contactForm));
      try {
        await saveMessage(fd);
        if (window.showToast) showToast("✉️ Message envoyé ! Réponse sous 24h.");
        contactForm.reset();
      } catch {
        if (window.showToast) showToast("❌ Erreur envoi. Réessayez ou appelez-nous.");
      }
    });
  }

  /* ── Bouton Checkout panier ── */
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      if (!window.cart || window.cart.length === 0) return;

      // Récupérer la méthode sélectionnée (si vous avez un formulaire admin)
      const method = "fedapay"; // valeur par défaut — à connecter à votre sélection paiement
      try {
        const orderId = await saveOrder(window.cart, method);
        console.log("Commande créée :", orderId);
        // Ici, redirigez vers FedaPay / Stripe avec l'orderId
      } catch {
        console.error("Impossible de sauvegarder la commande");
      }
    });
  }

});

/* ── EXPORT de l'instance db pour usage ailleurs ── */
export { db };
