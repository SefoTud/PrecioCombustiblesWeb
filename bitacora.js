// Archivo: bitacora.js

import { q, STORAGE_KEYS, getHoyYMD, esToYMD, ymdToEs } from './utils.js';

window.precioMaximoZona = 0;

export function abrirAnotar(nombreGasolinera, precioL, ahorroMax) {
    window.precioMaximoZona = (precioL || 0) + (parseFloat(ahorroMax) || 0);

    if(q('bitacoraGasName')) q('bitacoraGasName').innerText = nombreGasolinera;
    if(q('bitacoraPrecioManual')) q('bitacoraPrecioManual').value = precioL ? precioL.toFixed(3) : '';
    if(q('bitacoraLitros')) q('bitacoraLitros').value = '';
    if(q('bitacoraEuros')) q('bitacoraEuros').value = '';
    if(q('bitacoraKm')) q('bitacoraKm').value = '';
    if(q('bitacoraFecha')) q('bitacoraFecha').value = getHoyYMD();
    if(q('editBitacoraId')) q('editBitacoraId').value = '';

    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let select = q('bitacoraCarSelect');
    if(select) {
        select.innerHTML = '<option value="">🚘 Selecciona con qué vehículo...</option>';
        myCars.forEach(c => { 
            if (c.rol !== 'lector') {
                select.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; 
            }
        });
        let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
        if (activeCar) select.value = activeCar;
    }

    if(q('bitacoraModal')) q('bitacoraModal').style.display = 'flex';
}

export function cancelarEdicionBitacora() {
    if(q('bitacoraModal')) q('bitacoraModal').style.display = 'none';
}

export async function guardarBitacora() {
    let litros = parseFloat(q('bitacoraLitros').value);
    let euros = parseFloat(q('bitacoraEuros').value);
    let carId = q('bitacoraCarSelect').value;
    let precioManual = parseFloat(q('bitacoraPrecioManual').value);
    
    if (!carId || (isNaN(litros) && isNaN(euros))) {
        alert("⚠️ Selecciona un vehículo y pon los Litros o los Euros.");
        return;
    }

    if (!window.auth || !window.auth.currentUser) {
        alert("⚠️ Inicia sesión en 'Mi Perfil' para guardar repostajes en la nube.");
        return;
    }

    if (isNaN(litros) && !isNaN(euros) && precioManual > 0) litros = euros / precioManual;
    if (isNaN(euros) && !isNaN(litros) && precioManual > 0) euros = litros * precioManual;
    let pL = precioManual > 0 ? precioManual : (euros / litros);

    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let foundCar = myCars.find(c => String(c.id) === String(carId));
    
    if (foundCar && foundCar.rol === 'lector') {
        alert("⚠️ Tu rol en este coche es de 'Solo Lectura'. No puedes guardar gastos.");
        return;
    }

    let carName = foundCar ? foundCar.name : "Vehículo";

    let n = q('bitacoraGasName').innerText;
    let fEs = ymdToEs(q('bitacoraFecha').value);
    let km = parseFloat(q('bitacoraKm').value) || 0;
    let editId = q('editBitacoraId').value;

    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let miNombre = window.auth.currentUser.displayName ? window.auth.currentUser.displayName.split(" ")[0] : "Conductor";

    let nuevoAhorroPL = window.precioMaximoZona > 0 ? (window.precioMaximoZona - pL) : 0;
    if (nuevoAhorroPL < 0) nuevoAhorroPL = 0; 

    let nuevoRegistro = {
        id: editId ? parseInt(editId) : Date.now(),
        fecha: fEs, nombre: n, litros: parseFloat(litros.toFixed(2)), euros: parseFloat(euros.toFixed(2)),
        precioL: parseFloat(pL.toFixed(3)), km: km, carId: carId, carName: carName, usuario: miNombre,
        ahorroPL: parseFloat(nuevoAhorroPL.toFixed(3)) 
    };

    if (editId) {
        let idx = bitacora.findIndex(b => String(b.id) === String(editId));
        if (idx > -1) bitacora[idx] = nuevoRegistro;
    } else {
        bitacora.push(nuevoRegistro);
    }

    // 🔥 Ordenamos por Fecha, y si es el mismo día, desempata el ID (Milisegundo exacto)
    bitacora.sort((a, b) => {
        let diff = new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime();
        if (diff === 0) return b.id - a.id; 
        return diff;
    });

    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(bitacora));

    await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miBitacora: bitacora }, { merge: true });

    if (carId && foundCar && foundCar.compartido) {
        let bitacoraEsteCoche = bitacora.filter(b => String(b.carId) === String(carId));
        window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), { repostajes: bitacoraEsteCoche }, { merge: true });
    }

    if(typeof window.mostrarToast === 'function') window.mostrarToast("💾 Repostaje guardado", "exito");
    else alert("💾 Repostaje guardado");
    
    if (typeof gtag === 'function') gtag('event', 'anotar_repostaje');

    q('bitacoraModal').style.display = 'none';
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
    if (q('historialModal') && q('historialModal').style.display === 'flex') actualizarListaHistorial();
}

export function abrirHistorial() {
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let fC = q('historialCarFilter');
    if(fC) {
        fC.innerHTML = '<option value="all">🚗 Todos mis vehículos</option>';
        myCars.forEach(c => { fC.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
        let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
        if (activeCar) fC.value = activeCar;
    }
    
    if(q('historialModal')) q('historialModal').style.display = 'flex';
    if(q('mapAhorroBadge')) q('mapAhorroBadge').style.display = 'none';

    window.mesesMemoria = null; 
    actualizarListaHistorial();
}

function actualizarMesesFiltro() {
    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let fM = q('historialMesFilter');
    let fC = q('historialCarFilter');
    if(!fM) return;
    
    let filterCarId = fC ? fC.value : 'all';
    let filtradosGas = filterCarId === "all" ? bitacora : bitacora.filter(b => String(b.carId) === String(filterCarId));
    let filtradosTaller = filterCarId === "all" ? mantLocal : mantLocal.filter(m => String(m.carId) === String(filterCarId));

    let todos = [];
    filtradosGas.forEach(b => todos.push(b.fecha));
    filtradosTaller.forEach(m => todos.push(m.fecha));

    let mesesUnicos = new Set();
    todos.forEach(f => {
        let p = f.split('/');
        if(p.length === 3) mesesUnicos.add(`${p[2]}-${p[1]}`);
    });

    let arrMeses = Array.from(mesesUnicos).sort().reverse();
    let arrMesesStr = JSON.stringify(arrMeses);
    
    if (window.mesesMemoria !== arrMesesStr) {
        let htmlMeses = '<option value="all">📅 Histórico Total</option>';
        const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        arrMeses.forEach(m => {
            let [anio, mesNum] = m.split('-');
            let nombreM = nombresMes[parseInt(mesNum)-1];
            htmlMeses += `<option value="${m}">${nombreM} ${anio}</option>`;
        });

        let valActual = fM.value;
        fM.innerHTML = htmlMeses;
        
        if (valActual && arrMeses.includes(valActual)) { fM.value = valActual; } 
        else { fM.value = 'all'; }
        window.mesesMemoria = arrMesesStr;
    }
}

export function actualizarListaHistorial() {
    actualizarMesesFiltro();

    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    
    let cochesParaConsumo = {};
    bitacora.forEach(b => {
        if (!cochesParaConsumo[b.carId]) cochesParaConsumo[b.carId] = [];
        cochesParaConsumo[b.carId].push(b);
    });

    Object.values(cochesParaConsumo).forEach(listaCoche => {
        // 🔥 Para comparar cronológicamente, desempatamos también por ID (el más viejo primero)
        listaCoche.sort((a, b) => {
            let diff = new Date(esToYMD(a.fecha)).getTime() - new Date(esToYMD(b.fecha)).getTime();
            if (diff === 0) return a.id - b.id; 
            return diff;
        });

        for (let i = 1; i < listaCoche.length; i++) {
            let anterior = listaCoche[i - 1];
            let actual = listaCoche[i];
            
            if (actual.km > 0 && anterior.km > 0 && actual.km > anterior.km) {
                let distancia = actual.km - anterior.km;
                actual.consumoReal = ((actual.litros / distancia) * 100).toFixed(1);
            }
        }
    });
    
    let filterCarId = q('historialCarFilter') ? q('historialCarFilter').value : 'all';
    let filterTipo = q('historialTipoFilter') ? q('historialTipoFilter').value : 'all';
    let filterMes = q('historialMesFilter') ? q('historialMesFilter').value : 'all';
    let lista = q('listaBitacora');
    if(!lista) return;
    
    let filtradosGas = filterCarId === "all" ? bitacora : bitacora.filter(b => String(b.carId) === String(filterCarId));
    let filtradosTaller = filterCarId === "all" ? mantLocal : mantLocal.filter(m => String(m.carId) === String(filterCarId));

    let combined = [];
    filtradosGas.forEach(b => combined.push({ type: 'gas', date: b.fecha, obj: b }));
    filtradosTaller.forEach(m => combined.push({ type: 'taller', date: m.fecha, obj: m }));

    combined = combined.filter(item => {
        let pasaTipo = (filterTipo === 'all' || filterTipo === item.type);
        let pasaMes = true;
        if (filterMes !== 'all') {
            let partes = item.date.split('/');
            if(partes.length === 3) pasaMes = (`${partes[2]}-${partes[1]}` === filterMes);
        }
        return pasaTipo && pasaMes;
    });

    // 🔥 Ordenamos lo que sale en pantalla (El más nuevo primero, con desempate por ID)
    combined.sort((a, b) => {
        let diff = new Date(esToYMD(b.date)).getTime() - new Date(esToYMD(a.date)).getTime();
        if (diff === 0) return b.obj.id - a.obj.id;
        return diff;
    });

    let html = "";
    let sumaGas = 0, sumaTaller = 0, sumaL = 0;

    combined.forEach(item => {
        let fStr = item.date;
        let cN = window.escaparHTML ? window.escaparHTML(item.obj.carName || "-") : item.obj.carName;
        let uN = item.obj.usuario ? `<span style="font-size:10px; color:var(--accent); font-weight:bold; background:var(--bg-panel); padding:2px 6px; border-radius:4px; border:1px solid var(--border-color);">👤 ${item.obj.usuario}</span>` : '';

        let cocheLigado = myCars.find(c => String(c.id) === String(item.obj.carId));
        let puedeModificar = true;
        if (cocheLigado && cocheLigado.compartido && cocheLigado.name.startsWith("🤝 ")) {
            if (cocheLigado.rol === 'editor' || cocheLigado.rol === 'lector') puedeModificar = false;
        }

        let bloqueBotonesGas = puedeModificar ? 
            `<button onclick="editarBitacora(${item.obj.id})" class="btn-icon-only btn-icon-edit">✏️</button>
             <button onclick="borrarBitacora(${item.obj.id})" class="btn-icon-only btn-icon-delete">🗑️</button>` : '';

        let bloqueBotonesTaller = puedeModificar ? 
            `<button onclick="if(typeof window.editarTaller === 'function') window.editarTaller(${item.obj.id}, true)" class="btn-icon-only btn-icon-edit">✏️</button>
             <button onclick="if(typeof window.borrarTaller === 'function') window.borrarTaller(${item.obj.id}, true)" class="btn-icon-only btn-icon-delete">🗑️</button>` : '';

        if (item.type === 'gas') {
            let b = item.obj;
            sumaGas += b.euros; sumaL += b.litros;
            let ahorroExacto = ((b.ahorroPL || 0) * b.litros).toFixed(2);
            let textoAhorro = parseFloat(ahorroExacto) > 0 ? `<div style="font-size:11.5px; color:var(--accent-green); font-weight:900; margin-top:2px;">💰 +${ahorroExacto} €</div>` : '';
            let logoHTML = typeof window.getLogoGasolinera === 'function' ? window.getLogoGasolinera(b.nombre) : '⛽';

            let consumoBadge = b.consumoReal ? `<span style="background:#8e44ad; color:white; font-size:9px; font-weight:bold; padding:3px 6px; border-radius:8px; margin-left:6px; display:inline-block; box-shadow:0 1px 2px rgba(0,0,0,0.1);">📈 ${b.consumoReal} L/100</span>` : '';

            html += `
            <div class="card-hist-gas" style="align-items:flex-start;">
                <div style="flex:1; min-width:0; padding-right:10px;">
                    <div class="txt-hist-titulo" style="display:flex; align-items:center; gap:6px;">
                        ${logoHTML}
                        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.nombre}</span>
                    </div>
                    <div class="txt-hist-detalle">${fStr} • ${b.litros} L a ${b.precioL} €/L</div>
                    <div class="txt-hist-detalle" style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-top:4px;">🚗 ${cN} | Km: ${b.km || '-'}${consumoBadge}</div>
                    <div style="margin-top:4px;">${uN}</div>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                    <div class="txt-gasto-rojo">-${b.euros} €</div>
                    ${textoAhorro}
                    <div class="btn-group-sm" style="margin-top:5px; justify-content:flex-end;">
                        ${bloqueBotonesGas}
                    </div>
                </div>
            </div>`;
        } else {
            let m = item.obj;
            sumaTaller += m.coste;
            let btnFoto = m.factura ? `<button onclick="if(typeof window.verFacturaTaller === 'function') window.verFacturaTaller('${m.factura}', '${m.tipo}')" class="btn-factura">📷 Ver Factura</button>` : '';
            html += `
            <div class="card-hist-taller">
                <div>
                    <div class="txt-hist-titulo">🔧 ${m.tipo}</div>
                    <div class="txt-hist-detalle">${fStr} • 🚗 ${cN}</div>
                    <div class="txt-hist-detalle">Km: ${m.km || '-'}</div>
                    ${uN}
                    ${btnFoto}
                </div>
                <div style="text-align:right;">
                    <div class="txt-gasto-rojo">-${m.coste} €</div>
                    <div class="btn-group-sm" style="margin-top:5px; justify-content:flex-end;">
                        ${bloqueBotonesTaller}
                    </div>
                </div>
            </div>`;
        }
    });

    if (combined.length === 0) { lista.innerHTML = "<div style='text-align:center;color:var(--text-muted);font-size:12px;padding:20px;'>No hay gastos registrados en este periodo.</div>"; } 
    else { lista.innerHTML = html; }

    if(q('resumenMes')) {
        let totalGastos = sumaGas + sumaTaller;
        let txtResumen = `📉 GASTOS: ${totalGastos.toFixed(2)} €<br>`;
        if (sumaGas > 0) txtResumen += `<span style="font-size:11px; font-weight:normal; color:var(--text-main);">⛽ Combustible: ${sumaGas.toFixed(2)}€ (${sumaL.toFixed(1)} L)</span><br>`;
        if (sumaTaller > 0) txtResumen += `<span style="font-size:11px; font-weight:normal; color:var(--text-main);">🔧 Taller: ${sumaTaller.toFixed(2)}€</span>`;
        q('resumenMes').innerHTML = txtResumen;
    }

    let canvas = q('gastosChart');
    if (canvas) {
        let ctx = canvas.getContext('2d');
        if (window.gastosChartInstance) { window.gastosChartInstance.destroy(); }
        
        if (sumaGas === 0 && sumaTaller === 0) {
            canvas.style.display = 'none';
            if(q('btnToggleGrafica')) q('btnToggleGrafica').style.display = 'none';
        } else {
            canvas.style.display = 'block';
            if(q('btnToggleGrafica')) q('btnToggleGrafica').style.display = 'flex';
            
            let isDark = document.body.classList.contains('dark-mode');
            let textColor = isDark ? '#e0e0e0' : '#333';
            let gridColor = isDark ? '#3a3b3c' : '#e4e6eb';

            let mesesData = {};
            combined.forEach(item => {
                let partes = item.date.split('/');
                if (partes.length === 3) {
                    let mesAnio = `${partes[1]}/${partes[2]}`;
                    if (!mesesData[mesAnio]) mesesData[mesAnio] = { gas: 0, taller: 0, time: new Date(`${partes[2]}-${partes[1]}-01`).getTime() };
                    if (item.type === 'gas') mesesData[mesAnio].gas += item.obj.euros;
                    else mesesData[mesAnio].taller += item.obj.coste;
                }
            });

            let sortedMeses = Object.keys(mesesData).sort((a, b) => mesesData[a].time - mesesData[b].time);
            
            let labels = [];
            let dataGas = [];
            let dataTaller = [];
            const nombresMesCoto = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

            sortedMeses.forEach(m => {
                let [mes, anio] = m.split('/');
                labels.push(`${nombresMesCoto[parseInt(mes)-1]} ${anio}`);
                dataGas.push(parseFloat(mesesData[m].gas.toFixed(2)));
                dataTaller.push(parseFloat(mesesData[m].taller.toFixed(2)));
            });

            window.gastosChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: '⛽ Comb.', data: dataGas, backgroundColor: '#3498db', borderRadius: 4 },
                        { label: '🔧 Taller', data: dataTaller, backgroundColor: '#e74c3c', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, ticks: { color: textColor }, grid: { display: false } },
                        y: { stacked: true, beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                    plugins: {
                        legend: { labels: { color: textColor } },
                        tooltip: { callbacks: { label: function(context) { return ' ' + context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' €'; } } }
                    }
                }
            });
        }
    }
    
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
}

export async function borrarBitacora(id) {
    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let bIndex = bitacora.findIndex(b => String(b.id) === String(id));
    if (bIndex === -1) return;

    let carId = bitacora[bIndex].carId;
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let cocheActual = myCars.find(c => String(c.id) === String(carId));

    if (cocheActual && cocheActual.compartido && cocheActual.name.startsWith("🤝 ")) {
        if (cocheActual.rol !== 'admin') {
            alert("⚠️ Como 'Conductor' solo puedes anotar gastos nuevos. Para modificarlos o borrarlos, avisa al Administrador del vehículo.");
            return;
        }
    }

    let seguro = await window.appConfirm("¿Seguro que quieres borrar este repostaje? Esta acción no se puede deshacer.", "Borrar Repostaje", "🗑️");
    if (!seguro) return;

    bitacora.splice(bIndex, 1);
    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(bitacora));

    if (window.auth && window.auth.currentUser) {
        window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miBitacora: bitacora }, { merge: true });
        if (cocheActual && cocheActual.compartido) {
            let bitacoraEsteCoche = bitacora.filter(b => String(b.carId) === String(carId));
            window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), { repostajes: bitacoraEsteCoche }, { merge: true });
        }
    }
    actualizarListaHistorial();
}

export function editarBitacora(id) {
    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
    let record = bitacora.find(b => String(b.id) === String(id));
    
    if (record) {
        let cocheActual = myCars.find(c => String(c.id) === String(record.carId));
        if (cocheActual && cocheActual.compartido && cocheActual.name.startsWith("🤝 ") && cocheActual.rol !== 'admin') {
            alert("⚠️ No tienes permisos para editar los gastos de este vehículo.");
            return;
        }

        if(q('historialModal')) q('historialModal').style.display = 'none';
        
        abrirAnotar(record.nombre, record.precioL, record.ahorroPL || 0); 
        
        if(q('editBitacoraId')) q('editBitacoraId').value = id;
        if(q('bitacoraLitros')) q('bitacoraLitros').value = record.litros;
        if(q('bitacoraEuros')) q('bitacoraEuros').value = record.euros;
        if(q('bitacoraCarSelect')) q('bitacoraCarSelect').value = record.carId;
        if(q('bitacoraFecha')) q('bitacoraFecha').value = esToYMD(record.fecha);
        if(q('bitacoraKm')) q('bitacoraKm').value = record.km || '';
    }
}

export function actualizarAhorroGlobal() {
    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let ahorrosPorCoche = {};
    let ahorroTotal = 0;

    bitacora.forEach(b => {
        let litros = parseFloat(b.litros) || 0;
        let ahorroEstimado = litros * (b.ahorroPL || 0); 
        ahorrosPorCoche[b.carId] = (ahorrosPorCoche[b.carId] || 0) + ahorroEstimado;
        ahorroTotal += ahorroEstimado;
    });

    const txtPerfil = document.getElementById('perfilAhorroTotal');
    if (txtPerfil) txtPerfil.innerText = ahorroTotal.toFixed(2) + " €";
    
    const txtMap = document.getElementById('mapAhorroText');
    if (txtMap) txtMap.innerText = ahorroTotal.toFixed(2) + " €";
    
    const badge = document.getElementById('mapAhorroBadge');
    if (badge) {
        if (ahorroTotal > 0) badge.style.display = 'flex';
        else badge.style.display = 'none'; 
    }
    
    return ahorrosPorCoche;
}

export function mostrarTendenciaZona() {
    alert("Para ver la tendencia general de tu zona o provincia, selecciona una gasolinera en el mapa y pulsa el botón '📈 Histórico'.");
}

export function enviarValoracion() {
    alert("Esta función se activará en la próxima actualización. ¡Gracias por tu interés!");
    if(q('reviewsModal')) q('reviewsModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const lInput = q('bitacoraLitros');
        const eInput = q('bitacoraEuros');
        const pInput = q('bitacoraPrecioManual');

        const calcularEuros = () => {
            let p = parseFloat(pInput.value) || 0;
            let l = parseFloat(lInput.value) || 0;
            if (p > 0 && l > 0) eInput.value = (l * p).toFixed(2);
            else if (l === 0 || isNaN(l)) eInput.value = '';
        };

        const calcularLitros = () => {
            let p = parseFloat(pInput.value) || 0;
            let e = parseFloat(eInput.value) || 0;
            if (p > 0 && e > 0) lInput.value = (e / p).toFixed(2);
            else if (e === 0 || isNaN(e)) lInput.value = '';
        };

        if (lInput) lInput.addEventListener('input', calcularEuros);
        if (eInput) eInput.addEventListener('input', calcularLitros);
        if (pInput) pInput.addEventListener('input', calcularEuros);
    }, 500);
});

window.abrirAnotar = abrirAnotar;
window.cancelarEdicionBitacora = cancelarEdicionBitacora;
window.guardarBitacora = guardarBitacora;
window.abrirHistorial = abrirHistorial;
window.actualizarListaHistorial = actualizarListaHistorial;
window.borrarBitacora = borrarBitacora;
window.editarBitacora = editarBitacora;
window.actualizarAhorroGlobal = actualizarAhorroGlobal;
window.mostrarTendenciaZona = mostrarTendenciaZona;
window.enviarValoracion = enviarValoracion;
