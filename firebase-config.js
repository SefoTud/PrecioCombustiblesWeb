// Archivo: firebase-config.js

// 1. Importamos las herramientas de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 2. Tus llaves de acceso a la base de datos
const firebaseConfig = {
    apiKey: "AIzaSyBRugyDzIlYo7kPW0url-rVBEhk1_EhVcs",
    authDomain: "precio-combustibles-b2160.firebaseapp.com",
    projectId: "precio-combustibles-b2160",
    storageBucket: "precio-combustibles-b2160.firebasestorage.app",
    messagingSenderId: "14102207330",
    appId: "1:14102207330:web:a55197dbc9f4f38cc2aa3b"
};

// 3. Encendemos Firebase
const app = initializeApp(firebaseConfig);

// 4. EXPORTAMOS estas variables para que app.js pueda usarlas
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// (Opcional) Si en tu app.js usabas window.auth = getAuth(app); 
// Mantenemos esto temporalmente para que nada se rompa en tu HTML
window.auth = auth;
window.db = db;
window.googleProvider = googleProvider;
