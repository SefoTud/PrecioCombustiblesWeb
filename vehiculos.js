// Archivo: vehiculos.js

import { STORAGE_KEYS } from './utils.js';

export function abrirMisVehiculos() {
    if (!document.getElementById("controls").classList.contains("collapsed")) window.toggleControls();
    document.getElementById('misVehiculosModal').style.display = 'flex';
    
    if(typeof window.toggleFormCoche === 'function') window.toggleFormCoche(false);
    
    renderCars();
    
    const btnNoti = document.getElementById('btnNotificaciones');
    if (btnNoti && "Notification" in window) {
        if (Notification.permission === "granted") {
            btnNoti.style.display = 'none'; 
        } else {
            btnNoti.style.display = 'block'; 
        }
    } else if (btnNoti) {
        btnNoti.style.display = 'none'; 
    }
}

export function cerrarMisVehiculos() {
    document.getElementById('misVehiculosModal').style.display = 'none';
    if(typeof window.abrirPerfil === 'function') window.abrirPerfil(); 
}

export async function saveCar() {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];

    const idToEdit = document.getElementById('editCarId').value;
    const name = document.getElementById('carName').value;
    const fuel = document.getElementById('carFuel').value;
    const consumo = parseFloat(document.getElementById('carConsumo').value);
    const deposito = parseFloat(document.getElementById('carDeposito').value);
    const itv = document.getElementById('carITV').value;
    const seguro = document.getElementById('carSeguro').value;
    const aceite = document.getElementById('carAceite').value;

    if (!name || !consumo || !deposito) {
        alert("⚠️ Rellena al menos el Nombre, el Consumo y el Depósito.");
        return;
    }

    let esVehiculoAdmin = idToEdit !== "" && !name.startsWith("🤝 ");
    let compartidoFlag = false;

    if (idToEdit !== "") {
        let oldCar = myCars.find(c => String(c.id) === String(idToEdit));
        if (oldCar && oldCar.compartido) compartidoFlag = true;
        
        if (oldCar && oldCar.compartido && (!esVehiculoAdmin || oldCar.name !== name)) {
            let seguroAccion = await window.appConfirm("Al cambiar de coche, ¿quieres desvincularlo de la red compartida?", "Modificar Vehículo", "⚠️");
            if(!seguroAccion) return;
            compartidoFlag = false;
        }
    }

    let nuevoCoche = {
        id: idToEdit ? parseInt(idToEdit) : Date.now(),
        name, fuel, consumo, deposito, itv, seguro, aceite, compartido: compartidoFlag
    };

    if (idToEdit) {
        const index = myCars.findIndex(c => String(c.id) === String(idToEdit));
        if (index > -1) {
            if (myCars[index].rol) nuevoCoche.rol = myCars[index].rol;
            myCars[index] = nuevoCoche;
        }
    } else {
        myCars.push(nuevoCoche);
    }

    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));

    if (window.auth && window.auth.currentUser) {
        window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });
        
        if (compartidoFlag) {
            window.setDoc(window.doc(window.db, "gastos_compartidos", String(idToEdit ? idToEdit : nuevoCoche.id)), { 
                cocheData: nuevoCoche 
            }, { merge: true }).catch(e => console.error("Error sincronizando cambios del coche", e));
        }
    }

    if (typeof window.toggleFormCoche === 'function') window.toggleFormCoche(false);
    renderCars();
    if (typeof window.updateCarSelect === 'function') window.updateCarSelect();
    if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
}

export function editCar(id) {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    const car = myCars.find(c => String(c.id) === String(id));
    if (car) {
        if (car.name.startsWith("🤝 ")) {
            alert("⚠️ No tienes permisos para editar la configuración principal de este vehículo compartido.");
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

export async function deleteCar(id) {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let cocheActual = myCars.find(c => String(c.id) === String(id));
    if (cocheActual && cocheActual.name.startsWith("🤝 ")) {
        alert("⚠️ No puedes eliminar un coche compartido. Usa el botón 'Salir' para abandonar el vehículo.");
        return;
    }

    let seguro = await window.appConfirm("¿Borrar vehículo? Conlleva eliminarlo también para los invitados y borrar TODO su historial de gastos.", "Borrar Vehículo", "🗑️");
    
    if (seguro) {
        myCars = myCars.filter(car => String(car.id) !== String(id));
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
        
        let bitacoraLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
        bitacoraLocal = bitacoraLocal.filter(b => String(b.carId) !== String(id));
        localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(bitacoraLocal));

        let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
        mantLocal = mantLocal.filter(m => String(m.carId) !== String(id));
        localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocal));
        
        if (window.auth && window.auth.currentUser) {
            const uid = window.auth.currentUser.uid;
            
            window.setDoc(window.doc(window.db, "usuarios", uid), { 
                misCoches: myCars, 
                miBitacora: bitacoraLocal,
                miTaller: mantLocal 
            }, { merge: true });

            if (cocheActual && cocheActual.compartido && window.db) {
                window.setDoc(window.doc(window.db, "gastos_compartidos", String(id)), { 
                    cocheEliminado: true,
                    repostajes: [],
                    taller: []
                }, { merge: true }).catch(e => console.error(e));
            }
        }
        renderCars(); updateCarSelect();
        if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
        if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal(); 
    }
}

export async function abandonarCocheCompartido(id) {
    let seguro = await window.appConfirm("¿Seguro que quieres salir de este vehículo compartido? Dejarás de ver sus gastos, pero el dueño original NO lo perderá.", "Salir del coche", "👋");
    if (!seguro) return;
    
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    myCars = myCars.filter(car => String(car.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
    
    let bitacoraLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    bitacoraLocal = bitacoraLocal.filter(b => String(b.carId) !== String(id));
    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(bitacoraLocal));

    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    mantLocal = mantLocal.filter(m => String(m.carId) !== String(id));
    localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocal));
    
    if (window.auth && window.auth.currentUser) {
        const uid = window.auth.currentUser.uid;
        await window.setDoc(window.doc(window.db, "usuarios", uid), { 
            misCoches: myCars, 
            miBitacora: bitacoraLocal,
            miTaller: mantLocal
        }, { merge: true });
    }
    
    if (typeof window.mostrarToast === 'function') window.mostrarToast("👋 Has salido del coche", "exito");
    renderCars(); updateCarSelect();
    if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
    if (typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();
}

export function renderCars() {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
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
        
        let badgeRol = '';
        if (esInvitadoCoche) {
            let textoRol = car.rol === 'admin' ? '👑 Admin' : (car.rol === 'lector' ? '👁️ Lector' : '✍️ Conductor');
            badgeRol = `<span style="font-size:11px; font-weight:bold; background:var(--bg-panel); color:var(--text-main); border:1px solid var(--border-color); border-radius:6px; padding:3px 6px; margin-right:5px;">${textoRol}</span>`;
        }

        let bloqueBotones = esInvitadoCoche 
            ? `<div style="display:flex; gap:6px; align-items:center;">
                ${badgeRol}
                <button onclick="abandonarCocheCompartido(${car.id})" style="background:#e74c3c; color:white; border:none; border-radius:8px; padding:8px 12px; cursor:pointer;" title="Salir de este coche">👋 Salir</button>
               </div>`
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
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
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
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    const select = document.getElementById('activeCarSelect'); 
    if (!select) return;
    
    const sMode = localStorage.getItem(STORAGE_KEYS.PREFS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFS)).sMode : 'zona';

    if (myCars.length === 0 || sMode === 'provincia') { select.style.display = 'none'; return; }

    select.style.display = 'block';
    let html = '<option value="">🚘 Selecciona tu vehículo...</option>';
    myCars.forEach(car => { html += `<option value="${car.id}">${car.name} (${car.consumo}L/100)</option>`; });
    
    let valActual = select.value;
    select.innerHTML = html;
    if(valActual && myCars.find(c => String(c.id) === String(valActual))) select.value = valActual;
}

export function applyCarSettings() {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
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
        const autonomiaInput = document.getElementById('autonomiaInput');
        const consumoInput = document.getElementById('consumoInput');
        
        if (litrosInput) { 
            let litrosAEchar = window.currentCarCapacity;
            
            // Si el usuario ha rellenado la autonomía y el consumo, hacemos la magia matemática
            if (autonomiaInput && consumoInput && autonomiaInput.value !== "" && consumoInput.value !== "") {
                let autonomia = parseFloat(autonomiaInput.value);
                let consumo = parseFloat(consumoInput.value);
                
                if (!isNaN(autonomia) && !isNaN(consumo) && consumo > 0) {
                    // Calculamos los litros que todavía quedan en el tanque
                    let litrosRestantes = (autonomia / 100) * consumo;
                    
                    // Se lo restamos a la capacidad total
                    litrosAEchar = window.currentCarCapacity - litrosRestantes;
                    
                    // Escudo por si el usuario pone una autonomía ilógica (mayor al depósito)
                    if (litrosAEchar < 0) litrosAEchar = 0;
                }
            }
            
            // Lo ponemos en el input redondeado a 1 decimal (ej: 47.5)
            litrosInput.value = litrosAEchar.toFixed(1); 
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
    
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    const coche = myCars.find(c => String(c.id) === String(idCoche));
    if (!coche) return;

    let rolElegido = await new Promise((resolve) => {
        document.getElementById('customModalTitle').innerText = "Asignar Permisos";
        document.getElementById('customModalMessage').innerText = "Elige el nivel de acceso que tendrá tu invitado:";
        document.getElementById('customModalIcon').innerText = "🔑";
        
        let wrapper = document.getElementById('customModalInputWrapper');
        wrapper.style.display = 'block';
        
        let input = document.getElementById('customModalInput');
        input.style.display = 'none'; 
        
        let oldSelect = document.getElementById('customModalSelectTemp');
        if (oldSelect) oldSelect.remove();
        
        let select = document.createElement('select');
        select.id = 'customModalSelectTemp';
        select.style.cssText = "width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-main); font-size: 14px; font-weight: bold; box-sizing: border-box; text-align: center; cursor: pointer; outline: none;";
        
        // 🔥 ACTUALIZACIÓN: Textos exactos y claros como los has pedido
        select.innerHTML = `
            <option value="admin">👑 Administrador (Anotar, editar y borrar gastos)</option>
            <option value="editor" selected>✍️ Conductor(Anotar gastos)</option>
            <option value="lector">👁️ Lector (Leer gastos)</option>
        `;
        wrapper.appendChild(select);
        
        let btnCopy = document.getElementById('customModalBtnCopy');
        if (btnCopy) btnCopy.style.display = "none";
        
        let btnCancel = document.getElementById('customModalBtnCancel');
        btnCancel.style.display = 'block';
        btnCancel.innerText = "Cancelar";
        btnCancel.onclick = () => { 
            document.getElementById('customAppModal').style.display = 'none'; 
            select.remove();
            input.style.display = 'block';
            resolve(null); 
        };
        
        let btnOk = document.getElementById('customModalBtnOk');
        btnOk.innerText = "Generar Código";
        btnOk.style.background = "var(--accent)";
        btnOk.onclick = () => { 
            document.getElementById('customAppModal').style.display = 'none'; 
            let val = select.value;
            select.remove();
            input.style.display = 'block'; 
            resolve(val); 
        };
        
        document.getElementById('customAppModal').style.display = 'flex';
    });
    
    if (!rolElegido) return; 

    const loading = document.getElementById('loading-overlay');
    if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Generando invitación..."; }

    coche.compartido = true;
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
    await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });

    let bitacoraLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let gastosPrevios = bitacoraLocal.filter(b => String(b.carId) === String(idCoche));
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
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
        await window.setDoc(window.doc(window.db, "invitaciones", codigo), {
            cocheData: coche,
            creador: window.auth.currentUser.uid,
            rolAsignado: rolElegido,
            fecha: Date.now()
        });

        if(loading) loading.style.display = "none";
        
                let rolNombre = rolElegido === 'admin' ? 'Administrador' : (rolElegido === 'lector' ? 'Lector' : 'Conductor');

        
        await new Promise((resolve) => {
            document.getElementById('customModalTitle').innerText = "Código de invitación";
            document.getElementById('customModalMessage').innerHTML = `✅ ¡Invitación lista!<br><br>Se unirá como: <b>${rolNombre}</b><br><small style="color:var(--text-muted);">(Este código desaparecerá automáticamente al usarse)</small>`;
            document.getElementById('customModalIcon').innerText = "🔗";
            
            let wrapper = document.getElementById('customModalInputWrapper');
            wrapper.style.display = 'block';
            
            let input = document.getElementById('customModalInput');
            input.style.display = 'block';
            input.value = codigo;
            input.readOnly = true; 
            
            let btnCopy = document.getElementById('customModalBtnCopy');
            if (btnCopy) btnCopy.style.display = "block";
            
            let btnCancel = document.getElementById('customModalBtnCancel');
            btnCancel.style.display = 'none'; 
            
            let btnOk = document.getElementById('customModalBtnOk');
            btnOk.innerText = "Vale";
            btnOk.style.background = "var(--accent-green)";
            btnOk.onclick = () => { 
                document.getElementById('customAppModal').style.display = 'none'; 
                input.readOnly = false; 
                resolve(true); 
            };
            
            document.getElementById('customAppModal').style.display = 'flex';
        });
        
    } catch (error) {
        if(loading) loading.style.display = "none";
        alert("❌ Error al conectar con el servidor. Revisa tu internet.");
    }
}

export async function unirseCocheCompartido() {
    if (typeof gtag === 'function') gtag('event', 'compartir_coche_unirse');

    if (!window.auth || !window.auth.currentUser) {
        alert("⚠️ Inicia sesión en 'Mi Perfil' para unirte a un vehículo compartido.");
        return;
    }

    let inputCodigo = document.getElementById('inputCodigoCoche');
    let codigo = inputCodigo ? inputCodigo.value.trim() : "";
    
    if (!codigo || codigo === "") {
        alert("⚠️ Escribe el código de invitación primero.");
        return;
    }

    const loading = document.getElementById('loading-overlay');
    if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Buscando vehículo..."; }

    try {
        const invRef = window.doc(window.db, "invitaciones", codigo);
        const invSnap = await window.getDoc(invRef);

        if (!invSnap.exists()) {
            if(loading) loading.style.display = "none";
            alert("❌ El código no existe, es incorrecto o ya ha sido utilizado por alguien.");
            return;
        }

        const data = invSnap.data();
        
        if (data.creador === window.auth.currentUser.uid) {
            if(loading) loading.style.display = "none";
            alert("⚠️ No puedes unirte a un vehículo que tú mismo has creado.");
            return;
        }

        const cocheImportado = data.cocheData;
        cocheImportado.name = "🤝 " + cocheImportado.name;
        cocheImportado.rol = data.rolAsignado || 'editor';

        let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
        if (myCars.find(c => String(c.id) === String(cocheImportado.id))) {
            if(loading) loading.style.display = "none";
            alert("⚠️ Ya tienes este vehículo en tu garaje.");
            return;
        }

        myCars.push(cocheImportado);
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
        await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });

        await window.setDoc(window.doc(window.db, "gastos_compartidos", String(cocheImportado.id)), {
            miembros: window.arrayUnion ? window.arrayUnion(window.auth.currentUser.uid) : [window.auth.currentUser.uid]
        }, { merge: true });

        try {
            await window.deleteDoc(invRef);
        } catch (errorFirebase) {
            console.log("Aviso: Falta actualizar las reglas de Firestore para permitir el borrado.");
        }

        if(loading) loading.style.display = "none";
        
                let rolNombre = cocheImportado.rol === 'admin' ? 'Administrador' : (cocheImportado.rol === 'lector' ? 'Lector' : 'Conductor');
        alert(`✅ ¡Vehículo añadido a tu garaje!\n\nTu nivel de permiso es: ${rolNombre}`);
        
        if(inputCodigo) inputCodigo.value = "";
        
        renderCars();
        if(typeof window.updateCarSelect === 'function') window.updateCarSelect();
        
        if(typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();

    } catch (error) {
        if(loading) loading.style.display = "none";
        alert("❌ Error al unirse. Comprueba tu conexión.");
    }
}

export function iniciarRadaresCompartidos() {
    if (!window.auth || !window.auth.currentUser || !window.db) return;
    
    if (window.radaresActivos) {
        window.radaresActivos.forEach(apagar => apagar());
    }
    window.radaresActivos = [];

    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];

    if (myCars && myCars.length > 0) {
        myCars.forEach(car => {
            if (!car.compartido) return;

            let apagarRadar = window.onSnapshot(window.doc(window.db, "gastos_compartidos", String(car.id)), (docSnapCompartido) => {
                if (docSnapCompartido.exists()) {
                    let dataCompartida = docSnapCompartido.data();
                    let huboCambiosUI = false;
                    let bitacoraLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];

                    if (dataCompartida.cocheEliminado === true) {
                        apagarRadar(); 
                        
                        let updatedCars = myCars.filter(c => String(c.id) !== String(car.id));
                        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(updatedCars));
                        
                        let updatedBitacora = bitacoraLocal.filter(b => String(b.carId) !== String(car.id));
                        localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(updatedBitacora));

                        let mantLocalInvitado = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
                        mantLocalInvitado = mantLocalInvitado.filter(m => String(m.carId) !== String(car.id));
                        localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocalInvitado));
                        
                        if (window.auth && window.auth.currentUser) {
                            window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { 
                                misCoches: updatedCars,
                                miBitacora: updatedBitacora,
                                miTaller: mantLocalInvitado
                            }, { merge: true });
                        }
                        
                        alert(`🚨 El administrador ha eliminado el vehículo compartido y todos sus gastos asociados.`);
                        renderCars();
                        updateCarSelect();
                        if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();
                        return;
                    }

                    if (dataCompartida.cocheData) {
                        let idx = myCars.findIndex(c => String(c.id) === String(car.id));
                        if (idx > -1) {
                            let cocheLocal = myCars[idx];
                            let soyInvitado = cocheLocal.name.startsWith("🤝 ");
                            let nombreFinal = dataCompartida.cocheData.name;
                            
                            if (soyInvitado && !nombreFinal.startsWith("🤝 ")) {
                                nombreFinal = "🤝 " + nombreFinal;
                            }
                            
                            let rolExistente = cocheLocal.rol || 'editor';
                            let cocheActualizado = { ...dataCompartida.cocheData, name: nombreFinal, compartido: true, rol: rolExistente };
                            
                            if (JSON.stringify(cocheLocal) !== JSON.stringify(cocheActualizado)) {
                                myCars[idx] = cocheActualizado;
                                localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
                                
                                if (window.auth && window.auth.currentUser) {
                                    window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });
                                }
                                
                                huboCambiosUI = true;
                                renderCars();
                            }
                        }
                    }

                    if (dataCompartida.repostajes) {
                        let viejaStr = JSON.stringify(bitacoraLocal.filter(b => String(b.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.repostajes);
                        
                        if (viejaStr !== nuevaStr) {
                            let nuevaBitacora = bitacoraLocal.filter(b => String(b.carId) !== String(car.id));
                            nuevaBitacora = nuevaBitacora.concat(dataCompartida.repostajes);
                            
                            const getHoyYMD = () => { const d=new Date(); let m=''+(d.getMonth()+1), di=''+d.getDate(), a=d.getFullYear(); if(m.length<2)m='0'+m; if(di.length<2)di='0'+di; return [a,m,di].join('-'); };
                            const esToYMD = (esDate) => { if(!esDate) return getHoyYMD(); let p=esDate.split('/'); if(p.length!==3) return getHoyYMD(); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };
                            
                            nuevaBitacora.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(nuevaBitacora));
                            if(typeof window.bitacora !== 'undefined') window.bitacora = nuevaBitacora; 
                            huboCambiosUI = true;
                        }
                    }

                    if (dataCompartida.taller) {
                        let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
                        let viejaStr = JSON.stringify(mantLocal.filter(m => String(m.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.taller);

                        if (viejaStr !== nuevaStr) {
                            let nuevoTaller = mantLocal.filter(m => String(m.carId) !== String(car.id));
                            nuevoTaller = nuevoTaller.concat(dataCompartida.taller);
                            
                            const getHoyYMD = () => { const d=new Date(); let m=''+(d.getMonth()+1), di=''+d.getDate(), a=d.getFullYear(); if(m.length<2)m='0'+m; if(di.length<2)di='0'+di; return [a,m,di].join('-'); };
                            const esToYMD = (esDate) => { if(!esDate) return getHoyYMD(); let p=esDate.split('/'); if(p.length!==3) return getHoyYMD(); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };

                            nuevoTaller.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(nuevoTaller));
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

export function lanzarNotificacion(titulo, cuerpo) {
    const opciones = {
        body: cuerpo,
        icon: 'android-chrome-192x192.png',
        badge: 'favicon-32x32.png',
        vibrate: [200, 100, 200]
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification(titulo, opciones);
        });
    } else {
        new Notification(titulo, opciones);
    }
}

export function solicitarPermisoNotificaciones() {
    if (!("Notification" in window)) {
        alert("Tu dispositivo o navegador no soporta notificaciones.");
        return;
    }
    
    if (Notification.permission === "denied") {
        alert("⚠️ Tienes las notificaciones bloqueadas en tu navegador para esta web.\n\nPara activarlas, toca el candado (o icono de ajustes) al lado de la dirección de la web, ve a Permisos, y activa 'Notificaciones'.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("¡Activadas! Te avisaremos cuando caduque tu ITV o Seguro.");
            const btnNoti = document.getElementById('btnNotificaciones');
            if(btnNoti) btnNoti.style.display = 'none';
            lanzarNotificacion("¡Precio Combustibles!", "Las alertas del garaje están listas y funcionando.");
        }
    });
}

export function revisarAlertasAlEntrar() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const hoy = new Date();
    const ultimaNoti = localStorage.getItem('gasofa_last_noti');
    const fechaHoyStr = hoy.toDateString();

    if (ultimaNoti === fechaHoyStr) return; 

    let hayAvisos = false;
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];

    myCars.forEach(car => {
        if (car.itv) {
            let diasItv = (new Date(car.itv) - hoy) / (1000 * 60 * 60 * 24);
            if (diasItv <= 15 && diasItv >= -365) {
                let mensaje = diasItv < 0
                    ? `¡CADUCADA hace ${Math.abs(Math.round(diasItv))} días! Peligro de multa. 🚔`
                    : `Caduca en ${Math.ceil(diasItv)} días. ¡Pide cita!`;
                lanzarNotificacion(`⚠️ ITV de ${car.name}`, mensaje);
                hayAvisos = true;
            }
        }
        if (car.seguro) {
            let diasSeg = (new Date(car.seguro) - hoy) / (1000 * 60 * 60 * 24);
            if (diasSeg <= 15 && diasSeg >= -365) {
                let mensaje = diasSeg < 0
                    ? `¡VENCIDO hace ${Math.abs(Math.round(diasSeg))} días! Conduces sin seguro. 🚨`
                    : `Vence en ${Math.ceil(diasSeg)} días. Revisa tu póliza.`;
                lanzarNotificacion(`🛡️ Seguro de ${car.name}`, mensaje);
                hayAvisos = true;
            }
        }
    });

    if (hayAvisos) {
        localStorage.setItem('gasofa_last_noti', fechaHoyStr);
    }
}

window.lanzarNotificacion = lanzarNotificacion;
window.solicitarPermisoNotificaciones = solicitarPermisoNotificaciones;
window.revisarAlertasAlEntrar = revisarAlertasAlEntrar;
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
window.abandonarCocheCompartido = abandonarCocheCompartido;
