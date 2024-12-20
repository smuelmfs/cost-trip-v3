import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp;
let db: Firestore;

try {
  // Inicializar o Firebase apenas se ainda não estiver inicializado
  if (!getApps().length) {
    console.log("Inicializando o Firebase...");
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
    console.log("Firebase inicializado com sucesso.");
  } else {
    console.log("Firebase já inicializado, utilizando a instância existente.");
    app = getApp();
  }

  // Configuração do Firestore
  if (app) {
    console.log("Configurando o Firestore...");
    db = getFirestore(app);
    console.log("Firestore configurado com sucesso.");
  } else {
    throw new Error("Falha ao inicializar o Firebase App antes de configurar o Firestore.");
  }
} catch (err) {
  console.error("Erro ao inicializar o Firebase ou configurar o Firestore:", err);
  throw err; // Rethrow para lidar com o erro na chamada
}

export default db;
