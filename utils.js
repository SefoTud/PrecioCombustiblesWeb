// Archivo: utils.js

// 1. Selector rápido del DOM
export const q = id => document.getElementById(id);

// 2. Diccionario de Claves (Evita errores al escribir los nombres de la memoria)
export const STORAGE_KEYS = {
    CARS: 'gasofa_cars',
    BITACORA: 'gasofa_bitacora',
    TALLER: 'gasofa_taller',
    DESC: 'gasofaDesc',
    PARKING: 'gasofa_parking',
    FAVS: 'gasofaFavs',
    PREFS: 'gasofaPrefs',
    TOTAL_OPINIONES: 'gasofa_total_opiniones'
};

// 3. Herramientas de Fechas (Centralizadas)
export function getHoyYMD() {
    const d = new Date();
    let mes = '' + (d.getMonth() + 1), dia = '' + d.getDate(), anio = d.getFullYear();
    if (mes.length < 2) mes = '0' + mes; 
    if (dia.length < 2) dia = '0' + dia;
    return [anio, mes, dia].join('-');
}

export function esToYMD(esDate) {
    if (!esDate) return getHoyYMD();
    let partes = esDate.split('/'); 
    if (partes.length !== 3) return getHoyYMD();
    let dia = partes[0].padStart(2, '0'), mes = partes[1].padStart(2, '0'), anio = partes[2];
    return `${anio}-${mes}-${dia}`;
}

export function ymdToEs(ymdDate) {
    if (!ymdDate) return new Date().toLocaleDateString('es-ES');
    let partes = ymdDate.split('-'); 
    if (partes.length !== 3) return new Date().toLocaleDateString('es-ES');
    return `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
}
