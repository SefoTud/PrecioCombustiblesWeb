// 1. Traemos la configuración y las herramientas de Firebase
import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 2. Funciones de acceso con Correo
export async function entrarConCorreo() {
    if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Correo' });

    const email = document.getElementById('emailLogin').value.trim();
    const pass = document.getElementById('passLogin').value;
    if(!email || !pass) { alert("⚠️ Escribe tu correo y contraseña."); return; }
    try {
        const loading = document.getElementById('loading-overlay');
        if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Iniciando sesión..."; }
        await signInWithEmailAndPassword(auth, email, pass);
        if(loading) loading.style.display = "none";
        alert("✅ ¡Bienvenido de nuevo!");
    } catch(error) {
        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
        alert("❌ Error: " + error.code);
    }
}

export async function registrarConCorreo() {
    if (typeof gtag === 'function') gtag('event', 'sign_up', { 'metodo': 'Correo' });

    const email = document.getElementById('emailLogin').value.trim();
    const pass = document.getElementById('passLogin').value;
    if(!email || pass.length < 6) { alert("⚠️ Pon un correo válido y una contraseña de al menos 6 caracteres."); return; }
    try {
        const loading = document.getElementById('loading-overlay');
        if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Creando cuenta..."; }
        await createUserWithEmailAndPassword(auth, email, pass);
        if(loading) loading.style.display = "none";
        alert("✅ ¡Cuenta creada con éxito!");
    } catch(error) {
        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
        alert("❌ Error: " + error.code);
    }
}

export async function recuperarContrasena() {
    const email = document.getElementById('emailLogin').value.trim();
    if(!email) { alert("⚠️ Escribe tu correo electrónico arriba primero."); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("✉️ Correo enviado. Revisa tu bandeja.");
    } catch(error) {
        console.error("Error Firebase:", error);
        alert("❌ Error: " + error.message);
    }
}

// 3. Funciones de acceso con Google y Cerrar Sesión
export async function loginConGoogleUI() {
    if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Google' });

    if(!auth || !googleProvider) {
        window.mostrarToast("⏳ Conectando con el servidor, un segundo...");
        return;
    }
    try {
        document.getElementById("loading-overlay").style.display = "flex";
        document.getElementById("loading-text").innerText = "Iniciando sesión...";
        await signInWithPopup(auth, googleProvider);
        document.getElementById("loading-overlay").style.display = "none";
        window.mostrarToast("✅ ¡Bienvenido!");
    } catch (error) {
        document.getElementById("loading-overlay").style.display = "none";
        window.mostrarToast("❌ Error al iniciar sesión");
        console.error("Error Login:", error);
    }
}

export async function logoutUI() {
    let mensaje = "¿Seguro que quieres cerrar sesión?\n\n⚠️ Por privacidad, tus vehículos y gastos se ocultarán de este teléfono, pero seguirán a salvo en tu nube para cuando vuelvas a entrar.";
    
    if(confirm(mensaje)){
        try {
            // 1. Cerramos la conexión con Firebase
            await signOut(auth);
            
            // 2. PASAMOS LA ASPIRADORA: Borramos todo rastro del usuario en el móvil
            localStorage.removeItem('gasofa_cars');
            localStorage.removeItem('gasofa_bitacora');
            localStorage.removeItem('gasofa_taller');
            localStorage.removeItem('gasofaDesc');
            // Nota: No borramos el parking ni las preferencias de dark mode, eso es útil conservarlo
            
            alert("👋 Sesión cerrada correctamente.");
            
            // 3. Recargamos la página desde cero para limpiar la memoria viva
            location.reload();
            
        } catch (error) {
            console.error("Error Logout:", error);
        }
    }
}


// 4. Conectamos los botones de tu HTML
window.entrarConCorreo = entrarConCorreo;
window.registrarConCorreo = registrarConCorreo;
window.recuperarContrasena = recuperarContrasena;
window.loginConGoogleUI = loginConGoogleUI;
window.logoutUI = logoutUI;
