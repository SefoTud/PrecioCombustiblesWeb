// Archivo: parking.js

import { q, STORAGE_KEYS } from './utils.js';

export function openGarage() { 
    q('garageModal').style.display = 'flex';
    actualizarUIResumenParking();
}

export function guardarParking() {
    const btn = q('btnGuardarCoche');
    if(btn) {
        btn.innerText = "⏳ Guardando..."; 
        btn.disabled = true; 
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const coords = { 
            lat: pos.coords.latitude, 
            lon: pos.coords.longitude, 
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        localStorage.setItem(STORAGE_KEYS.PARKING, JSON.stringify(coords));

        if(btn) {
            btn.innerText = "💾 Guardar Sitio"; 
            btn.disabled = false;
        }
        alert("✅ Ubicación guardada. ¡Ya puedes irte tranquilo!");
        if (typeof gtag === 'function') gtag('event', 'guardar_parking');
        actualizarUIResumenParking();
    }, () => {
        if(btn) {
            btn.innerText = "💾 Guardar Sitio";
            btn.disabled = false;
        }
        alert("❌ Error: Necesito el GPS para guardar el parking.");
    }, { enableHighAccuracy: true, timeout: 10000 });
}

export function irAMiCoche() {
    let coords = null;
    try { coords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARKING)); } catch(e) {}

    if (coords && coords.lat && coords.lon) {
        const url = `http://maps.google.com/maps?daddr=${coords.lat},${coords.lon}&directionsmode=walking`;
        if (typeof gtag === 'function') gtag('event', 'navegar_al_coche');
        window.open(url, '_blank');
    } else {
        alert("⚠️ No he podido encontrar las coordenadas de tu parking.");
    }
}

export async function borrarParking() {
    let seguro = await window.appConfirm("¿Seguro que quieres borrar la ubicación de tu coche?", "Borrar Parking", "🗑️");
    if (seguro) {
        localStorage.removeItem(STORAGE_KEYS.PARKING);
        actualizarUIResumenParking();
        if (typeof window.mostrarToast === 'function') window.mostrarToast("❌ Sitio liberado");
    }
}

export function actualizarUIResumenParking() {
    const coords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARKING));
    const btnGuardar = q('btnGuardarCoche');
    const divGuardado = q('botonesCocheGuardado');
    const info = q('infoParking');

    if (coords) {
        if (btnGuardar) btnGuardar.style.display = 'none'; 
        if (divGuardado) divGuardado.style.display = 'flex'; 
        if (info) info.innerText = `Aparcado a las ${coords.fecha}`;
    } else {
        if (btnGuardar) btnGuardar.style.display = 'block'; 
        if (divGuardado) divGuardado.style.display = 'none'; 
        if (info) info.innerText = `No hay ninguna ubicación guardada.`;
    }
}

window.openGarage = openGarage;
window.guardarParking = guardarParking;
window.irAMiCoche = irAMiCoche;
window.borrarParking = borrarParking;
window.actualizarUIResumenParking = actualizarUIResumenParking;