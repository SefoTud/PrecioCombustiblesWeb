// ============================================================================
// Archivo: valoraciones.js
// Motor independiente de Opiniones, Gamificación y Ranking
// ============================================================================

import { q, STORAGE_KEYS } from './utils.js';

window.estrellasSeleccionadas = 0;
window.ultimoDocumentoOpinion = null;
window.gasolineraActualOpiniones = null;
window.resumenOpiniones = {};

export async function cambiarApodo() {
    if (!window.auth.currentUser) return;
    let apodoActual = window.auth.currentUser.displayName || "Conductor";
    let nuevoApodo = await window.appPrompt("Introduce tu apodo público para las reseñas:", apodoActual, "Cambiar Apodo", "✏️");
    
    if (nuevoApodo !== null && nuevoApodo.trim() !== "") {
        try {
            await window.updateProfile(window.auth.currentUser, { displayName: nuevoApodo.trim() });
            q('nombreUsuario').innerText = nuevoApodo.trim();
            
            const uid = window.auth.currentUser.uid;
            window.setDoc(window.doc(window.db, "perfiles_publicos", uid), { nombrePublico: nuevoApodo.trim() }, { merge: true });
            if (typeof window.mostrarToast === 'function') window.mostrarToast("✅ Apodo actualizado", "exito");
        } catch(e) { alert("No se pudo actualizar el apodo."); }
    }
}

export async function abrirValoraciones(ideess, nombreGasolinera) {
if (typeof gtag === 'function') gtag('event', 'ver_opiniones_gasolinera');
    const modal = q('opinionesModal');
    if (!modal) return;
    
    q('tituloModalOpiniones').innerText = "Opinar - " + nombreGasolinera;
    q('ideessOpinionActual').value = ideess;
    q('nombreGasolineraOpinionActual').value = nombreGasolinera;
    
    marcarEstrellas(0);
    q('textoOpinion').value = '';
    ['btnAire', 'btnBano', 'btnTienda', 'btnLavado', 'btnRestaurante', 'btnDuchas'].forEach(id => {
        const btn = q(id);
        if (btn) { btn.classList.remove('activo'); btn.style.background = 'var(--bg-input)'; btn.style.color = 'var(--text-muted)'; btn.style.borderColor = 'var(--border-color)'; }
    });
    q('btnBorrarOpinion').style.display = 'none';

    modal.style.display = 'flex';
    q('listaOpiniones').innerHTML = "<p style='text-align:center;'>Cargando datos...</p>";

    if (window.auth && window.auth.currentUser) {
        const uid = window.auth.currentUser.uid;
        try {
            const docSnap = await window.getDoc(window.doc(window.db, "opiniones", `${ideess}_${uid}`));
            if (docSnap.exists()) {
                const data = docSnap.data();
                marcarEstrellas(data.estrellas);
                q('textoOpinion').value = data.comentario || '';
                
                if (data.servicios) {
                    if (data.servicios.aireGratis) toggleServicio('btnAire');
                    if (data.servicios.bano) toggleServicio('btnBano');
                    if (data.servicios.tienda) toggleServicio('btnTienda');
                    if (data.servicios.lavado) toggleServicio('btnLavado');
                    if (data.servicios.restaurante) toggleServicio('btnRestaurante');
                    if (data.servicios.duchas) toggleServicio('btnDuchas');
                }
                q('btnBorrarOpinion').style.display = 'block';
            }
        } catch(e) { console.log("Sin opiniones previas."); }
    }
    if (window.cargarListaOpiniones) window.cargarListaOpiniones(ideess);
}

export function cerrarModalOpiniones() { q('opinionesModal').style.display = 'none'; }

export function marcarEstrellas(cantidad) {
    window.estrellasSeleccionadas = cantidad;
    const estrellas = q('estrellasSelector').children;
    for (let i = 0; i < 5; i++) {
        if (i < cantidad) { estrellas[i].style.color = '#f1c40f'; estrellas[i].style.textShadow = '0 0 5px rgba(241, 196, 15, 0.4)'; } 
        else { estrellas[i].style.color = '#ccc'; estrellas[i].style.textShadow = 'none'; }
    }
}

export function toggleServicio(id) {
    const btn = q(id);
    if (!btn) return;
    if (btn.classList.contains('activo')) {
        btn.classList.remove('activo'); btn.style.background = 'var(--bg-input)'; btn.style.color = 'var(--text-muted)'; btn.style.borderColor = 'var(--border-color)';
    } else {
        btn.classList.add('activo'); btn.style.background = 'var(--accent-green)'; btn.style.color = 'white'; btn.style.borderColor = 'var(--accent-green)';
    }
}

export async function procesarEnvioOpinion() {
    if (window.estrellasSeleccionadas === 0) {
        cerrarModalOpiniones();
        if (window.mostrarToast) window.mostrarToast("⚠️ Toca las estrellas para dar una nota", "error");
        return;
    }

    // 🛡️ EL ESCUDO ANTI-FANTASMAS: Si no hay sesión, cortamos aquí mismo.
    if (!window.auth || !window.auth.currentUser) { 
        cerrarModalOpiniones(); 
        if (window.mostrarToast) window.mostrarToast("❌ Inicia sesión en 'Mi Perfil' para opinar", "error"); 
        return; 
    }

    const ideess = q('ideessOpinionActual').value;
    const nombreGasolinera = q('nombreGasolineraOpinionActual').value;
    const comentario = q('textoOpinion').value.trim();
    
    const serviciosExtras = {
        aireGratis: q('btnAire').classList.contains('activo'), bano: q('btnBano').classList.contains('activo'),
        tienda: q('btnTienda').classList.contains('activo'), lavado: q('btnLavado').classList.contains('activo'),
        restaurante: q('btnRestaurante').classList.contains('activo'), duchas: q('btnDuchas').classList.contains('activo')
    };

    let totalMisOpiniones = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_OPINIONES)) || 0;
    totalMisOpiniones++;
    localStorage.setItem(STORAGE_KEYS.TOTAL_OPINIONES, totalMisOpiniones);

    let medallaNivel = "";
    if (totalMisOpiniones >= 750) medallaNivel = "Dios de la Carretera 🏎️🔥"; else if (totalMisOpiniones >= 400) medallaNivel = "Leyenda Viva 👑";
    else if (totalMisOpiniones >= 200) medallaNivel = "Veterano del Asfalto 🎖️"; else if (totalMisOpiniones >= 100) medallaNivel = "Inspector de Pista 🕵️‍♂️";
    else if (totalMisOpiniones >= 60) medallaNivel = "As del Volante 🃏"; else if (totalMisOpiniones >= 30) medallaNivel = "Rastreador de Rutas 🗺️";
    else if (totalMisOpiniones >= 15) medallaNivel = "Viajero Frecuente 🚙"; else if (totalMisOpiniones >= 5) medallaNivel = "Copiloto Atento 🧭";
    else medallaNivel = "Turista de Paso 🎒"; 

    const uid = window.auth.currentUser.uid;
    const nombrePub = window.auth.currentUser.displayName || "Conductor";
    const fotoPub = window.auth.currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    
    window.setDoc(window.doc(window.db, "usuarios", uid), { totalOpiniones: totalMisOpiniones, medallaNivel: medallaNivel }, { merge: true });
    window.setDoc(window.doc(window.db, "perfiles_publicos", uid), { totalOpiniones: totalMisOpiniones, medallaNivel: medallaNivel, nombrePublico: nombrePub, fotoPublica: fotoPub }, { merge: true });

    const badgePerfil = q('medallaPerfil'); if (badgePerfil) { badgePerfil.innerText = medallaNivel; badgePerfil.style.display = 'inline-block'; }
    const contadorPerfil = q('numOpinionesPerfil'); if (contadorPerfil) { contadorPerfil.innerText = `(${totalMisOpiniones} reseñas)`; contadorPerfil.style.display = 'inline-block'; }

    let haSubidoDeNivel = false;
    const hitos = [1, 5, 15, 30, 60, 100, 200, 400, 750];
    if (hitos.includes(totalMisOpiniones)) {
        haSubidoDeNivel = true;
        setTimeout(() => { alert(`🎉 ¡NUEVO LOGRO DESBLOQUEADO!\n\nNivel:\n${medallaNivel}`); }, 1500); 
    }

    const opinionRef = window.doc(window.db, "opiniones", `${ideess}_${uid}`);
    const resumenRef = window.doc(window.db, "opiniones_resumen", String(ideess));

    try {
        const resumenDoc = await window.getDoc(resumenRef);
        const opinionAntiguaDoc = await window.getDoc(opinionRef);

        let nuevoTotal = 1; let nuevaSuma = window.estrellasSeleccionadas;
        if (resumenDoc.exists()) {
            nuevoTotal = resumenDoc.data().totalOpiniones || 0;
            nuevaSuma = resumenDoc.data().sumaEstrellas || 0;
            if (opinionAntiguaDoc.exists()) nuevaSuma -= opinionAntiguaDoc.data().estrellas; else nuevoTotal += 1;
            nuevaSuma += window.estrellasSeleccionadas;
        }

        await window.setDoc(resumenRef, { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma }, { merge: true });

        await window.setDoc(opinionRef, {
            idGasolinera: ideess, nombreGasolinera: nombreGasolinera || "Estación de Servicio", 
            uidUsuario: uid, nombreUsuario: nombrePub, medallaNivel: medallaNivel || "Turista de Paso 🎒",
            estrellas: window.estrellasSeleccionadas, comentario: comentario, servicios: serviciosExtras, fecha: new Date().toISOString()
        });

        if (haSubidoDeNivel) {
            try {
                const qAnteriores = window.query(window.collection(window.db, "opiniones"), window.where("uidUsuario", "==", uid));
                const snapshot = await window.getDocs(qAnteriores);
                let promesas = [];
                snapshot.forEach(docViejo => { promesas.push(window.setDoc(window.doc(window.db, "opiniones", docViejo.id), { medallaNivel: medallaNivel }, { merge: true })); });
                await Promise.all(promesas); 
            } catch (err) {}
        }
        
        window.resumenOpiniones[String(ideess)] = { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma };
        if (typeof window.descargarResumenEstrellas === 'function') window.descargarResumenEstrellas();
        else if (typeof window.fetchGasolineras === 'function') window.fetchGasolineras();

        if (typeof gtag === 'function') gtag('event', 'publicar_opinion', { 'estrellas': window.estrellasSeleccionadas }); 

        cerrarModalOpiniones();
        if (window.mostrarToast) window.mostrarToast("✅ ¡Opinión publicada!", "exito");
    } catch (error) { cerrarModalOpiniones(); alert("Error al guardar: " + error.message); }
}

export async function procesarBorradoOpinion() {
    // 🛡️ ESCUDO AL BORRAR: Solo por seguridad extra
    if (!window.auth || !window.auth.currentUser) return;

    const ideess = q('ideessOpinionActual').value;
    let seguro = await window.appConfirm("¿Seguro que quieres borrar tu opinión?", "Borrar Opinión", "🗑️");
    if (!seguro) return;

    let totalMisOpiniones = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_OPINIONES)) || 0;
    if (totalMisOpiniones > 0) totalMisOpiniones--; 
    localStorage.setItem(STORAGE_KEYS.TOTAL_OPINIONES, totalMisOpiniones);

    let medallaNivel = "";
    if (totalMisOpiniones >= 750) medallaNivel = "Dios de la Carretera 🏎️🔥"; else if (totalMisOpiniones >= 400) medallaNivel = "Leyenda Viva 👑";
    else if (totalMisOpiniones >= 200) medallaNivel = "Veterano del Asfalto 🎖️"; else if (totalMisOpiniones >= 100) medallaNivel = "Inspector de Pista 🕵️‍♂️";
    else if (totalMisOpiniones >= 60) medallaNivel = "As del Volante 🃏"; else if (totalMisOpiniones >= 30) medallaNivel = "Rastreador de Rutas 🗺️";
    else if (totalMisOpiniones >= 15) medallaNivel = "Viajero Frecuente 🚙"; else if (totalMisOpiniones >= 5) medallaNivel = "Copiloto Atento 🧭";
    else medallaNivel = "Turista de Paso 🎒"; 

    const uid = window.auth.currentUser.uid;
    window.setDoc(window.doc(window.db, "usuarios", uid), { totalOpiniones: totalMisOpiniones, medallaNivel: medallaNivel }, { merge: true });
    window.setDoc(window.doc(window.db, "perfiles_publicos", uid), { totalOpiniones: totalMisOpiniones, medallaNivel: medallaNivel }, { merge: true });

    const badgePerfil = q('medallaPerfil'); if (badgePerfil) { badgePerfil.innerText = medallaNivel; badgePerfil.style.display = 'inline-block'; }
    const contadorPerfil = q('numOpinionesPerfil'); if (contadorPerfil) { contadorPerfil.innerText = `(${totalMisOpiniones} reseñas)`; contadorPerfil.style.display = 'inline-block'; }

    let haBajadoDeNivel = false;
    const hitosBajada = [4, 14, 29, 59, 99, 199, 399, 749];
    if (hitosBajada.includes(totalMisOpiniones)) {
        haBajadoDeNivel = true;
        setTimeout(() => { alert(`⚠️ ATENCIÓN: HAS PERDIDO UN NIVEL 📉\n\nTu contador ha bajado a ${totalMisOpiniones}.\nTu nueva insignia es:\n${medallaNivel}`); }, 1000); 
    }

    const opinionRef = window.doc(window.db, "opiniones", `${ideess}_${uid}`);
    const resumenRef = window.doc(window.db, "opiniones_resumen", String(ideess));

    try {
        const opinionAntiguaDoc = await window.getDoc(opinionRef);
        if (!opinionAntiguaDoc.exists()) return;
        let estrellasRestar = opinionAntiguaDoc.data().estrellas;
        await window.deleteDoc(opinionRef);

        const resumenDoc = await window.getDoc(resumenRef);
        if (resumenDoc.exists()) {
            let nuevoTotal = Math.max(0, (resumenDoc.data().totalOpiniones || 1) - 1);
            let nuevaSuma = Math.max(0, (resumenDoc.data().sumaEstrellas || estrellasRestar) - estrellasRestar);
            await window.setDoc(resumenRef, { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma }, { merge: true });
            if (window.resumenOpiniones) window.resumenOpiniones[String(ideess)] = { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma };
        }

        if (haBajadoDeNivel) {
            try {
                const qAnteriores = window.query(window.collection(window.db, "opiniones"), window.where("uidUsuario", "==", uid));
                const snapshot = await window.getDocs(qAnteriores);
                let promesas = [];
                snapshot.forEach(docViejo => { promesas.push(window.setDoc(window.doc(window.db, "opiniones", docViejo.id), { medallaNivel: medallaNivel }, { merge: true })); });
                await Promise.all(promesas);
            } catch(e) {}
        }

        if (typeof window.descargarResumenEstrellas === 'function') window.descargarResumenEstrellas();
        else if (typeof window.fetchGasolineras === 'function') window.fetchGasolineras();
        
        cerrarModalOpiniones();
        if (window.mostrarToast) window.mostrarToast("🗑️ Opinión borrada", "exito");
        
    } catch (error) { alert("Error al borrar: " + error.message); }
}

export async function votarOpinion(idOpinionDoc, tipo) {
    if (!window.auth || !window.auth.currentUser) { if (window.mostrarToast) window.mostrarToast("❌ Inicia sesión en 'Mi Perfil' para votar", "error"); return; }
    
    if (typeof gtag === 'function') gtag('event', 'votar_opinion', { 'tipo_voto': tipo });
    
    const uid = window.auth.currentUser.uid;
    const ref = window.doc(window.db, "opiniones", idOpinionDoc);
    
    try {
        const docSnap = await window.getDoc(ref);
        if(!docSnap.exists()) return;
        let data = docSnap.data(); let likes = data.likes || []; let dislikes = data.dislikes || [];
        
        likes = likes.filter(id => id !== uid); dislikes = dislikes.filter(id => id !== uid);
        
        if (tipo === 'like' && !(data.likes || []).includes(uid)) likes.push(uid);
        else if (tipo === 'dislike' && !(data.dislikes || []).includes(uid)) dislikes.push(uid);
        
        await window.setDoc(ref, { likes: likes, dislikes: dislikes }, { merge: true });
        
        const qOpiniones = window.query(window.collection(window.db, "opiniones"), window.where("idGasolinera", "==", String(data.idGasolinera)), window.orderBy("fecha", "desc"), window.limit(15));
        const querySnapshot = await window.getDocs(qOpiniones);
        pintarOpinionesHTML(querySnapshot, true);

    } catch (error) { console.error("Error al votar:", error); }
}

export async function descargarResumenEstrellas() {
    try {
        const querySnapshot = await window.getDocs(window.collection(window.db, "opiniones_resumen"));
        querySnapshot.forEach((doc) => { window.resumenOpiniones[doc.id] = doc.data(); });
        if (typeof window.fetchGasolineras === 'function' && (window.userCoords || window.searchMode === 'provincia')) window.fetchGasolineras();
    } catch (e) {}
}

export function generarEstrellasHTML(ideess, nombreGasolinera = "Esta gasolinera") {
    let data = window.resumenOpiniones[String(ideess)];
    let nota = 0; let total = 0;
    
    if (data && data.totalOpiniones > 0) { nota = data.sumaEstrellas / data.totalOpiniones; total = data.totalOpiniones; }
    let estrellasHTML = ""; let notaRedondeada = Math.round(nota * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
        if (notaRedondeada >= i) estrellasHTML += '<span style="color:#f1c40f; text-shadow:0 0 2px rgba(241,196,15,0.4);">★</span>';
        else if (notaRedondeada === i - 0.5) estrellasHTML += '<span style="position:relative; display:inline-block; color:#e0e0e0;"><span style="color:#f1c40f; position:absolute; top:0; left:0; width:50%; overflow:hidden; text-shadow:0 0 2px rgba(241,196,15,0.4);">★</span>★</span>';
        else estrellasHTML += '<span style="color:#e0e0e0;">★</span>';
    }
    let texto = total > 0 ? `<span style="font-size:11px; color:var(--text-muted); font-weight:bold; margin-left:6px;">(${nota.toFixed(1)}) - ${total} op.</span>` : `<span style="font-size:11px; color:var(--text-muted); font-style:italic; margin-left:6px;">Sin opiniones</span>`;
    
    // 👇 SOLUCIÓN: Limpiamos el nombre y lo inyectamos dinámicamente en el onclick 👇
    let nombreLimpio = nombreGasolinera.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    return `<div style="display:flex; align-items:center; font-size:17px; line-height:1; margin-bottom:4px; cursor:pointer;" onclick="window.abrirValoraciones('${ideess}', '${nombreLimpio}')">${estrellasHTML} ${texto}</div>`;
}


export function pintarOpinionesHTML(querySnapshot, limpiarLista) {
    const divLista = q('listaOpiniones');
    const btnCargarMas = q('btnCargarMasOpiniones');
    
    if (limpiarLista) divLista.innerHTML = "";
    if (querySnapshot.empty && limpiarLista) { divLista.innerHTML = "<p style='text-align:center; color:var(--text-muted); font-style:italic;'>Aún no hay reseñas. ¡Sé el primero!</p>"; if (btnCargarMas) btnCargarMas.style.display = "none"; return; }

    let html = "";
    querySnapshot.forEach((docSnap) => {
        let d = docSnap.data();
        let fecha = new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        let nombre = d.nombreUsuario || "Anónimo"; let medalla = d.medallaNivel || "Turista de Paso 🎒";
        let estrellas = ""; for(let i=1; i<=5; i++) estrellas += i <= d.estrellas ? '<span style="color:#f1c40f;">★</span>' : '<span style="color:#ccc;">★</span>';

        let serviciosHTML = "";
        if (d.servicios) {
            if (d.servicios.aireGratis) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">💨 AIRE</span>';
            if (d.servicios.bano) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">🚻 BAÑO</span>';
            if (d.servicios.tienda) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">☕ TIENDA</span>';
            if (d.servicios.lavado) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">🧼 LAVADO</span>';
            if (d.servicios.restaurante) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">🍔 COMIDA</span>';
            if (d.servicios.duchas) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px; margin-right:4px; display:inline-block; margin-bottom:4px;">🚿 DUCHAS</span>';
        }

        let likes = d.likes ? d.likes.length : 0; let dislikes = d.dislikes ? d.dislikes.length : 0;
        let myUid = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : null;
        let colorLike = d.likes && d.likes.includes(myUid) ? 'var(--accent-green)' : 'var(--text-muted)';
        let colorDislike = d.dislikes && d.dislikes.includes(myUid) ? '#e74c3c' : 'var(--text-muted)';

        html += `
        <div style="background:var(--bg-body); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:10px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="font-size:13.5px; font-weight:900; color:var(--text-main);">👤 ${nombre}</span>
                        <span style="background:rgba(243, 156, 18, 0.15); color:#d35400; border:1px solid #f39c12; font-size:9.5px; font-weight:900; padding:2px 6px; border-radius:12px; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.05);">${medalla}</span>
                    </div>
                    <div style="font-size:16px; line-height:1; margin-top:2px;">${estrellas}</div>
                </div>
                <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-align:right; margin-left:8px;">${fecha}</div>
            </div>
            ${serviciosHTML ? `<div>${serviciosHTML}</div>` : ''}
            ${d.comentario ? `<div style="font-size:13px; color:var(--text-main); font-style:italic; line-height:1.4; margin-top:4px;">"${d.comentario}"</div>` : ''}
            <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:10px; border-top:1px dashed var(--border-color); padding-top:8px;">
                <button onclick="window.votarOpinion('${docSnap.id}', 'like')" style="background:var(--bg-input); border:1px solid var(--border-color); color:${colorLike}; font-size:12px; cursor:pointer; font-weight:bold; display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; transition:0.2s;">👍 Útil (${likes})</button>
                <button onclick="window.votarOpinion('${docSnap.id}', 'dislike')" style="background:var(--bg-input); border:1px solid var(--border-color); color:${colorDislike}; font-size:12px; cursor:pointer; font-weight:bold; display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; transition:0.2s;">👎 Falsa (${dislikes})</button>
            </div>
        </div>`;
    });

    if (limpiarLista) divLista.innerHTML = html; else divLista.insertAdjacentHTML('beforeend', html);
    window.ultimoDocumentoOpinion = querySnapshot.docs[querySnapshot.docs.length - 1];
    if (btnCargarMas) btnCargarMas.style.display = (querySnapshot.docs.length === 15) ? "block" : "none";
}

export async function cargarListaOpiniones(ideess) {
    window.gasolineraActualOpiniones = ideess; window.ultimoDocumentoOpinion = null;
    const divLista = q('listaOpiniones'); if (divLista) divLista.innerHTML = "<p style='text-align:center;'>Cargando datos...</p>";
    try {
        const queryData = window.query(window.collection(window.db, "opiniones"), window.where("idGasolinera", "==", String(ideess)), window.orderBy("fecha", "desc"), window.limit(15));
        const querySnapshot = await window.getDocs(queryData); pintarOpinionesHTML(querySnapshot, true);
    } catch (error) { divLista.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Error al cargar las opiniones.</p>"; }
}

export async function cargarMasOpiniones() {
    const btnCargarMas = q('btnCargarMasOpiniones'); if (btnCargarMas) btnCargarMas.innerText = "⏳ Cargando...";
    try {
        const queryData = window.query(window.collection(window.db, "opiniones"), window.where("idGasolinera", "==", String(window.gasolineraActualOpiniones)), window.orderBy("fecha", "desc"), window.startAfter(window.ultimoDocumentoOpinion), window.limit(15));
        const querySnapshot = await window.getDocs(queryData); pintarOpinionesHTML(querySnapshot, false);
        if (btnCargarMas) btnCargarMas.innerText = "👇 Cargar más opiniones";
    } catch (error) { if (btnCargarMas) btnCargarMas.innerText = "Error. Reintentar"; }
}

export async function abrirMisOpiniones() {
    q('misOpinionesModal').style.display = 'flex';
    if (typeof gtag === 'function') gtag('event', 'ver_mis_opiniones_perfil');
    const divLista = q('listaMisOpiniones');
    divLista.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div><p style="text-align:center; color:var(--text-muted);">Buscando tus reseñas...</p>';

    if (!window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;

    try {
        const qOpiniones = window.query(window.collection(window.db, "opiniones"), window.where("uidUsuario", "==", uid));
        const snapshot = await window.getDocs(qOpiniones);
        let misOpiniones = []; snapshot.forEach(doc => misOpiniones.push({ id: doc.id, ...doc.data() }));

        let totalRealFirebase = misOpiniones.length;
        localStorage.setItem(STORAGE_KEYS.TOTAL_OPINIONES, totalRealFirebase);
        window.setDoc(window.doc(window.db, "usuarios", uid), { totalOpiniones: totalRealFirebase }, { merge: true });
        window.setDoc(window.doc(window.db, "perfiles_publicos", uid), { totalOpiniones: totalRealFirebase }, { merge: true });
        
        const badgePerfil = q('numOpinionesPerfil');
        if (badgePerfil) { badgePerfil.innerText = `(${totalRealFirebase} reseñas)`; badgePerfil.style.display = 'inline-block'; }

        misOpiniones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (misOpiniones.length === 0) { divLista.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-style:italic;">Aún no has escrito ninguna reseña.</p>'; return; }

        let html = "";
        let arrayGlobal = [];
        try { let localData = localStorage.getItem('gasofaCache_v2'); if (localData) arrayGlobal = JSON.parse(localData); } catch(e) {}

        misOpiniones.forEach(d => {
            let fecha = new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            let estrellas = ""; for(let i=1; i<=5; i++) estrellas += i <= d.estrellas ? '<span style="color:#f1c40f;">★</span>' : '<span style="color:#ccc;">★</span>';
            let likes = d.likes ? d.likes.length : 0; let dislikes = d.dislikes ? d.dislikes.length : 0;
            
            let nombreGas = d.nombreGasolinera || "Estación de Servicio";
            if (nombreGas === "Estación de Servicio") {
                let gasCache = arrayGlobal.find(g => String(g.IDEESS) === String(d.idGasolinera));
                if (gasCache) nombreGas = gasCache.Rótulo || gasCache.Nombre;
            }

            let serviciosHTML = "";
            if (d.servicios) {
                if (d.servicios.aireGratis) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">💨 AIRE</span>';
                if (d.servicios.bano) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">🚻 BAÑO</span>';
                if (d.servicios.tienda) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">☕ TIENDA</span>';
                if (d.servicios.lavado) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">🧼 LAVADO</span>';
                if (d.servicios.restaurante) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">🍔 COMIDA</span>';
                if (d.servicios.duchas) serviciosHTML += '<span style="background:var(--accent-green); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-right:4px;">🚿 DUCHAS</span>';
            }

            html += `
            <div style="background:var(--bg-panel); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom: 10px; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <div style="font-size:14px; font-weight:900; color:var(--accent);">⛽ ${nombreGas}</div>
                        <div style="font-size:16px;">${estrellas}</div>
                    </div>
                    <div style="font-size:10px; color:var(--text-muted); font-weight:bold;">${fecha}</div>
                </div>
                ${serviciosHTML ? `<div style="margin-top:4px;">${serviciosHTML}</div>` : ''}
                ${d.comentario ? `<div style="font-size:13px; color:var(--text-main); font-style:italic; margin-top:6px;">"${d.comentario}"</div>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border-color); margin-top:8px; padding-top:8px;">
                    <div style="font-size:11px; color:var(--text-muted); font-weight:bold;">👍 ${likes} | 👎 ${dislikes}</div>
                    <button onclick="window.borrarMiOpinionDesdePerfil('${d.id}', '${d.idGasolinera}', ${d.estrellas})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:8px; font-weight:bold; cursor:pointer;">🗑️ Borrar</button>
                </div>
            </div>`;
        });
        divLista.innerHTML = html;
    } catch (error) { divLista.innerHTML = '<p style="text-align:center; color:#e74c3c;">Error al cargar las reseñas.</p>'; }
}

export async function borrarMiOpinionDesdePerfil(idOpinionDoc, ideess, estrellasRestar) {
    let seguro = await window.appConfirm("¿Seguro que quieres borrar esta valoración?", "Borrar Opinión", "🗑️");
    if (!seguro) return;

    try {
        const opinionRef = window.doc(window.db, "opiniones", idOpinionDoc);
        const resumenRef = window.doc(window.db, "opiniones_resumen", String(ideess));
        await window.deleteDoc(opinionRef);

        const resumenDoc = await window.getDoc(resumenRef);
        if (resumenDoc.exists()) {
            let nuevoTotal = Math.max(0, (resumenDoc.data().totalOpiniones || 1) - 1);
            let nuevaSuma = Math.max(0, (resumenDoc.data().sumaEstrellas || estrellasRestar) - estrellasRestar);
            await window.setDoc(resumenRef, { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma }, { merge: true });
            if (window.resumenOpiniones) window.resumenOpiniones[String(ideess)] = { totalOpiniones: nuevoTotal, sumaEstrellas: nuevaSuma };
        }

        if (typeof window.descargarResumenEstrellas === 'function') window.descargarResumenEstrellas();
        if (window.mostrarToast) window.mostrarToast("🗑️ Opinión borrada", "exito");
        abrirMisOpiniones(); 
    } catch (error) { alert("Error al borrar: " + error.message); }
}

export async function abrirRanking() {
    q('rankingModal').style.display = 'flex';
    if(typeof gtag === 'function') gtag('event', 'ver_ranking_usuarios');
    const divLista = q('listaRanking');
    divLista.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div><p style="text-align:center;">Cargando clasificación...</p>';

    try {
        const qRanking = window.query(window.collection(window.db, "perfiles_publicos"), window.orderBy("totalOpiniones", "desc"), window.limit(50));
        const snapshot = await window.getDocs(qRanking);

        let html = ""; let posicion = 1;
        snapshot.forEach(doc => {
            let data = doc.data();
            if (!data.totalOpiniones || data.totalOpiniones === 0) return; 
            
            let nombre = data.nombrePublico || "Conductor"; let foto = data.fotoPublica || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            let medalla = data.medallaNivel || "Turista de Paso 🎒"; let total = data.totalOpiniones;
            let corona = ""; let bgRow = "var(--bg-panel)";
            
            if (posicion === 1) { corona = "🥇"; bgRow = "rgba(241, 196, 15, 0.1)"; } else if (posicion === 2) { corona = "🥈"; bgRow = "rgba(189, 195, 199, 0.1)"; }
            else if (posicion === 3) { corona = "🥉"; bgRow = "rgba(205, 127, 50, 0.1)"; } else { corona = `<span style="font-size:12px; font-weight:bold; color:var(--text-muted); width:20px; text-align:center; display:inline-block;">${posicion}</span>`; }

            let isMe = window.auth && window.auth.currentUser && doc.id === window.auth.currentUser.uid;
            let borderStyle = isMe ? "border: 2px solid var(--accent);" : "border: 1px solid var(--border-color);";

            html += `
            <div style="background:${bgRow}; ${borderStyle} border-radius:12px; padding:10px; margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                <div style="font-size:18px;">${corona}</div>
                <img src="${foto}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color);">
                <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center;">
                    <div style="font-size:14px; font-weight:900; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nombre}</div>
                    <div style="font-size:10px; color:#d35400; font-weight:bold; margin-top:2px;">${medalla}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-input); padding:4px 8px; border-radius:8px; min-width:45px;">
                    <span style="font-size:14px; font-weight:900; color:var(--accent); line-height:1;">${total}</span>
                    <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Reseñas</span>
                </div>
            </div>`;
            posicion++;
        });
        divLista.innerHTML = html === "" ? '<p style="text-align:center;">Aún no hay usuarios.</p>' : html;
    } catch (error) { divLista.innerHTML = '<p style="text-align:center; color:#e74c3c;">Error al cargar.</p>'; }
}

document.addEventListener("DOMContentLoaded", () => { setTimeout(descargarResumenEstrellas, 1000); });

// Exponer las funciones a window para HTML (botones)
window.cambiarApodo = cambiarApodo;
window.abrirValoraciones = abrirValoraciones;
window.cerrarModalOpiniones = cerrarModalOpiniones;
window.marcarEstrellas = marcarEstrellas;
window.toggleServicio = toggleServicio;
window.procesarEnvioOpinion = procesarEnvioOpinion;
window.procesarBorradoOpinion = procesarBorradoOpinion;
window.votarOpinion = votarOpinion;
window.descargarResumenEstrellas = descargarResumenEstrellas;
window.generarEstrellasHTML = generarEstrellasHTML;
window.pintarOpinionesHTML = pintarOpinionesHTML;
window.cargarListaOpiniones = cargarListaOpiniones;
window.cargarMasOpiniones = cargarMasOpiniones;
window.abrirMisOpiniones = abrirMisOpiniones;
window.borrarMiOpinionDesdePerfil = borrarMiOpinionDesdePerfil;
window.abrirRanking = abrirRanking;
