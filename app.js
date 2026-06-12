// Archivo: app.js

// 1. Traemos la base de datos y la interfaz
import { auth, db, googleProvider } from './firebase-config.js';
import { cerrarTutorial, toggleFormCoche, activarSwipeModales } from './interfaz.js';

// 2. ACTIVAMOS TODOS LOS MOTORES INDEPENDIENTES
import './parking.js';
import './auth.js';
import './taller.js';
import './archivos.js';
import './vehiculos.js';
import './bitacora.js';
import './camaras.js';


// 3. Traemos el resto de funciones de Firebase
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

window.deleteDoc = deleteDoc;
window.onSnapshot = onSnapshot;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;

// ==========================================================
// 🛡️ ESCUDOS ANTI-CUELGUES (Protección contra fallos silenciosos)
// ==========================================================
function actualizarCabeceraTendencias() {}
function cargarServiciosOSM(gasolineras) {}
window.compartirNativo = function(titulo, texto) {
    if (navigator.share) {
        navigator.share({ title: titulo, text: decodeURIComponent(texto) }).catch(e => console.log(e));
    } else {
        alert("Copia este enlace para compartir:\n" + decodeURIComponent(texto));
    }
};

// 4. MOTOR DE SESIÓN (Saneado y Modularizado)
const vistaNoLogueado = document.getElementById('vistaNoLogueado');
const vistaLogueado = document.getElementById('vistaLogueado');

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (vistaNoLogueado) vistaNoLogueado.style.display = 'none';
        if (vistaLogueado) {
            vistaLogueado.style.display = 'flex';
            if (document.getElementById('fotoUsuario')) document.getElementById('fotoUsuario').src = user.photoURL || 'https://via.placeholder.com/50';
            if (document.getElementById('nombreUsuario')) document.getElementById('nombreUsuario').innerText = user.displayName || 'Conductor';
            if (document.getElementById('emailUsuario')) document.getElementById('emailUsuario').innerText = user.email;
        }

        // DESCARGA AUTOMÁTICA Y SINCRONIZACIÓN
        window.getDoc(window.doc(window.db, "usuarios", user.uid)).then(docSnap => {
            if (docSnap.exists()) {
                let data = docSnap.data();
                
                if (data.misCoches) {
                    let misCochesLocales = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
                    let fusionados = [...misCochesLocales];
                    data.misCoches.forEach(cNube => { if (!fusionados.find(cLocal => String(cLocal.id) === String(cNube.id))) fusionados.push(cNube); });
                    localStorage.setItem('gasofa_cars', JSON.stringify(fusionados));
                }
                if (data.misDescuentos) {
                    let descuentosGuardados = JSON.parse(localStorage.getItem('gasofaDesc')) || [];
                    let descFusionados = [...descuentosGuardados];
                    data.misDescuentos.forEach(dNube => { if (!descFusionados.find(dLocal => dLocal.marca === dNube.marca)) descFusionados.push(dNube); });
                    localStorage.setItem('gasofaDesc', JSON.stringify(descFusionados));
                }
                if (data.miBitacora) {
                    let bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
                    let bitFusionados = [...bitacora];
                    data.miBitacora.forEach(bNube => { if (!bitFusionados.find(bLocal => String(bLocal.id) === String(bNube.id))) bitFusionados.push(bNube); });
                    bitFusionados.sort((a, b) => new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-')));
                    localStorage.setItem('gasofa_bitacora', JSON.stringify(bitFusionados));
                }
                if (data.miTaller) {
                    let tallerLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                    let tallerFusionados = [...tallerLocal];
                    data.miTaller.forEach(tNube => { if (!tallerFusionados.find(tL => String(tL.id) === String(tNube.id))) tallerFusionados.push(tNube); });
                    tallerFusionados.sort((a, b) => new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-')));
                    localStorage.setItem('gasofa_taller', JSON.stringify(tallerFusionados));
                }
            }

            // Despertamos los módulos visuales de forma segura
            if (typeof window.renderCars === 'function') window.renderCars();
            if (typeof window.updateCarSelect === 'function') window.updateCarSelect();
            if (typeof window.renderDiscounts === 'function') window.renderDiscounts();
            if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
            if (typeof window.actualizarListaHistorial === 'function') window.actualizarListaHistorial();

            // SUBIDA AUTOMÁTICA
            let currentCars = JSON.parse(localStorage.getItem('gasofa_cars')) || [];
            let currentDesc = JSON.parse(localStorage.getItem('gasofaDesc')) || [];
            let currentBit = JSON.parse(localStorage.getItem('gasofa_bitacora')) || [];
            let currentTaller = JSON.parse(localStorage.getItem('gasofa_taller')) || [];

            window.setDoc(window.doc(window.db, "usuarios", user.uid), {
                misCoches: currentCars,
                misDescuentos: currentDesc,
                miBitacora: currentBit,
                miTaller: currentTaller
            }, { merge: true });

            if (typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();
        });

    } else {
        if(vistaNoLogueado) vistaNoLogueado.style.display = 'block';
        if(vistaLogueado) vistaLogueado.style.display = 'none';
        if(document.getElementById('mapAhorroBadge')) document.getElementById('mapAhorroBadge').style.display = 'none';
        
        // Si no está logueado, despertamos la UI igualmente
        if (typeof window.updateCarSelect === 'function') window.updateCarSelect();
        if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
    }
});

const D = document, q = i => D.getElementById(i);



            const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyeIN2o-dHcyXw-ZAhUKboaotrOJcv-VM7ABYxzEkUsU4q19pKLrEFj64PanMyYSt_-/exec";
            const APP_URL = window.location.href;

            let map = L.map("map", { zoomControl: false, maxZoom: 19, closePopupOnClick: false, attributionControl: false }).setView([40.41, -3.70], 6);
            
            window.map = map;

            let userCoords = null, cacheGasolineras = null, chartInstance = null, currentModalStationId = null, currentTrends = {};

                        // Convertimos la capa de marcadores en un Cluster Automático
            let markersLayer = L.markerClusterGroup({
                maxClusterRadius: 60,
                disableClusteringAtZoom: 14, // Si haces mucho zoom, se separan para que veas los precios
                iconCreateFunction: function (cluster) {
                    return L.divIcon({ html: '<span>' + cluster.getChildCount() + '</span>', className: 'my-cluster-icon', iconSize: L.point(40, 40) });
                }
            }).addTo(map);


            let isFetching = false;
            let trendsLoaded = false;

            let userMarker = null;
            let originMarker = null;
            let destMarker = null;
            let interMarker = null;

            let osrmCache = {};
            try { osrmCache = JSON.parse(localStorage.getItem('gasofaOsrmCache')) || {}; } catch (e) { osrmCache = {}; }

            let lastGpsCoords = null;
            try { lastGpsCoords = JSON.parse(localStorage.getItem('gasofaLastGps')) || null; } catch (e) { }

            let lastCoordsStr = lastGpsCoords ? lastGpsCoords.lat + "," + lastGpsCoords.lon : "";
            window.fullChartData = null;
            let historicoCache = {};

            let searchMode = 'zona';
            let routeLineLayer = null;
            let routeLineLayers = [];
            let allRoutes = [];
            let activeRouteIndex = 0;
            let routePolylineCoords = null;
            let routeCumDist = [];
            let totalRouteDist = 0;

            let favoritos = [];
            try { favoritos = JSON.parse(localStorage.getItem('gasofaFavs')) || []; } catch (e) { favoritos = []; }
            window.descartadasRuta = [];
            window.descartarGasolinera = function (id) {
                window.descartadasRuta.push(id);
                fetchGasolineras();
            };

            let descuentosGuardados = [];
            try { descuentosGuardados = JSON.parse(localStorage.getItem('gasofaDesc')) || []; } catch (e) { descuentosGuardados = []; }

                        // ==========================================================
            // 🛡️ ESCUDO ANTI-HACKERS (Sanitizador XSS)
            // ==========================================================
            window.escaparHTML = function(texto) {
                if (!texto) return "";
                return texto.toString()
                    .replace(/&/g, "&" + "amp;")
                    .replace(/</g, "&" + "lt;")
                    .replace(/>/g, "&" + "gt;")
                    .replace(/"/g, "&" + "quot;")
                    .replace(/'/g, "&" + "#039;");
            };


            // Mapa base minimalista: diseño limpio sin colores de relleno ni nombres que distraigan
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; CARTO'
}).addTo(map);
            map.createPane("puntos_rojo").style.zIndex = 400; map.createPane("puntos_amar").style.zIndex = 401; map.createPane("puntos_verde").style.zIndex = 402;
            map.createPane("precios_rojo").style.zIndex = 600; map.createPane("precios_amar").style.zIndex = 601; map.createPane("precios_verde").style.zIndex = 602;

            // NUEVO: PANE PARA LAS CÁMARAS PARA QUE SE VEAN POR ENCIMA
            map.createPane("puntos_camaras").style.zIndex = 610;

            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === 'visible') {
                    isFetching = false;
                    if (q("list-container")) q("list-container").classList.remove("bloqueado");
                    if (q("loading-overlay")) q("loading-overlay").style.display = "none";
                }
            });

            window.onload = () => {
                const sysDark = window.matchMedia('(prefers-color-scheme: dark)');
                const savedDark = localStorage.getItem('gasofaDark');
                const isDark = savedDark !== null ? savedDark === 'true' : sysDark.matches;
                if (isDark) { document.body.classList.add('dark-mode'); q('btnDarkMode').innerText = '☀️ Os'; }

                sysDark.addEventListener('change', e => {
                    if (localStorage.getItem('gasofaDark') === null) {
                        if (e.matches) { document.body.classList.add('dark-mode'); q('btnDarkMode').innerText = '☀️ Oscuro'; }
                        else { document.body.classList.remove('dark-mode'); q('btnDarkMode').innerText = '🌙 Oscuro'; }
                    }
                    
                });

                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('./sw.js').catch(console.error);
                }

                // --- LANZAR TUTORIAL (SOLO LA PRIMERA VEZ) ---
                if (!localStorage.getItem('gasofa_tutorial_visto')) {
                    setTimeout(() => {
                        document.getElementById('tutorialModal').style.display = 'flex';
                        window.mostrarPasoTutorial(1);
                    }, 1000); 
                }


                cargarPreferencias();
                setMode(searchMode, true);

                let tieneCacheValida = false;
                try {
                    const localData = localStorage.getItem('gasofaCache_v2');
                    const localTime = localStorage.getItem('gasofaCacheTime');

                    if (localData && localTime && (Date.now() - parseInt(localTime) < 21600000)) {
                        cacheGasolineras = JSON.parse(localData);
                        tieneCacheValida = true;
                        q("loading-overlay").style.display = "none";

                        if (lastGpsCoords && searchMode === 'zona') {
                            ponerMarcadorUsuario(lastGpsCoords.lat, lastGpsCoords.lon);
                            fetchGasolineras();
                        }
                    }
                } catch (e) { }

                irAMiUbicacion(!tieneCacheValida);
                
                if (!tieneCacheValida) mostrarSkeleton();

                             fetch(WEB_APP_URL + "?accion=obtenerDatosDesdeDrive&t=" + Date.now(), { redirect: "follow" })
                    .then(res => {
                        if (!res.ok) throw new Error("Servidor no responde");
                        return res.text();
                    })
                    .then(dataStr => {
                        try {
                            const newData = JSON.parse(dataStr);
                            if (newData && newData.length > 0) {
                                verificarCambios(newData);
                            } else {
                                throw new Error("Datos vacíos");
                            }
                        } catch (e) {
                            console.error("Error procesando datos de la API:", e);
                            throw new Error("Formato incorrecto");
                        }
                    })
                                        .catch(e => {
                        console.error("Fallo al leer la API:", e);
                        
                        // 1. Apagamos la pantalla de carga para que el error sea visible
                        const loadingOverlay = document.getElementById('loading-overlay');
                        if (loadingOverlay) loadingOverlay.style.display = 'none';
                        
                        // 2. Quitamos el telón gris del mapa
                        const mapSkel = document.getElementById('map-skeleton-overlay');
                        if (mapSkel) mapSkel.classList.remove('active');

                        // 3. Desbloqueamos la pantalla para poder hacer scroll
                        const listContainer = document.getElementById('list-container');
                        if (listContainer) listContainer.classList.remove('bloqueado');
                        
                        // 4. Inyectamos un cartel gigante y elegante en el lugar de las gasolineras
                        const gasList = document.getElementById('gas-list');
                        if (gasList) {
                            gasList.innerHTML = `
                                <div style="margin: 20px; padding: 30px 20px; background: var(--bg-panel); border: 2px dashed #e74c3c; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                    <div style="font-size: 50px; margin-bottom: 10px;">📡</div>
                                    <h3 style="color: #e74c3c; margin: 0 0 10px 0; font-size: 18px;">Sin Conexión</h3>
                                    <p style="color: var(--text-muted); font-size: 14px; margin: 0; line-height: 1.5;">
                                        No hemos podido recibir los precios del servidor.<br><br>
                                        Comprueba tu conexión a internet o inténtalo de nuevo en unos minutos.
                                    </p>
                                </div>
                            `;
                        }
                    });

   
                                fetchTrends(q("tipoCombustible").value);

                // 1. Freno suave (Debounce) para evitar que el teclado se congele al escribir
                let temporizadorFiltros = null;

                ["marcaInput", "litrosInput", "consumoInput", "autonomiaInput", "idaVueltaInput", "radioBusqueda", "ordenarPor", "abiertasInput", "desvioInput"].forEach(id => {
                    const el = q(id);
                    if (el) {
                        let esEscribir = id.includes("Input") && id !== "abiertasInput" && id !== "idaVueltaInput";
                        
                        el.addEventListener(esEscribir ? "input" : "change", () => {
                            if (esEscribir) {
                                clearTimeout(temporizadorFiltros);
                                temporizadorFiltros = setTimeout(() => {
                                    guardarPreferencias(); 
                                    fetchGasolineras();
                                }, 500); // Espera medio segundo tras la última tecla
                            } else {
                                // Los botones de click normal se aplican al instante
                                guardarPreferencias(); 
                                fetchGasolineras();
                            }
                        });
                    }
                });

                q("tipoCombustible").addEventListener("change", () => {
                    if (typeof gtag === 'function') gtag('event', 'filtro_combustible', { 'tipo': q("tipoCombustible").options[q("tipoCombustible").selectedIndex].text });
                    fetchTrends(q("tipoCombustible").value); guardarPreferencias(); fetchGasolineras();
                });
                q("radioBusqueda").addEventListener("change", () => {
                    if (typeof gtag === 'function') { gtag('event', 'cambio_radio', { 'km_elegidos': q("radioBusqueda").value }); }
                });
                q("provinciaInput").addEventListener("change", () => {
                    if (typeof gtag === 'function') { gtag('event', 'busqueda_provincia', { 'provincia_elegida': q("provinciaInput").options[q("provinciaInput").selectedIndex].text }); }
                    // Cerramos los filtros automáticamente al elegir provincia
                    if (!q("controls").classList.contains("collapsed")) toggleControls();
                    guardarPreferencias(); fetchGasolineras();
                });

                q("cpInput").addEventListener("keypress", e => {
                    if (e.key === "Enter") { e.preventDefault(); e.target.blur(); buscarPorCP(); }
                });

                function activarAutocompletado(inputId, listId, isZona) {
                    let input = q(inputId);
                    if (!input) return;
                    let timeoutId;

                    input.addEventListener("input", function (e) {
                        let val = this.value.trim();
                        let list = q(listId);
                        list.innerHTML = "";

                        if (inputId === "origenInput" && q("cityNameRuta")) q("cityNameRuta").style.display = "none";
                        if (inputId === "destinoInput" && q("cityNameDest")) q("cityNameDest").style.display = "none";
                        if (inputId === "pasandoPorInput" && q("cityNameInter")) q("cityNameInter").style.display = "none";

                        if (!val || val.length < 2) { list.style.display = "none"; return; }

                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(async () => {
                            try {
                                const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(val) + '&countrycodes=es&format=json&addressdetails=1&limit=5');
                                const data = await r.json();

                                list.innerHTML = "";
                                if (data.length > 0) {
                                    list.style.display = "block";
                                    data.forEach(item => {
                                        let div = document.createElement("div");
                                        div.style.cssText = "padding:10px; border-bottom:1px solid var(--border-color); cursor:pointer; font-size:13px; color:var(--text-main); text-align:left;";
                                        div.onmouseover = () => div.style.background = "var(--bg-input)";
                                        div.onmouseout = () => div.style.background = "transparent";

                                        let nombreLimpio = item.display_name.split(",").slice(0, 3).join(",");
                                        let nombrePrincipal = item.name || nombreLimpio.split(",")[0];

                                        div.innerHTML = "📍 <strong>" + nombrePrincipal + "</strong><br><span style='font-size:10px;color:var(--text-muted);'>" + nombreLimpio + "</span>";

                                        div.onclick = function () {
                                            list.style.display = "none";
                                            input.value = "";

                                            if (isZona) {
                                                if (q("cityName")) { q("cityName").style.display = "inline-block"; q("cityName").innerText = "📍 " + nombrePrincipal; }
                                                if (q("cityNameRuta")) { q("cityNameRuta").style.display = "inline-block"; q("cityNameRuta").innerText = "📍 " + nombrePrincipal; }
                                                window.isManuallyLocated = true;

                                                // 1. Movemos el mapa a la ubicación elegida
                                                ponerMarcadorUsuario(parseFloat(item.lat), parseFloat(item.lon));

                                                // 2. CERRAMOS EL PANEL (Igual que hace la lupa)
                                                if (!q("controls").classList.contains("collapsed")) toggleControls();

                                                // 3. Cargamos las gasolineras
                                                fetchGasolineras();
                                            } else {
                                                // Lógica para Origen/Destino en Rutas
                                                if (inputId === "origenInput" && q("cityNameRuta")) { q("cityNameRuta").style.display = "inline-block"; q("cityNameRuta").innerText = "📍 " + nombrePrincipal; }
                                                if (inputId === "destinoInput" && q("cityNameDest")) { q("cityNameDest").style.display = "inline-block"; q("cityNameDest").innerText = "📍 " + nombrePrincipal; }
                                                if (inputId === "pasandoPorInput" && q("cityNameInter")) { q("cityNameInter").style.display = "inline-block"; q("cityNameInter").innerText = "📍 " + nombrePrincipal; }
                                            }
                                        };

                                        list.appendChild(div);
                                    });
                                } else { list.style.display = "none"; }
                            } catch (err) { list.style.display = "none"; }
                        }, 1200);
                    });
                }

                activarAutocompletado("cpInput", "autocomplete-list", true);
                activarAutocompletado("origenInput", "autocomplete-list-origen", false);
                activarAutocompletado("destinoInput", "autocomplete-list-destino", false);
                activarAutocompletado("pasandoPorInput", "autocomplete-list-inter", false);

                document.addEventListener("click", function (e) {
                    ["autocomplete-list", "autocomplete-list-origen", "autocomplete-list-destino", "autocomplete-list-inter"].forEach(id => {
                        let list = q(id);
                        if (list && e.target.id !== "cpInput" && e.target.id !== "origenInput" && e.target.id !== "destinoInput" && e.target.id !== "pasandoPorInput") {
                            list.style.display = "none";
                        }
                    });
                });

                q("destinoInput").addEventListener("keypress", e => { if (e.key === "Enter") calcularRuta(); });

                ["cpInput", "origenInput", "destinoInput", "pasandoPorInput"].forEach(id => {
                    const inpt = q(id);
                    if (inpt) {
                        inpt.addEventListener("keydown", (e) => {
                            const pillMap = { "cpInput": "cityName", "origenInput": "cityNameRuta", "destinoInput": "cityNameDest", "pasandoPorInput": "cityNameInter" };
                            const pill = q(pillMap[id]);
                            if (pill && pill.style.display !== "none") {
                                pill.style.display = "none";
                                if (e.key === "Backspace" || e.key === "Delete") { inpt.value = ""; }
                            }
                        });
                    }
                });

                // --- VIGILANTE DE MARCADORES (MUTATION OBSERVER) ---
                // Vigila el mapa y actualiza las tendencias de las gasolineras que salen de los clusters
                const observer = new MutationObserver((mutations) => {
                    if (!trendsLoaded) return; // Si aún no hay datos, no hacemos nada
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            // Comprobamos si el nodo que acaba de aparecer en el mapa es HTML válido
                            if (node.nodeType === 1 && node.querySelectorAll) {
                                // Buscamos si tiene el indicador de tendencia dentro
                                let indicadores = node.classList.contains('tr-ind') ? [node] : node.querySelectorAll('.tr-ind');
                                indicadores.forEach(el => {
                                    // Si todavía tiene el reloj de arena, se lo cambiamos por el dato real
                                    if (el.innerHTML.includes('⏳')) {
                                        let id = el.getAttribute('data-id');
                                        let type = el.getAttribute('data-type');
                                        el.innerHTML = getTrendHTML(currentTrends[id], type);
                                    }
                                });
                            }
                        });
                    });
                });
                // Le decimos al vigilante que se quede mirando el contenedor del mapa
                observer.observe(document.getElementById('map'), { childList: true, subtree: true });
                // ----------------------------------------------------

                map.on('click', () => {
                    if (!q("controls").classList.contains("collapsed")) toggleControls();
                });
                
                            // --- NUEVA MEJORA UX: Toque en zona vacía del mapa limpia la pantalla ---
                        map.on('click', function (e) {
                if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.id === 'map') {
                    const listCont = document.getElementById('list-container');
                    if (!document.getElementById("controls").classList.contains("collapsed")) toggleControls();
                    
                    if (!listCont.classList.contains('hidden-down')) {
                        listCont.classList.add('hidden-down');
                        document.body.classList.add('map-full');
                        if (document.getElementById('btnVerLista')) document.getElementById('btnVerLista').style.display = 'flex';
                        if (document.getElementById('btnSubir')) document.getElementById('btnSubir').style.display = 'none';
                        if (typeof vibrar === 'function') vibrar(40);
                        
                        let mapFix = setInterval(() => { if (map) map.invalidateSize({ panTo: false }); }, 50);
                        setTimeout(() => clearInterval(mapFix), 400);
                    } else {
                        // MAGIA: Si la lista YA estaba escondida, entonces SÍ que queremos cerrar el globo
                        map.closePopup();
                    }
                }
            });



                               // Truco para inyectar los servicios OSM y TENDENCIAS en el PopUp al abrirlo y CENTRAR el mapa
                map.on('popupopen', function (e) {
                    let node = e.popup._contentNode;
                    if (!node) return;

                    let necesitaEspera = false;

                    // 1. Si los filtros están abiertos, los cerramos
                    if (!document.getElementById("controls").classList.contains("collapsed")) {
                        toggleControls();
                        necesitaEspera = true;
                    }
                    
                   
                    // 2. Si la lista está escondida abajo, la hacemos subir suavemente
                    if (document.getElementById('list-container').classList.contains('hidden-down')) {
                        document.getElementById('list-container').classList.remove('hidden-down');
                        document.body.classList.remove('map-full');
                        if (document.getElementById('btnVerLista')) document.getElementById('btnVerLista').style.display = 'none';
                        if (typeof vibrar === 'function') vibrar(30);
                        
                        // Le vamos avisando al mapa paso a paso que su tamaño está cambiando
                        let fixMapa = setInterval(() => { if (map) map.invalidateSize({ panTo: false }); }, 50);
                        setTimeout(() => clearInterval(fixMapa), 400);
                        
                        necesitaEspera = true; // Esto obliga al mapa a esperar a que la lista suba antes de moverse
                    }

                    // CHIVATO Analytics
                    let spanRotulo = node.querySelector('span[style*="white-space:nowrap; overflow:hidden"]');
                    let nombreGas = spanRotulo ? spanRotulo.innerText : "Desconocida";
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'abrir_popup_mapa', { 'event_category': 'Interaccion_Usuario', 'nombre_gasolinera': nombreGas });
                    }

                    // 1. Inyectar OSM
                    let placeholder = node.querySelector('.osm-pop-placeholder');
                    if (placeholder) {
                        let id = placeholder.getAttribute('data-id');
                        if (window.osmCache && window.osmCache[id]) placeholder.innerHTML = window.osmCache[id];
                    }

                    // 2. Inyectar Tendencias
                    let trendPlaceholder = node.querySelector('.tr-ind');
                    if (trendPlaceholder && typeof trendsLoaded !== 'undefined' && trendsLoaded) {
                        let id = trendPlaceholder.getAttribute('data-id');
                        let type = trendPlaceholder.getAttribute('data-type');
                        trendPlaceholder.innerHTML = getTrendHTML(currentTrends[id], type);
                    }

                    // --- NUEVA LÓGICA DE TIEMPOS PARA ANIMACIONES SUAVES ---
                    let tiempoEspera = necesitaEspera ? 450 : 50;

                    // A) Movimiento suave de la cámara del mapa
                    setTimeout(() => {
                        let targetPoint = map.project(e.popup.getLatLng(), map.getZoom());
                        targetPoint.y -= 120; // Compensamos el globo
                        let targetLatLng = map.unproject(targetPoint, map.getZoom());
                        // duration: 0.5 hace un barrido súper elegante y natural
                        map.panTo(targetLatLng, { animate: true, duration: 0.5 }); 
                    }, tiempoEspera);

                    // B) Scroll sincronizado de la lista
                    if (trendPlaceholder) {
                        let idGasolinera = trendPlaceholder.getAttribute('data-id');
                        let tarjetaDOM = document.getElementById('tarjeta-' + idGasolinera);
                        
                        if (tarjetaDOM) {
                            setTimeout(() => {
                                let listCont = document.getElementById('list-container');
                                let targetTop = tarjetaDOM.offsetTop - 15; 
                                listCont.scrollTo({ top: targetTop, behavior: 'smooth' });
                                
                                // Seguro anti-saltos del móvil
                                setTimeout(() => window.scrollTo(0, 0), 50);
                                
                                // Iluminamos la tarjeta
                                let colorOriginal = tarjetaDOM.style.background;
                                tarjetaDOM.style.transition = 'background 0.5s ease';
                                tarjetaDOM.style.background = 'var(--bg-ahorro)'; 
                                
                                setTimeout(() => { tarjetaDOM.style.background = colorOriginal; }, 1500);
                            }, tiempoEspera);
                        }
                    }
                });



activarSwipeModales();

            };

                        function toggleControls() {
                const c = q("controls");
                c.classList.toggle("collapsed");
                
                // Solo encendemos/apagamos el botón inferior, NO tocamos la lista
                if (q("nav-filtros")) {
                    if (c.classList.contains("collapsed")) {
                        q("nav-filtros").classList.remove("active");
                    } else {
                        q("nav-filtros").classList.add("active");
                    }
                }

                // Le decimos al mapa que se reajuste fluidamente
                let stretchInterval = setInterval(() => { if (map) map.invalidateSize(); }, 50);
                setTimeout(() => clearInterval(stretchInterval), 450);
            }




            function actualizarInterfazLitros() {
                let esProv = (searchMode === 'provincia');
                let esRuta = (searchMode === 'ruta');
                let cocheSeleccionado = q("activeCarSelect") && q("activeCarSelect").value !== "";

                if (esProv) {
                    if (q("contenedorLitrosManuales")) q("contenedorLitrosManuales").style.display = "none";
                    if (q("modoLlenadoInteligente")) q("modoLlenadoInteligente").style.display = "none";
                } else if (esRuta && cocheSeleccionado) {
                    if (q("contenedorLitrosManuales")) q("contenedorLitrosManuales").style.display = "none";
                    if (q("modoLlenadoInteligente")) q("modoLlenadoInteligente").style.display = "flex";
                } else {
                    if (q("contenedorLitrosManuales")) q("contenedorLitrosManuales").style.display = "flex";
                    if (q("modoLlenadoInteligente")) q("modoLlenadoInteligente").style.display = "none";
                }
            }

                        // IDEA 2: MOTOR DE VIBRACIÓN NATIVO
            window.vibrar = function (ms = 50) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch(e){} };

            function setMode(mode, isInit = false) {
                vibrar(30); // Micro-vibración al cambiar de pestaña

                // ARREGLO 1: Memoria de los botones inferiores
                document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
                if (q("nav-" + mode)) q("nav-" + mode).classList.add('active');

                // 🔥 Asegurar que el botón Filtros siga encendido si el panel está abierto
                if (q("nav-filtros") && q("controls") && !q("controls").classList.contains("collapsed")) {
                    q("nav-filtros").classList.add("active");
                }
                
                searchMode = mode;
                
                // IDEA 4: Color dinámico para la barra de estado del móvil
                let metaTheme = document.querySelector('meta[name="theme-color"]');
                let isDark = document.body.classList.contains('dark-mode');
                if (mode === 'zona') metaTheme.setAttribute("content", isDark ? "#2d88ff" : "#0056b3");
                else if (mode === 'ruta') metaTheme.setAttribute("content", isDark ? "#f39c12" : "#c85a17");
                else if (mode === 'provincia') metaTheme.setAttribute("content", isDark ? "#27ae60" : "#1e7a44");

                // Aplicamos el color al borde del panel flotante
                const controles = q("controls");
                if (controles) {
                    controles.classList.remove("panel-zona", "panel-ruta", "panel-provincia");
                    controles.classList.add("panel-" + mode);
                }


                const optInteligente = q("ordenarPor").querySelector('option[value="inteligente"]');
                const optDistancia = q("ordenarPor").querySelector('option[value="distancia"]');
                const optAhorro = q("ordenarPor").querySelector('option[value="ahorro"]');

                if (mode === 'zona') {
                    q('zona-ui').style.display = 'block'; q('ruta-ui').style.display = 'none'; q('provincia-ui').style.display = 'none';

                    if (optInteligente) { optInteligente.disabled = true; optInteligente.innerText = "🧠 Solo Plan Inteligente (En Ruta)"; }
                    if (optDistancia) optDistancia.disabled = false;
                    if (optAhorro) optAhorro.disabled = false;
                    if (q("ordenarPor").value === "inteligente") q("ordenarPor").value = "precio";

                    if (routeLineLayer) { map.removeLayer(routeLineLayer); routeLineLayer = null; routePolylineCoords = null; }
                    routeLineLayers.forEach(l => map.removeLayer(l)); routeLineLayers = []; allRoutes = [];
                    if (originMarker) { map.removeLayer(originMarker); originMarker = null; }
                    if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
                    if (interMarker) { map.removeLayer(interMarker); interMarker = null; }
                    if (!isInit && userCoords) { map.setView(userCoords, 14); fetchGasolineras(); }

                } else if (mode === 'ruta') {
                    q('zona-ui').style.display = 'none'; q('ruta-ui').style.display = 'block'; q('provincia-ui').style.display = 'none';

                    // Llamamos a la nueva función centralizada para verificar requisitos
                    if (typeof window.comprobarRequisitosInteligentes === 'function') window.comprobarRequisitosInteligentes();

                    if (optDistancia) optDistancia.disabled = false;
                    if (optAhorro) optAhorro.disabled = false;

                    if (q("origenInput").value.trim() === "" || q("origenInput").value.trim() === "Mi Ubicación") {
                        q("origenInput").value = q("cpInput").value;
                    }
                    markersLayer.clearLayers();
                    if (routePolylineCoords) fetchGasolineras();
                    else {
                        q('gas-list').innerHTML = "<div style='text-align:center;padding:20px;color:var(--text-muted);'>Escribe tu destino y pulsa <b>IR 🛣️</b> para trazar la ruta.</div>";
                        q('resumenAhorro').innerText = "Esperando ruta...";
                    }

                } else if (mode === 'provincia') {
                    q('zona-ui').style.display = 'none'; q('ruta-ui').style.display = 'none'; q('provincia-ui').style.display = 'block';

                    if (optInteligente) { optInteligente.disabled = true; optInteligente.innerText = "🧠 Solo Plan Inteligente (En Ruta)"; }
                    if (optDistancia) optDistancia.disabled = true;
                    if (optAhorro) optAhorro.disabled = true;
                    if (["inteligente", "distancia", "ahorro"].includes(q("ordenarPor").value)) {
                        q("ordenarPor").value = "precio";
                    }

                    if (routeLineLayer) { map.removeLayer(routeLineLayer); routeLineLayer = null; routePolylineCoords = null; }
                    routeLineLayers.forEach(l => map.removeLayer(l)); routeLineLayers = []; allRoutes = [];
                    if (originMarker) { map.removeLayer(originMarker); originMarker = null; }
                    if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
                    if (interMarker) { map.removeLayer(interMarker); interMarker = null; }
                    markersLayer.clearLayers();

                    if (q("provinciaInput").value) fetchGasolineras();
                    else {
                        q('gas-list').innerHTML = "<div style='text-align:center;padding:20px;color:var(--text-muted);'>Selecciona una provincia arriba para ver todas sus gasolineras.</div>";
                        q('resumenAhorro').innerText = "Esperando provincia...";
                    }
                }

                let esProv = (mode === 'provincia');
                actualizarInterfazLitros();
                if (q("consumoInput")) q("consumoInput").style.display = esProv ? "none" : "";
                if (q("autonomiaInput")) q("autonomiaInput").style.display = esProv ? "none" : "";
                if (q("idaVueltaInput") && q("idaVueltaInput").parentElement) q("idaVueltaInput").parentElement.style.display = esProv ? "none" : "";
                                if (q("btnToggleAvanzados")) q("btnToggleAvanzados").style.display = esProv ? "none" : "flex";
                if (esProv && typeof toggleFiltrosAvanzados === 'function') toggleFiltrosAvanzados(false);


                isFetching = false;

                const selectorCoches = document.getElementById('activeCarSelect');
                if (selectorCoches) {
                    if (mode === 'provincia') {
                        selectorCoches.style.display = 'none';
                    } else {
                        selectorCoches.style.display = (typeof myCars !== 'undefined' && myCars.length > 0) ? 'block' : 'none';
                    }
                }

                guardarPreferencias();
            }

            async function calcularRuta() {
                if (typeof gtag === 'function') { gtag('event', 'buscar_ruta'); }
                let orig = q("origenInput").value.trim();
                if (orig === "" && q("cityNameRuta") && q("cityNameRuta").style.display !== "none") orig = q("cityNameRuta").innerText.replace("📍 ", "").trim();

                let dest = q("destinoInput").value.trim();
                if (dest === "" && q("cityNameDest") && q("cityNameDest").style.display !== "none") dest = q("cityNameDest").innerText.replace("📍 ", "").trim();

                if (!dest) { alert("Por favor, introduce un destino."); return; }

                if (!q("controls").classList.contains("collapsed")) toggleControls();

                q("list-container").scrollTop = 0;
                q("loading-overlay").style.display = "flex";
                q("loading-text").innerText = "Trazando ruta...";
                if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.add("active");

                try {
                    let coordOrig = userCoords;
                    if (orig !== "" && orig.toLowerCase() !== "mi ubicacion" && orig.toLowerCase() !== "mi ubicación" && orig !== q("cpInput").value) {
                        q("loading-text").innerText = "Ubicando origen...";
                        const r1 = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(orig) + '&countrycodes=es&format=json&addressdetails=1&limit=1');
                        const d1 = await r1.json();
                        if (d1.length > 0) {
                            coordOrig = [parseFloat(d1[0].lat), parseFloat(d1[0].lon)];
                            const a = d1[0].address || {};
                            let c = a.city || a.town || a.village || a.municipality || d1[0].name || "";
                            if (!c || !isNaN(c)) c = orig.toUpperCase();
                            if (q("cityNameRuta")) { q("cityNameRuta").innerText = "📍 " + c; q("cityNameRuta").style.display = "inline-block"; }
                        }
                        else throw "No se encuentra el origen ingresado.";
                    } else {
                        if (q("cityNameRuta") && q("cityNameRuta").innerText !== "") { q("cityNameRuta").style.display = "inline-block"; }
                    }

                    if (!coordOrig) throw "No tenemos tu ubicación actual. Escribe una ciudad de origen.";

                    const r2 = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(dest) + '&countrycodes=es&format=json&addressdetails=1&limit=1');
                    const d2 = await r2.json();
                    let coordDest;
                    if (d2.length > 0) {
                        coordDest = [parseFloat(d2[0].lat), parseFloat(d2[0].lon)];
                        const a = d2[0].address || {};
                        let c = a.city || a.town || a.village || a.municipality || d2[0].name || "";
                        if (!c || !isNaN(c)) c = dest.toUpperCase();
                        if (q("cityNameDest")) { q("cityNameDest").innerText = "📍 " + c; q("cityNameDest").style.display = "inline-block"; }
                    } else throw "No se encuentra el destino ingresado.";

                    let inter = q("pasandoPorInput").value.trim();
                    if (inter === "" && q("cityNameInter") && q("cityNameInter").style.display !== "none") inter = q("cityNameInter").innerText.replace("📍 ", "").trim();
                    let coordInter = null;
                    if (inter !== "") {
                        q("loading-text").innerText = "Ubicando punto intermedio...";
                        const rInter = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(inter) + '&countrycodes=es&format=json&addressdetails=1&limit=1');
                        const dInter = await rInter.json();
                        if (dInter.length > 0) {
                            coordInter = [parseFloat(dInter[0].lat), parseFloat(dInter[0].lon)];
                            const a = dInter[0].address || {};
                            let c = a.city || a.town || a.village || a.municipality || dInter[0].name || "";
                            if (!c || !isNaN(c)) c = inter.toUpperCase();
                            if (q("cityNameInter")) { q("cityNameInter").innerText = "📍 " + c; q("cityNameInter").style.display = "inline-block"; }
                        } else {
                            alert("⚠️ No encontramos el pueblo/ciudad intermedio. Calculando ruta directa.");
                            if (q("cityNameInter")) q("cityNameInter").style.display = "none";
                        }
                    } else {
                        if (q("cityNameInter")) q("cityNameInter").style.display = "none";
                    }

                    q("loading-text").innerText = "Trazando ruta...";

                    let coordsString = coordOrig[1] + ',' + coordOrig[0];
                    if (coordInter) coordsString += ';' + coordInter[1] + ',' + coordInter[0];
                    coordsString += ';' + coordDest[1] + ',' + coordDest[0];

                    const url = 'https://router.project-osrm.org/route/v1/driving/' + coordsString + '?overview=full&geometries=geojson&alternatives=true';

                    const r3 = await fetch(url);
                    const d3 = await r3.json();

                    if (d3.code !== 'Ok' || !d3.routes || d3.routes.length === 0) throw "Error al calcular la ruta por carretera.";

                    allRoutes = d3.routes;
                    window.descartadasRuta = [];

                    if (originMarker) map.removeLayer(originMarker);
                    if (destMarker) map.removeLayer(destMarker);
                    if (interMarker) map.removeLayer(interMarker);

                    originMarker = L.marker([coordOrig[0], coordOrig[1]], {
                        icon: L.divIcon({ className: '', html: '<div style="font-size:20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">🔵</div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
                        zIndexOffset: 1000
                    }).addTo(map).bindPopup("<b>Origen</b>");

                    if (coordInter) {
                        interMarker = L.marker([coordInter[0], coordInter[1]], {
                            icon: L.divIcon({ className: '', html: '<div style="font-size:20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">📍</div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
                            zIndexOffset: 1000
                        }).addTo(map).bindPopup("<b>Parada: " + inter + "</b>");
                    }

                    destMarker = L.marker([coordDest[0], coordDest[1]], {
                        icon: L.divIcon({ className: '', html: '<div style="font-size:24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">🏁</div>', iconSize: [24, 24], iconAnchor: [12, 24] }),
                        zIndexOffset: 1000
                    }).addTo(map).bindPopup("<b>Destino</b>");

                    renderActiveRoute(0);

                } catch (e) {
                    alert(e);
                    q("loading-overlay").style.display = "none";
                    if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.remove("active");
                }
            }

            window.renderActiveRoute = function (index) {
                activeRouteIndex = index;
                const route = allRoutes[index];
                routePolylineCoords = route.geometry.coordinates;

                routeCumDist = [0];
                totalRouteDist = 0;
                for (let i = 1; i < routePolylineCoords.length; i++) {
                    let d = getDistance(routePolylineCoords[i - 1][1], routePolylineCoords[i - 1][0], routePolylineCoords[i][1], routePolylineCoords[i][0]);
                    totalRouteDist += d;
                    routeCumDist.push(totalRouteDist);
                }

                if (routeLineLayer) map.removeLayer(routeLineLayer);
                routeLineLayers.forEach(l => map.removeLayer(l));
                routeLineLayers = [];

                const formatTime = (secs) => {
                    let mins = Math.round(secs / 60);
                    if (mins < 60) return mins + " min";
                    let h = Math.floor(mins / 60);
                    let m = mins % 60;
                    return h + "h " + (m < 10 ? "0" : "") + m + "m";
                };

                allRoutes.forEach((r, i) => {
                    if (i === activeRouteIndex) return;
                    let latlngs = r.geometry.coordinates.map(c => [c[1], c[0]]);

                    let layer = L.polyline(latlngs, { color: '#7f8c8d', weight: 6, opacity: 0.9 }).addTo(map);

                    layer.bindTooltip("⏱️ " + formatTime(r.duration) + "<br>🚗 " + (r.distance / 1000).toFixed(1) + " km", {
                        permanent: true,
                        direction: 'center',
                        className: 'alt-route-tooltip',
                        interactive: true
                    });

                    layer.on('click', () => {
                        q("loading-overlay").style.display = "flex";
                        q("loading-text").innerText = "Cambiando ruta...";
                        setTimeout(() => renderActiveRoute(i), 100);
                    });
                    routeLineLayers.push(layer);
                });

                let activeLatlngs = routePolylineCoords.map(c => [c[1], c[0]]);
                routeLineLayer = L.polyline(activeLatlngs, { color: '#4285F4', weight: 6, opacity: 0.9 }).addTo(map);

                routeLineLayer.bindTooltip("🔵 Elegida<br>⏱️ " + formatTime(route.duration) + "<br>🚗 " + (route.distance / 1000).toFixed(1) + " km", {
                    permanent: true,
                    direction: 'right',
                    offset: [40, 0],
                    className: 'active-route-tooltip'
                });

                routeLineLayers.push(routeLineLayer);

                map.fitBounds(routeLineLayer.getBounds());

                fetchGasolineras();
            };

            function verificarCambios(newData) {
                let huboCambios = false;

                const minData = newData.map(g => {
                    let adb = "";
                    for (let k in g) { if (k.toLowerCase().includes("adblue")) { adb = g[k]; break; } }
                    return {
                        "IDEESS": g["IDEESS"], "Rótulo": g["Rótulo"], "Latitud": g["Latitud"], "Longitud (WGS84)": g["Longitud (WGS84)"],
                        "Horario": g["Horario"], "Dirección": g["Dirección"], "Tipo Venta": g["Tipo Venta"],
                        "Provincia": g["Provincia"],
                        "Municipio": g["Municipio"] || g["Localidad"],
                        "Precio Gasoleo A": g["Precio Gasoleo A"], "Precio Gasolina 95 E5": g["Precio Gasolina 95 E5"],
                        "Precio Gasoleo Premium": g["Precio Gasoleo Premium"], "Precio Gasolina 98 E5": g["Precio Gasolina 98 E5"],
                        "Precio Gasoleo B": g["Precio Gasoleo B"], "Precio Gases Licuados del Petróleo": g["Precio Gases Licuados del Petróleo"],
                        "Precio Gas Natural Comprimido": g["Precio Gas Natural Comprimido"], "Precio Gas Natural Licuado": g["Precio Gas Natural Licuado"],
                        "AdBlue": adb
                    };
                });

                if (!cacheGasolineras || cacheGasolineras.length === 0) {
                    cacheGasolineras = minData;
                    huboCambios = true;
                } else {
                    cacheGasolineras.forEach((oldG, i) => {
                        const newG = minData.find(n => n.IDEESS === oldG.IDEESS);
                        if (newG && (newG["Precio Gasoleo A"] !== oldG["Precio Gasoleo A"] || newG["Precio Gasolina 95 E5"] !== oldG["Precio Gasolina 95 E5"])) {
                            cacheGasolineras[i] = newG;
                            huboCambios = true;
                        }
                    });
                }

                if (huboCambios) {
                    try {
                        localStorage.setItem('gasofaCache_v2', JSON.stringify(cacheGasolineras));
                        localStorage.setItem('gasofaCacheTime', Date.now().toString());
                    } catch (e) { }
                    if (userCoords && (!routePolylineCoords || searchMode === 'zona')) fetchGasolineras();
                }
                q("loading-overlay").style.display = "none";
            }

            function ponerMarcadorUsuario(lat, lon) {
                userCoords = [lat, lon];
                if (searchMode === 'zona') map.setView(userCoords, 14);
                if (userMarker) {
                    userMarker.setLatLng(userCoords);
                } else {
                    userMarker = L.marker(userCoords).addTo(map).bindPopup("Estás aquí");
                }
            }

                             window.centrarMapa = function (lat, lon) {
                if (!document.getElementById("controls").classList.contains("collapsed")) toggleControls();
                
                let markerTarget = null;
                markersLayer.eachLayer(l => {
                    if (l.getLatLng) {
                        const pos = l.getLatLng();
                        if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lon) < 0.0001) { 
                            markerTarget = l;
                        }
                    }
                });

                if (markerTarget) {
                    if (!markerTarget.isPopupOpen()) {
                        // Movimiento inicial, el evento 'popupopen' hará el ajuste fino de la cámara
                        map.setView([lat, lon], 16);
                        setTimeout(() => { markerTarget.openPopup(); }, 250);
                    } else {
                        // ESCUDO: Si ya está abierto y haces doble clic, aplicamos el mismo cálculo 
                        // exacto que hace el popup para no empujarlo fuera de la pantalla.
                        let targetPoint = map.project([lat, lon], 16);
                        targetPoint.y -= 120; 
                        let targetLatLng = map.unproject(targetPoint, 16);
                        map.setView(targetLatLng, 16);
                    }
                } else {
                    map.setView([lat, lon], 16);
                }
            };
                  


            window.openDiscounts = function () {
                q('editDescId').value = ''; // Limpiamos el modo edición al abrir
                renderDiscounts();
                q('descModal').style.display = 'flex';
            };

            window.renderDiscounts = function () {
    const list = q('descList');
    if (descuentosGuardados.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:12px; padding:10px;">No tienes tarjetas guardadas.</div>';
        return;
    }
    
    let htmlAcumulado = ''; // Caja temporal
    
    descuentosGuardados.forEach((d, index) => {
        let tipoVisual = d.tipo === 'euro' ? `-${d.valor} €/L` : `-${d.valor}%`;
        
        // Escudo de seguridad
        let marcaSegura = window.escaparHTML ? window.escaparHTML(d.marca) : d.marca;
        
        htmlAcumulado += `<div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:10px; border-radius:12px; border:1px solid var(--border-color);">
        <div>
            <strong style="color:var(--accent); font-size:14px;">${marcaSegura}</strong><br>
            <small style="font-size:12px; font-weight:bold; color:var(--accent-green);">💳 Descuento: ${tipoVisual}</small>
        </div>
        <div style="display:flex; gap:5px;">
            <button onclick="editDescCard(${index})" style="background:#2c3e50; color:white; border:none; border-radius:8px; padding:8px 12px; cursor:pointer;" title="Editar">✏️</button>
            <button onclick="deleteDescCard(${index})" style="background:#e74c3c; color:white; border:none; border-radius:8px; padding:8px 12px; cursor:pointer;" title="Borrar">🗑️</button>
        </div>
    </div>`;
    });
    
    // Inyectamos de golpe
    list.innerHTML = htmlAcumulado;
};

                                    window.saveDescCard = function () {
                const idToEdit = q('editDescId').value;
                let m = q('descMarca').value.trim().toUpperCase();
                let v = parseFloat(q('descValor').value);
                let t = q('descTipo').value;

                if (!m || isNaN(v) || v <= 0) { alert("⚠️ Escribe la marca y un descuento válido."); return; }

                if (idToEdit !== "") {
                    descuentosGuardados[parseInt(idToEdit)] = { marca: m, valor: v, tipo: t };
                } else {
                    descuentosGuardados.push({ marca: m, valor: v, tipo: t });
                }

                // 1. Guardado en teléfono
                localStorage.setItem('gasofaDesc', JSON.stringify(descuentosGuardados));

                // 2. Copia silenciosa en la Nube
                if (window.auth && window.auth.currentUser) {
                    const uid = window.auth.currentUser.uid;
                    window.setDoc(window.doc(window.db, "usuarios", uid), {
                        misDescuentos: descuentosGuardados
                    }, { merge: true });
                }

                q('editDescId').value = '';
                q('descMarca').value = '';
                q('descValor').value = '';

                renderDiscounts();
                fetchGasolineras(); 
            };


            
            

            // Nueva función para cargar los datos en los inputs
            window.editDescCard = function (index) {
                const card = descuentosGuardados[index];
                if (card) {
                    q('editDescId').value = index;
                    q('descMarca').value = card.marca;
                    q('descValor').value = card.valor;
                    q('descTipo').value = card.tipo;
                    // Scroll hacia arriba para ver los campos si hay mucha lista
                    q('descModal').querySelector('.modal-content').scrollTop = 0;
                }
            };

                                    window.deleteDescCard = function (index) {
                if (confirm("¿Borrar esta tarjeta?")) {
                    descuentosGuardados.splice(index, 1);
                    
                    // 1. Borramos del teléfono
                    localStorage.setItem('gasofaDesc', JSON.stringify(descuentosGuardados));
                    
                    // 2. Borramos de la Nube
                    if (window.auth && window.auth.currentUser) {
                        const uid = window.auth.currentUser.uid;
                        window.setDoc(window.doc(window.db, "usuarios", uid), {
                            misDescuentos: descuentosGuardados
                        }, { merge: true });
                    }

                    q('editDescId').value = ''; 
                    renderDiscounts();
                    fetchGasolineras();
                }
            };




                        function toggleTheme() {
                const body = document.body; body.classList.toggle('dark-mode'); const isDark = body.classList.contains('dark-mode');
                localStorage.setItem('gasofaDark', isDark); q('btnDarkMode').innerText = isDark ? '☀️ Claro' : '🌙 Oscuro';
                
                // --- ARREGLO: Cambiar color de la barra también al usar el botón ---
                let metaTheme = document.querySelector('meta[name="theme-color"]');
                if (searchMode === 'zona') metaTheme.setAttribute("content", isDark ? "#2d88ff" : "#0056b3");
                else if (searchMode === 'ruta') metaTheme.setAttribute("content", isDark ? "#f39c12" : "#c85a17");
                else if (searchMode === 'provincia') metaTheme.setAttribute("content", isDark ? "#27ae60" : "#1e7a44");
                // ------------------------------------------------------------------

                if (chartInstance) {
                    const tColor = isDark ? '#e0e0e0' : '#333'; const gColor = isDark ? '#333' : '#ddd';

                    chartInstance.options.scales.x.ticks.color = tColor; chartInstance.options.scales.x.grid.color = gColor;
                    chartInstance.options.scales.y.ticks.color = tColor; chartInstance.options.scales.y.grid.color = gColor;
                    chartInstance.options.plugins.legend.labels.color = tColor; chartInstance.update();
                }
            }

            function getTrendHTML(tData, type) {
                if (!tData || tData.error) {
                    return type === 'map' ? '<span style="color:#95a5a6;font-size:11px;">➖</span>' : '<span style="color:#95a5a6;font-weight:bold;font-size:12px;">➖ N/D</span>';
                }

                let c = tData.c > 3 ? 3 : tData.c;
                let char = tData.dir === 1 ? "▲" : (tData.dir === -1 ? "▼" : "➖");
                let color = tData.dir === 1 ? "#e74c3c" : (tData.dir === -1 ? "#27ae60" : "#95a5a6");

                let fSizeMap = tData.dir === 0 ? "10px" : (c === 1 ? "11px" : (c === 2 ? "8px" : "6.5px"));
                let fSizeList = tData.dir === 0 ? "12px" : (c === 1 ? "12px" : (c === 2 ? "10px" : "8px"));
                let lHeight = tData.dir === 0 ? "0.4" : "0.85";

                let stackMap = '<div style="display:flex;flex-direction:column;align-items:center;line-height:' + lHeight + ';font-size:' + fSizeMap + ';">' + Array(c).fill('<span>' + char + '</span>').join('') + '</div>';
                let stackList = '<div style="display:flex;flex-direction:column;align-items:center;line-height:' + lHeight + ';font-size:' + fSizeList + ';">' + Array(c).fill('<span>' + char + '</span>').join('') + '</div>';

                let diffStr = tData.dir === 0 ? "0.000€" : (tData.dir === 1 ? "+" + tData.diff.toFixed(3) + "€" : tData.diff.toFixed(3) + "€");

                if (type === 'map') {
                    return '<div style="color:' + color + '; display:flex; align-items:center;">' + stackMap + '</div>';
                } else {
                    return '<div style="color:' + color + '; display:flex; align-items:center; gap:4px;">' + stackList + ' <span style="font-weight:bold; font-size:12px;">' + diffStr + '</span></div>';
                }
            }

            function fetchTrends(v) {
                const c = { "Precio Gasoleo A": 4, "Precio Gasolina 95 E5": 5, "Precio Gasoleo Premium": 6, "Precio Gasolina 98 E5": 7, "Precio Gasoleo B": 8, "Precio Gases Licuados del Petróleo": 9, "AdBlue": 10, "Precio Gas Natural Comprimido": 11, "Precio Gas Natural Licuado": 12 };
                if (!c[v]) return;

                trendsLoaded = false;
                currentTrends = {};
                D.querySelectorAll('.tr-ind').forEach(el => el.innerHTML = '⏳');

                fetch(WEB_APP_URL + "?accion=obtenerTendencias&colIdx=" + c[v] + "&t=" + Date.now(), { redirect: "follow" })
                    .then(res => res.json())
                    .then(r => {
                        trendsLoaded = true;
                        currentTrends = r || {};

                        // MAGIA: En vez de llamar a fetchGasolineras() y borrar el mapa,
                        // actualizamos solo los iconitos en silencio.
                        D.querySelectorAll('.tr-ind').forEach(el => {
                            let id = el.getAttribute('data-id');
                            let type = el.getAttribute('data-type');
                            el.innerHTML = getTrendHTML(currentTrends[id], type);
                        }); actualizarCabeceraTendencias();
                    })
                    .catch(e => {
                        trendsLoaded = true;
                        D.querySelectorAll('.tr-ind').forEach(el => { el.innerHTML = getTrendHTML(null, el.getAttribute('data-type')); });
                    });
            }


            function addPulseHeart(id) { const h = q(id); if (h) { h.classList.remove('pulse-heart'); void h.offsetWidth; h.classList.add('pulse-heart'); } }

            function toggleFav(id, e, hId) {
                if (e) { e.stopPropagation(); if (e.preventDefault) e.preventDefault(); }
                let isF = false; if (favoritos.includes(id)) { favoritos = favoritos.filter(f => f !== id); } else { favoritos.push(id); isF = true; }
                localStorage.setItem('gasofaFavs', JSON.stringify(favoritos));
                const ic = isF ? '❤️' : '🤍';
                if (currentModalStationId === id && q('modalFavHeart')) q('modalFavHeart').innerText = ic;
                D.querySelectorAll('.fav-btn-id-' + id).forEach(el => el.innerText = ic);
                if (hId) addPulseHeart(hId); if (q("ordenarPor").value === "favoritas") fetchGasolineras();
            }

            function isGasolineraOpen(horario) {
                if (!horario) return true;
                let h = horario.toUpperCase().replace(/[–—\/]/g, '-').replace(/ Y /g, ';');
                if (h.includes("24H") || h.includes("24 H")) return true;

                const now = new Date();
                const minNow = now.getHours() * 60 + now.getMinutes();
                const currentDay = now.getDay() === 0 ? 7 : now.getDay();
                const diasMap = { 'L': 1, 'M': 2, 'X': 3, 'J': 4, 'V': 5, 'S': 6, 'D': 7 };

                let isOpen = false;
                let foundValidDay = false;

                let blocks = h.split(';');

                for (let b of blocks) {
                    b = b.trim();
                    if (!b) continue;

                    let daysPart = "";
                    let timePart = b;

                    if (b.includes(':')) {
                        let parts = b.split(':');
                        if (/[LMXJVSD]/.test(parts[0])) { daysPart = parts[0].trim(); timePart = parts.slice(1).join(':'); }
                    }

                    let dayMatches = true;
                    if (daysPart) {
                        dayMatches = false;
                        let dayGroups = daysPart.split(',');
                        for (let g of dayGroups) {
                            g = g.trim();
                            if (g.includes('-')) {
                                let [d1Str, d2Str] = g.split('-');
                                let d1 = diasMap[d1Str.trim()]; let d2 = diasMap[d2Str.trim()];
                                if (d1 && d2) {
                                    foundValidDay = true;
                                    let minD = Math.min(d1, d2); let maxD = Math.max(d1, d2);
                                    if (currentDay >= minD && currentDay <= maxD) dayMatches = true;
                                }
                            } else {
                                if (diasMap[g]) {
                                    foundValidDay = true;
                                    if (diasMap[g] === currentDay) dayMatches = true;
                                }
                            }
                        }
                    }

                    if (dayMatches) {
                        const timeRegex = /(\d{1,2})[:.](\d{2})\s*[-aA]\s*(\d{1,2})[:.](\d{2})/g;
                        let match;
                        while ((match = timeRegex.exec(timePart)) !== null) {
                            let start = parseInt(match[1]) * 60 + parseInt(match[2]);
                            let end = parseInt(match[3]) * 60 + parseInt(match[4]);
                            if (end < start) {
                                if (minNow >= start || minNow <= end) isOpen = true;
                            } else {
                                if (minNow >= start && minNow <= end) isOpen = true;
                            }
                        }
                        if (timePart.includes("24H") || timePart.includes("24 H")) { isOpen = true; }
                    }
                }
                return foundValidDay ? isOpen : true;
            }

                        // =========================================================
// 🌍 MOTOR GPS RESPETUOSO CON PAGESPEED (Lighthouse)
// =========================================================
function irAMiUbicacion(mostrarCargando, esBoton = false) {
    window.isManuallyLocated = false;

    const cn = q("cityName");
    const cnRuta = q("cityNameRuta");

    // 1. Qué hacer si falla o si no hay permiso
    const manejarErrorGPS = () => {
        if (cn) cn.style.display = "none";
        if (cnRuta) cnRuta.style.display = "none";
        if (mostrarCargando) q("loading-overlay").style.display = "none";
        
        isFetching = false;
        const listContainer = q("list-container");
        if (listContainer) listContainer.classList.remove("bloqueado");
        if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.remove("active");

        const lD = q("gas-list");
        if (lD && lD.innerHTML.includes("sk-card")) {
            lD.innerHTML = "<div style='text-align:center;padding:30px 20px;color:var(--text-muted);'><span style='font-size:40px;display:block;margin-bottom:10px;'>📍</span><b>No detectamos tu ubicación.</b><br>Escribe tu ciudad o código postal en el buscador de arriba.</div>";
        }
    };

    // 2. El motor real que busca la ubicación
    const pedirGPSAlNavegador = () => {
        if (mostrarCargando) {
            if (cn) { cn.style.display = "inline-block"; cn.innerText = "📍 Buscando GPS..."; }
            if (cnRuta) { cnRuta.style.display = "inline-block"; cnRuta.innerText = "📍 Buscando GPS..."; }
            if (typeof mostrarSkeleton === 'function') mostrarSkeleton();
        }

        let timeoutGPS = setTimeout(() => {
            console.warn("Tiempo de espera agotado para el GPS.");
            manejarErrorGPS();
        }, 6000);

        if (!navigator.geolocation) {
            clearTimeout(timeoutGPS);
            manejarErrorGPS();
            return;
        }

        navigator.geolocation.getCurrentPosition(pos => {
            clearTimeout(timeoutGPS); 
            
            if (window.isManuallyLocated) return;

            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;

            if (lastGpsCoords && getDistance(lat, lon, lastGpsCoords.lat, lastGpsCoords.lon) < 0.1) {
            } else {
                osrmCache = {};
                localStorage.removeItem('gasofaOsrmCache');
                lastCoordsStr = lat + "," + lon;
            }

            lastGpsCoords = { lat: lat, lon: lon };
            try { localStorage.setItem('gasofaLastGps', JSON.stringify(lastGpsCoords)); } catch (e) { }

            ponerMarcadorUsuario(lat, lon);

            if (cacheGasolineras && cacheGasolineras.length > 0 && searchMode === 'zona') fetchGasolineras();

            if (cn) cn.innerText = "📍 Traduciendo...";
            if (cnRuta) cnRuta.innerText = "📍 Traduciendo...";

            fetch('https://nominatim.openstreetmap.org/reverse?lat=' + pos.coords.latitude + '&lon=' + pos.coords.longitude + '&format=json&addressdetails=1')
                .then(r => r.json())
                .then(d => {
                    if (d && d.address) {
                        const a = d.address, c = a.city || a.town || a.village || a.municipality || "Ubicación";
                        if (cn) { cn.innerText = "📍 " + c; cn.style.display = "inline-block"; }
                        if (cnRuta) { cnRuta.innerText = "📍 " + c; cnRuta.style.display = "inline-block"; }
                        if (q("cpInput")) q("cpInput").value = "";

                        if (q("origenInput") && (q("origenInput").value === "" || q("origenInput").value === "Mi Ubicación")) {
                            q("origenInput").value = c;
                        }
                    } else {
                        if (cn) cn.style.display = "none";
                        if (cnRuta) cnRuta.style.display = "none";
                    }
                }).catch(() => {
                    if (cn) cn.style.display = "none";
                    if (cnRuta) cnRuta.style.display = "none";
                });
        }, (error) => {
            clearTimeout(timeoutGPS);
            console.warn("Error de geolocalización:", error.message);
            manejarErrorGPS();
        }, { enableHighAccuracy: true, timeout: 5000 });
    };

      // 3. LA MAGIA PARA GOOGLE PAGESPEED (Revisamos los permisos antes de actuar)
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            if (result.state === 'granted' || esBoton) {
                pedirGPSAlNavegador();
            } else if (result.state === 'prompt') {
                if (mostrarCargando) q("loading-overlay").style.display = "none";
                isFetching = false;
                if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.remove("active");
                if (q("list-container")) { q("list-container").classList.remove("bloqueado"); q("list-container").scrollTop = 0; }
                if (q("header-ahorro")) q("header-ahorro").style.display = "block"; 
                
                // Limpiamos la lista para que no quede el esqueleto de fondo
                const lD = q("gas-list");
                if (lD) lD.innerHTML = "<div style='text-align:center;padding:40px 20px;color:var(--text-muted);font-weight:bold;'>Esperando ubicación...</div>";

                // 🌟 MAGIA 1: Creamos la Ventana Flotante Dinámica
                let modalPermiso = document.getElementById('modalPermisoGPS');
                if (!modalPermiso) {
                    modalPermiso = document.createElement('div');
                    modalPermiso.id = 'modalPermisoGPS';
                    // Fondo oscuro con desenfoque para que parezca una app nativa
                    modalPermiso.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:none; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; backdrop-filter:blur(5px); opacity:0; transition:opacity 0.3s;";
                    
                    modalPermiso.innerHTML = `
                        <div style="background:var(--bg-panel); width:100%; max-width:340px; border-radius:20px; padding:30px 20px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="cajaPermisoGPS">
                            <div style="font-size:55px; margin-bottom:15px; animation: bounceGPS 2s infinite;">📍</div>
                            <h3 style="color:var(--text-main); margin:0 0 10px 0; font-size:22px; font-weight:900;">Tu radar inteligente</h3>
                            <p style="color:var(--text-muted); font-size:15px; line-height:1.5; margin-bottom:25px;">
                                Para mostrarte las gasolineras más baratas a tu alrededor y calcular tus ahorros reales, necesitamos activar tu ubicación.
                            </p>
                            <button id="btnConcederGPS" style="background:var(--accent); color:white; border:none; padding:15px; width:100%; border-radius:12px; font-weight:900; font-size:16px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); margin-bottom:12px;">
                                Permitir ubicación
                            </button>
                            <button id="btnDenegarGPS" style="background:transparent; color:var(--text-muted); border:none; padding:10px; width:100%; border-radius:12px; font-weight:bold; font-size:14px; cursor:pointer;">
                                Usar buscador manual
                            </button>
                        </div>
                        <style>@keyframes bounceGPS { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }</style>
                    `;
                    document.body.appendChild(modalPermiso);

                    document.getElementById('btnConcederGPS').onclick = () => {
                        modalPermiso.style.opacity = '0';
                        document.getElementById('cajaPermisoGPS').style.transform = 'scale(0.8)';
                        setTimeout(() => { modalPermiso.style.display = 'none'; }, 300);
                        window.irAMiUbicacion(true, true); // Llama al navegador real
                    };
                    
                    document.getElementById('btnDenegarGPS').onclick = () => {
                        modalPermiso.style.opacity = '0';
                        document.getElementById('cajaPermisoGPS').style.transform = 'scale(0.8)';
                        setTimeout(() => { modalPermiso.style.display = 'none'; }, 300);
                        manejarErrorGPS(); // Muestra el cartel de error y el buscador
                    };
                }

                // 🌟 MAGIA 2: COREOGRAFÍA CON EL TUTORIAL
                const tutorialVisto = localStorage.getItem('gasofa_tutorial_visto');
                const tutorial = document.getElementById('tutorialModal');

                if (!tutorialVisto && tutorial) {
                    // Si el usuario es NUEVO, vigilamos en la sombra el tutorial
                    const observer = new MutationObserver((mutations) => {
                        // En cuanto detectamos que el usuario cierra el tutorial...
                        if (tutorial.style.display === 'none') {
                            observer.disconnect(); // Dejamos de vigilar
                            
                            // Hacemos una pausa dramática de 0.5s para que la app respire
                            setTimeout(() => {
                                modalPermiso.style.display = 'flex';
                                // Efecto rebote suave (fade-in + pop)
                                setTimeout(() => {
                                    modalPermiso.style.opacity = '1';
                                    document.getElementById('cajaPermisoGPS').style.transform = 'scale(1)';
                                }, 10);
                            }, 500);
                        }
                    });
                    // Enganchamos el espía a la ventana del tutorial
                    observer.observe(tutorial, { attributes: true, attributeFilter: ['style'] });
                } else {
                    // Si el usuario YA HA VISTO el tutorial en el pasado (pero reseteó el GPS), 
                    // mostramos la ventana flotante al instante sin esperas.
                    modalPermiso.style.display = 'flex';
                    setTimeout(() => {
                        modalPermiso.style.opacity = '1';
                        document.getElementById('cajaPermisoGPS').style.transform = 'scale(1)';
                    }, 10);
                }

            } else {
                manejarErrorGPS();
            }
        });
    } else {
        pedirGPSAlNavegador();
    }
}




            async function buscarPorCP() {
                if (typeof gtag === 'function') gtag('event', 'buscar_zona');

                // Cerramos SIEMPRE el panel de filtros de forma instantánea al darle a la lupa
                if (!q("controls").classList.contains("collapsed")) toggleControls();

                const v = q("cpInput").value.trim();
                const cn = q("cityName");
                const cnRuta = q("cityNameRuta");

                // Si no hay texto nuevo pero ya teníamos una ciudad guardada (píldora), detenemos el código aquí.
                if (v.length < 2) return;


                if (cn) { cn.style.display = "inline-block"; cn.innerText = "⏳..."; }
                if (cnRuta) { cnRuta.style.display = "inline-block"; cnRuta.innerText = "⏳..."; }

                try {
                    const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(v) + '&countrycodes=es&format=json&addressdetails=1');
                    const d = await r.json();

                    if (d.length > 0) {
                        window.isManuallyLocated = true;
                        isFetching = false;

                        ponerMarcadorUsuario(parseFloat(d[0].lat), parseFloat(d[0].lon));
                        const a = d[0].address;
                        let c = a.city || a.town || a.village || a.municipality || d[0].name || "";
                        if (!c || !isNaN(c)) c = v.toUpperCase();

                        if (cn) cn.innerText = "📍 " + c;
                        if (cnRuta) cnRuta.innerText = "📍 " + c;

                        q("cpInput").value = "";
                        fetchGasolineras();
                    } else {
                        if (cn) cn.innerText = "❌ Error";
                        if (cnRuta) cnRuta.innerText = "❌ Error";
                        setTimeout(() => {
                            if (cn) cn.style.display = "none";
                            if (cnRuta) cnRuta.style.display = "none";
                        }, 2000);
                    }
                } catch (e) {
                    if (cn) cn.style.display = "none";
                    if (cnRuta) cnRuta.style.display = "none";
                }
            }

            function getPrecioPorTipo(g, t) {
                if (t === "AdBlue") return g["AdBlue"] || "";
                return g[t] || "";
            }

function mostrarSkeleton() {
    // Ocultamos el spinner central si estaba visible
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
    
    // Encendemos el telón gris sobre el mapa
    const mapSkel = document.getElementById("map-skeleton-overlay");
    if (mapSkel) mapSkel.classList.add("active");
    
    let html = "";
    for (let i = 0; i < 5; i++) {
        html += `<div class="sk-card">
                    <div style="display:flex; justify-content:space-between;">
                        <div class="skeleton sk-line-1"></div>
                        <div class="skeleton" style="height:24px; width:24px; border-radius:50%;"></div>
                    </div>
                    <div class="skeleton sk-line-2"></div>
                    <div class="skeleton sk-line-3"></div>
                 </div>`;
    }
    document.getElementById("gas-list").innerHTML = html;
}


            function cerrarGrafico() { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } q('chartModal').style.display = 'none'; currentModalStationId = null; }

            window.updateChartRange = function (days, btn) {
                if (!window.fullChartData || !chartInstance) return;

                if (btn) {
                    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }

                let slicedLabels = window.fullChartData.labels.slice(-days);

                let slicedDatasets = window.fullChartData.datasets.map(ds => {
                    return { ...ds, data: ds.data.slice(-days) };
                });

                // Mantenemos la regla infalible de colores para las barras de zona
                if (chartInstance.config.type === 'bar') {
                    slicedDatasets[0].backgroundColor = slicedDatasets[0].data.map(val => val > 0 ? 'rgba(231, 76, 60, 0.7)' : 'rgba(39, 174, 96, 0.7)');
                    slicedDatasets[0].borderColor = slicedDatasets[0].data.map(val => val > 0 ? '#c0392b' : '#1e7a44');
                    slicedDatasets[0].borderWidth = 2;
                    slicedDatasets[0].borderRadius = 4;
                }

                chartInstance.data.labels = slicedLabels;
                chartInstance.data.datasets = slicedDatasets;
                chartInstance.update();

                // --- MAGIA NUEVA CORREGIDA: CALCULADORA DE RESUMEN TOTAL ---
                let resumenDiv = document.getElementById('tendenciaTotalResumen');
                if (resumenDiv) {
                    let totalVariacion = 0;

                    // AQUÍ ESTÁ EL ARREGLO GRAMATICAL:
                    let textoTiempo = days === 3 ? "estos 3 días" : (days === 7 ? "esta semana" : "estos 30 días");
                    let prefijoCombustible = "";

                    if (chartInstance.config.type === 'bar') {
                        let datosBarra = slicedDatasets[0].data;
                        totalVariacion = datosBarra.reduce((acc, val) => acc + val, 0);

                    } else if (chartInstance.config.type === 'line') {
                        let selectCombustible = document.getElementById("tipoCombustible");
                        let nombreCombustible = selectCombustible.options[selectCombustible.selectedIndex].text;

                        let datasetCorrecto = slicedDatasets.find(ds => ds.label.toLowerCase() === nombreCombustible.toLowerCase());

                        if (!datasetCorrecto) {
                            datasetCorrecto = slicedDatasets.find(ds => ds.hidden !== true) || slicedDatasets[0];
                        }

                        let datosLinea = datasetCorrecto.data.filter(val => val !== null);
                        if (datosLinea.length > 1) {
                            totalVariacion = datosLinea[datosLinea.length - 1] - datosLinea[0];
                        }
                        prefijoCombustible = `del <b>${datasetCorrecto.label}</b> `;
                    }

                    // Y le quitamos el "estos" fijo de la frase para usar nuestra nueva variable:
                    if (Math.abs(totalVariacion) < 0.001) {
                        resumenDiv.innerHTML = `En ${textoTiempo} la tendencia ${prefijoCombustible}se ha <b>mantenido</b> ⚖️`;
                    } else if (totalVariacion > 0) {
                        resumenDiv.innerHTML = `En ${textoTiempo} la tendencia ${prefijoCombustible}es de <span style="color:#e74c3c; font-weight:900;">▲ SUBIDA (+${totalVariacion.toFixed(3)}€)</span>`;
                    } else {
                        resumenDiv.innerHTML = `En ${textoTiempo} la tendencia ${prefijoCombustible}es de <span style="color:#27ae60; font-weight:900;">▼ BAJADA (${totalVariacion.toFixed(3)}€)</span>`;
                    }
                }
            };





            function mostrarHistorico(n, id, h) {
                if (typeof gtag === 'function') gtag('event', 'ver_historico', { 'gasolinera': n });
                if (chartInstance) chartInstance.destroy();
                currentModalStationId = id;

                // ---> AÑADE ESTA LÍNEA AQUÍ PARA ASEGURARTE DE QUE SE VE EL CORAZÓN <---
                document.getElementById('modalFavHeart').style.display = 'inline-block';

                q('chartModal').style.display = 'flex';
                q('modalTitle').innerText = n + " (ID: " + id + ")";
                q('modalHorario').innerText = h ? "🕒 " + h : "🕒 Horario no disponible";
                q('chartTimeButtons').style.display = 'none';

                const mFav = q('modalFavHeart'); mFav.innerText = favoritos.includes(id) ? '❤️' : '🤍'; mFav.onclick = e => toggleFav(id, e, 'modalFavHeart');
                const st = q('chartStatus');

                const ctx = q('priceChart').getContext('2d'); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                const tColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333';
                const gColor = document.body.classList.contains('dark-mode') ? '#333' : '#ddd';

                const drawChart = (d) => {
                    st.style.display = 'none';
                    if (!d || !d.datasets || d.datasets.length === 0) { alert("No hay datos guardados para esta estación."); cerrarGrafico(); return; }

                    window.fullChartData = JSON.parse(JSON.stringify(d));
                    q('chartTimeButtons').style.display = 'flex';

                    chartInstance = new Chart(ctx, {
                        type: 'line', data: d,
                        options: {
                            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false, axis: 'x' },
                            plugins: {
                                tooltip: {
                                    backgroundColor: 'rgba(0,0,0,0.85)', titleFont: { size: 13 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 6, usePointStyle: true, callbacks: {
                                        labelColor: c => ({ borderColor: c.dataset.borderColor, backgroundColor: c.dataset.borderColor, borderWidth: 2 }),
                                        label: c => (c.dataset.label ? c.dataset.label + ': ' : '') + (c.parsed.y !== null ? c.parsed.y.toFixed(3).replace('.', ',') + ' €/L' : '')
                                    }
                                },
                                legend: {
                                    display: true, labels: {
                                        color: tColor, boxWidth: 12, font: { size: 11, weight: 'bold' }, generateLabels: ch => {
                                            const oL = Chart.defaults.plugins.legend.labels.generateLabels(ch);
                                            oL.forEach(l => { l.pointStyle = 'rect'; if (l.hidden) { l.fillStyle = 'transparent'; l.text = '̶' + l.text; } else { l.fillStyle = ch.data.datasets[l.datasetIndex].borderColor; l.strokeStyle = l.fillStyle; l.lineWidth = 2; } }); return oL;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    afterDataLimits: scale => {
                                        scale.max += 0.10;
                                        scale.min = Math.max(0, scale.min - 0.10);
                                    },
                                    ticks: { color: tColor, font: { size: 10 } }, grid: { color: gColor }
                                },
                                x: { ticks: { color: tColor, font: { size: 10 } }, grid: { color: gColor } }
                            }
                        }
                    });
                    updateChartRange(7, D.querySelectorAll('.time-btn')[1]);
                };

                if (historicoCache[id]) {
                    st.style.display = 'none';
                    drawChart(historicoCache[id]);
                } else {
                    st.style.display = 'flex';
                    q('chartSpinner').style.display = 'block'; q('chartText').innerText = "Calculando histórico..."; q('chartSubText').style.display = 'block';

                    fetch(WEB_APP_URL + "?accion=obtenerHistoricoOptimizado&nGas=" + encodeURIComponent(n) + "&idGas=" + encodeURIComponent(id) + "&t=" + Date.now(), { redirect: "follow" })
                        .then(res => res.json())
                        .then(d => {
                            historicoCache[id] = d;
                            drawChart(d);
                        })
                        .catch(e => {
                            q('chartSpinner').style.display = 'none'; q('chartSubText').style.display = 'none';
                            q('chartText').innerHTML = "❌ Datos no disponibles.<br><small>Es posible que la base de datos esté vacía para esta estación.</small>";
                        });
                }
            }

            async function getRealDistances(origin, stations) {
                let results = []; const chunkSize = 50;
                for (let i = 0; i < stations.length; i += chunkSize) {
                    let chunk = stations.slice(i, i + chunkSize);
                    let coords = [origin.lng, origin.lat].join(',');
                    chunk.forEach(s => { coords += ';' + parseFloat(s["Longitud (WGS84)"].replace(",", ".")) + ',' + parseFloat(s.Latitud.replace(",", ".")); });
                    let url = 'https://router.project-osrm.org/table/v1/driving/' + coords + '?sources=0&annotations=distance,duration';
                    try {
                        let res = await fetch(url); let data = await res.json();
                        if (data.code === 'Ok' && data.distances && data.distances[0]) {
                            for (let j = 1; j < data.distances[0].length; j++) results.push({ dist: data.distances[0][j], time: data.durations[0][j] });
                        } else {
                            chunk.forEach(s => results.push({ dist: getDistance(origin.lat, origin.lng, parseFloat(s.Latitud.replace(",", ".")), parseFloat(s["Longitud (WGS84)"].replace(",", "."))) * 1000, time: null }));
                        }
                    } catch (e) {
                        chunk.forEach(s => results.push({ dist: getDistance(origin.lat, origin.lng, parseFloat(s.Latitud.replace(",", ".")), parseFloat(s["Longitud (WGS84)"].replace(",", "."))) * 1000, time: null }));
                    }
                }
                return results;
            }

            // ==========================================================
            // MOTOR DE LOGOS DE GASOLINERAS (HÍBRIDO ANTI-GLOBOS)
            // ==========================================================
            function getLogoGasolinera(nombre, isMapa = false) {
                let n = nombre.toUpperCase();
                let src = ""; 

                // 1. REBELDES (Marcas que dan el globo terráqueo. Usamos enlace directo)
                if (n.includes("Q8") || n.includes("KUWAIT")) src = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Q8_logo.svg/120px-Q8_logo.svg.png";
                else if (n.includes("TAMOIL")) src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Tamoil_logo.svg/120px-Tamoil_logo.svg.png";
                else if (n.includes("ENI") || n.includes("AGIP")) src = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Eni_SpA_logo.svg/120px-Eni_SpA_logo.svg.png";
                else if (n.includes("GMOIL") || n.includes("GM OIL") || n.includes("GROS MERCAT")) src = "https://gmoil.es/favicon.ico"; 

                // 2. Marcas Principales y Tradicionales (Con dominio)
                else if (n.includes("REPSOL") || n.includes("CAMPSA") || n.includes("PETRONOR")) src = "repsol.es";
                else if (n.includes("CEPSA") || n.includes("MOEVE")) src = "cepsa.es"; 
                else if (n.includes("BP") || n.includes("B.P.")) src = "bp.com";
                else if (n.includes("SHELL")) src = "shell.es";
                else if (n.includes("GALP")) src = "galp.com";
                else if (n.includes("SARAS")) src = "sarasenergia.com";
                else if (n.includes("DISA")) src = "disa.es";
                else if (n.includes("AVIA")) src = "aviaenergias.es"; // <-- ¡AVIA vuelve a su sitio con Google!
                
                // 3. Supermercados e Hipermercados
                else if (n.includes("CARREFOUR")) src = "carrefour.es";
                else if (n.includes("ALCAMPO")) src = "alcampo.es";
                else if (n.includes("EROSKI")) src = "eroski.es";
                else if (n.includes("E.LECLERC") || n.includes("LECLERC")) src = "e-leclerc.es";
                else if (n.includes("BONAREA") || n.includes("BON AREA")) src = "bonarea.com";
                else if (n.includes("MERCADONA")) src = "mercadona.es";
                else if (n.includes("CAPRABO")) src = "caprabo.com";
                else if (n.includes("FAMILY ENERGY") || n.includes("FAMILY CASH")) src = "familycash.es";
                else if (n.includes("CONDIS")) src = "condis.es";
                else if (n.includes("ALDI")) src = "aldi.es";
                else if (n.includes("SUPECO")) src = "supeco.es";
                else if (n.includes("ESCLATOIL") || n.includes("ESCLAT")) src = "bonpreuesclat.cat";

                // 4. Low Cost e Independientes
                else if (n.includes("PLENERGY")) src = "plenergy.es";
                else if (n.includes("PLENOIL")) src = "plenoil.es";
                else if (n.includes("PETROPRIX")) src = "petroprix.com";
                else if (n.includes("BALLENOIL")) src = "ballenoil.es";
                else if (n.includes("EASYGAS") || n.includes("EASY GAS")) src = "easygasgroup.com";
                else if (n.includes("FAST FUEL")) src = "fastfuel.es";
                else if (n.includes("BEROIL")) src = "beroil.es";
                else if (n.includes("VALCARCE")) src = "grupovalcarce.com";
                else if (n.includes("MEROIL")) src = "meroil.es";
                else if (n.includes("PCAN")) src = "pcan.es";
                else if (n.includes("GASEXPRESS") || n.includes("GAS EXPRESS")) src = "gasexpress.es";
                else if (n.includes("PETROMIRALLES")) src = "petromiralles.com";
                else if (n.includes("ENERPLUS")) src = "enerplus.es";
                else if (n.includes("AUTONET")) src = "autonet-oil.es";
                else if (n.includes("BDMED")) src = "bdmed.es";
                else if (n.includes("ON TURTLE") || n.includes("RED TORTUGA")) src = "onturtle.eu";
                else if (n.includes("ANENERGETICOS") || n.includes("AN ENERGETICOS")) src = "anenergeticos.com";
                else if (n.includes("FARRUCO")) src = "farruco.es";
                else if (n.includes("BTP")) src = "btp.es";
                else if (n.includes("GASENER")) src = "gasener.com";
                else if (n.includes("IBERDOA")) src = "iberdoa.es";
                else if (n.includes("NIEVES")) src = "grupnieves.com";
                else if (n.includes("OCTANO")) src = "octano.es";
                else if (n.includes("ORTEGAL")) src = "ortegal.es";
                else if (n.includes("PETROCAT")) src = "petrocat.cat";
                else if (n.includes("SINESTAR")) src = "sinestar.es";
                else if (n.includes("STAR PETROLEUM")) src = "starpetroleum.com";
                else if (n.includes("TGAS")) src = "tgas.es";
                else if (n.includes("VILALTA")) src = "vilalta.es";
                else if (n.includes("GASCENTRO")) src = "gascentro.es";

                let size = isMapa ? 18 : 24;
                let margin = isMapa ? "margin-right: 6px;" : "";

                let fallbackHTML = `<div style="width:${size}px; height:${size}px; border-radius:4px; background:var(--bg-ahorro); border:1px solid var(--accent-green); display:flex; align-items:center; justify-content:center; font-size:${isMapa ? 10 : 14}px; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.15); ${margin}">⛽</div>`;

                if (src) {
                    let finalUrl = "";
                    
                    // Si el texto empieza por HTTP, es una imagen directa. Si no, es un dominio y usamos Google.
                    if (src.startsWith("http")) {
                        finalUrl = src;
                    } else {
                        finalUrl = "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://" + src + "&size=64";
                    }
                    
                    return `
                    <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0; width:${size}px; height:${size}px; ${margin}">
                        <img src="${finalUrl}" width="${size}" height="${size}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:${size}px; height:${size}px; object-fit:contain; border-radius:4px; background:white; padding:2px; box-shadow:0 1px 3px rgba(0,0,0,0.15);">
                        <div style="display:none; width:${size}px; height:${size}px; border-radius:4px; background:var(--bg-ahorro); border:1px solid var(--accent-green); align-items:center; justify-content:center; font-size:${isMapa ? 10 : 14}px; box-shadow:0 1px 3px rgba(0,0,0,0.15);">⛽</div>
                    </div>`;
                } else {
                    return fallbackHTML;
                }
            }



            async function fetchGasolineras() {
                if (!cacheGasolineras || isFetching) return;
                if (searchMode === 'zona' && !userCoords) return;
                if (searchMode === 'ruta' && !routePolylineCoords) return;
                if (searchMode === 'provincia' && !q("provinciaInput").value) return;

                isFetching = true;
                q("list-container").classList.add("bloqueado");
                q("list-container").scrollTop = 0;
                
                mostrarSkeleton();

                try {
                    const fT = q("tipoCombustible").value, fTN = q("tipoCombustible").options[q("tipoCombustible").selectedIndex].text, mD = parseFloat(q("radioBusqueda").value), fM = q("marcaInput").value.toUpperCase(), o = q("ordenarPor").value, lts = parseFloat(q("litrosInput").value) || 0, consumo = parseFloat(q("consumoInput").value) || 0, idV = q("idaVueltaInput").checked, sA = q("abiertasInput").checked, lD = q("gas-list");

                    const valProv = q("provinciaInput") ? q("provinciaInput").value : "";

                    // LÓGICA DE AUTONOMÍA INTACTA (Manual o Depósito lleno)
                    const valAuto = q("autonomiaInput").value;
                    let autonomiaManual = valAuto ? parseFloat(valAuto) : null;
                    let autonomiaMaximaCoche = (window.currentCarCapacity > 0 && consumo > 0) ? (window.currentCarCapacity / consumo) * 100 : Infinity;
                    let autonomia = autonomiaManual !== null ? autonomiaManual : autonomiaMaximaCoche;
                    const tieneAutonomia = !isNaN(autonomia) && autonomia > 0 && autonomia !== Infinity;

                    let currentCoordsStr = userCoords ? (userCoords[0] + "," + userCoords[1]) : "sin-gps";
                    if (lastCoordsStr === "") { lastCoordsStr = currentCoordsStr; }
                    else if (lastCoordsStr !== currentCoordsStr && searchMode === 'zona') {
                        osrmCache = {};
                        localStorage.removeItem('gasofaOsrmCache');
                        lastCoordsStr = currentCoordsStr;
                    }

                    let bounds;
                    const desvInput = q("desvioInput");
                    const maxDesvio = desvInput ? parseFloat(desvInput.value) : 5;
                    const pad = maxDesvio / 111;

                    if (searchMode === 'ruta') bounds = routeLineLayer.getBounds();

                    let enRadio = cacheGasolineras.filter(g => {
                        if (window.descartadasRuta && window.descartadasRuta.includes(g.IDEESS)) return false;

                        if (sA && !isGasolineraOpen(g.Horario)) return false;
                        const p = getPrecioPorTipo(g, fT); if (!p || !g.Rótulo.toUpperCase().includes(fM)) return false;

                        const lat = parseFloat(g.Latitud.replace(",", "."));
                        const lon = parseFloat(g["Longitud (WGS84)"].replace(",", "."));

                        if (isNaN(lat) || isNaN(lon) || lat < 25) return false;

                        if (searchMode === 'provincia') {
                            // Si es TODAS, no filtramos por nombre de provincia
                            if (valProv && valProv !== "TODAS")
                                if (valProv) {

                                    if (!g.Provincia) return false;
                                    let provLimpia = g.Provincia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                                    let busquedaLimpia = valProv.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                                    if (!provLimpia.includes(busquedaLimpia)) return false;
                                }
                            g.distHaversine = 0;
                        } else if (searchMode === 'zona') {
                            const d = getDistance(userCoords[0], userCoords[1], lat, lon);
                            if (d > mD) return false;

                            if (tieneAutonomia) {
                                const distNecesaria = idV ? (d * 2) : d;
                                if (distNecesaria > autonomia) return false;
                            }
                            g.distHaversine = d;
                        } else {
                            if (lat < bounds.getSouth() - pad || lat > bounds.getNorth() + pad || lon < bounds.getWest() - pad || lon > bounds.getEast() + pad) return false;

                            let minDist = Infinity;
                            let closestIdx = 0;
                            for (let i = 0; i < routePolylineCoords.length; i++) {
                                let d = getDistance(lat, lon, routePolylineCoords[i][1], routePolylineCoords[i][0]);
                                if (d < minDist) { minDist = d; closestIdx = i; }
                            }
                            if (minDist > maxDesvio) return false;

                            g.distHaversine = minDist;
                            g.distDesdeOrigen = routeCumDist[closestIdx] + minDist;
                        }

                        g.precioOficial = parseFloat(p.replace(",", "."));
                        g.pN = g.precioOficial;
                        g.descAplicado = "";

                        descuentosGuardados.forEach(desc => {
                            if (g.Rótulo.toUpperCase().includes(desc.marca)) {
                                if (desc.tipo === 'euro') {
                                    g.pN = Math.max(0.1, g.precioOficial - desc.valor);
                                    g.descAplicado = '-' + desc.valor + '€';
                                } else if (desc.tipo === 'porcentaje') {
                                    g.pN = Math.max(0.1, g.precioOficial * (1 - (desc.valor / 100)));
                                    g.descAplicado = '-' + desc.valor + '%';
                                }
                            }
                        });
                        return true;
                    });

                    if (enRadio.length === 0) {
                        lD.innerHTML = "<div style='text-align:center;padding:20px;color:var(--text-muted);'>Sin resultados.</div>";
                        markersLayer.clearLayers(); 
                        
                        isFetching = false;
                        q("list-container").classList.remove("bloqueado");
                        return;
                    }

                    let allPrices = enRadio.map(g => g.pN);
                    const globalMinP = Math.min(...allPrices);
                    const globalMaxP = Math.max(...allPrices);

                    let filtradas = o === "favoritas" ? enRadio.filter(g => favoritos.includes(g.IDEESS)) : enRadio;

                    if (filtradas.length === 0) {
                        lD.innerHTML = "<div style='text-align:center;padding:20px;color:var(--text-muted);'>No tienes gasolineras favoritas aquí.</div>";
                        markersLayer.clearLayers(); return;
                    }

                    // --- LÓGICA ESPECIAL TOP 100 ESPAÑA ---
                    if (searchMode === 'provincia' && valProv === "TODAS") {
                        // Ordenamos primero para saber cuáles son las 100 mejores/peores
                        if (o === "caras") {
                            filtradas.sort((a, b) => b.pN - a.pN);
                        } else {
                            filtradas.sort((a, b) => a.pN - b.pN);
                        }

                        // Cortamos la lista a 100
                        filtradas = filtradas.slice(0, 100);

                        // Actualizamos el cartel de arriba
                        const fTN = q("tipoCombustible").options[q("tipoCombustible").selectedIndex].text;
                        q('resumenAhorro').innerHTML = `🏆 TOP 100 ESPAÑA (${fTN}): Las más ${o === 'caras' ? 'caras' : 'baratas'}`;
                    }
                    // -----------------------------------------

                    if (searchMode === 'zona') {
                        let needsRouting = filtradas.filter(g => osrmCache[g.IDEESS] === undefined);

                        if (needsRouting.length > 0) {
                            q("loading-overlay").style.display = "flex"; q("loading-text").innerText = "🚗 Calculando rutas y tiempos...";
                            const newRoutes = await getRealDistances({ lat: userCoords[0], lng: userCoords[1] }, needsRouting);
                            needsRouting.forEach((g, idx) => { osrmCache[g.IDEESS] = newRoutes[idx]; });
                            try { localStorage.setItem('gasofaOsrmCache', JSON.stringify(osrmCache)); } catch (e) { }
                        }
                    }

                    markersLayer.clearLayers();

                    filtradas.forEach((g) => {
                        if (searchMode === 'zona') {
                            let routeData = osrmCache[g.IDEESS];
                            if (routeData) {
                                g.distCalculada = (routeData.dist !== null && routeData.dist !== undefined && !isNaN(routeData.dist)) ? (routeData.dist / 1000) : g.distHaversine;
                                g.tiempoCalculado = routeData.time ? Math.round(routeData.time / 60) : null;
                            } else {
                                g.distCalculada = g.distHaversine; g.tiempoCalculado = null;
                            }
                        } else if (searchMode === 'ruta') {
                            g.distCalculada = g.distHaversine; g.tiempoCalculado = null;
                        } else { // provincia
                            g.distCalculada = 0; g.tiempoCalculado = null;
                        }
                    });

                    filtradas.sort((a, b) => b.pN - a.pN);

                    let litrosEfectivos = lts > 0 ? lts : (window.currentCarCapacity > 0 ? window.currentCarCapacity : 50);

                    filtradas.forEach(g => {
                        g.aBruto = (globalMaxP - g.pN) * litrosEfectivos;
                        let mult = searchMode === 'zona' ? (idV ? 2 : 1) : 2;
                        g.cViaje = (consumo > 0 && searchMode !== 'provincia') ? (g.distCalculada * mult) * (consumo / 100) * g.pN : 0;
                        g.aNeto = g.aBruto - g.cViaje;
                    });

                    let bestStation = "", maxAhorroNeto = -Infinity, bestLat = 0, bestLon = 0;
                    filtradas.forEach(g => {
                        if (g.aNeto > maxAhorroNeto) {
                            maxAhorroNeto = g.aNeto; bestStation = g.Rótulo;
                            bestLat = parseFloat(g.Latitud.replace(",", ".")); bestLon = parseFloat(g["Longitud (WGS84)"].replace(",", "."));
                        }
                    });

                    // --- LÓGICA AYER VS HOY (NIVEL DIOS) ---
                    window.lastFiltradas = filtradas;
                    actualizarCabeceraTendencias();
                    // --------------------------



                    let planViajeHtml = "";
                    window.planesUnicosGlobal = [];
                    if (typeof window.selectedSmartPlanIndex === 'undefined') window.selectedSmartPlanIndex = 0;

                    let distTotalViaje = idV ? (totalRouteDist * 2) : totalRouteDist;
                    let necesitaPlanInteligente = (searchMode === 'ruta' && tieneAutonomia && consumo > 0 && distTotalViaje > autonomia);

                    if (necesitaPlanInteligente) {
                        let encuentros = [];
                        filtradas.forEach(g => {
                            if (g["Tipo Venta"] === "R") return;
                            encuentros.push({ ...g, kmTravesia: g.distDesdeOrigen, sentido: "➡️ A la IDA" });
                            if (idV) encuentros.push({ ...g, kmTravesia: distTotalViaje - g.distDesdeOrigen, sentido: "⬅️ A la VUELTA" });
                        });

                        function generarPlan(indicesVariantes) {
                            let distRestante = distTotalViaje;
                            let paradaNum = 0;
                            let paradas = [];
                            let ahorroTotalPlan = 0;
                            let kmUltimoRepostaje = 0;

                            // LÓGICA DE AUTONOMÍA (INICIA CON MANUAL, LUEGO MÁXIMA)
                            let autonomiaDisponible = autonomiaManual !== null ? autonomiaManual : autonomiaMaximaCoche;

                            let estacionesRuta = encuentros.slice().sort((a, b) => a.kmTravesia - b.kmTravesia);

                            while (distRestante > autonomiaDisponible && paradaNum < 15) {
                                paradaNum++;
                                let limiteKm = kmUltimoRepostaje + autonomiaDisponible;

                                // En la PRIMERA parada, no exigimos mínimo de km. 
                                let kmInicioVentana = paradaNum === 1 ? 0 : kmUltimoRepostaje + (autonomiaDisponible * 0.4);

                                let candidatas = estacionesRuta.filter(e => e.kmTravesia >= kmInicioVentana && e.kmTravesia <= limiteKm);

                                if (candidatas.length === 0 && paradaNum > 1) {
                                    candidatas = estacionesRuta.filter(e => e.kmTravesia >= kmUltimoRepostaje && e.kmTravesia <= limiteKm);
                                }

                                if (candidatas.length === 0) return null;

                                let modoLlenadoActivo = (window.currentCarCapacity > 0 && q("llenarDepositoInput") && q("llenarDepositoInput").checked);

                                candidatas.forEach(c => {
                                    let kmConducidos = c.kmTravesia - kmUltimoRepostaje;
                                    let litrosAComprar = 0;

                                    if (modoLlenadoActivo) {
                                        if (paradaNum === 1) {
                                            let litrosAlSalir = (autonomia / 100) * consumo;
                                            let litrosGastados = (kmConducidos / 100) * consumo;
                                            let litrosRestantesAlLlegar = litrosAlSalir - litrosGastados;
                                            litrosAComprar = window.currentCarCapacity - Math.max(0, litrosRestantesAlLlegar);
                                        } else {
                                            let litrosGastados = (kmConducidos / 100) * consumo;
                                            litrosAComprar = litrosGastados;
                                        }
                                    } else {
                                        if (paradaNum === 1) {
                                            litrosAComprar = litrosEfectivos + ((kmConducidos / 100) * consumo);
                                        } else {
                                            litrosAComprar = (kmConducidos / 100) * consumo;
                                        }
                                        if (window.currentCarCapacity > 0 && litrosAComprar > window.currentCarCapacity) {
                                            litrosAComprar = window.currentCarCapacity;
                                        } else if (window.currentCarCapacity === 0 && litrosAComprar > litrosEfectivos && paradaNum === 1) {
                                            litrosAComprar = litrosEfectivos;
                                        }
                                    }

                                    c.litrosRepostados = litrosAComprar;
                                    let ahorroBrutoReal = (globalMaxP - c.pN) * litrosAComprar;
                                    let costoDesvioReal = (c.distCalculada * 2) * (consumo / 100) * c.pN;
                                    c.ahorroRealTemporal = ahorroBrutoReal - costoDesvioReal;
                                });

                                candidatas.sort((a, b) => b.ahorroRealTemporal - a.ahorroRealTemporal);

                                let idx = (paradaNum - 1) < indicesVariantes.length ? indicesVariantes[paradaNum - 1] : 0;
                                let elegida = candidatas.length > idx ? candidatas[idx] : candidatas[0];

                                elegida = { ...elegida, aNeto: elegida.ahorroRealTemporal, paradaNum: paradaNum };

                                paradas.push(elegida);
                                ahorroTotalPlan += elegida.ahorroRealTemporal;

                                kmUltimoRepostaje = elegida.kmTravesia;
                                distRestante = distTotalViaje - kmUltimoRepostaje;

                                // Tras la primera parada, el depósito ya está lleno
                                autonomiaDisponible = autonomiaMaximaCoche;
                            }

                            if (distRestante > autonomiaDisponible) return null;

                            return { paradas: paradas, ahorroTotal: ahorroTotalPlan, idUnico: paradas.map(p => p.IDEESS).join('-') };
                        }

                        let matrices = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [3, 3, 3, 3, 3], [1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [2, 0, 0, 0, 0], [0, 2, 0, 0, 0], [1, 1, 0, 0, 0], [2, 2, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 2, 0, 0]];
                        let planesBrutos = matrices.map(m => generarPlan(m));

                        let idsVistos = new Set();
                        planesBrutos.forEach(p => {
                            if (p && !idsVistos.has(p.idUnico)) {
                                idsVistos.add(p.idUnico);
                                window.planesUnicosGlobal.push(p);
                            }
                        });

                        window.planesUnicosGlobal.sort((a, b) => b.ahorroTotal - a.ahorroTotal);
                        window.planesUnicosGlobal = window.planesUnicosGlobal.slice(0, 8);

                        if (window.selectedSmartPlanIndex >= window.planesUnicosGlobal.length) window.selectedSmartPlanIndex = 0;
                    }

                    let gasolinerasParaPintar = filtradas;

                    if (o === "inteligente" && window.planesUnicosGlobal.length > 0) {
                        let planActual = window.planesUnicosGlobal[window.selectedSmartPlanIndex];
                        let idsDelPlan = planActual.paradas.map(p => p.IDEESS);
                        gasolinerasParaPintar = filtradas.filter(g => idsDelPlan.includes(g.IDEESS));
                    } else if (o === "inteligente" && window.planesUnicosGlobal.length === 0) {
                        gasolinerasParaPintar = [];
                    }

                                       // DIBUJADO DE LAS TARJETAS (ESTILO NATIVO NUEVO)
           let marcadoresEnLote = [];
                    gasolinerasParaPintar.forEach((g) => {
                        const lat = parseFloat(g.Latitud.replace(",", ".")), ln = parseFloat(g["Longitud (WGS84)"].replace(",", "."));
                        const pN = g.pN;
                        const isF = favoritos.includes(g.IDEESS), hIc = isF ? '❤️' : '🤍', isR = g["Tipo Venta"] === "R";

                        // --- ESTRELLAS (DESACTIVADAS) Y SEMÁFORO INTELIGENTE (ACTIVO) ---
                        let htmlEstrellas = typeof generarEstrellasAmazon === 'function' ? generarEstrellasAmazon(0, 0) : '';

                        let calculoPredictivo = window.calcularSemaforoPredictivo ? window.calcularSemaforoPredictivo(g.pN, currentTrends[g.IDEESS]) : {resultado: {color:"#f39c12", icon:"🟡", texto:"ESTABLE"}, detalles: {}};
                        let semaforo = calculoPredictivo.resultado;
                        let bgSemaforo = document.body.classList.contains('dark-mode') ? 'rgba(0,0,0,0.3)' : 'var(--bg-ahorro)';
                        
                        let jsonDetalles = encodeURIComponent(JSON.stringify(calculoPredictivo.detalles));
                        let nombreSeguro = g.Rótulo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        
                        let htmlPrediccion = `<div style="display:flex; align-items:center; gap:4px; font-size:10px; font-weight:900; color:${semaforo.color}; margin-top:4px; margin-bottom:6px; background:${bgSemaforo}; padding:3px 8px; border-radius:12px; border:1px solid ${semaforo.color}; width:fit-content; box-shadow:0 2px 4px rgba(0,0,0,0.05); cursor:pointer;" onclick="window.abrirInfoPrediccion(event, '${nombreSeguro}', '${jsonDetalles}', '${semaforo.icon}', '${semaforo.texto}', '${semaforo.color}')">
                                                <span style="font-size:12px;">${semaforo.icon}</span> <span style="margin-top:1px;">PREDICCIÓN: ${semaforo.texto}</span>
                                                <span style="background:var(--bg-panel); color:var(--text-main); border-radius:50%; width:14px; height:14px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; border:1px solid var(--border-color); margin-left:2px; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-family:serif;" title="¿Cómo se calcula?">i</span>
                                             </div>`;

                        htmlEstrellas = htmlEstrellas + htmlPrediccion;

                        let pStrVisualMap = pN.toFixed(3);

                        let pStrVisualPop = pN.toFixed(3) + " €/L";
                        
                        // Aumentamos la anchura de 65 a 95 para que quepa el logo, el precio y la tendencia
                        let iconSz = [95, 28], iconAnc = [47, 35];

                        if (g.descAplicado !== "") {
                            let tachado = '<div style="text-decoration:line-through; font-size:0.75em; color:var(--text-muted); line-height:1;">' + g.precioOficial.toFixed(3) + '</div>';
                            pStrVisualMap = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">' + tachado + '<div style="line-height:1;">' + pN.toFixed(3) + '</div></div>';
                            // Aumentamos también la anchura si tiene un descuento aplicado
                            iconSz = [105, 42]; iconAnc = [52, 45];
                            pStrVisualPop = '<div style="display:flex; flex-direction:column; align-items:center;">' + tachado + '<div style="line-height:1;">' + pN.toFixed(3) + ' €/L</div></div>';
                        }

                        let tData = currentTrends[g.IDEESS], tH_m = trendsLoaded ? getTrendHTML(tData, 'map') : '⏳', tH = trendsLoaded ? getTrendHTML(tData, 'list') : '⏳';
                        let cS = pN <= (globalMinP + 0.03) ? "var(--accent-green)" : pN < (globalMinP + globalMaxP) / 2 ? "var(--accent-orange)" : "#e74c3c";

                        let pPunto = cS === "var(--accent-green)" ? "puntos_verde" : cS === "var(--accent-orange)" ? "puntos_amar" : "puntos_rojo";
                        let pPrecio = cS === "var(--accent-green)" ? "precios_verde" : cS === "var(--accent-orange)" ? "precios_amar" : "precios_rojo";

                        const m = (g.pN === globalMinP) ? "🥇" : "";
                        const bSM = isR ? '<div style="background:#c0392b;color:#fff;font-size:10px;padding:2px 5px;border-radius:4px;display:inline-block;margin-bottom:5px;">🔒 SOLO SOCIOS</div><br>' : '';
                        const mU = "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + ln, sN = g.Rótulo.replace(/'/g, ""), iM = 'heart_map_' + g.IDEESS;


                        let msgDist = '';
                        if (searchMode === 'zona') msgDist = '🚗 ' + g.distCalculada.toFixed(2) + ' km' + (g.tiempoCalculado ? ' | ⏱️ ' + g.tiempoCalculado + ' min' : '');
                        else if (searchMode === 'ruta') msgDist = '⤴️ Desvío: ' + g.distCalculada.toFixed(2) + ' km';
                        else msgDist = '📍 En tu provincia';

                        let msgAhorroWa = (consumo > 0 && searchMode !== 'provincia') ? (g.aNeto > 0 ? "Ahorro Real Neto: " + g.aNeto.toFixed(2) + "€" : "¡Te cuesta más el " + (searchMode === 'zona' ? 'viaje' : 'desvío') + " (" + g.cViaje.toFixed(2) + "€)!") : "Ahorras " + g.aBruto.toFixed(2) + "€ llenando hoy.";
                        const waM = encodeURIComponent('⛽ ¡Ojo! ' + fTN + ' a ' + pN.toFixed(3) + '€/L en ' + g.Rótulo + ' (' + g.Dirección + '). ' + msgAhorroWa + ' 🚗💨\n\n📍 Míralo en Precio Combustibles:\n' + APP_URL);
                        const waB = '<a class="btn-action btn-wa" href="https://api.whatsapp.com/send?text=' + waM + '" target="_blank">💬 WA</a>';

                        // --- NUEVO DISEÑO POP-UP NATIVO CENTRADO ---
                        // --- 1. Ahorro Ultra Compacto (Solo para el Pop-Up) ---
                        let htmlAhorroPop = "";
                        if (consumo > 0 && searchMode !== 'provincia') {
                            if (g.aNeto > 0) htmlAhorroPop = `<div style="background:${cS};color:#fff;padding:4px 6px;border-radius:6px;font-weight:bold;font-size:10px;">+${g.aNeto.toFixed(2)}€</div>`;
                            else htmlAhorroPop = `<div style="background:#e74c3c;color:#fff;padding:4px 6px;border-radius:6px;font-weight:bold;font-size:10px;">-${Math.abs(g.aNeto).toFixed(2)}€</div>`;
                        } else if (g.aBruto > 0) {
                            htmlAhorroPop = `<div style="background:${cS};color:#fff;padding:4px 6px;border-radius:6px;font-weight:bold;font-size:10px;">AHORRA ${g.aBruto.toFixed(2)}€</div>`;
                        }

                                                // --- 2. Insignia Socios Compacta ---
                        const bSMPop = isR ? '<span style="background:#c0392b;color:#fff;font-size:8px;padding:2px 4px;border-radius:4px;margin-left:4px;vertical-align:middle;">🔒 SOCIOS</span>' : '';


                        // --- 3. Diseño del Pop-Up ---
                        let osmCacheHtml = window.osmCache && window.osmCache[g.IDEESS] ? window.osmCache[g.IDEESS] : '<span style="font-size:10px;color:var(--text-muted);">🔄 Buscando extras...</span>';

                        const pop = `
                    <div style="min-width: 200px; text-align: left; padding: 2px 0; font-family: -apple-system, sans-serif;">
                        
                        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:6px;">
                            <div style="display:flex; justify-content:center; align-items:center; gap:8px; text-align:center;">
                                <div style="font-size:14px; font-weight:900; color:var(--text-main); display:flex; align-items:center; gap:6px; max-width: 180px;">
                                    ${m} 
                                    ${getLogoGasolinera(g.Rótulo)}
                                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${g.Rótulo}</span> 
                                    ${bSMPop}
                                </div>
                                <span id="${iM}" class="fav-btn fav-btn-id-${g.IDEESS}" onclick="toggleFav('${g.IDEESS}',event,'${iM}')" style="font-size:16px; margin-top:-2px;">${hIc}</span>
                            </div>
                            <div style="margin-top:2px;">
                                ${htmlEstrellas}
                            </div>
                        </div>

                        <div style="background:var(--bg-input); border-radius:8px; padding:6px 10px; margin-bottom:8px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                            <div style="color:${cS}; font-size:16px; font-weight:900; display:flex; align-items:center; gap:4px;">
                                ${pStrVisualPop} <span class="tr-ind" data-type="list" data-id="${g.IDEESS}">${tH}</span>
                            </div>
                            <div>${htmlAhorroPop}</div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:10px; color:var(--text-muted); font-weight:bold;">
                            <span class="distancia-badge" style="background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-color); font-weight:bold; font-size:10px; padding:3px 6px; border-radius:6px;">${msgDist}</span>
                            <span>🕒 ${g.Horario ? g.Horario.split(';')[0].substring(0, 16) + (g.Horario.length > 16 ? '...' : '') : 'N/D'}</span>
                        </div>

                        <div class="osm-pop-placeholder" data-id="${g.IDEESS}" style="display:flex; flex-wrap:wrap; justify-content:center; gap:3px; margin-bottom:10px;">
                            ${osmCacheHtml}
                        </div>

                        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px; margin-top:8px;">
                            <button onclick="mostrarHistorico('${sN}','${g.IDEESS}','${g.Horario || ''}')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:0 8px; height:32px; border-radius:8px; box-sizing:border-box; font-size:11px; font-weight:bold; cursor:pointer;">📈 Histórico</button>
                            
                            <button onclick="alert('🚧 ¡Próximamente! Estamos ultimando la sección de opiniones.')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:0 8px; height:32px; border-radius:8px; box-sizing:border-box; font-size:11px; font-weight:bold; cursor:pointer;">⭐ Opiniones</button>
                            
                            <button onclick="abrirAnotar('${sN}', ${g.pN}, ${(globalMaxP - g.pN).toFixed(3)})" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:0 8px; height:32px; border-radius:8px; box-sizing:border-box; font-size:11px; font-weight:bold; cursor:pointer;">📓 Anotar</button>
                            
                            <button onclick="compartirNativo('${sN}', '${waM}')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:0 8px; height:32px; border-radius:8px; box-sizing:border-box; font-size:11px; font-weight:bold; cursor:pointer;">📤 Compartir</button>
                            
                            <a href="${mU}" target="_blank" style="background:var(--accent); color:#fff; border:none; margin:0; padding:0 12px; height:34px; border-radius:8px; box-sizing:border-box; font-size:12px; font-weight:bold; flex:1; display:flex; align-items:center; justify-content:center; text-decoration:none; box-shadow:0 2px 4px rgba(0,0,0,0.15);">🗺️ Ir a Maps</a>
                        </div>
                    </div>`;



                        let htmlMapa = '<div style="background:' + cS + '; color:#fff; padding:4px 6px; border-radius:12px; font-weight:900; font-size:14px; box-shadow:0 3px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; border: 1px solid rgba(255,255,255,0.5); text-shadow: 0 1px 2px rgba(0,0,0,0.3); white-space:nowrap; box-sizing:border-box;">' + getLogoGasolinera(g.Rótulo, true) + pStrVisualMap + '<span class="tr-ind" style="margin-left:4px; filter: brightness(0) invert(1);" data-type="map" data-id="' + g.IDEESS + '">' + tH_m + '</span></div>';


                        // Solo dibujamos la etiqueta del precio para que el cluster cuente 1 solo marcador por gasolinera
                        let nuevoMarcador = L.marker([lat, ln], { icon: L.divIcon({ className: '', html: htmlMapa, iconSize: iconSz, iconAnchor: iconAnc }), pane: pPrecio, zIndexOffset: parseInt(10000 - (g.pN * 1000)) }).bindPopup(pop, { maxHeight: 320, autoPan: false });
marcadoresEnLote.push(nuevoMarcador);

                    });
                    
                   markersLayer.addLayers(marcadoresEnLote); // Pintamos todo el mapa en 1 milisegundo


                    if (searchMode === 'provincia' && gasolinerasParaPintar.length > 0) {
                        map.fitBounds(markersLayer.getBounds(), { padding: [20, 20] });
                    }


                    lD.innerHTML = "";

                    if (consumo > 0 && searchMode !== 'provincia') {
                        if (necesitaPlanInteligente) {
                            q("header-ahorro").style.display = "none";
                        } else {
                            q("header-ahorro").style.display = "block";
                            if (maxAhorroNeto > 0) {
                                q("resumenAhorro").innerHTML = '<div style="cursor:pointer;" onclick="window.centrarMapa(' + bestLat + ',' + bestLon + ')">🏆 MEJOR OPCIÓN (' + searchMode.toUpperCase() + '): <strong>' + bestStation + '</strong> <span style="color:var(--accent-green);">(+' + maxAhorroNeto.toFixed(2) + '€)</span> <small style="font-size:10px;text-decoration:underline;">📍 VER</small></div>';
                            } else {
                                q("resumenAhorro").innerHTML = "⚠️ NINGUNA SALE RENTABLE CON ESTOS DESVÍOS";
                            }
                        }
                    } else {
                        q("header-ahorro").style.display = "block";
                        q("resumenAhorro").innerHTML = "💰 AHORRO MÁXIMO POSIBLE (" + searchMode.toUpperCase() + "): " + ((globalMaxP - globalMinP) * litrosEfectivos).toFixed(2) + "€";
                    }

                    if (necesitaPlanInteligente && window.planesUnicosGlobal.length > 0) {
                        // Aseguramos que la opción elegida sea válida
                        if (typeof window.selectedSmartPlanIndex === 'undefined' || window.selectedSmartPlanIndex >= window.planesUnicosGlobal.length) window.selectedSmartPlanIndex = 0;
                        
                        let planElegido = window.planesUnicosGlobal[window.selectedSmartPlanIndex];
                        let ahorroMaximo = planElegido.ahorroTotal.toFixed(2);
                        let paradasMaximo = planElegido.paradas.length === 1 ? "1 parada" : planElegido.paradas.length + " paradas";

                        planViajeHtml = `<div style="background:var(--bg-ahorro); border:2px solid var(--accent-green); border-radius:10px; padding:12px; margin-bottom:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">`;
                        planViajeHtml += `<div style="color:var(--accent-green); font-weight:900; margin-bottom:10px; display:flex; flex-direction:column; gap:4px;">
                                        <div style="font-size:14px;">🗺️ PLAN INTELIGENTE</div>
                                        <div style="background:var(--accent-green); color:#fff; padding:6px 10px; border-radius:6px; font-size:16px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                                            💰 AHORRAS +${ahorroMaximo}€ (en ${paradasMaximo})
                                        </div>
                                      </div>`;

                        if (window.planesUnicosGlobal.length > 1) {
                            planViajeHtml += `<div style="margin-bottom:12px;">
                            <label style="font-size:12px; font-weight:bold; color:var(--text-muted); margin-bottom:4px; display:block;">Opciones de ruta (evitar atascos):</label>
                            <select id="selectorPlanInteligente" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); font-weight:bold; color:var(--text-main); background:var(--bg-input); cursor:pointer; font-size:13px;" onchange="window.selectedSmartPlanIndex=parseInt(this.value); window.fetchGasolineras();">`;

                            window.planesUnicosGlobal.forEach((p, i) => {
                                let textoParadas = p.paradas.length === 1 ? "1 parada" : p.paradas.length + " paradas";
                                let isSel = i === window.selectedSmartPlanIndex ? 'selected' : '';
                                planViajeHtml += `<option value="${i}" ${isSel}>OPCIÓN ${i + 1} (+${p.ahorroTotal.toFixed(2)}€ en ${textoParadas})</option>`;
                            });
                                                        planViajeHtml += `</select></div>`;
                        }

                        // INYECTAMOS EL BOTÓN DE EXPORTAR CON EL ESTILO ORIGINAL DE TU MARCA
                        planViajeHtml += `
                        <button onclick="window.exportarRutaGoogleMaps()" style="width:100%; background:var(--accent); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; font-size:14px; cursor:pointer; margin-top:5px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 6px rgba(0,0,0,0.15); box-sizing:border-box;">
                            🗺️ Iniciar Ruta en Google Maps
                        </button>
                        `;

                       
                        let planSeleccionado = window.planesUnicosGlobal[window.selectedSmartPlanIndex];
                        planViajeHtml += `<div id="plan-variante-activo">`;
                        planSeleccionado.paradas.forEach(mejor => {
                            let colorPrecio = mejor.pN <= (globalMinP + 0.03) ? "var(--accent-green)" : mejor.pN < (globalMinP + globalMaxP) / 2 ? "var(--accent-orange)" : "#e74c3c";
                            planViajeHtml += `
                        <div class="list-item" style="border-color:var(--accent-green);" onclick="window.centrarMapa(${parseFloat(mejor.Latitud.replace(',', '.'))}, ${parseFloat(mejor['Longitud (WGS84)'].replace(',', '.'))})">
                            
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; width:100%;">
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <span class="top-badge oro">PARADA ${mejor.paradaNum}</span>
                                    <span style="font-weight:bold; color:var(--text-main); font-size:12px; white-space:nowrap;">${mejor.sentido}</span>
                                </div>
                                <button onclick="event.preventDefault(); event.stopPropagation(); window.descartarGasolinera('${mejor.IDEESS}'); return false;" style="background:#e74c3c; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:10px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2); white-space:nowrap;">❌ IGNORAR</button>
                            </div>
                            
                            <div style="font-size:15px; font-weight:800; color:var(--text-main); line-height:1.2; display:flex; align-items:center; gap:6px;">
                                🏆 ${getLogoGasolinera(mejor.Rótulo)} ${mejor.Rótulo}
                            </div>
                            <div style="margin-top:8px; margin-bottom:8px; display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
                                <span style="background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-color); font-weight:bold; font-size:10px; padding:3px 6px; border-radius:6px; text-transform:uppercase;">
                                    ${mejor.Municipio || ''}
                                </span>
                                <span style="font-size:12px; color:var(--text-muted); font-weight:500;">${mejor.Dirección}</span>
                            </div>

                            
                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; width:100%;">
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <span style="color:${colorPrecio}; font-weight:900; font-size:17px; white-space:nowrap;">${mejor.pN.toFixed(3)} €/L</span>
                                    <span style="background:var(--accent-green); color:#fff; font-weight:bold; font-size:11px; padding:3px 6px; border-radius:6px; white-space:nowrap;">+${mejor.aNeto.toFixed(2)}€</span>
                                    <span style="background:#34495e; color:#fff; font-weight:bold; font-size:11px; padding:3px 6px; border-radius:6px; white-space:nowrap; margin-left:4px;">⛽ Echar ${mejor.litrosRepostados.toFixed(1)} L</span>
                                </div>
                                <span class="distancia-badge" style="background:var(--bg-input); border-color:var(--border-color); color:var(--text-main);">🚗 km ${mejor.kmTravesia.toFixed(0)}</span>
                            </div>
                            
                            <div style="font-size:11px; color:var(--accent); font-weight:bold; border-top:1px solid var(--border-color); padding-top:8px; margin-top:2px;">
                                ⤴️ Desvío: ${mejor.distCalculada.toFixed(1)} km
                            </div>
                            <div id="servicios-os-${mejor.IDEESS}" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; min-height:24px;"></div>
                        </div>`;
                        });
                        planViajeHtml += `</div></div>`;

                        lD.innerHTML = planViajeHtml;
                    }

                                                          if (o !== "inteligente") {
                        if (o === "distancia" && searchMode !== 'provincia') {
                            // Si estamos en ruta, ordenamos por orden de aparición en el viaje. Si no, por cercanía al GPS.
                            if (searchMode === 'ruta') filtradas.sort((a, b) => a.distDesdeOrigen - b.distDesdeOrigen);
                            else filtradas.sort((a, b) => a.distCalculada - b.distCalculada);
                        }
                        else if (o === "ahorro" && searchMode !== 'provincia') filtradas.sort((a, b) => b.aNeto - a.aNeto);
                        else if (o === "caras") filtradas.sort((a, b) => b.pN - a.pN);
                        else filtradas.sort((a, b) => a.pN - b.pN);


                        filtradas.forEach((g, i) => g.rP = i + 1);

                        // 1. CREAMOS LA CAJA INVISIBLE (Mejora de Rendimiento Fragment)
                        const fragmentoMagico = document.createDocumentFragment();

                        filtradas.forEach(g => {
                            const lat = parseFloat(g.Latitud.replace(",", ".")), ln = parseFloat(g["Longitud (WGS84)"].replace(",", "."));
                            const pN = g.pN;
                            const isF = favoritos.includes(g.IDEESS), hIc = isF ? '❤️' : '🤍', isR = g["Tipo Venta"] === "R";

                            // PREPARAMOS EL PRECIO Y EL DESCUENTO POR SEPARADO
                            let pStrVisualList = pN.toFixed(3) + " €/L";
                            let htmlDescuento = "";
                            if (g.descAplicado !== "") {
                                htmlDescuento = '<div style="display:flex; justify-content:flex-end; align-items:center; gap:4px; margin-bottom:2px;"><span style="text-decoration:line-through; font-size:12px; color:var(--text-muted);">' + g.precioOficial.toFixed(3) + ' €</span><span class="desc-badge">' + g.descAplicado + '</span></div>';
                            }

                            let tData = currentTrends[g.IDEESS], tH = trendsLoaded ? getTrendHTML(tData, 'list') : '⏳';
                            let cS = pN <= (globalMinP + 0.03) ? "var(--accent-green)" : pN < (globalMinP + globalMaxP) / 2 ? "var(--accent-orange)" : "#e74c3c";
                            let m = g.rP === 1 && o !== "favoritas" ? "🥇" : g.rP === 2 && o !== "favoritas" ? "🥈" : g.rP === 3 && o !== "favoritas" ? "🥉" : "", cM = m === "🥇" ? "oro" : m === "🥈" ? "plata" : m === "🥉" ? "bronce" : "";

                                       
                                            const bSL = isR ? '<span style="background:transparent; color:#c0392b; border:1px solid #c0392b; font-size:9px; font-weight:bold; padding:2px 5px; border-radius:4px; vertical-align:middle; margin-left:5px;">🔒 SOCIOS</span>' : '';
                            const mU = "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + ln, sN = g.Rótulo.replace(/'/g, ""), iL = 'heart_list_' + g.IDEESS;


                            let htmlAhorroList = "";

                            
                        // --- ESTRELLAS (DESACTIVADAS) Y SEMÁFORO INTELIGENTE (ACTIVO) ---
                        let htmlEstrellas = typeof generarEstrellasAmazon === 'function' ? generarEstrellasAmazon(0, 0) : '';

                        let calculoPredictivo = window.calcularSemaforoPredictivo ? window.calcularSemaforoPredictivo(g.pN, currentTrends[g.IDEESS]) : {resultado: {color:"#f39c12", icon:"🟡", texto:"ESTABLE"}, detalles: {}};
                        let semaforo = calculoPredictivo.resultado;
                        let bgSemaforo = document.body.classList.contains('dark-mode') ? 'rgba(0,0,0,0.3)' : 'var(--bg-ahorro)';
                        
                        let jsonDetalles = encodeURIComponent(JSON.stringify(calculoPredictivo.detalles));
                        let nombreSeguro = g.Rótulo.replace(/'/g, "\\'").replace(/"/g, '"');
                        
                        let htmlPrediccion = `<div style="display:flex; align-items:center; gap:4px; font-size:10px; font-weight:900; color:${semaforo.color}; margin-top:4px; margin-bottom:6px; background:${bgSemaforo}; padding:3px 8px; border-radius:12px; border:1px solid ${semaforo.color}; width:fit-content; box-shadow:0 2px 4px rgba(0,0,0,0.05); cursor:pointer;" onclick="window.abrirInfoPrediccion(event, '${nombreSeguro}', '${jsonDetalles}', '${semaforo.icon}', '${semaforo.texto}', '${semaforo.color}')">
                                                <span style="font-size:12px;">${semaforo.icon}</span> <span style="margin-top:1px;">PREDICCIÓN: ${semaforo.texto}</span>
                                                <span style="background:var(--bg-panel); color:var(--text-main); border-radius:50%; width:14px; height:14px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; border:1px solid var(--border-color); margin-left:2px; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-family:serif;" title="¿Cómo se calcula?">i</span>
                                             </div>`;

                        htmlEstrellas = htmlEstrellas + htmlPrediccion;


                            if (consumo > 0 && searchMode !== 'provincia') {
                                if (g.aNeto > 0) htmlAhorroList = '<span class="badge-ahorro pulse-ahorro" style="background:' + cS + '">AHORRO NETO: +' + g.aNeto.toFixed(2) + '€</span><div style="font-size:12px;color:var(--text-muted);font-weight:bold;text-align:right;margin-top:2px;">' + (searchMode === 'zona' ? 'Viaje' : 'Desvío') + ': -' + g.cViaje.toFixed(2) + '€</div>';
                                else htmlAhorroList = '<span class="badge-ahorro" style="background:#e74c3c">PIERDES ' + Math.abs(g.aNeto).toFixed(2) + '€</span><div style="font-size:12px;color:var(--text-muted);font-weight:bold;text-align:right;margin-top:2px;">' + (searchMode === 'zona' ? 'Viaje' : 'Desvío') + ': -' + g.cViaje.toFixed(2) + '€</div>';
                            } else if (g.aBruto > 0) {
                                htmlAhorroList = '<span class="badge-ahorro pulse-ahorro" style="background:' + cS + '">AHORRA ' + g.aBruto.toFixed(2) + '€</span>';
                            }

                            let msgDist = '';
                            if (searchMode === 'zona') msgDist = '🚗 ' + g.distCalculada.toFixed(1) + ' km' + (g.tiempoCalculado ? ' | ⏱️ ' + g.tiempoCalculado + ' min' : '');
                            else if (searchMode === 'ruta') msgDist = '⤴️ Desvío: ' + g.distCalculada.toFixed(1) + ' km';
                            else msgDist = '📍 Provincia';

                            let msgAhorroWa = (consumo > 0 && searchMode !== 'provincia') ? (g.aNeto > 0 ? "Ahorro Real Neto: " + g.aNeto.toFixed(2) + "€" : "¡Te cuesta más el " + (searchMode === 'zona' ? 'viaje' : 'desvío') + "!") : "Ahorras " + g.aBruto.toFixed(2) + "€ llenando hoy.";
                            const waM = encodeURIComponent('⛽ ¡Ojo! ' + fTN + ' a ' + pN.toFixed(3) + '€/L en ' + g.Rótulo + ' (' + g.Dirección + '). ' + msgAhorroWa + ' 🚗💨\n\n📍 Míralo en Precio Combustibles:\n' + APP_URL);

                            const item = D.createElement("div"); 
                            item.className = "list-item";
                            item.id = "tarjeta-" + g.IDEESS;

                            item.onclick = e => {
                                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && !e.target.closest('.fav-btn') && !e.target.closest('.d-tipo')) {
                                    // CHIVATO: Clic en la lista
                                    if (typeof gtag !== 'undefined') {
                                        gtag('event', 'clic_lista_gasolinera', {
                                            'event_category': 'Interaccion_Usuario',
                                            'nombre_gasolinera': g.Rótulo
                                        });
                                    }
                                    window.centrarMapa(lat, ln);
                                }
                            };

                            item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:stretch; width:100%; gap:8px;">
                            
                            <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span class="top-badge ${cM}" style="margin:0;">${o === "favoritas" ? '❤️ FAVORITA' : 'TOP ' + g.rP + ' ' + m}</span>${bSL}
                                </div>
                                
                                <div style="font-size:15px; font-weight:900; color:var(--text-main); line-height:1.1; display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px;">
                                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                        ${getLogoGasolinera(g.Rótulo)}
                                        <span style="word-break:break-word; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${g.Rótulo}</span>
                                    </div>
                                    <span id="${iL}" class="fav-btn fav-btn-id-${g.IDEESS}" onclick="toggleFav('${g.IDEESS}',event,'${iL}')" style="font-size:18px; line-height:1; margin-top:-2px; flex-shrink:0;">${hIc}</span>
                                </div>
                                
                                ${htmlEstrellas}
                                
                                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom: 2px;">
                                    <span style="background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-color); font-weight:bold; font-size:10px; padding:3px 6px; border-radius:6px; text-transform:uppercase;">${g.Municipio || ''}</span>
                                    <span class="distancia-badge" style="background:var(--bg-input); color:var(--text-muted); border:1px solid var(--border-color); font-weight:bold; font-size:10px; padding:3px 6px; border-radius:6px;">${msgDist}</span>
                                </div>
                                
                                <div style="font-size:11px; color:var(--text-muted); line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${g.Dirección}</div>
                                <div style="font-size:10px; color:var(--text-muted);">🕒 ${g.Horario || ''}</div>
                                
                                <div id="servicios-os-${g.IDEESS}" style="display:flex; flex-wrap:wrap; gap:3px; min-height:20px; margin-top:2px;"></div>

                                <div style="margin-top:auto; padding-top:6px; width:100%;">
                                    ${htmlAhorroList.replace('text-align:right', 'text-align:left')}
                                </div>
                            </div>
                            
                            <div style="display:flex; flex-direction:column; align-items:flex-end; width:135px; flex-shrink:0;">
                                <div style="text-align:right; width:100%;">
                                    ${htmlDescuento}
                                    <div class="price-text" style="color:${cS}; justify-content:flex-end; font-size:1.3em;">${pStrVisualList}<span class="tr-ind" data-type="list" data-id="${g.IDEESS}" style="margin-left:4px;">${tH}</span></div>
                                </div>
                                
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; width:100%; margin-top:auto; padding-top:10px;">
                                    
                                    <button onclick="mostrarHistorico('${sN}','${g.IDEESS}','${g.Horario || ''}')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:6px 2px; font-size:9px; font-weight:bold; border-radius:8px; width:100%; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; box-sizing:border-box;">
                                        <span style="font-size:14px; line-height:1;">📈</span><span>HISTÓRICO</span>
                                    </button>
                                    
                                    <button onclick="alert('🚧 ¡Próximamente! Estamos ultimando la sección de opiniones.')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:6px 2px; font-size:9px; font-weight:bold; border-radius:8px; width:100%; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; box-sizing:border-box;">
                                        <span style="font-size:14px; line-height:1;">⭐</span><span>OPINIONES</span>
                                    </button>
                                    
                                    <button onclick="abrirAnotar('${sN}', ${g.pN}, ${(globalMaxP - g.pN).toFixed(3)})" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:6px 2px; font-size:9px; font-weight:bold; border-radius:8px; width:100%; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; box-sizing:border-box;">
                                        <span style="font-size:14px; line-height:1;">📓</span><span>ANOTAR</span>
                                    </button>
                                    
                                    <button onclick="compartirNativo('${sN}', '${waM}')" style="background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); margin:0; padding:6px 2px; font-size:9px; font-weight:bold; border-radius:8px; width:100%; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; box-sizing:border-box;">
                                        <span style="font-size:14px; line-height:1;">📤</span><span>COMPARTIR</span>
                                    </button>

                                    <a href="${mU}" target="_blank" style="background:var(--accent); color:#fff; border:none; margin:0; padding:8px 2px; font-size:11px; font-weight:bold; border-radius:8px; width:100%; display:flex; align-items:center; justify-content:center; gap:6px; grid-column: span 2; text-decoration:none; box-shadow:0 2px 4px rgba(0,0,0,0.15); box-sizing:border-box;">
                                        <span style="font-size:14px; line-height:1;">🗺️</span><span>IR A MAPS</span>
                                    </a>
                                </div>
                        
                            </div>
                        </div>`;

                            // 2. EN LUGAR DE DIBUJARLA, LA METEMOS A LA CAJA INVISIBLE
                            fragmentoMagico.appendChild(item);

                        });
                        
                        // 3. PEGAMOS LA CAJA ENTERA EN LA PANTALLA (Solo 1 dibujado en lugar de 100)
                        lD.appendChild(fragmentoMagico);
                    }

                    // DISPARAR LA BÚSQUEDA SILENCIOSA DE SERVICIOS EN OSM
                    if (o === "inteligente" && window.planesUnicosGlobal.length > 0) {
                        cargarServiciosOSM(window.planesUnicosGlobal[window.selectedSmartPlanIndex].paradas);
                    } else if (o !== "inteligente") {
                        cargarServiciosOSM(filtradas);
                    }

                    if (window.calcularMediaNacional) window.calcularMediaNacional();
                }

                catch (errorFinal) {
                    console.error(errorFinal);
                } finally {
                    q("loading-overlay").style.display = "none";
                    isFetching = false;
                    q("list-container").classList.remove("bloqueado");
                    if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.remove("active");
                }
            }

            function getDistance(la1, lo1, la2, lo2) { const p = Math.PI / 180, a = 0.5 - Math.cos((la2 - la1) * p) / 2 + Math.cos(la1 * p) * Math.cos(la2 * p) * (1 - Math.cos((lo2 - lo1) * p)) / 2; return 12742 * Math.asin(Math.sqrt(a)); }

            function guardarPreferencias() {
                let valDesvio = q("desvioInput") ? q("desvioInput").value : "5";
                let valAutonomia = q("autonomiaInput") ? q("autonomiaInput").value : "";
                localStorage.setItem("gasofaPrefs", JSON.stringify({ m: q("marcaInput").value, l: q("litrosInput").value, cons: q("consumoInput").value, auto: valAutonomia, idV: q("idaVueltaInput").checked, c: q("tipoCombustible").value, r: q("radioBusqueda").value, o: q("ordenarPor").value, a: q("abiertasInput").checked, sMode: searchMode, desvio: valDesvio }));
            }

            function cargarPreferencias() {
                const s = localStorage.getItem("gasofaPrefs");
                if (s) {
                    try {
                        const p = JSON.parse(s);
                        q("marcaInput").value = p.m || "";
                        q("litrosInput").value = p.l || 50;
                        q("consumoInput").value = p.cons || "";
                        if (q("autonomiaInput")) q("autonomiaInput").value = p.auto || "";
                        q("idaVueltaInput").checked = p.idV !== undefined ? p.idV : true;
                        q("tipoCombustible").value = p.c || "Precio Gasoleo A";
                        q("radioBusqueda").value = p.r || "1";
                        q("ordenarPor").value = p.o || "precio";
                        q("abiertasInput").checked = p.a || false;
                        searchMode = p.sMode || 'zona';
                        if (q("desvioInput")) q("desvioInput").value = p.desvio || "5";
                    } catch (e) {
                        q("litrosInput").value = 50; q("radioBusqueda").value = "1"; searchMode = 'zona';
                    }
                } else {
                    q("litrosInput").value = 50; q("radioBusqueda").value = "1"; searchMode = 'zona';
                }
            }

            // --- INSTALACIÓN ---
            let eventoInstalacion;
            const btnInstalar = document.getElementById('btnInstalar');
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const esInApp = (ua.indexOf('Instagram') > -1) || (ua.indexOf('TikTok') > -1) || (ua.indexOf('BytedanceWebview') > -1) || (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1) || (ua.indexOf('Twitter') > -1);

            const esIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

            if (esInApp || esIOS) { btnInstalar.style.display = 'block'; }

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault(); eventoInstalacion = e; btnInstalar.style.display = 'block';
            });

            btnInstalar.addEventListener('click', async () => {
                if (typeof gtag === 'function') gtag('event', 'clic_instalar_app');
                if (esInApp) { alert("🔒 Estás en el navegador de una red social.\n\nPara instalar la app, toca los 3 puntitos (arriba a la derecha) y selecciona 'Abrir en Chrome/Safari'."); return; }
                if (esIOS) { alert("🍎 Para instalar en iPhone:\n\n1. Toca el botón 'Compartir'.\n2. Selecciona 'Añadir a la pantalla de inicio'."); return; }
                if (eventoInstalacion) { eventoInstalacion.prompt(); const { outcome } = await eventoInstalacion.userChoice; if (outcome === 'accepted') { btnInstalar.style.display = 'none'; } eventoInstalacion = null; }
            });

                         window.currentCarCapacity = 0;

  

// Función para descargar la factura/imagen que se está viendo en el modal
window.descargarFacturaActual = function(e) {
    if (e) e.stopPropagation(); // Importante: evita que tocar el botón cierre el visor
    
    const imgSrc = document.getElementById('camaraModalImg').src;
    if (!imgSrc || imgSrc === "") return;
    
    // Generamos un nombre automático limpio basado en el título del modal
    let tituloRaw = document.getElementById('camaraModalTitle').innerText;
    let tituloLimpio = tituloRaw.replace('🎥 ', '').replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    let nombreArchivo = "Factura_" + tituloLimpio + ".jpg";
    
    // Forzamos la descarga creando un enlace temporal invisible
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (typeof mostrarToast === 'function') mostrarToast("⬇️ Descarga iniciada");
};

window.toggleFiltrosAvanzados = function(forzarAbierto = null) {
    const bloque = document.getElementById('bloqueFiltrosAvanzados');
    const flecha = document.getElementById('flechaAvanzados');
    if (!bloque || !flecha) return;

    let abrir = forzarAbierto !== null ? forzarAbierto : bloque.style.display === 'none';

    if (abrir) {
        bloque.style.display = 'flex';
        flecha.innerText = '▲';
    } else {
        bloque.style.display = 'none';
        flecha.innerText = '🔽';
    }
    
    // Le indicamos al mapa que refresque su área visible fluidamente
    let stretchInterval = setInterval(() => { if (map) map.invalidateSize(); }, 50);
    setTimeout(() => clearInterval(stretchInterval), 300);
};



 

 
          
            // Generador dinámico de rutas múltiples para Google Maps
            window.exportarRutaGoogleMaps = function() {
                if (!originMarker || !destMarker || !window.planesUnicosGlobal || !window.planesUnicosGlobal[window.selectedSmartPlanIndex]) {
                    alert("⚠️ No hay ninguna ruta activa o plan inteligente seleccionado.");
                    return;
                }

                // Extraemos las coordenadas directamente de tus marcadores del mapa
                let latOrig = originMarker.getLatLng().lat;
                let lonOrig = originMarker.getLatLng().lng;
                let latDest = destMarker.getLatLng().lat;
                let lonDest = destMarker.getLatLng().lng;

                let url = `https://www.google.com/maps/dir/?api=1&origin=${latOrig},${lonOrig}&destination=${latDest},${lonDest}&travelmode=driving`;

                let plan = window.planesUnicosGlobal[window.selectedSmartPlanIndex];
                if (plan.paradas && plan.paradas.length > 0) {
                    // Ordenamos cronológicamente las gasolineras por los kilómetros de travesía del viaje
                    let paradasOrdenadas = plan.paradas.slice().sort((a, b) => a.kmTravesia - b.kmTravesia);
                    
                    let wpString = paradasOrdenadas.map(p => {
                        // Saneamos tus comas de la API de industria por puntos flotantes de Google
                        let latWp = parseFloat(p.Latitud.replace(",", "."));
                        let lonWp = parseFloat(p["Longitud (WGS84)"].replace(",", "."));
                        return `${latWp},${lonWp}`;
                    }).join('%7C'); // %7C es el símbolo de separación | que exige Google Maps
                    
                    url += `&waypoints=${wpString}`;
                }

                // Abre la app de Maps en teléfonos o pestaña nueva en PC
                window.open(url, '_blank');
            };

            // Validador dinámico para desbloquear el Plan Inteligente (Garaje o Manual) con lectura de Tanque
            window.comprobarRequisitosInteligentes = function() {
                const selectCar = q("activeCarSelect") && q("activeCarSelect").value !== "";
                const consumoManual = q("consumoInput") && q("consumoInput").value !== "";
                const autonomiaManual = q("autonomiaInput") && q("autonomiaInput").value !== "";
                const depManualInput = q("depositoManualInput");
                const optInteligente = q("ordenarPor") ? q("ordenarPor").querySelector('option[value="inteligente"]') : null;

                if (!optInteligente) return;

                if (selectCar) {
                    // Si hay coche seleccionado, el depósito manual no hace falta. Lo ocultamos.
                    if (depManualInput) depManualInput.style.display = 'none';
                    
                    optInteligente.disabled = false;
                    optInteligente.innerText = "🧠 Solo Plan Inteligente";
                } else {
                    // Si NO hay coche, mostramos la caja del depósito para que puedan rellenarlo a mano
                    if (depManualInput) depManualInput.style.display = 'block';
                    
                    const depositoManual = depManualInput && depManualInput.value !== "";

                    // REGLA MANUAL: Exige Consumo + Autonomía + Depósito para calcular con precisión
                    if (consumoManual && autonomiaManual && depositoManual) {
                        // Sincronizamos el valor tecleado a mano directamente con la variable que exige el algoritmo
                        window.currentCarCapacity = parseFloat(depManualInput.value) || 0;
                        
                        optInteligente.disabled = false;
                        optInteligente.innerText = "🧠 Solo Plan Inteligente";
                    } else {
                        optInteligente.disabled = true;
                        optInteligente.innerText = "🧠 Plan Inteligente (Faltan Datos)";
                        
                        window.currentCarCapacity = 0; // Reseteamos si faltan datos
                        
                        if (q("ordenarPor").value === "inteligente") {
                            q("ordenarPor").value = "precio";
                            if (typeof window.fetchGasolineras === 'function') window.fetchGasolineras();
                        }
                    }
                }
            };

           // ==========================================================
// 🌉 PUENTE HTML-JS LIMPIO Y SEGURO
// ==========================================================
window.q = q; 
window.openDiscounts = openDiscounts;
window.saveDescCard = saveDescCard;
window.editDescCard = editDescCard;
window.deleteDescCard = deleteDescCard;
window.toggleControls = toggleControls;
window.setMode = setMode;
window.buscarPorCP = buscarPorCP;
window.calcularRuta = calcularRuta;
window.irAMiUbicacion = irAMiUbicacion;
window.toggleTheme = toggleTheme;
window.cerrarGrafico = cerrarGrafico;
window.descargarFacturaActual = descargarFacturaActual;
window.toggleFiltrosAvanzados = toggleFiltrosAvanzados;
window.exportarRutaGoogleMaps = exportarRutaGoogleMaps;
window.mostrarHistorico = mostrarHistorico;
window.fetchGasolineras = fetchGasolineras; 
window.toggleFav = toggleFav; 
window.updateChartRange = updateChartRange;
window.comprobarRequisitosInteligentes = comprobarRequisitosInteligentes;

// Escuchadores de interfaz y Despertador de Módulos
document.addEventListener("DOMContentLoaded", () => {
    if (q("consumoInput")) q("consumoInput").addEventListener("input", window.comprobarRequisitosInteligentes);
    if (q("autonomiaInput")) q("autonomiaInput").addEventListener("input", window.comprobarRequisitosInteligentes);
    if (q("depositoManualInput")) q("depositoManualInput").addEventListener("input", window.comprobarRequisitosInteligentes);
    
    // Refrescamos todo si cambiamos de coche manualmente
    if (q("activeCarSelect")) {
        q("activeCarSelect").addEventListener("change", () => {
            window.comprobarRequisitosInteligentes();
            if (typeof window.applyCarSettings === 'function') window.applyCarSettings();
            window.fetchGasolineras();
        });
    }
    
    // ¡EL TOQUE MÁGICO! Despertamos los módulos visuales al cargar la página
    setTimeout(() => {
        if (typeof window.updateCarSelect === 'function') window.updateCarSelect();
        if (typeof window.applyCarSettings === 'function') window.applyCarSettings();
        if (typeof window.actualizarUIResumenParking === 'function') window.actualizarUIResumenParking();
    }, 100);
});

// =========================================================
// 🔄 DESPERTADOR: RECARGA AUTOMÁTICA AL VOLVER A LA APP
// =========================================================
let ultimaVezActualizado = Date.now();
const TIEMPO_CADUCIDAD = 30 * 60 * 1000; // 30 minutos (en milisegundos)

document.addEventListener("visibilitychange", () => {
    // Si la aplicación vuelve a estar visible en pantalla
    if (document.visibilityState === "visible") {
        const ahora = Date.now();
        
        // Comprobamos si ha pasado el tiempo límite desde la última recarga (30 min)
        if (ahora - ultimaVezActualizado > TIEMPO_CADUCIDAD) {
            
            // Avisamos al usuario
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast("🔄 Actualizando precios tras inactividad...", "info");
            }
            
            // Forzamos la recarga de gasolineras
            if (typeof window.fetchGasolineras === 'function') {
                window.fetchGasolineras();
            }
            
            // Reiniciamos el reloj
            ultimaVezActualizado = ahora; 
        }
    }
});

         