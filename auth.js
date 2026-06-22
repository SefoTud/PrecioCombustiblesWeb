// Archivo: auth.js

import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { q, STORAGE_KEYS } from './utils.js';

export async function entrarConCorreo() {
    if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Correo' });

    const email = q('emailLogin').value.trim();
    const pass = q('passLogin').value;
    if(!email || !pass) { alert("⚠️ Escribe tu correo y contraseña."); return; }
    try {
        const loading = q('loading-overlay');
        if(loading) { loading.style.display = "flex"; q('loading-text').innerText = "Iniciando sesión..."; }
        await signInWithEmailAndPassword(auth, email, pass);
        if(loading) loading.style.display = "none";
        alert("✅ ¡Bienvenido de nuevo!");
    } catch(error) {
        if(q('loading-overlay')) q('loading-overlay').style.display = "none";
        alert("❌ Error: " + error.code);
    }
}

export async function registrarConCorreo() {
    if (typeof gtag === 'function') gtag('event', 'sign_up', { 'metodo': 'Correo' });

    const email = q('emailLogin').value.trim();
    const pass = q('passLogin').value;
    if(!email || pass.length < 6) { alert("⚠️ Pon un correo válido y una contraseña de al menos 6 caracteres."); return; }
    try {
        const loading = q('loading-overlay');
        if(loading) { loading.style.display = "flex"; q('loading-text').innerText = "Creando cuenta..."; }
        await createUserWithEmailAndPassword(auth, email, pass);
        if(loading) loading.style.display = "none";
        alert("✅ ¡Cuenta creada con éxito!");
    } catch(error) {
        if(q('loading-overlay')) q('loading-overlay').style.display = "none";
        alert("❌ Error: " + error.code);
    }
}

export async function recuperarContrasena() {
    const email = q('emailLogin').value.trim();
    if(!email) { alert("⚠️ Escribe tu correo electrónico arriba primero."); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("✉️ Correo enviado. Revisa tu bandeja.");
    } catch(error) {
        console.error("Error Firebase:", error);
        alert("❌ Error: " + error.message);
    }
}

export async function loginConGoogleUI() {
    if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Google' });

    if(!auth || !googleProvider) {
        window.mostrarToast("⏳ Conectando con el servidor, un segundo...");
        return;
    }
    try {
        q("loading-overlay").style.display = "flex";
        q("loading-text").innerText = "Iniciando sesión...";
        await signInWithPopup(auth, googleProvider);
        q("loading-overlay").style.display = "none";
        window.mostrarToast("✅ ¡Bienvenido!");
    } catch (error) {
        q("loading-overlay").style.display = "none";
        window.mostrarToast("❌ Error al iniciar sesión");
        console.error("Error Login:", error);
    }
}

export async function logoutUI() {
    let mensaje = "⚠️ Por privacidad, tus vehículos y gastos se ocultarán de este teléfono, pero seguirán a salvo en tu nube para cuando vuelvas a entrar.";
    
    let seguro = await window.appConfirm(mensaje, "¿Cerrar Sesión?", "🚪");
    
    if(seguro){
        try {
            // 1. Limpiamos el localStorage PRIMERO para evitar problemas con los listeners de Firebase
            localStorage.removeItem(STORAGE_KEYS.CARS);
            localStorage.removeItem(STORAGE_KEYS.BITACORA);
            localStorage.removeItem(STORAGE_KEYS.TALLER);
            localStorage.removeItem(STORAGE_KEYS.DESC);
            localStorage.removeItem(STORAGE_KEYS.TOTAL_OPINIONES); // Aprovechamos para limpiar las reseñas de la sesión

            // 2. 🔥 ¡EL REMEDIO CRÍTICO! Forzamos a la barra a aparecer quitándole el 'collapsed'
            const barraControles = document.getElementById("controls");
            if (barraControles) {
                barraControles.classList.remove("collapsed");
            }
            
            // Cerramos los modales manualmente para que la interfaz responda al instante
            if (document.getElementById('misVehiculosModal')) {
                document.getElementById('misVehiculosModal').style.display = 'none';
            }
            // Si tienes un modal para el perfil general (ej: 'perfilModal'), ciérralo aquí también:
            // if (document.getElementById('perfilModal')) document.getElementById('perfilModal').style.display = 'none';

            // 3. Ahora sí, desconectamos al usuario de Firebase de forma segura
            await signOut(auth);
            
            alert("👋 Sesión cerrada correctamente. Volviendo al inicio...");
            
            // 4. Refresco ultra-compatible para entornos móviles y PWAs instaladas
            setTimeout(() => {
                // Redireccionar a la misma ruta limpia es infinitamente más fiable que location.reload() en móviles
                window.location.href = window.location.pathname; 
            }, 1000);
            
        } catch (error) {
            console.error("Error Logout:", error);
        }
    }
}


window.entrarConCorreo = entrarConCorreo;
window.registrarConCorreo = registrarConCorreo;
window.recuperarContrasena = recuperarContrasena;
window.loginConGoogleUI = loginConGoogleUI;
window.logoutUI = logoutUI;
