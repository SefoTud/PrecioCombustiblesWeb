export function closeGarage() {
    document.getElementById('garageModal').style.display = 'none';
}

export function toggleGraficaHistorial() {
    const cont = document.getElementById('contenedorGraficaHistorial');
    const btnText = document.getElementById('btnToggleGrafica');
    if (cont.style.display === 'none') {
        cont.style.display = 'block';
        if (btnText) btnText.innerHTML = '📉 Ocultar Gráfica <span id="flechaGrafica">▲</span>';
    } else {
        cont.style.display = 'none';
        if (btnText) btnText.innerHTML = '📉 Mostrar Gráfica <span id="flechaGrafica">▼</span>';
    }
}

export function cerrarTutorial() {
    document.getElementById('tutorialModal').style.display = 'none';
    localStorage.setItem('gasofa_tutorial_visto', 'true');
}


export function abrirInfoPrediccion(e, nombre, jsonDetalles, icon, texto, color) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    document.getElementById('modalPredGasName').innerText = nombre;
    let detalles = JSON.parse(decodeURIComponent(jsonDetalles));
    
    document.getElementById('modalPredInerciaIcon').innerText = detalles.inercia.icon;
    document.getElementById('modalPredInerciaTxt').innerText = detalles.inercia.txt;
    document.getElementById('modalPredInerciaTxt').style.color = detalles.inercia.color;

    document.getElementById('modalPredSemanaIcon').innerText = detalles.semana.icon;
    document.getElementById('modalPredSemanaTxt').innerText = detalles.semana.txt;
    document.getElementById('modalPredSemanaTxt').style.color = detalles.semana.color;

    document.getElementById('modalPredCalIcon').innerText = detalles.calendario.icon;
    document.getElementById('modalPredCalTxt').innerText = detalles.calendario.txt;
    document.getElementById('modalPredCalTxt').style.color = detalles.calendario.color;

    document.getElementById('modalPredResIcon').innerText = icon;
    document.getElementById('modalPredResTxt').innerText = texto;
    let resBox = document.getElementById('modalPredResultadoBox');
    resBox.style.color = color; resBox.style.borderColor = color;
    document.getElementById('infoPrediccionModal').style.display = 'flex';
}

export function toggleFormCoche(forzarAbierto = null) {
    const form = document.getElementById('formNuevoVehiculo');
    const btn = document.getElementById('btnToggleFormCoche');
    const titulo = document.getElementById('tituloFormCoche');
    const lista = document.getElementById('carList'); 
    
    let abrir = forzarAbierto !== null ? forzarAbierto : form.style.display === 'none';
    
    if (abrir) {
        form.style.display = 'flex';
        btn.style.display = 'none';
        if (lista) lista.style.display = 'none';
        if (titulo.innerText !== "Editar vehículo") titulo.innerText = "Registrar vehículo";
        document.getElementById('misVehiculosModal').querySelector('.modal-content').scrollTop = 0;
    } else {
        form.style.display = 'none';
        btn.style.display = 'flex';
        if (lista) lista.style.display = 'flex'; 
        document.getElementById('editCarId').value = '';
        document.getElementById('carName').value = '';
        document.getElementById('carConsumo').value = '';
        document.getElementById('carDeposito').value = '';
        document.getElementById('carITV').value = '';
        document.getElementById('carSeguro').value = '';
        document.getElementById('carAceite').value = '';
        titulo.innerText = "Registrar vehículo";
    }
}

// --- FUNCIONES DE INTERFAZ RECUPERADAS Y RECONSTRUIDAS ---

export function abrirPerfil() {
    const modal = document.getElementById('perfilModal');
    if (modal) modal.style.display = 'flex';
    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
}

export function cerrarPerfil() {
    const modal = document.getElementById('perfilModal');
    if (modal) modal.style.display = 'none';
}

// =========================================================
// 🪄 ANIMACIONES Y GESTOS TÁCTILES (SWIPE INTERACTIVO Y SCROLL)
// =========================================================

export function activarSwipeModales() {
    document.querySelectorAll('.modal-bg').forEach(modal => {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        const contenido = modal.querySelector('.modal-content') || modal;

        modal.addEventListener('touchstart', e => { 
            // Solo empezamos a escuchar si la ventana está scrolleada arriba del todo
            if (contenido.scrollTop <= 5) {
                startY = e.touches[0].screenY; 
                isDragging = true;
                // Le quitamos la animación para que se pegue al dedo de forma instantánea
                contenido.style.transition = 'none';
            }
        }, { passive: true });
        
        modal.addEventListener('touchmove', e => {
            if (!isDragging) return;
            currentY = e.touches[0].screenY;
            let diffY = currentY - startY;

            // Si arrastra hacia abajo, movemos la ventana exactamente los píxeles que mueva el dedo
            if (diffY > 0) {
                contenido.style.transform = `translateY(${diffY}px)`;
            }
        }, { passive: true });

        modal.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false;
            let diffY = currentY - startY;
            
            // Le devolvemos la animación suave (efecto muelle) para cuando soltemos el dedo
            contenido.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s";

            // Si el usuario ha bajado el dedo más de 120 píxeles, cerramos la ventana
            if (diffY > 120) {
                contenido.style.transform = "translateY(100vh)";
                modal.style.transition = "opacity 0.3s";
                modal.style.opacity = "0"; 
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Dejamos la ventana limpia para la próxima vez que se abra
                    contenido.style.transform = "";
                    contenido.style.opacity = "";
                    contenido.style.transition = "";
                    modal.style.opacity = "";
                    modal.style.transition = "";
                }, 300);
            } else {
                // Si se arrepiente y suelta el dedo antes, la ventana vuelve a su sitio original sola
                contenido.style.transform = "translateY(0px)";
                setTimeout(() => {
                    contenido.style.transform = "";
                    contenido.style.transition = "";
                }, 300);
            }
            currentY = 0;
        }, { passive: true });
    });
}

export function activarComportamientosLista() {
    const listCont = document.getElementById('list-container');
    const btnSubir = document.getElementById('btnSubir');
    const btnVerLista = document.getElementById('btnVerLista');
    
    if (!listCont) return;

    // 1. Mostrar/Ocultar botón flotante de SUBIR al hacer scroll
    listCont.addEventListener('scroll', () => {
        if (listCont.scrollTop > 300) {
            if (btnSubir) btnSubir.style.display = 'flex';
        } else {
            if (btnSubir) btnSubir.style.display = 'none';
        }
    }, { passive: true });

    // 2. Deslizar la lista hacia abajo PEGADA AL DEDO
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    listCont.addEventListener('touchstart', (e) => {
        if (listCont.scrollTop <= 5) { 
            startY = e.touches[0].clientY;
            isDragging = true;
            listCont.style.transition = 'none'; 
        }
    }, { passive: true });

    listCont.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        let diffY = currentY - startY;

        if (diffY > 0) {
            listCont.style.transform = `translateY(${diffY}px)`;
        }
    }, { passive: true });

    listCont.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        let diffY = currentY - startY;
        
        listCont.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

        if (diffY > 100) { 
            listCont.style.transform = ""; 
            listCont.classList.add('hidden-down');
            document.body.classList.add('map-full');
            
            if (btnVerLista) btnVerLista.style.display = 'flex';
            if (btnSubir) btnSubir.style.display = 'none';
            
            // 🔥 EL PARCHE DEL MAPA GRIS 🔥
            // Engañamos a la pantalla simulando que el usuario ha girado el móvil.
            // Esto obliga al motor del mapa a repintarse al 100% de tamaño instantáneamente.
            let mapFix = setInterval(() => { 
                window.dispatchEvent(new Event('resize')); 
                if (window.map) window.map.invalidateSize({ panTo: false }); 
            }, 50);
            setTimeout(() => clearInterval(mapFix), 400);

        } else {
            // Efecto muelle si suelta antes de tiempo
            listCont.style.transform = "translateY(0px)";
            setTimeout(() => {
                listCont.style.transform = "";
                listCont.style.transition = "";
            }, 300);
        }
        currentY = 0;
    }, { passive: true });
}

// 3. DESPERTADOR AUTOMÁTICO DE GESTOS
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        activarSwipeModales();
        activarComportamientosLista();
    }, 500);
});

// Enchufamos las funciones principales a global por seguridad
window.activarSwipeModales = activarSwipeModales;
window.restaurarLista = function() {
    const listCont = document.getElementById('list-container');
    if (listCont) listCont.classList.remove('hidden-down');
    document.body.classList.remove('map-full');
    
    const btnVerLista = document.getElementById('btnVerLista');
    if (btnVerLista) btnVerLista.style.display = 'none';
    
    // Obligamos al mapa a ajustarse otra vez al tamaño pequeño
    let mapFix = setInterval(() => { 
        window.dispatchEvent(new Event('resize')); 
        if (window.map) window.map.invalidateSize({ panTo: false }); 
    }, 50);
    setTimeout(() => clearInterval(mapFix), 400);
};


export function abrirValoraciones() {
    const modal = document.getElementById('valoracionesModal');
    if (modal) modal.style.display = 'flex';
}

export function marcarEstrellas(n) {
    for (let i = 1; i <= 5; i++) {
        const estrella = document.getElementById(`star${i}`);
        if (estrella) {
            estrella.style.color = i <= n ? '#f1c40f' : '#bdc3c7';
        }
    }
    window.notaValoracion = n;
}

export function restaurarLista() {
    const listCont = document.getElementById('list-container');
    if (listCont) listCont.classList.remove('hidden-down');
    document.body.classList.remove('map-full');
    
    const btnVerLista = document.getElementById('btnVerLista');
    if (btnVerLista) btnVerLista.style.display = 'none';
    
    const btnSubir = document.getElementById('btnSubir');
    if (btnSubir) btnSubir.style.display = 'none'; 
    
    if (typeof window.vibrar === 'function') window.vibrar(30);
    
    let mapFix = setInterval(() => { if (window.map) window.map.invalidateSize({ panTo: false }); }, 50);
    setTimeout(() => clearInterval(mapFix), 400);
}
window.restaurarLista = restaurarLista;

// --- TUTORIAL Y CÁMARAS RECUPERADAS ---

export function mostrarPasoTutorial(paso) {
    window.pasoActualTutorial = paso;
    for (let i = 1; i <= 6; i++) {
        let el = document.getElementById('tut-step-' + i);
        if (el) el.style.display = (i === paso) ? 'block' : 'none';
    }
    let dots = document.querySelectorAll('.tut-dot');
    dots.forEach((dot, index) => {
        if(dot) dot.style.background = (index + 1 === paso) ? 'var(--accent)' : 'var(--border-color)';
    });
    let btnNext = document.getElementById('btnTutNext');
    if (btnNext) {
        if (paso === 6) {
            btnNext.innerText = "¡Empezar a Ahorrar! 🚀";
            btnNext.style.background = "var(--accent-green)";
        } else {
            btnNext.innerText = "Siguiente ➡️";
            btnNext.style.background = "var(--accent)";
        }
    }
}

export function avanzarTutorial() {
    if (!window.pasoActualTutorial) window.pasoActualTutorial = 1;
    if (window.pasoActualTutorial < 6) {
        mostrarPasoTutorial(window.pasoActualTutorial + 1);
    } else {
        if(typeof window.cerrarTutorial === 'function') window.cerrarTutorial();
    }
}

// =========================================================
// 🍞 SISTEMA DE NOTIFICACIONES INTELIGENTE (TOAST)
// =========================================================
export function mostrarToast(mensaje, tipo = "info") {
    const toast = document.getElementById('toastBox');
    if (!toast) return;

    // Pintamos la notificación del color adecuado
    if (tipo === "exito") {
        toast.style.background = "var(--accent-green)"; // Verde éxito
        toast.style.border = "1px solid #145c32";
    } else if (tipo === "error") {
        toast.style.background = "#e74c3c"; // Rojo error
        toast.style.border = "1px solid #c0392b";
    } else {
        toast.style.background = "#2c3e50"; // Azul oscuro info por defecto
        toast.style.border = "1px solid #1a252f";
    }

    toast.innerHTML = mensaje;
    toast.style.bottom = "20px";
    toast.style.opacity = "1";

    // Evitamos que parpadee si saltan dos notificaciones muy rápido
    if (window.toastTimer) clearTimeout(window.toastTimer);
    
    window.toastTimer = setTimeout(() => {
        toast.style.bottom = "-100px";
        toast.style.opacity = "0";
    }, 3000);
}

// Conectamos a la ventana global
window.mostrarToast = mostrarToast;



// Conectamos a la ventana global para que tu HTML las encuentre siempre
window.mostrarPasoTutorial = mostrarPasoTutorial;
window.avanzarTutorial = avanzarTutorial;



// Enchufamos las funciones rescatadas a la ventana global del navegador
window.abrirPerfil = abrirPerfil;
window.cerrarPerfil = cerrarPerfil;
window.activarSwipeModales = activarSwipeModales;
window.abrirValoraciones = abrirValoraciones;
window.marcarEstrellas = marcarEstrellas;

// Conectamos los botones de tu HTML para que sigan funcionando mágicamente
window.closeGarage = closeGarage;
window.toggleGraficaHistorial = toggleGraficaHistorial;
window.cerrarTutorial = cerrarTutorial;
window.abrirInfoPrediccion = abrirInfoPrediccion;
window.toggleFormCoche = toggleFormCoche;
