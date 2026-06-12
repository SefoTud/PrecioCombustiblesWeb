// Archivo: parking.js

export function openGarage() { 
    document.getElementById('garageModal').style.display = 'flex';
    actualizarUIResumenParking();
}

export function guardarParking() {
    const btn = document.getElementById('btnGuardarCoche');
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
        localStorage.setItem('gasofa_parking', JSON.stringify(coords));

        if(btn) {
            btn.innerText = "💾 Guardar Sitio"; 
            btn.disabled = false;
        }
        alert("✅ Ubicación guardada. ¡Ya puedes irte tranquilo!");
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
    try { coords = JSON.parse(localStorage.getItem('gasofa_parking')); } catch(e) {}

    if (coords && coords.lat && coords.lon) {
        // Enlace corregido para forzar navegación a pie
        const url = `http://maps.google.com/maps?daddr=${coords.lat},${coords.lon}&directionsmode=walking`;
        window.open(url, '_blank');
    } else {
        alert("⚠️ No he podido encontrar las coordenadas de tu parking.");
    }
}

export function borrarParking() {
    if (confirm("¿Seguro que quieres borrar la ubicación de tu coche?")) {
        localStorage.removeItem('gasofa_parking');
        actualizarUIResumenParking();
    }
}

export function actualizarUIResumenParking() {
    const coords = JSON.parse(localStorage.getItem('gasofa_parking'));
    const btnGuardar = document.getElementById('btnGuardarCoche');
    const divGuardado = document.getElementById('botonesCocheGuardado');
    const info = document.getElementById('infoParking');

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

// Conectamos las funciones a la ventana global para los botones de tu HTML
window.openGarage = openGarage;
window.guardarParking = guardarParking;
window.irAMiCoche = irAMiCoche;
window.borrarParking = borrarParking;
window.actualizarUIResumenParking = actualizarUIResumenParking;
