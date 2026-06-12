// Archivo: taller.js

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const q = id => document.getElementById(id);

// Pequeñas herramientas de fecha necesarias para el taller
function getHoyYMD() {
    const d = new Date();
    let mes = '' + (d.getMonth() + 1), dia = '' + d.getDate(), anio = d.getFullYear();
    if (mes.length < 2) mes = '0' + mes; if (dia.length < 2) dia = '0' + dia;
    return [anio, mes, dia].join('-');
}
function esToYMD(esDate) {
    if (!esDate) return getHoyYMD();
    let partes = esDate.split('/'); if (partes.length !== 3) return getHoyYMD();
    let dia = partes[0].padStart(2, '0'), mes = partes[1].padStart(2, '0'), anio = partes[2];
    return `${anio}-${mes}-${dia}`;
}
function ymdToEs(ymdDate) {
    if (!ymdDate) return new Date().toLocaleDateString('es-ES');
    let partes = ymdDate.split('-'); if (partes.length !== 3) return new Date().toLocaleDateString('es-ES');
    return `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
}

export function comprimirImagenBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
                let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6)); 
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

export function abrirTaller() {
    // Leemos los coches directamente de la memoria local
    let myCarsTaller = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let carSelect = q('tallerCarSelect');
    carSelect.innerHTML = '<option value="">🚘 Selecciona el vehículo...</option>';
    myCarsTaller.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
    
    let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
    if (activeCar) carSelect.value = activeCar;

    q('tallerFecha').value = getHoyYMD(); q('editTallerId').value = "";
    q('tallerKm').value = ""; q('tallerCoste').value = ""; q('tallerNotas').value = "";
    if(q('tallerFactura')) q('tallerFactura').value = ""; 
    if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional"; 
    if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸"; 

    q('tallerModal').style.display = 'flex';
}

export async function guardarTaller() {
    if (typeof gtag === 'function') {
        let tipoParaChivato = q('tallerTipo') ? q('tallerTipo').value : 'Desconocido';
        let tieneFoto = (q('tallerFactura') && q('tallerFactura').files.length > 0) ? 'Sí' : 'No';
        gtag('event', 'guardar_gasto_taller', { 'tipo_reparacion': tipoParaChivato, 'sube_factura': tieneFoto });
    }

    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let myCarsTaller = JSON.parse(localStorage.getItem('gasofa_cars')) || [];

    let idEdit = q('editTallerId').value;
    let carId = q('tallerCarSelect').value;
    let fecha = q('tallerFecha').value;
    let km = parseFloat(q('tallerKm').value) || 0;
    let tipo = q('tallerTipo').value;
    let coste = parseFloat(q('tallerCoste').value);
    let notas = q('tallerNotas').value.trim();

    if (!carId || isNaN(coste)) { alert("⚠️ Selecciona un vehículo y escribe el coste."); return; }
    
    if (!window.auth || !window.auth.currentUser) {
        alert("⚠️ Inicia sesión en 'Mi Perfil' para poder guardar gastos en la nube.");
        return;
    }

    let foundCar = myCarsTaller.find(c => String(c.id) === String(carId));
    let carName = foundCar ? foundCar.name : "Vehículo";
    let fechaEs = ymdToEs(fecha);

    let miNombre = "Conductor";
    if (window.auth && window.auth.currentUser && window.auth.currentUser.displayName) {
        miNombre = window.auth.currentUser.displayName.split(" ")[0];
    }

    let fotoBase64 = "";
    if (idEdit !== "") { 
        let oldRecord = mantLocal.find(m => String(m.id) === String(idEdit));
        if (oldRecord && oldRecord.factura) fotoBase64 = oldRecord.factura;
    }

    const fileInput = q('tallerFactura');
    if (fileInput && fileInput.files.length > 0) {
        try {
            const loading = document.getElementById('loading-overlay');
            if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Comprimiendo factura..."; }
            fotoBase64 = await comprimirImagenBase64(fileInput.files[0]);
            if(loading) loading.style.display = "none";
        } catch(err) {
            if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
            alert("❌ Error al leer la imagen de tu móvil."); return;
        }
    }

    if (idEdit !== "") {
        let index = mantLocal.findIndex(m => String(m.id) === String(idEdit));
        if (index > -1) mantLocal[index] = { id: parseInt(idEdit), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoBase64, usuario: miNombre };
    } else {
        mantLocal.push({ id: Date.now(), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoBase64, usuario: miNombre });
    }

    mantLocal.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
    localStorage.setItem('gasofa_taller', JSON.stringify(mantLocal));

    if (window.auth && window.auth.currentUser) {
        let sizeStr = JSON.stringify(mantLocal).length;
        if (sizeStr > 800000) alert("⚠️ Pronto llegarás al límite de espacio de tu historial. Considera borrar facturas muy antiguas.");
        window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miTaller: mantLocal }, { merge: true });

        if (carId) {
            let cocheActual = myCarsTaller.find(c => String(c.id) === String(carId));
            if (cocheActual && cocheActual.compartido) {
                let tallerEsteCoche = mantLocal.filter(m => String(m.carId) === String(carId));
                window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), { taller: tallerEsteCoche }, { merge: true });
            }
        }
    }

    q('editTallerId').value = ""; q('tallerCoste').value = ""; q('tallerNotas').value = "";
    if(q('tallerFactura')) q('tallerFactura').value = "";
    if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional";
    if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸";
    
    if(q('historialModal') && q('historialModal').style.display === 'flex') {
        if(typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
    }
    q('tallerModal').style.display = 'none';
}

export function editarTaller(id, desdeHistorial = false) {
    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let record = mantLocal.find(m => String(m.id) === String(id));
    if (record) {
        if (desdeHistorial) q('historialModal').style.display = 'none';
        else q('tallerModal').style.display = 'none';

        q('editTallerId').value = id;
        
        let myCarsTaller = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
        let carSelect = q('tallerCarSelect');
        carSelect.innerHTML = '<option value="">🚘 Selecciona el vehículo...</option>';
        myCarsTaller.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
        
        q('tallerCarSelect').value = record.carId; q('tallerFecha').value = esToYMD(record.fecha);
        q('tallerKm').value = record.km || ""; q('tallerTipo').value = record.tipo;
        q('tallerCoste').value = record.coste; q('tallerNotas').value = record.notas || "";
        if(q('tallerFactura')) q('tallerFactura').value = ""; 
        if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional";
        if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸";

        q('tallerModal').style.display = 'flex';
    }
}

export function borrarTaller(id, desdeHistorial = false) {
    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let registro = mantLocal.find(m => String(m.id) === String(id));
    let myCarsTaller = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    
    if (registro) {
        let cocheGasto = myCarsTaller.find(c => String(c.id) === String(registro.carId));
        if (cocheGasto && cocheGasto.compartido && cocheGasto.name.startsWith("🤝 ")) {
            alert("⚠️ Solo el administrador (creador) del vehículo puede borrar este gasto de taller.");
            return;
        }
    }

    if (confirm("¿Borrar este gasto de taller?")) {
        let carIdDelGasto = registro?.carId;
        mantLocal = mantLocal.filter(m => String(m.id) !== String(id));
        localStorage.setItem('gasofa_taller', JSON.stringify(mantLocal));
        
        if (window.auth && window.auth.currentUser) {
            window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miTaller: mantLocal }, { merge: true });
            
            if (carIdDelGasto) {
                let cocheActual = myCarsTaller.find(c => String(c.id) === String(carIdDelGasto));
                if (cocheActual && cocheActual.compartido) {
                    let tallerEsteCoche = mantLocal.filter(m => String(m.carId) === String(carIdDelGasto));
                    window.setDoc(window.doc(window.db, "gastos_compartidos", String(carIdDelGasto)), { taller: tallerEsteCoche }, { merge: true });
                }
            }
        }
        
        if(desdeHistorial && typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
    }
}

// ==========================================
// 🧾 VISOR DE FACTURAS
// ==========================================
export function verFacturaTaller(fotoSrc, tipo) {
    const img = document.getElementById('camaraModalImg');
    const modal = document.getElementById('camaraModal');
    const title = document.getElementById('camaraModalTitle');
    
    if (img && modal && title) {
        img.src = fotoSrc;
        title.innerText = "🧾 " + tipo;
        modal.style.display = 'flex';
        
        window.esZoomCamara = false;
        img.style.width = '100%';
        img.style.cursor = 'zoom-in';
        
        const text = document.getElementById('camaraZoomText');
        if (text) text.innerText = "Toca la foto para hacer zoom • Toca fuera para cerrar";
    }
}

// Conectamos a la ventana global para que el botón de bitacora.js la encuentre
window.verFacturaTaller = verFacturaTaller;


// Conexión a los botones de tu HTML
window.abrirTaller = abrirTaller;
window.guardarTaller = guardarTaller;
window.editarTaller = editarTaller;
window.borrarTaller = borrarTaller;
window.comprimirImagenBase64 = comprimirImagenBase64;
