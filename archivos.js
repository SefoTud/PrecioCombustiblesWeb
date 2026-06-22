// Archivo: archivos.js

import { q, STORAGE_KEYS, esToYMD } from './utils.js';

export async function exportarDatosCSV() {
    let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];
    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];

    if (bitacora.length === 0 && myCars.length === 0 && mantLocal.length === 0) {
        alert("⚠️ No tienes datos para exportar.");
        return;
    }

    if (typeof gtag === 'function') gtag('event', 'exportar_datos');

    let fechaHoy = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    
    let nombrePersonalizado = await window.appPrompt("Ponle un nombre a tu copia de seguridad:", `Copia_Precio_Combustibles_${fechaHoy}`, "Exportar a Excel", "💾");

    if (!nombrePersonalizado) return;
    if (!nombrePersonalizado.toLowerCase().endsWith('.csv')) nombrePersonalizado += '.csv';

    let csvContent = "TIPO;FECHA;NOMBRE_O_TIPO;LITROS;EUROS;PRECIO_L;KM;COCHE_ID;COCHE_NOMBRE;FUEL;CONSUMO;DEPOSITO;ITV;SEGURO;ACEITE;NOTAS;USUARIO\r\n";

    bitacora.forEach(b => {
        let fila = ["REPOSTAJE", b.fecha, b.nombre ? b.nombre.replace(/;/g, ",") : "", b.litros, b.euros, b.precioL, b.km || 0, b.carId || "", b.carName ? b.carName.replace(/;/g, ",") : "", "", "", "", "", "", "", "", b.usuario || ""];
        csvContent += fila.join(";") + "\r\n";
    });
    
    mantLocal.forEach(m => {
        let fila = ["TALLER", m.fecha, m.tipo ? m.tipo.replace(/;/g, ",") : "", "", m.coste, "", m.km || 0, m.carId || "", m.carName ? m.carName.replace(/;/g, ",") : "", "", "", "", "", "", "", m.notas ? m.notas.replace(/;/g, ",") : "", m.usuario || ""];
        csvContent += fila.join(";") + "\r\n";
    });

    myCars.forEach(c => {
        let fila = ["VEHICULO", "", c.name ? c.name.replace(/;/g, ",") : "", "", "", "", "", c.id, c.name ? c.name.replace(/;/g, ",") : "", c.fuel || "", c.consumo || 0, c.deposito || 0, c.itv || "", c.seguro || "", c.aceite || "", "", ""];
        csvContent += fila.join(";") + "\r\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nombrePersonalizado); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
}

export async function importarDatosCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        const text = e.target.result;
        const lineas = text.split("\n");

        if (lineas.length < 2) return;

        let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
        let myCars = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
        let mantLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || []; 

        let nuevosRepostajes = [];
        let nuevosCoches = [];
        let nuevosTalleres = []; 
        
        let miNombreActual = window.auth && window.auth.currentUser && window.auth.currentUser.displayName ? window.auth.currentUser.displayName.split(" ")[0] : "Conductor";

        for (let i = 1; i < lineas.length; i++) {
            let columnas = lineas[i].split(";");
            if (columnas.length < 3) continue;

            let tipo = columnas[0].trim();
            let fUsuario = columnas[16] && columnas[16].trim() !== "" ? columnas[16].trim() : miNombreActual;

            if (tipo === "REPOSTAJE") {
                let fFecha = columnas[1].trim();
                let fNombre = columnas[2].trim();
                let fLitros = parseFloat(columnas[3]);
                let fEuros = parseFloat(columnas[4]);

                let yaExiste = bitacora.some(b => b.fecha === fFecha && (b.nombre ? b.nombre.replace(/;/g, ",") : "") === fNombre && b.litros === fLitros && b.euros === fEuros);
                let yaEnNuevos = nuevosRepostajes.some(b => b.fecha === fFecha && b.nombre === fNombre && b.litros === fLitros && b.euros === fEuros);

                if (!yaExiste && !yaEnNuevos) {
                    // Mantenemos la generación de ID aquí sumando 'i' para que el más nuevo de la lista del Excel tenga el ID más alto.
                    nuevosRepostajes.push({ id: Date.now() + i, fecha: fFecha, nombre: fNombre, litros: fLitros, euros: fEuros, precioL: parseFloat(columnas[5]), km: parseFloat(columnas[6]), carId: columnas[7], carName: columnas[8] ? columnas[8].trim() : "", usuario: fUsuario });
                }
            } else if (tipo === "VEHICULO") {
                let idCoche = columnas[7] ? columnas[7].trim() : Date.now() + i;
                if (!myCars.find(c => String(c.id) === String(idCoche))) {
                    nuevosCoches.push({ id: idCoche, name: columnas[2], fuel: columnas[9] || "Precio Gasoleo A", consumo: parseFloat(columnas[10]) || 0, deposito: parseFloat(columnas[11]) || 0, itv: columnas[12] || "", seguro: columnas[13] || "", aceite: columnas[14] ? columnas[14].trim() : "" });
                }
            } else if (tipo === "TALLER") { 
                let fFecha = columnas[1].trim();
                let fTipo = columnas[2].trim();
                let fCoste = parseFloat(columnas[4]);
                let fKm = parseFloat(columnas[6]) || 0;
                let fCarId = columnas[7] ? columnas[7].trim() : "";
                let fCarName = columnas[8] ? columnas[8].trim() : "";
                let fNotas = columnas[15] ? columnas[15].trim() : "";

                let yaExiste = mantLocal.some(m => m.fecha === fFecha && m.tipo === fTipo && m.coste === fCoste && String(m.carId) === String(fCarId));
                let yaEnNuevos = nuevosTalleres.some(m => m.fecha === fFecha && m.tipo === fTipo && m.coste === fCoste && String(m.carId) === String(fCarId));

                if (!yaExiste && !yaEnNuevos) {
                    nuevosTalleres.push({
                        id: Date.now() + i,
                        fecha: fFecha,
                        tipo: fTipo,
                        coste: fCoste,
                        km: fKm,
                        carId: fCarId,
                        carName: fCarName,
                        notas: fNotas,
                        factura: "", 
                        usuario: fUsuario
                    });
                }
            }
        }

        let mensaje = `Se han encontrado datos NUEVOS en el archivo:\n\n⛽ ${nuevosRepostajes.length} Repostajes\n🚗 ${nuevosCoches.length} Vehículos\n🔧 ${nuevosTalleres.length} Gastos de taller\n\n¿Quieres añadirlos a tu historial?`;

        if (nuevosRepostajes.length === 0 && nuevosCoches.length === 0 && nuevosTalleres.length === 0) {
            alert("👍 Tu app ya está al día. No se han encontrado datos nuevos o diferentes en este archivo para importar.");
            input.value = "";
            return;
        }

        let seguro = await window.appConfirm(mensaje, "Importar Datos", "📥");
        if (seguro) {
            bitacora = [...nuevosRepostajes, ...bitacora];
            myCars = [...myCars, ...nuevosCoches];
            mantLocal = [...nuevosTalleres, ...mantLocal];
            
            localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(bitacora));
            localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(myCars));
            localStorage.setItem(STORAGE_KEYS.TALLER, JSON.stringify(mantLocal)); 
            
            if (window.auth && window.auth.currentUser) {
                window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { 
                    misCoches: myCars,
                    miBitacora: bitacora,
                    miTaller: mantLocal
                }, { merge: true });
            }

            alert("✅ Datos importados correctamente.");
            location.reload();
        }
        input.value = "";
    };
    reader.readAsText(file);
}

export function descargarPDFHistorial() {
    if (typeof gtag === 'function') gtag('event', 'descargar_pdf_informe');

    const loading = document.getElementById('loading-overlay');
    if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Generando PDF..."; }
    
    let filterCarId = q('historialCarFilter').value;
    let filterTipo = q('historialTipoFilter') ? q('historialTipoFilter').value : 'all';
    let filterMes = q('historialMesFilter') ? q('historialMesFilter').value : 'all';
    
    let textCoche = q('historialCarFilter').options[q('historialCarFilter').selectedIndex].text;
    let textMes = q('historialMesFilter').options[q('historialMesFilter').selectedIndex].text;

    let bitacora = JSON.parse(localStorage.getItem(STORAGE_KEYS.BITACORA)) || [];
    let mantenimientoAct = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALLER)) || [];

    let filtradosGas = filterCarId === "all" ? bitacora : bitacora.filter(b => String(b.carId) === String(filterCarId));
    let filtradosTaller = filterCarId === "all" ? mantenimientoAct : mantenimientoAct.filter(m => String(m.carId) === String(filterCarId));

    let combinedBruto = [];
    filtradosGas.forEach(b => combinedBruto.push({ type: 'gas', date: b.fecha, obj: b }));
    filtradosTaller.forEach(m => combinedBruto.push({ type: 'taller', date: m.fecha, obj: m }));

    let combined = combinedBruto.filter(item => {
        let pasaTipo = (filterTipo === 'all' || filterTipo === item.type);
        let pasaMes = true;
        if (filterMes !== 'all') {
            let partes = item.date.split('/');
            if (partes.length === 3) pasaMes = (`${partes[2]}-${partes[1]}` === filterMes);
        }
        return pasaTipo && pasaMes;
    });

    // 🔥 Desempate por ID para que en el PDF salgan en orden correcto
    combined.sort((a, b) => {
        let diff = new Date(esToYMD(b.date)).getTime() - new Date(esToYMD(a.date)).getTime();
        if (diff === 0) return b.obj.id - a.obj.id;
        return diff;
    });

    if (combined.length === 0) {
        if(loading) loading.style.display = "none";
        alert("⚠️ No hay gastos en este periodo para hacer el informe.");
        return;
    }

    q('pdfFiltroCoche').innerText = textCoche.replace('🚗 ', '');
    q('pdfFiltroMes').innerText = textMes.replace('📅 ', '');
    q('pdfFechaEmision').innerText = new Date().toLocaleDateString('es-ES');

    let canvas = q('gastosChart');
    let imgGrafica = q('pdfGraficaImg');
    if (canvas && canvas.style.display !== 'none' && combined.length > 0) {
        let ctx = canvas.getContext('2d');
        ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
        imgGrafica.src = canvas.toDataURL("image/jpeg", 1.0);
        imgGrafica.style.display = 'block';
    } else {
        imgGrafica.style.display = 'none';
    }

    let tbody = q('pdfTablaBody');
    let totalSuma = 0;
    let htmlAcumuladoPDF = ''; 

    combined.forEach(item => {
        let concepto = item.type === 'gas' ? `⛽ Repostaje (${item.obj.nombre})` : `🔧 Taller (${item.obj.tipo})`;
        let usuarioSeguro = item.obj.usuario ? (window.escaparHTML ? window.escaparHTML(item.obj.usuario) : item.obj.usuario) : '';
        let pagador = usuarioSeguro ? `<br><small style="color:#777">👤 ${usuarioSeguro}</small>` : '';
        let cocheLimpio = item.obj.carName ? (window.escaparHTML ? window.escaparHTML(item.obj.carName) : item.obj.carName) : "-";
        let cocheN = cocheLimpio + pagador;
        let importe = item.type === 'gas' ? item.obj.euros : item.obj.coste;
        
        totalSuma += importe;
        let baseImp = importe / 1.21;
        let iva = importe - baseImp;

        htmlAcumuladoPDF += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 8px;">${item.date}</td>
                <td style="padding: 10px 8px;">${concepto}</td>
                <td style="padding: 10px 8px;">${cocheN}</td>
                <td style="padding: 10px 8px; text-align: right;">${baseImp.toFixed(2)} €</td>
                <td style="padding: 10px 8px; text-align: right;">${iva.toFixed(2)} €</td>
                <td style="padding: 10px 8px; text-align: right; font-weight: bold;">${importe.toFixed(2)} €</td>
            </tr>
        `;
    });

    let totalBase = totalSuma / 1.21;
    let totalIVA = totalSuma - totalBase;
    let estiloCelda = "padding: 14px 8px; font-weight: bold; font-size: 13px; border-top: 2px solid #1e7a44; border-bottom: 2px solid #1e7a44; line-height: 1.2;";

    htmlAcumuladoPDF += `
        <tr style="background-color: #f9fafb;">
            <td colspan="3" style="text-align: right; ${estiloCelda}">TOTALES:</td>
            <td style="text-align: right; ${estiloCelda}">${totalBase.toFixed(2)} €</td>
            <td style="text-align: right; ${estiloCelda}">${totalIVA.toFixed(2)} €</td>
            <td style="text-align: right; color: #e74c3c; ${estiloCelda}">${totalSuma.toFixed(2)} €</td>
        </tr>
    `;

    tbody.innerHTML = htmlAcumuladoPDF;

    let elemento = q('plantillaPDF');
    let opt = {
        margin:       0,
        filename:     `Informe_${textCoche.replace(/ /g, '_')}_${textMes.replace(/ /g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(elemento).save().then(() => {
            if(loading) loading.style.display = "none";
            if(typeof window.mostrarToast === 'function') window.mostrarToast("📄 ¡PDF generado con éxito!");
            else alert("📄 ¡PDF generado con éxito!");
        }).catch(err => {
            if(loading) loading.style.display = "none";
            alert("❌ Error al generar el PDF.");
            console.error(err);
        });
    } else {
        if(loading) loading.style.display = "none";
        alert("❌ Error: La librería de PDF no está cargada.");
    }
}

window.exportarDatosCSV = exportarDatosCSV;
window.importarDatosCSV = importarDatosCSV;
window.descargarPDFHistorial = descargarPDFHistorial;
