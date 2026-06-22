// Archivo: taller.js

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { q, STORAGE_KEYS, getHoyYMD, esToYMD, ymdToEs } from './utils.js';

// 🔥 PEGA AQUÍ TU ENLACE DE GOOGLE APPS SCRIPT (EN UNA SOLA LÍNEA)
const DRIVE_IMAGES_URL = "https://script.google.com/macros/s/AKfycbxQnm6JHq35o0Vpv-7iZeeK2PZupMlDNKglEn7lC504ZuE6HJCJXh_toSMzL6szNfiF5A/exec";

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
    let myCarsTaller = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let carSelect = q('tallerCarSelect');
    carSelect.innerHTML = '<option value="">🚘 Selecciona el vehículo...</option>';
    
    myCarsTaller.forEach(c => { 
        if (c.rol !== 'lector') {
            carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; 
        }
    });
    
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

    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let myCarsTaller = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];

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
    if (foundCar && foundCar.rol === 'lector') {
        alert("⚠️ Tu rol en este coche es de 'Solo Lectura'.");
        return;
    }

    let carName = foundCar ? foundCar.name : "Vehículo";
    let fechaEs = ymdToEs(fecha);

    let miNombre = "Conductor";
    let miUid = "Anonimo";
    if (window.auth && window.auth.currentUser) {
        miUid = window.auth.currentUser.uid;
        if (window.auth.currentUser.displayName) {
            miNombre = window.auth.currentUser.displayName.split(" ")[0];
        }
    }

    let fotoUrlFinal = "";
    if (idEdit !== "") { 
        let oldRecord = mantLocal.find(m => String(m.id) === String(idEdit));
        if (oldRecord && oldRecord.factura) fotoUrlFinal = oldRecord.factura;
    }

    const fileInput = q('tallerFactura');
    if (fileInput && fileInput.files.length > 0) {
        const loading = document.getElementById('loading-overlay');
        try {
            if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Comprimiendo factura..."; }
            let base64Comprimido = await comprimirImagenBase64(fileInput.files[0]);

            if(loading) document.getElementById('loading-text').innerText = "Subiendo a Google Drive... ☁️";

            // Limpiamos foto antigua si estamos editando
            if (idEdit !== "" && fotoUrlFinal && fotoUrlFinal.includes("id=")) {
                try {
                    let idDriveViejo = fotoUrlFinal.match(/id=([^&]+)/)[1];
                    await fetch(DRIVE_IMAGES_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({ accion: "borrarFactura", idArchivo: idDriveViejo }),
                        redirect: "follow"
                    });
                } catch(e) { console.log("Aviso: No se pudo limpiar la foto anterior."); }
            }

            // Subimos enviando también el ID del usuario
            const resDrive = await fetch(DRIVE_IMAGES_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    accion: "subirFactura",
                    userId: miUid,
                    base64: base64Comprimido,
                    nombreArchivo: `factura_${carId}_${Date.now()}.jpg`
                }),
                redirect: "follow"
            });
            
            const resData = await resDrive.json();
            if (resData.exito) {
                fotoUrlFinal = resData.url; 
            } else {
                throw new Error(resData.error || "Fallo en el servidor de Drive");
            }
            
            if(loading) loading.style.display = "none";
        } catch(err) {
            if(loading) loading.style.display = "none";
            alert("❌ Error al subir imagen: " + err.message); 
            return;
        }
    }

    if (idEdit !== "") {
        let index = mantLocal.findIndex(m => String(m.id) === String(idEdit));
        if (index > -1) mantLocal[index] = { id: parseInt(idEdit), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoUrlFinal, usuario: miNombre };
    } else {
        mantLocal.push({ id: Date.now(), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoUrlFinal, usuario: miNombre });
    }

    mantLocal.sort((a, b) => {
        let diff = new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha));
        if (diff === 0) return b.id - a.id;
        return diff;
    });
    
    localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocal));

    if (window.auth && window.auth.currentUser) {
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
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let myCarsTaller = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let record = mantLocal.find(m => String(m.id) === String(id));
    
    if (record) {
        let cocheActual = myCarsTaller.find(c => String(c.id) === String(record.carId));
        if (cocheActual && cocheActual.compartido && cocheActual.name.startsWith("🤝 ") && cocheActual.rol !== 'admin') {
            alert("⚠️ No tienes permisos para editar los gastos de este vehículo.");
            return;
        }

        if (desdeHistorial) q('historialModal').style.display = 'none';
        else q('tallerModal').style.display = 'none';

        q('editTallerId').value = id;
        
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

export async function borrarTaller(id, desdeHistorial = false) {
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let registro = mantLocal.find(m => String(m.id) === String(id));
    let myCarsTaller = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    
    if (registro) {
        let cocheGasto = myCarsTaller.find(c => String(c.id) === String(registro.carId));
        if (cocheGasto && cocheGasto.compartido && cocheGasto.name.startsWith("🤝 ")) {
            if (cocheGasto.rol !== 'admin') {
                alert("⚠️ Como 'Conductor' solo puedes anotar gastos nuevos. Para modificarlos o borrarlos, avisa al Administrador del vehículo.");
                return;
            }
        }
    }

    let seguro = await window.appConfirm("¿Seguro que quieres borrar este mantenimiento y su factura?", "Borrar Mantenimiento", "🗑️");
    
    if (seguro) {
        let carIdDelGasto = registro?.carId;

        // Limpiamos la foto usando la nueva fórmula
        if (registro && registro.factura && registro.factura.includes("id=")) {
            try {
                let idDrive = registro.factura.match(/id=([^&]+)/)[1];
                fetch(DRIVE_IMAGES_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({ accion: "borrarFactura", idArchivo: idDrive }),
                    redirect: "follow"
                });
            } catch(e) { console.error("Error al limpiar Drive", e); }
        }

        mantLocal = mantLocal.filter(m => String(m.id) !== String(id));
        localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocal));
        
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

window.verFacturaTaller = verFacturaTaller;
window.abrirTaller = abrirTaller;
window.guardarTaller = guardarTaller;
window.editarTaller = editarTaller;
window.borrarTaller = borrarTaller;
window.comprimirImagenBase64 = comprimirImagenBase64;