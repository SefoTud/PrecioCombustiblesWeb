// Archivo: vehiculos.js

export function abrirMisVehiculos() {
    if (!document.getElementById("controls").classList.contains("collapsed")) window.toggleControls();
    document.getElementById('misVehiculosModal').style.display = 'flex';
    
    if(typeof window.toggleFormCoche === 'function') window.toggleFormCoche(false);
    
    renderCars();
    
    const btnNoti = document.getElementById('btnNotificaciones');
    if (btnNoti && "Notification" in window && Notification.permission === "default") {
        btnNoti.style.display = 'block';
    } else if (btnNoti) {
        btnNoti.style.display = 'none';
    }
}

export function cerrarMisVehiculos() {
    document.getElementById('misVehiculosModal').style.display = 'none';
    if(typeof window.abrirPerfil === 'function') window.abrirPerfil(); 
}

export function saveCar() {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];

    const idToEdit = document.getElementById('editCarId').value;
    const name = document.getElementById('carName').value;
    const fuel = document.getElementById('carFuel').value;
    const consumo = parseFloat(document.getElementById('carConsumo').value);
    const deposito = parseFloat(document.getElementById('carDeposito').value);
    const itv = document.getElementById('carITV').value;
    const seguro = document.getElementById('carSeguro').value;
    const aceite = document.getElementById('carAceite').value;

    if (!name || !consumo || !deposito) { alert("⚠️ Por favor, rellena al menos el Nombre, Consumo y Depósito."); return; }

    if (idToEdit) {
        const index = myCars.findIndex(c => String(c.id) === String(idToEdit));
        if (index > -1) { 
            myCars[index] = { id: parseInt(idToEdit), name, fuel, consumo, deposito, itv, seguro, aceite, compartido: myCars[index].compartido || false }; 
            
            if (myCars[index].compartido && window.db) {
                window.setDoc(window.doc(window.db, "gastos_compartidos", String(idToEdit)), {
                    cocheData: myCars[index]
                }, { merge: true }).catch(e => console.error(e));
            }
        }
    } else {
        myCars.push({ id: Date.now(), name, fuel, consumo, deposito, itv, seguro, aceite, compartido: false });
    }

    localStorage.setItem('gasofa_cars', JSON.stringify(myCars));

    if (window.auth && window.auth.currentUser) {
        const uid = window.auth.currentUser.uid;
        window.setDoc(window.doc(window.db, "usuarios", uid), {
            misCoches: myCars
        }, { merge: true }).catch(e => console.error("Error nube:", e));
    }

    renderCars();
    updateCarSelect();
    if(typeof window.toggleFormCoche === 'function') window.toggleFormCoche(false);
}

export function editCar(id) {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    const car = myCars.find(c => String(c.id) === String(id));
    if (car) {
        if (car.name.startsWith("🤝 ")) {
            alert("⚠️ No tienes permisos para editar este vehículo compartido.");
            return;
        }
        document.getElementById('editCarId').value = car.id;
        document.getElementById('carName').value = car.name || '';
        document.getElementById('carFuel').value = car.fuel || 'Precio Gasoleo A';
        document.getElementById('carConsumo').value = car.consumo || '';
        document.getElementById('carDeposito').value = car.deposito || '';
        document.getElementById('carITV').value = car.itv || '';
        document.getElementById('carSeguro').value = car.seguro || '';
        document.getElementById('carAceite').value = car.aceite || '';

        document.getElementById('tituloFormCoche').innerText = "Editar vehículo";
        if(typeof window.toggleFormCoche === 'function') window.toggleFormCoche(true);
    }
}

export function deleteCar(id) {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let cocheActual = myCars.find(c => String(c.id) === String(id));
    if (cocheActual && cocheActual.name.startsWith("🤝 ")) {
        alert("⚠️ No puedes eliminar un coche compartido.");
        return;
    }

    if (confirm("¿Borrar vehículo? Conlleva eliminarlo también para todos los usuarios invitados y borrar TODO su historial de gastos (gasolina y taller).")) {
        myCars = myCars.filter(car => String(car.id) !== String(id));
        localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
        
        let bitacoraLocal = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
        bitacoraLocal = bitacoraLocal.filter(b => String(b.carId) !== String(id));
        localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacoraLocal));

        let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
        mantLocal = mantLocal.filter(m => String(m.carId) !== String(id));
        localStorage.setItem('gasofa_taller', JSON.stringify(mantLocal));
        
        if (window.auth && window.auth.currentUser) {
            const uid = window.auth.currentUser.uid;
            window.setDoc(window.doc(window.db, "usuarios", uid), {
                misCoches: myCars,
                miBitacora: bitacoraLocal
            }, { merge: true });

            if (cocheActual && cocheActual.compartido && window.db) {
                window.setDoc(window.doc(window.db, "gastos_compartidos", String(id)), {
                    cocheEliminado: true
                }, { merge: true }).catch(e => console.error(e));
            }
        }
        renderCars();
        updateCarSelect();
        if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
    }
}

export function renderCars() {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    const list = document.getElementById('carList');
    if(!list) return;
    
    let htmlAcumulado = '';
    let ahorrosG = typeof window.actualizarAhorroGlobal === 'function' ? window.actualizarAhorroGlobal() : {};

    myCars.forEach(car => {
        const hoy = new Date();
        let barrasHTML = '';

        const crearBarra = (icono, titulo, fechaStr) => {
            let f = new Date(fechaStr);
            let dias = (f - hoy) / (1000 * 60 * 60 * 24);
            let porcentajePeligro = 100 - Math.max(0, Math.min(100, (dias / 365) * 100));
            let color = '', estiloFondo = '';

            if (dias < 0) {
                color = '#c0392b'; porcentajePeligro = 100; 
                estiloFondo = 'background: repeating-linear-gradient(45deg, #e74c3c, #e74c3c 10px, #a93226 10px, #a93226 20px);';
            } else if (dias <= 7) {
                color = '#e74c3c'; porcentajePeligro = Math.max(95, porcentajePeligro); estiloFondo = `background: ${color};`;
            } else if (dias <= 30) {
                color = '#f39c12'; estiloFondo = `background: ${color};`;
            } else {
                color = 'var(--accent-green)'; porcentajePeligro = Math.max(2, porcentajePeligro); estiloFondo = `background: ${color};`;
            }
            
            let fechaExacta = f.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            let textoDias = fechaExacta;
            
            if (dias < 0) textoDias += " (¡Caducado!)";
            else if (dias <= 7) { let dNum = Math.floor(dias); textoDias += ` (en ${dNum} ${dNum === 1 ? 'día' : 'días'}!)`; }
            else if (dias <= 30) { let dNum = Math.floor(dias); textoDias += ` (en ${dNum} días)`; }

            return `
            <div style="display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:var(--text-muted);">
                    <span>${icono} ${titulo}</span>
                    <span style="color:${color};">${textoDias}</span>
                </div>
                <div style="width:100%; height:6px; background:var(--bg-body); border:1px solid var(--border-color); border-radius:4px; overflow:hidden; box-sizing:border-box;">
                    <div style="width:${porcentajePeligro}%; height:100%; border-radius:2px; ${estiloFondo}"></div>
                </div>
            </div>`;
        };

        if (car.itv) barrasHTML += crearBarra('🛂', 'ITV', car.itv);
        if (car.seguro) barrasHTML += crearBarra('🛡️', 'Seguro', car.seguro);
        
        let tagsExtra = '';
        if (car.aceite) tagsExtra += `<span class="badge-base" style="background:var(--bg-body); color:var(--text-muted); border:1px solid var(--border-color); font-weight:bold; font-size:10px; margin-top:2px;">🛢️ Aceite: ${car.aceite} km</span>`;
        let ahorroEsteCoche = ahorrosG[car.id] ? ahorrosG[car.id].toFixed(2) : "0.00";
        tagsExtra += `<span class="badge-base" style="background:var(--bg-ahorro); color:var(--accent-green); border:1px dashed var(--accent-green); font-weight:bold; font-size:10px; margin-top:2px;">💰 Ahorro: +${ahorroEsteCoche}€</span>`;

        let alertasBloque = '';
        if (barrasHTML || tagsExtra) {
            alertasBloque = `
            <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border-color); display:flex; flex-direction:column; gap:10px; width:100%;">
                ${barrasHTML}
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:2px;">${tagsExtra}</div>
            </div>`;
        }

        let nombreSeguro = window.escaparHTML ? window.escaparHTML(car.name) : car.name;
        let esInvitadoCoche = car.name.startsWith("🤝 ");
        let bloqueBotones = esInvitadoCoche 
            ? `<span style="font-size:12px; font-weight:800; color:var(--text-muted); padding:10px; white-space:nowrap;">🤝 Compartido</span>`
            : `<div style="display:flex; gap:6px;">
                <button onclick="generarCodigoCompartir(${car.id})" style="background:var(--bg-input); color:var(--accent); border:1px solid var(--border-color); border-radius:8px; padding:8px 12px; cursor:pointer;" title="Compartir Coche">🔗</button>
                <button onclick="editCar(${car.id})" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); border-radius:8px; padding:8px 12px; cursor:pointer;" title="Editar">✏️</button>
                <button onclick="deleteCar(${car.id})" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); border-radius:8px; padding:8px 12px; cursor:pointer;" title="Borrar">🗑️</button>
               </div>`;

        htmlAcumulado += `
        <div class="card-garaje" style="flex-direction:column; align-items:stretch;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;">
                <div style="flex:1; min-width:0; padding-right:10px;">
                    <div class="txt-coche-titulo" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nombreSeguro}</div>
                    <div class="txt-coche-detalle">⛽ ${car.consumo} L/100km | 🛢️ Max: ${car.deposito} L</div>
                </div>
                <div style="flex-shrink:0;">
                    ${bloqueBotones}
                </div>
            </div>
            ${alertasBloque}
        </div>`;
    });

    list.innerHTML = htmlAcumulado;
}

export function verificarAlertasGaraje() {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let iconosAlerta = "";
    const hoy = new Date();

    myCars.forEach(car => {
        if (car.itv) {
            let dias = (new Date(car.itv) - hoy) / (1000 * 60 * 60 * 24);
            if (dias < 0) iconosAlerta += "❌";
            else if (dias <= 30) iconosAlerta += "⚠️";
        }
        if (car.seguro) {
            let dias = (new Date(car.seguro) - hoy) / (1000 * 60 * 60 * 24);
            if (dias < 0) iconosAlerta += "❌";
            else if (dias <= 30) iconosAlerta += "⚠️";
        }
    });

    const badge = document.getElementById('alertaGarajeTop');
    if (badge) {
        if (iconosAlerta !== "") {
            badge.innerHTML = iconosAlerta + ' GARAJE';
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

export function updateCarSelect() {
    verificarAlertasGaraje(); 
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    const select = document.getElementById('activeCarSelect'); 
    if (!select) return;
    
    const sMode = localStorage.getItem("gasofaPrefs") ? JSON.parse(localStorage.getItem("gasofaPrefs")).sMode : 'zona';

    if (myCars.length === 0 || sMode === 'provincia') { select.style.display = 'none'; return; }

    select.style.display = 'block';
    let html = '<option value="">🚘 Selecciona tu vehículo...</option>';
    myCars.forEach(car => { html += `<option value="${car.id}">${car.name} (${car.consumo}L/100)</option>`; });
    
    let valActual = select.value;
    select.innerHTML = html;
    if(valActual && myCars.find(c => String(c.id) === String(valActual))) select.value = valActual;
}

export function applyCarSettings() {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    const select = document.getElementById('activeCarSelect'); 
    const carId = select ? select.value : "";
    const btnFill = document.getElementById('btnFill'); 
    const litrosInput = document.getElementById('litrosInput'); 
    const consumoInput = document.getElementById('consumoInput'); 
    let selectorCombustible = document.getElementById('tipoCombustible');

    if (!carId) {
        window.currentCarCapacity = 0; 
        if (btnFill) btnFill.style.display = 'none'; 
        if (consumoInput) consumoInput.value = ''; 
        if (litrosInput) { litrosInput.value = ''; litrosInput.dispatchEvent(new Event('input')); } 
        if (selectorCombustible) selectorCombustible.value = 'Precio Gasoleo A';
        
        if(select) select.style.borderColor = 'var(--accent)'; 
    } else {
        const car = myCars.find(c => String(c.id) === String(carId));
        if (car) {
            if (consumoInput) consumoInput.value = car.consumo; 
            if (selectorCombustible) selectorCombustible.value = car.fuel;
            window.currentCarCapacity = car.deposito; 
            if (btnFill) btnFill.style.display = 'block';
            if (litrosInput) { litrosInput.value = ''; litrosInput.dispatchEvent(new Event('input')); }
            
            if(select) {
                select.style.borderColor = 'var(--accent-green)'; 
                setTimeout(() => select.style.borderColor = 'var(--accent)', 1000);
            }
        }
    }

    if (typeof window.comprobarRequisitosInteligentes === 'function') window.comprobarRequisitosInteligentes();
}

export function llenarATope() { 
    if (window.currentCarCapacity > 0) { 
        const litrosInput = document.getElementById('litrosInput'); 
        if (litrosInput) { 
            litrosInput.value = window.currentCarCapacity; 
            litrosInput.dispatchEvent(new Event('input')); 
        } 
    } 
}

export async function generarCodigoCompartir(idCoche) {
    if (typeof gtag === 'function') gtag('event', 'compartir_coche_generar');

    if (!window.auth || !window.auth.currentUser) {
        alert("⚠️ Inicia sesión en 'Mi Perfil' para compartir tu vehículo.");
        return;
    }
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    const coche = myCars.find(c => String(c.id) === String(idCoche));
    if (!coche) return;

    coche.compartido = true;
    localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
    await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });

    let bitacoraLocal = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let gastosPrevios = bitacoraLocal.filter(b => String(b.carId) === String(idCoche));
    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let tallerPrevio = mantLocal.filter(m => String(m.carId) === String(idCoche));

    if (gastosPrevios.length > 0 || tallerPrevio.length > 0) {
        await window.setDoc(window.doc(window.db, "gastos_compartidos", String(idCoche)), {
            repostajes: gastosPrevios,
            taller: tallerPrevio
        }, { merge: true }).catch(e => console.error("Error volcando historial:", e));
    }

    if(typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();

    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));

    try {
        const loading = document.getElementById('loading-overlay');
        if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Generando invitación..."; }

        await window.setDoc(window.doc(window.db, "invitaciones", codigo), {
            cocheData: coche,
            creador: window.auth.currentUser.uid,
            fecha: Date.now()
        });

        if(loading) loading.style.display = "none";
        prompt(`✅ ¡Vehículo listo para compartir!\n\nPásale este código a tu familiar/empleado. (Solo se puede usar 1 vez):`, codigo);
        
    } catch (error) {
        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
        alert("❌ Error al conectar con el servidor. Revisa tu internet.");
    }
}

export async function unirseCocheCompartido() {
    if (typeof gtag === 'function') gtag('event', 'compartir_coche_unirse');

    if (!window.auth || !window.auth.currentUser) {
        alert("⚠️ Inicia sesión en 'Mi Perfil' para unirte a un coche.");
        return;
    }

    let input = document.getElementById('inputCodigoCoche');
    let codigo = input.value.trim();

    if (codigo.length < 5) { alert("⚠️ Escribe un código válido."); return; }

    try {
        const loading = document.getElementById('loading-overlay');
        if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Buscando vehículo..."; }

        const docRef = window.doc(window.db, "invitaciones", codigo);
        const docSnap = await window.getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const cocheInvitacion = data.cocheData;
            
            let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];

            if (myCars.find(c => String(c.id) === String(cocheInvitacion.id))) {
                if(loading) loading.style.display = "none";
                alert("⚠️ Ya tienes este coche en tu garaje.");
                return;
            }

            cocheInvitacion.name = "🤝 " + cocheInvitacion.name; 
            cocheInvitacion.compartido = true; 

            myCars.push(cocheInvitacion);
            localStorage.setItem('gasofa_cars', JSON.stringify(myCars));

            await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), {
                misCoches: myCars
            }, { merge: true });

            await window.deleteDoc(docRef);

            if(loading) loading.style.display = "none";
            if (typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();
            
            alert(`🚗 ¡Perfecto! Te has unido a: ${cocheInvitacion.name}`);
            
            input.value = "";
            renderCars();
            updateCarSelect();

        } else {
            if(loading) loading.style.display = "none";
            alert("❌ El código no existe o ya ha sido utilizado por otra persona.");
        }

    } catch (error) {
        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
        alert("❌ Error al conectar con el servidor.");
    }
}

export function iniciarRadaresCompartidos() {
    if (!window.auth || !window.auth.currentUser || !window.db) return;
    
    if (window.radaresActivos) {
        window.radaresActivos.forEach(apagar => apagar());
    }
    window.radaresActivos = [];

    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];

    if (myCars && myCars.length > 0) {
        myCars.forEach(car => {
            if (!car.compartido) return;

            let apagarRadar = window.onSnapshot(window.doc(window.db, "gastos_compartidos", String(car.id)), (docSnapCompartido) => {
                if (docSnapCompartido.exists()) {
                    let dataCompartida = docSnapCompartido.data();
                    let huboCambiosUI = false;
                    let bitacoraLocal = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];

                    // A) Coche eliminado
                    if (dataCompartida.cocheEliminado === true) {
                        apagarRadar(); 
                        
                        let updatedCars = myCars.filter(c => String(c.id) !== String(car.id));
                        localStorage.setItem('gasofa_cars', JSON.stringify(updatedCars));
                        
                        let updatedBitacora = bitacoraLocal.filter(b => String(b.carId) !== String(car.id));
                        localStorage.setItem('gasofa_bitacora', JSON.stringify(updatedBitacora));

                        let mantLocalInvitado = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                        mantLocalInvitado = mantLocalInvitado.filter(m => String(m.carId) !== String(car.id));
                        localStorage.setItem('gasofa_taller', JSON.stringify(mantLocalInvitado));
                        
                        if (window.auth && window.auth.currentUser) {
                            window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { 
                                misCoches: updatedCars,
                                miBitacora: updatedBitacora 
                            }, { merge: true });
                        }
                        
                        alert(`🚨 El administrador ha eliminado el vehículo compartido y todos sus gastos asociados.`);
                        renderCars();
                        updateCarSelect();
                        if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
                        return;
                    }

                    // B) Coche editado
                    if (dataCompartida.cocheData) {
                        let idx = myCars.findIndex(c => String(c.id) === String(car.id));
                        if (idx > -1) {
                            let nombreConEmoji = dataCompartida.cocheData.name;
                            if (!nombreConEmoji.startsWith("🤝 ")) nombreConEmoji = "🤝 " + nombreConEmoji;
                            let cocheActualizado = { ...dataCompartida.cocheData, name: nombreConEmoji, compartido: true };
                            
                            if (JSON.stringify(myCars[idx]) !== JSON.stringify(cocheActualizado)) {
                                myCars[idx] = cocheActualizado;
                                localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
                                huboCambiosUI = true;
                                renderCars();
                            }
                        }
                    }

                    // 1. Repostajes
                    if (dataCompartida.repostajes) {
                        let viejaStr = JSON.stringify(bitacoraLocal.filter(b => String(b.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.repostajes);
                        
                        if (viejaStr !== nuevaStr) {
                            let nuevaBitacora = bitacoraLocal.filter(b => String(b.carId) !== String(car.id));
                            nuevaBitacora = nuevaBitacora.concat(dataCompartida.repostajes);
                            
                            const getHoyYMD = () => { const d=new Date(); let m=''+(d.getMonth()+1), di=''+d.getDate(), a=d.getFullYear(); if(m.length<2)m='0'+m; if(di.length<2)di='0'+di; return [a,m,di].join('-'); };
                            const esToYMD = (esDate) => { if(!esDate) return getHoyYMD(); let p=esDate.split('/'); if(p.length!==3) return getHoyYMD(); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };
                            
                            nuevaBitacora.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem('gasofa_bitacora', JSON.stringify(nuevaBitacora));
                            if(typeof window.bitacora !== 'undefined') window.bitacora = nuevaBitacora; 
                            huboCambiosUI = true;
                        }
                    }

                    // 2. Taller
                    if (dataCompartida.taller) {
                        let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                        let viejaStr = JSON.stringify(mantLocal.filter(m => String(m.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.taller);

                        if (viejaStr !== nuevaStr) {
                            let nuevoTaller = mantLocal.filter(m => String(m.carId) !== String(car.id));
                            nuevoTaller = nuevoTaller.concat(dataCompartida.taller);
                            
                            const getHoyYMD = () => { const d=new Date(); let m=''+(d.getMonth()+1), di=''+d.getDate(), a=d.getFullYear(); if(m.length<2)m='0'+m; if(di.length<2)di='0'+di; return [a,m,di].join('-'); };
                            const esToYMD = (esDate) => { if(!esDate) return getHoyYMD(); let p=esDate.split('/'); if(p.length!==3) return getHoyYMD(); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };

                            nuevoTaller.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem('gasofa_taller', JSON.stringify(nuevoTaller));
                            huboCambiosUI = true;
                        }
                    }

                    if (huboCambiosUI) {
                        if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
                        let modalHistorial = document.getElementById('historialModal');
                        if (modalHistorial && modalHistorial.style.display === 'flex') {
                            if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
                        }
                    }
                }
            });
            window.radaresActivos.push(apagarRadar);
        });
    }
}


// Conectamos a la ventana global
window.abrirMisVehiculos = abrirMisVehiculos;
window.cerrarMisVehiculos = cerrarMisVehiculos;
window.saveCar = saveCar;
window.editCar = editCar;
window.deleteCar = deleteCar;
window.renderCars = renderCars;
window.verificarAlertasGaraje = verificarAlertasGaraje;
window.updateCarSelect = updateCarSelect;
window.applyCarSettings = applyCarSettings;
window.llenarATope = llenarATope;
window.generarCodigoCompartir = generarCodigoCompartir;
window.unirseCocheCompartido = unirseCocheCompartido;
window.iniciarRadaresCompartidos = iniciarRadaresCompartidos;
