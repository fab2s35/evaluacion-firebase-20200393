import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Asegúrate de que esto esté si usas Storage
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from "@env";

// ✅ Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

console.log("Valor de configuración", firebaseConfig);

// ✅ Inicializar la app
const app = initializeApp(firebaseConfig);

// ✅ Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // opcional si lo necesitas

// ✅ Logs opcionales para debug
console.log("Firebase initialized:", !!app);
console.log("Firestore initialized:", !!db);
console.log("Auth initialized:", !!auth);
console.log("Storage initialized:", !!storage);

// ✅ Exportar servicios
export { auth, db, storage };
