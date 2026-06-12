// Archivo: bitacora.js

const q = id => document.getElementById(id);

function getHoyYMD() { const d = new Date(); let m = ''+(d.getMonth()+1), di = ''+d.getDate(), a = d.getFullYear(); if(m.length<2)m='0'+m; if(di.length<2)di='0'+di; return [a,m,di].join('-'); }
function esToYMD(esDate) { if (!esDate) return getHoyYMD(); let p = esDate.split('/'); if (p.length !== 3) return getHoyYMD(); return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`; }
function ymdToEs(ymdDate) { if (!ymdDate) return new Date().toLocaleDateString('es-ES'); let p = ymdDate.split('-'); if (p.length !== 3) return new Date().toLocaleDateString('es-ES'); return `${parseInt(p[2])}/${parseInt(p[1])}/${p[0]}`; }

export function abrirAnotar(nombreGasolinera, precioL, ahorroMax) {
    if(q('bitacoraGasName')) q('bitacoraGasName').innerText = nombreGasolinera;
    if(q('bitacoraPrecioManual')) q('bitacoraPrecioManual').value = precioL ? precioL.toFixed(3) : '';
    if(q('bitacoraLitros')) q('bitacoraLitros').value = '';
    if(q('bitacoraEuros')) q('bitacoraEuros').value = '';
    if(q('bitacoraKm')) q('bitacoraKm').value = '';
    if(q('bitacoraFecha')) q('bitacoraFecha').value = getHoyYMD();
    if(q('editBitacoraId')) q('editBitacoraId').value = '';

    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let select = q('bitacoraCarSelect');
    if(select) {
        select.innerHTML = '<option value="">🚘 Selecciona con qué vehículo...</option>';
        myCars.forEach(c => { select.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
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

    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let foundCar = myCars.find(c => String(c.id) === String(carId));
    let carName = foundCar ? foundCar.name : "Vehículo";

    let n = q('bitacoraGasName').innerText;
    let fEs = ymdToEs(q('bitacoraFecha').value);
    let km = parseFloat(q('bitacoraKm').value) || 0;
    let editId = q('editBitacoraId').value;

    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let miNombre = window.auth.currentUser.displayName ? window.auth.currentUser.displayName.split(" ")[0] : "Conductor";

    let nuevoRegistro = {
        id: editId ? parseInt(editId) : Date.now(),
        fecha: fEs, nombre: n, litros: parseFloat(litros.toFixed(2)), euros: parseFloat(euros.toFixed(2)),
        precioL: parseFloat(pL.toFixed(3)), km: km, carId: carId, carName: carName, usuario: miNombre
    };

    if (editId) {
        let idx = bitacora.findIndex(b => String(b.id) === String(editId));
        if (idx > -1) bitacora[idx] = nuevoRegistro;
    } else {
        bitacora.push(nuevoRegistro);
    }

    bitacora.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
    localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));

    await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miBitacora: bitacora }, { merge: true });

    if (carId && foundCar && foundCar.compartido) {
        let bitacoraEsteCoche = bitacora.filter(b => String(b.carId) === String(carId));
        window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), { repostajes: bitacoraEsteCoche }, { merge: true });
    }

    q('bitacoraModal').style.display = 'none';
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
    if (q('historialModal') && q('historialModal').style.display === 'flex') actualizarListaHistorial();
}

export function abrirHistorial() {
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let fC = q('historialCarFilter');
    if(fC) {
        fC.innerHTML = '<option value="all">🚗 Todos mis vehículos</option>';
        myCars.forEach(c => { fC.innerHTML += `<option value="${c.id}">${c.name}</option>`; });
        let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
        if (activeCar) fC.value = activeCar;
    }
    
    // 🔥 SOLUCIÓN GRÁFICA A CERO: Mostrar la ventana ANTES de dibujar la gráfica
    if(q('historialModal')) q('historialModal').style.display = 'flex';
    if(q('mapAhorroBadge')) q('mapAhorroBadge').style.display = 'none';

    // Forzamos al desplegable a repintarse desde cero la primera vez
    window.mesesMemoria = null; 
    actualizarListaHistorial();
}

function actualizarMesesFiltro() {
    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let fM = q('historialMesFilter');
    let fC = q('historialCarFilter');
    if(!fM) return;
    
    // Buscamos solo los meses del coche que tenemos seleccionado en ese momento
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
    
    // 🔥 SOLUCIÓN MES FANTASMA: Solo repinta el menú si detecta que la cantidad de meses únicos ha cambiado
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
        
        // Comprobamos si el mes que tenías seleccionado sigue existiendo
        if (valActual && arrMeses.includes(valActual)) {
            fM.value = valActual;
        } else {
            fM.value = 'all'; // Si lo has borrado, salta al histórico total por seguridad
        }
        window.mesesMemoria = arrMesesStr;
    }
}

export function actualizarListaHistorial() {
    // 1. Repasamos la lista de meses SIEMPRE de forma inteligente
    actualizarMesesFiltro();

    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    
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

    combined.sort((a, b) => new Date(esToYMD(b.date)).getTime() - new Date(esToYMD(a.date)).getTime());

    let html = "";
    let sumaGas = 0, sumaTaller = 0, sumaL = 0;

    combined.forEach(item => {
        let fStr = item.date;
        let cN = window.escaparHTML ? window.escaparHTML(item.obj.carName || "-") : item.obj.carName;
        let uN = item.obj.usuario ? `<span style="font-size:10px; color:var(--accent); font-weight:bold; background:var(--bg-panel); padding:2px 6px; border-radius:4px; border:1px solid var(--border-color);">👤 ${item.obj.usuario}</span>` : '';

        if (item.type === 'gas') {
            let b = item.obj;
            sumaGas += b.euros; sumaL += b.litros;
            html += `
            <div class="card-hist-gas">
                <div>
                    <div class="txt-hist-titulo">⛽ ${b.nombre}</div>
                    <div class="txt-hist-detalle">${fStr} • ${b.litros} L a ${b.precioL} €/L</div>
                    <div class="txt-hist-detalle">🚗 ${cN} | Km: ${b.km || '-'}</div>
                    ${uN}
                </div>
                <div style="text-align:right;">
                    <div class="txt-gasto-rojo">-${b.euros} €</div>
                    <div class="btn-group-sm" style="margin-top:5px; justify-content:flex-end;">
                        <button onclick="editarBitacora(${b.id})" class="btn-icon-only btn-icon-edit">✏️</button>
                        <button onclick="borrarBitacora(${b.id})" class="btn-icon-only btn-icon-delete">🗑️</button>
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
                        <button onclick="if(typeof window.editarTaller === 'function') window.editarTaller(${m.id}, true)" class="btn-icon-only btn-icon-edit">✏️</button>
                        <button onclick="if(typeof window.borrarTaller === 'function') window.borrarTaller(${m.id}, true)" class="btn-icon-only btn-icon-delete">🗑️</button>
                    </div>
                </div>
            </div>`;
        }
    });

    if (combined.length === 0) {
        lista.innerHTML = "<div style='text-align:center;color:var(--text-muted);font-size:12px;padding:20px;'>No hay gastos registrados en este periodo.</div>";
    } else {
        lista.innerHTML = html;
    }

    if(q('resumenMes')) {
        let totalGastos = sumaGas + sumaTaller;
        let txtResumen = `📉 GASTOS: ${totalGastos.toFixed(2)} €<br>`;
        if (sumaGas > 0) txtResumen += `<span style="font-size:11px; font-weight:normal; color:var(--text-main);">⛽ Combustible: ${sumaGas.toFixed(2)}€ (${sumaL.toFixed(1)} L)</span><br>`;
        if (sumaTaller > 0) txtResumen += `<span style="font-size:11px; font-weight:normal; color:var(--text-main);">🔧 Taller: ${sumaTaller.toFixed(2)}€</span>`;
        q('resumenMes').innerHTML = txtResumen;
    }

    // 2. Dibujamos la gráfica
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
                        {
                            label: '⛽ Comb.',
                            data: dataGas,
                            backgroundColor: '#3498db',
                            borderRadius: 4
                        },
                        {
                            label: '🔧 Taller',
                            data: dataTaller,
                            backgroundColor: '#e74c3c',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { 
                            beginAtZero: true, 
                            ticks: { color: textColor }, 
                            grid: { color: gridColor } 
                        }
                    },
                    plugins: {
                        legend: { labels: { color: textColor } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ' ' + context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' €';
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
}

export function borrarBitacora(id) {
    if (!confirm("¿Seguro que quieres borrar este repostaje?")) return;
    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let bIndex = bitacora.findIndex(b => String(b.id) === String(id));
    if (bIndex === -1) return;

    let carId = bitacora[bIndex].carId;
    let myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
    let cocheActual = myCars.find(c => String(c.id) === String(carId));

    if (cocheActual && cocheActual.compartido && cocheActual.name.startsWith("🤝 ")) {
        alert("⚠️ Solo el administrador del vehículo puede borrar este gasto.");
        return;
    }

    bitacora.splice(bIndex, 1);
    localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));

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
    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let record = bitacora.find(b => String(b.id) === String(id));
    if (record) {
        if(q('historialModal')) q('historialModal').style.display = 'none';
        abrirAnotar(record.nombre, record.precioL, 0);
        if(q('editBitacoraId')) q('editBitacoraId').value = id;
        if(q('bitacoraLitros')) q('bitacoraLitros').value = record.litros;
        if(q('bitacoraEuros')) q('bitacoraEuros').value = record.euros;
        if(q('bitacoraCarSelect')) q('bitacoraCarSelect').value = record.carId;
        if(q('bitacoraFecha')) q('bitacoraFecha').value = esToYMD(record.fecha);
        if(q('bitacoraKm')) q('bitacoraKm').value = record.km || '';
    }
}

export function actualizarAhorroGlobal() {
    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
    let ahorrosPorCoche = {};
    let ahorroTotal = 0;

    bitacora.forEach(b => {
        let euros = parseFloat(b.euros) || 0;
        let ahorroEstimado = euros * 0.12; 
        ahorrosPorCoche[b.carId] = (ahorrosPorCoche[b.carId] || 0) + ahorroEstimado;
        ahorroTotal += ahorroEstimado;
    });

    const txtPerfil = document.getElementById('perfilAhorroTotal');
    if (txtPerfil) txtPerfil.innerText = ahorroTotal.toFixed(2) + " €";
    
    const txtMap = document.getElementById('mapAhorroText');
    if (txtMap) txtMap.innerText = ahorroTotal.toFixed(2) + " €";
    
    const badge = document.getElementById('mapAhorroBadge');
    if (badge && ahorroTotal > 0) badge.style.display = 'flex';
    
    return ahorrosPorCoche;
}

export function mostrarTendenciaZona() {
    alert("Para ver la tendencia general de tu zona o provincia, selecciona una gasolinera en el mapa y pulsa el botón '📈 Histórico'.");
}

export function enviarValoracion() {
    alert("Esta función se activará en la próxima actualización. ¡Gracias por tu interés!");
    if(q('reviewsModal')) q('reviewsModal').style.display = 'none';
}

// --- CALCULADORA EN VIVO DE LITROS Y EUROS ---
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

// Exportar a global
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
