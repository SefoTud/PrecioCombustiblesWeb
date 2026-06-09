import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";



  const firebaseConfig = {
    apiKey: "AIzaSyBRugyDzIlYo7kPW0url-rVBEhk1_EhVcs",
    authDomain: "precio-combustibles-b2160.firebaseapp.com",
    projectId: "precio-combustibles-b2160",
    storageBucket: "precio-combustibles-b2160.firebasestorage.app",
    messagingSenderId: "14102207330",
    appId: "1:14102207330:web:a55197dbc9f4f38cc2aa3b"
  };

  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
  window.deleteDoc = deleteDoc;
  window.onSnapshot = onSnapshot;
  window.googleProvider = new GoogleAuthProvider();
  window.signInWithPopup = signInWithPopup;
  window.signOut = signOut;
  window.doc = doc;
  window.setDoc = setDoc;
  window.getDoc = getDoc;
  
  // FUNCIONES DE CORREO
  window.signInWithEmailAndPassword = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.sendPasswordResetEmail = sendPasswordResetEmail;

  window.entrarConCorreo = async function() {
  if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Correo' });

      const email = document.getElementById('emailLogin').value.trim();
      const pass = document.getElementById('passLogin').value;
      if(!email || !pass) { alert("⚠️ Escribe tu correo y contraseña."); return; }
      try {
          const loading = document.getElementById('loading-overlay');
          if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Iniciando sesión..."; }
          await window.signInWithEmailAndPassword(window.auth, email, pass);
          if(loading) loading.style.display = "none";
          alert("✅ ¡Bienvenido de nuevo!");
      } catch(error) {
          if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
          alert("❌ Error: " + error.code);
      }
  };

  window.registrarConCorreo = async function() {
  if (typeof gtag === 'function') gtag('event', 'sign_up', { 'metodo': 'Correo' });

      const email = document.getElementById('emailLogin').value.trim();
      const pass = document.getElementById('passLogin').value;
      if(!email || pass.length < 6) { alert("⚠️ Pon un correo válido y una contraseña de al menos 6 caracteres."); return; }
      try {
          const loading = document.getElementById('loading-overlay');
          if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Creando cuenta..."; }
          await window.createUserWithEmailAndPassword(window.auth, email, pass);
          if(loading) loading.style.display = "none";
          alert("✅ ¡Cuenta creada con éxito!");
      } catch(error) {
          if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
          alert("❌ Error: " + error.code);
      }
  };

  window.recuperarContrasena = async function() {
      const email = document.getElementById('emailLogin').value.trim();
      if(!email) { alert("⚠️ Escribe tu correo electrónico arriba primero."); return; }
      try {
          await window.sendPasswordResetEmail(window.auth, email);
          alert("✉️ Correo enviado. Revisa tu bandeja.");
      } catch(error) {
          console.error("Error Firebase:", error);
          alert("❌ Error: " + error.message);
      }
  };

  onAuthStateChanged(window.auth, (user) => {
      const vistaNoLogueado = document.getElementById('vistaNoLogueado');
      const vistaLogueado = document.getElementById('vistaLogueado');
      if (user) {
          if(vistaNoLogueado) vistaNoLogueado.style.display = 'none';
          if(vistaLogueado) vistaLogueado.style.display = 'flex';
          if(document.getElementById('mapAhorroBadge')) document.getElementById('mapAhorroBadge').style.display = 'flex';
          document.getElementById('nombreUsuario').innerText = user.displayName || "Conductor";
          document.getElementById('emailUsuario').innerText = user.email;
          document.getElementById('fotoUsuario').src = user.photoURL || "https://via.placeholder.com/50?text=👤";
          localStorage.setItem('gasofa_uid', user.uid);

                  // DESCARGA AUTOMÁTICA Y SINCRONIZACIÓN GLOBAL
          window.getDoc(window.doc(window.db, "usuarios", user.uid)).then(docSnap => {
              if (docSnap.exists()) {
                  let data = docSnap.data();
                  
                  if (data.misCoches) {
                      let cochesNube = data.misCoches; let fusionados = [...myCars];
                      cochesNube.forEach(cNube => { if (!fusionados.find(cLocal => String(cLocal.id) === String(cNube.id))) fusionados.push(cNube); });
                      myCars = fusionados;
                  }
                  if (data.misDescuentos) {
                      let descNube = data.misDescuentos; let descFusionados = [...descuentosGuardados];
                      descNube.forEach(dNube => { if (!descFusionados.find(dLocal => dLocal.marca === dNube.marca)) descFusionados.push(dNube); });
                      descuentosGuardados = descFusionados;
                  }
                  if (data.miBitacora) {
                      let bitNube = data.miBitacora; let bitFusionados = [...bitacora];
                      bitNube.forEach(bNube => { if (!bitFusionados.find(bLocal => String(bLocal.id) === String(bNube.id))) bitFusionados.push(bNube); });
                      bitacora = bitFusionados; bitacora.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
                  }
                  // MEZCLAR TALLER
                  let tallerLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                  if (data.miTaller) {
                      let tallerNube = data.miTaller; let tallerFusionados = [...tallerLocal];
                      tallerNube.forEach(tNube => { if (!tallerFusionados.find(tL => String(tL.id) === String(tNube.id))) tallerFusionados.push(tNube); });
                      tallerLocal = tallerFusionados; tallerLocal.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
                  }
                  localStorage.setItem('gasofa_taller', JSON.stringify(tallerLocal));
              }

              localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
              localStorage.setItem('gasofaDesc', JSON.stringify(descuentosGuardados));
              localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));

              if (typeof renderCars === 'function') renderCars();
              if (typeof updateCarSelect === 'function') updateCarSelect();
              if (typeof renderDiscounts === 'function') renderDiscounts();
              if (typeof actualizarAhorroGlobal === 'function') actualizarAhorroGlobal();
              if (typeof actualizarListaHistorial === 'function') actualizarListaHistorial();
              if (typeof renderTaller === 'function') renderTaller();

              // SUBIDA AUTOMÁTICA
              let tallerAct = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
              window.setDoc(window.doc(window.db, "usuarios", user.uid), {
                  misCoches: myCars,
                  misDescuentos: descuentosGuardados,
                  miBitacora: bitacora,
                  miTaller: tallerAct
              }, { merge: true });

                        // ==========================================================
              // 📡 RADAR EN TIEMPO REAL (Sincronización Total)
              // ==========================================================
              if (typeof window.iniciarRadaresCompartidos === 'function') {
                  window.iniciarRadaresCompartidos();
              }
   
          });

      } else {
          if(vistaNoLogueado) vistaNoLogueado.style.display = 'block';
          if(vistaLogueado) vistaLogueado.style.display = 'none';
          if(document.getElementById('mapAhorroBadge')) document.getElementById('mapAhorroBadge').style.display = 'none';
      }
  });

            const D = document, q = i => D.getElementById(i);


            const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyeIN2o-dHcyXw-ZAhUKboaotrOJcv-VM7ABYxzEkUsU4q19pKLrEFj64PanMyYSt_-/exec";
            const APP_URL = window.location.href;

            let map = L.map("map", { zoomControl: false, maxZoom: 19, closePopupOnClick: false, attributionControl: false }).setView([40.41, -3.70], 6);

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

                    if (optInteligente) { optInteligente.disabled = false; optInteligente.innerText = "🧠 Solo Plan Inteligente"; }
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

                        function irAMiUbicacion(mostrarCargando) {
                window.isManuallyLocated = false;

                const cn = q("cityName");
                const cnRuta = q("cityNameRuta");

                if (mostrarCargando) {
                    if (cn) { cn.style.display = "inline-block"; cn.innerText = "📍 Buscando GPS..."; }
                    if (cnRuta) { cnRuta.style.display = "inline-block"; cnRuta.innerText = "📍 Buscando GPS..."; }
                    // Nos aseguramos de mostrar el esqueleto mientras busca
                    mostrarSkeleton();
                }

                // Definimos la función de error centralizada
                const manejarErrorGPS = () => {
                    if (cn) cn.style.display = "none";
                    if (cnRuta) cnRuta.style.display = "none";
                    if (mostrarCargando) q("loading-overlay").style.display = "none";
                    
                    // Quitamos el estado de carga
                    isFetching = false;
                    const listContainer = q("list-container");
                    if (listContainer) listContainer.classList.remove("bloqueado");
                    if (q("map-skeleton-overlay")) q("map-skeleton-overlay").classList.remove("active");

                    // Si la lista tiene el esqueleto, lo cambiamos por un mensaje amigable
                    const lD = q("gas-list");
                    if (lD && lD.innerHTML.includes("sk-card")) {
                        lD.innerHTML = "<div style='text-align:center;padding:30px 20px;color:var(--text-muted);'><span style='font-size:40px;display:block;margin-bottom:10px;'>📍</span><b>No detectamos tu ubicación.</b><br>Escribe tu ciudad o código postal en el buscador de arriba.</div>";
                    }
                };

                // Seguro de vida: Si en 6 segundos no hay respuesta del GPS, forzamos el error
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
                    clearTimeout(timeoutGPS); // Cancelamos el seguro de vida porque ha habido éxito
                    
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
                                q("cpInput").value = "";

                                if (q("origenInput").value === "" || q("origenInput").value === "Mi Ubicación") {
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
                    clearTimeout(timeoutGPS); // Cancelamos el seguro de vida
                    console.warn("Error de geolocalización:", error.message);
                    manejarErrorGPS();
                }, { enableHighAccuracy: true, timeout: 5000 }); // timeout nativo añadido aquí también
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
                    <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0; ${margin}">
                        <img src="${finalUrl}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:${size}px; height:${size}px; object-fit:contain; border-radius:4px; background:white; padding:2px; box-shadow:0 1px 3px rgba(0,0,0,0.15);">
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
                            <span class="distancia-badge" style="font-size:10px; padding:3px 6px;">${msgDist}</span>
                            <span>🕒 ${g.Horario ? g.Horario.split(';')[0].substring(0, 16) + (g.Horario.length > 16 ? '...' : '') : 'N/D'}</span>
                        </div>

                        <div class="osm-pop-placeholder" data-id="${g.IDEESS}" style="display:flex; flex-wrap:wrap; justify-content:center; gap:3px; margin-bottom:10px;">
                            ${osmCacheHtml}
                        </div>

                        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px; margin-top:4px;">
                            <button class="btn-action btn-historial" onclick="mostrarHistorico('${sN}','${g.IDEESS}','${g.Horario || ''}')" style="margin:0; padding:0 6px; height:34px; box-sizing:border-box;">📈 HISTÓRICO</button>
                            <button class="btn-action" style="background:#f1c40f; color:#000 !important; margin:0; padding:0 6px; height:34px; box-sizing:border-box;" onclick="alert('🚧 ¡Próximamente! Estamos ultimando la sección de opiniones.')"><span style="font-size:14px; margin-right:4px;">★</span> OPINIONES</button>

                            <button class="btn-action" style="background:#f39c12; margin:0; padding:0 6px; height:34px; box-sizing:border-box;" onclick="abrirAnotar('${sN}', ${g.pN}, ${(globalMaxP - g.pN).toFixed(3)})">📓 ANOTAR</button>
                                                       <button class="btn-action" style="background:#27ae60; border:none; margin:0; padding:0 6px; height:34px; box-sizing:border-box;" onclick="compartirNativo('${sN}', '${waM}')"><span style="font-size:14px; margin-right:4px;">📤</span> COMPARTIR</button>

                            <a class="btn-action btn-directo" href="${mU}" target="_blank" style="flex:1; margin:0; padding:0 6px; height:34px; box-sizing:border-box;">IR ↗</a>
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
                        let ahorroMaximo = window.planesUnicosGlobal[0].ahorroTotal.toFixed(2);
                        let paradasMaximo = window.planesUnicosGlobal[0].paradas.length === 1 ? "1 parada" : window.planesUnicosGlobal[0].paradas.length + " paradas";

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
                            <select id="selectorPlanInteligente" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); font-weight:bold; color:var(--text-main); background:var(--bg-input); cursor:pointer; font-size:13px;" onchange="window.selectedSmartPlanIndex=parseInt(this.value); fetchGasolineras();">`;

                            window.planesUnicosGlobal.forEach((p, i) => {
                                let textoParadas = p.paradas.length === 1 ? "1 parada" : p.paradas.length + " paradas";
                                let isSel = i === window.selectedSmartPlanIndex ? 'selected' : '';
                                planViajeHtml += `<option value="${i}" ${isSel}>OPCIÓN ${i + 1} (+${p.ahorroTotal.toFixed(2)}€ en ${textoParadas})</option>`;
                            });
                            planViajeHtml += `</select></div>`;
                        }

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
                                <span style="background:var(--accent); color:#fff; font-weight:900; font-size:10px; padding:3px 8px; border-radius:6px; text-transform:uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    ${mejor.Municipio || ''}
                                </span>
                                <span style="font-size:12px; color:var(--text-muted); font-weight:500;">📍 ${mejor.Dirección}</span>
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

                                       
                                            const bSL = isR ? '<span style="background:#c0392b;color:#fff;font-size:9px;padding:2px 4px;border-radius:3px;vertical-align:middle;margin-left:5px;">🔒 SOCIOS</span>' : '';
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
                                
                                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
     
                                    <span style="background:var(--accent); color:#fff; font-weight:900; font-size:10px; padding:2px 6px; border-radius:6px; text-transform:uppercase;">${g.Municipio || ''}</span>
                                    <span class="distancia-badge" style="font-size:10px; padding:2px 6px;">${msgDist}</span>
                                </div>
                                
                                <div style="font-size:11px; color:var(--text-muted); line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">📍 ${g.Dirección}</div>
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
                                
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; width:100%; margin-top:auto; padding-top:8px;">
                                    
                                    <button class="btn-action btn-historial" onclick="mostrarHistorico('${sN}','${g.IDEESS}','${g.Horario || ''}')" style="margin:0; padding:6px 2px; font-size:8px; border-radius:6px; width:100%; box-sizing:border-box; flex-direction:column; gap:2px;">
                                        <span style="font-size:13px; line-height:1;">📈</span><span>HISTÓRICO</span>
                                    </button>
                                    
                                    <button class="btn-action" style="background:#f1c40f; color:#000 !important; margin:0; padding:6px 2px; font-size:8px; border-radius:6px; width:100%; box-sizing:border-box; flex-direction:column; gap:2px;" onclick="alert('🚧 ¡Próximamente! Estamos ultimando la sección de opiniones.')">
                                        <span style="font-size:15px; line-height:1;">★</span><span>OPINIONES</span>
                                    </button>
                                             
                 
                                    
                                    <button class="btn-action" style="background:#f39c12; margin:0; padding:6px 2px; font-size:8px; border-radius:6px; width:100%; box-sizing:border-box; flex-direction:column; gap:2px;"                             onclick="abrirAnotar('${sN}', ${g.pN}, ${(globalMaxP - g.pN).toFixed(3)})"
  >
                                        <span style="font-size:13px; line-height:1;">📓</span><span>ANOTAR</span>
                                    </button>
                                    
                                                            <button class="btn-action" style="background:#27ae60; border:none; margin:0; padding:6px 2px; font-size:8px; border-radius:6px; width:100%; box-sizing:border-box; flex-direction:column; gap:2px;" onclick="compartirNativo('${sN}', '${waM}')">
                                        <span style="font-size:15px; line-height:1;">📤</span><span>COMPARTIR</span>
                                    </button>

                                    <a class="btn-action btn-directo" href="${mU}" target="_blank" style="margin:0; padding:6px 2px; font-size:9px; border-radius:6px; width:100%; box-sizing:border-box; flex-direction:column; gap:2px; grid-column: span 2;">
                                        <span style="font-size:14px; line-height:1;">↗️</span><span>IR A MAPS</span>
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

                        // --- GARAJE Y PARKING SEPARADOS ---
            let myCars = [];
try { myCars = JSON.parse(localStorage.getItem('gasofa_cars')) || []; } catch (e) { myCars = []; }
            window.currentCarCapacity = 0;

            function openGarage() { // ESTE AHORA SOLO ABRE EL PARKING LOCALIZADOR
                document.getElementById('garageModal').style.display = 'flex';
                actualizarUIResumenParking();
            }

            function closeGarage() {
                document.getElementById('garageModal').style.display = 'none';
            }

            // --- GESTIÓN EXCLUSIVA DE VEHÍCULOS ---
            function abrirMisVehiculos() {
                // Si venimos de un botón externo, ocultamos menús
                if (!document.getElementById("controls").classList.contains("collapsed")) toggleControls();
                document.getElementById('misVehiculosModal').style.display = 'flex';
                
                // Limpiamos los cajones por si acaso
                document.getElementById('editCarId').value = '';
                document.getElementById('carName').value = '';
                document.getElementById('carConsumo').value = '';
                document.getElementById('carDeposito').value = '';
                document.getElementById('carITV').value = '';
                document.getElementById('carSeguro').value = '';
                document.getElementById('carAceite').value = '';
                
                renderCars();
                
                const btnNoti = document.getElementById('btnNotificaciones');
                if (btnNoti && "Notification" in window && Notification.permission === "default") {
                    btnNoti.style.display = 'block';
                } else if (btnNoti) {
                    btnNoti.style.display = 'none';
                }
            }

            function cerrarMisVehiculos() {
                document.getElementById('misVehiculosModal').style.display = 'none';
                abrirPerfil(); // Vuelve al perfil directamente
            }

            function saveCar() {
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
                    const index = myCars.findIndex(c => c.id == idToEdit);
                    if (index > -1) { myCars[index] = { id: parseInt(idToEdit), name, fuel, consumo, deposito, itv, seguro, aceite }; }
                } else {
                    myCars.push({ id: Date.now(), name, fuel, consumo, deposito, itv, seguro, aceite });
                }

                localStorage.setItem('gasofa_cars', JSON.stringify(myCars));

                if (window.auth && window.auth.currentUser) {
                    const uid = window.auth.currentUser.uid;
                    window.setDoc(window.doc(window.db, "usuarios", uid), {
                        misCoches: myCars
                    }, { merge: true }).catch(e => console.error("Error nube:", e));
                }

                // Limpiamos los cajones y repintamos SIN cerrar la ventana
                document.getElementById('editCarId').value = '';
                document.getElementById('carName').value = '';
                document.getElementById('carConsumo').value = '';
                document.getElementById('carDeposito').value = '';
                document.getElementById('carITV').value = '';
                document.getElementById('carSeguro').value = '';
                document.getElementById('carAceite').value = '';
                
                renderCars();
                updateCarSelect();
            }

            function editCar(id) {
                const car = myCars.find(c => String(c.id) === String(id));
                if (car) {
                    document.getElementById('editCarId').value = car.id;
                    document.getElementById('carName').value = car.name || '';
                    document.getElementById('carFuel').value = car.fuel || 'Precio Gasoleo A';
                    document.getElementById('carConsumo').value = car.consumo || '';
                    document.getElementById('carDeposito').value = car.deposito || '';
                    document.getElementById('carITV').value = car.itv || '';
                    document.getElementById('carSeguro').value = car.seguro || '';
                    document.getElementById('carAceite').value = car.aceite || '';

                    // Hacemos scroll hacia arriba en el formulario
                    document.getElementById('misVehiculosModal').querySelector('.modal-content').scrollTop = 0;
                }
            }

            function deleteCar(id) {
                if (confirm("¿Borrar vehículo?")) {
                    myCars = myCars.filter(car => String(car.id) !== String(id));
                    localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
                    
                    if (window.auth && window.auth.currentUser) {
                        const uid = window.auth.currentUser.uid;
                        window.setDoc(window.doc(window.db, "usuarios", uid), {
                            misCoches: myCars
                        }, { merge: true });
                    }
                    renderCars();
                    updateCarSelect();
                }
            }


                                   function renderCars() {
    const list = document.getElementById('carList');
    
    // 1. Creamos una caja temporal invisible donde iremos metiendo el HTML
    let htmlAcumulado = '';
    
    let ahorrosG = typeof actualizarAhorroGlobal === 'function' ? actualizarAhorroGlobal() : {};

    myCars.forEach(car => {
        let alertasHTML = '';
        const hoy = new Date();

        if (car.itv) {
            let fItv = new Date(car.itv);
            let dias = (fItv - hoy) / (1000 * 60 * 60 * 24);
            let color = dias < 0 ? '#e74c3c' : (dias <= 30 ? '#f39c12' : 'var(--text-muted)');
            let icono = dias < 0 ? '❌' : (dias <= 30 ? '⚠️' : '✅');
            let mes = fItv.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            alertasHTML += `<span class="badge-base badge-alerta" style="color:${color};">${icono} ITV: ${mes}</span> `;
        }

        if (car.seguro) {
            let fSeg = new Date(car.seguro);
            let dias = (fSeg - hoy) / (1000 * 60 * 60 * 24);
            let color = dias < 0 ? '#e74c3c' : (dias <= 30 ? '#f39c12' : 'var(--text-muted)');
            let icono = dias < 0 ? '❌' : (dias <= 30 ? '⚠️' : '🛡️');
            let mes = fSeg.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            alertasHTML += `<span class="badge-base badge-alerta" style="color:${color};">${icono} Seguro: ${mes}</span> `;
        }

        if (car.aceite) {
            alertasHTML += `<span class="badge-base badge-alerta" style="color:var(--text-muted);">🛢️ Aceite: ${car.aceite} km</span> `;
        }

        let ahorroEsteCoche = ahorrosG[car.id] ? ahorrosG[car.id].toFixed(2) : "0.00";
        alertasHTML += `<span class="badge-base badge-ahorro-sm">​💰 Ahorro: +${ahorroEsteCoche}€</span>`;

        let alertasBloque = alertasHTML ? `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">${alertasHTML}</div>` : '';

        // 2. Escudo de seguridad por si alguien comparte un coche con código malicioso en el nombre
        let nombreSeguro = window.escaparHTML ? window.escaparHTML(car.name) : car.name;

        // 3. Sumamos la tarjeta a nuestra caja temporal en lugar de inyectarla al DOM directamente
        htmlAcumulado += `
        <div class="card-garaje">
            <div style="flex:1;">
                <span class="txt-coche-titulo">${nombreSeguro}</span><br>
                <span class="txt-coche-detalle">⛽ ${car.consumo} L/100km | 🛢️ Max: ${car.deposito} L</span>
                ${alertasBloque}
            </div>
            <div class="btn-group">
                <button class="btn-edit" style="background:#2d88ff;" onclick="generarCodigoCompartir(${car.id})" title="Compartir Coche">🔗</button>
                <button class="btn-edit" onclick="editCar(${car.id})" title="Editar">✏️</button>
                <button class="btn-delete" onclick="deleteCar(${car.id})" title="Borrar">🗑️</button>
            </div>
        </div>`;
    });

    // 4. Inyectamos todo de golpe en la pantalla UNA sola vez
    list.innerHTML = htmlAcumulado;
}



            function verificarAlertasGaraje() {
                let iconosAlerta = "";
                const hoy = new Date();

                // Recorremos todos los coches y vamos sumando los iconos
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
                        // Si hay símbolos, los mostramos todos seguidos
                        badge.innerHTML = iconosAlerta + ' GARAJE';
                        badge.style.display = 'inline-block';
                    } else {
                        // Si no hay ninguno, ocultamos el cartel
                        badge.style.display = 'none';
                    }
                }
            }

            function updateCarSelect() {
                verificarAlertasGaraje(); // Comprobamos las alertas siempre que se actualice la lista

                const select = document.getElementById('activeCarSelect'); if (!select) return;
                if (myCars.length === 0 || searchMode === 'provincia') { select.style.display = 'none'; return; }

                select.style.display = 'block';
                let html = '<option value="">🚘 Selecciona tu vehículo...</option>';
                myCars.forEach(car => { html += `<option value="${car.id}">${car.name} (${car.consumo}L/100)</option>`; });
                select.innerHTML = html;
            }


            function applyCarSettings() {
                const select = document.getElementById('activeCarSelect'); const carId = select.value;
                const btnFill = document.getElementById('btnFill'); const litrosInput = document.getElementById('litrosInput'); const consumoInput = document.getElementById('consumoInput'); let selectorCombustible = document.getElementById('tipoCombustible');

                if (!carId) {
                    window.currentCarCapacity = 0; if (btnFill) btnFill.style.display = 'none'; if (consumoInput) consumoInput.value = ''; if (litrosInput) { litrosInput.value = ''; litrosInput.dispatchEvent(new Event('input')); } if (selectorCombustible) selectorCombustible.value = 'Precio Gasoleo A';
                    actualizarInterfazLitros(); select.style.borderColor = 'var(--accent)'; return;
                }

                const car = myCars.find(c => c.id == carId);
                if (car) {
                    if (consumoInput) consumoInput.value = car.consumo; if (selectorCombustible) selectorCombustible.value = car.fuel;
                    window.currentCarCapacity = car.deposito; if (btnFill) btnFill.style.display = 'block';
                    if (litrosInput) { litrosInput.value = ''; litrosInput.dispatchEvent(new Event('input')); }
                    actualizarInterfazLitros();
                    select.style.borderColor = 'var(--accent-green)'; setTimeout(() => select.style.borderColor = 'var(--accent)', 1000);
                }
            }

            function llenarATope() { if (window.currentCarCapacity > 0) { const litrosInput = document.getElementById('litrosInput'); if (litrosInput) { litrosInput.value = window.currentCarCapacity; litrosInput.dispatchEvent(new Event('input')); } } }

            document.addEventListener('DOMContentLoaded', () => {
                updateCarSelect();
                const litrosInput = document.getElementById('litrosInput');
                if (litrosInput) { litrosInput.addEventListener('input', function () { if (window.currentCarCapacity > 0 && parseFloat(this.value) > window.currentCarCapacity) { this.value = window.currentCarCapacity; } }); }
            });

            // --- MOTOR DE SERVICIOS OPENSTREETMAP (OVERPASS API) ---
            window.osmCache = window.osmCache || {}; // Memoria global para guardar los servicios

            async function cargarServiciosOSM(estacionesParaPintar) {
                if (!estacionesParaPintar || estacionesParaPintar.length === 0) return;

                // AMPLIADO: Buscamos las 100 primeras gasolineras para que cargue toda la lista
                let estaciones = estacionesParaPintar.slice(0, 100);

                estaciones.forEach(g => {
                    if (!window.osmCache[g.IDEESS]) {
                        let div = document.getElementById('servicios-os-' + g.IDEESS);
                        if (div) div.innerHTML = '<span style="font-size:11px; color:#3498db; font-weight:bold;">🔄 Buscando servicios...</span>';
                    }
                });

                let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
                estaciones.forEach(g => {
                    let lat = parseFloat(g.Latitud.replace(",", "."));
                    let lon = parseFloat(g["Longitud (WGS84)"].replace(",", "."));
                    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
                    if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
                });

                minLat -= 0.005; maxLat += 0.005; minLon -= 0.005; maxLon += 0.005;

                const query = `[out:json][timeout:10];nwr["amenity"="fuel"](${minLat},${minLon},${maxLat},${maxLon});out center;`;
                const url = "https://overpass-api.de/api/interpreter";

                try {
                    const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: "data=" + encodeURIComponent(query)
                    });

                    if (!res.ok) throw new Error("Fallo en el servidor de OSM");
                    const data = await res.json();

                    // AQUÍ ESTÁ LA MAGIA DEL DISEÑO: Las "Píldoras" grises
                    const badgeStyle = "background:var(--bg-body); border:1px solid var(--border-color); padding:3px 8px; border-radius:8px; font-size:11px; font-weight:700; color:var(--text-main); display:inline-flex; align-items:center; gap:4px;";

                    estaciones.forEach(g => {
                        let lat = parseFloat(g.Latitud.replace(",", "."));
                        let lon = parseFloat(g["Longitud (WGS84)"].replace(",", "."));

                        let match = data.elements.find(el => {
                            let elLat = el.lat || (el.center && el.center.lat);
                            let elLon = el.lon || (el.center && el.center.lon);
                            return elLat && getDistance(lat, lon, elLat, elLon) < 0.15;
                        });

                        let html = '';
                        if (match && match.tags) {
                            let t = match.tags;
                            if (t.shop) html += `<span style="${badgeStyle}">🛒 Tienda</span>`;
                            if (t.car_wash === 'yes' || t.amenity === 'car_wash') html += `<span style="${badgeStyle}">🧼 Lavado</span>`;
                            if (t.toilets === 'yes') html += `<span style="${badgeStyle}">🚽 Aseos</span>`;
                            if (t.amenity === 'cafe' || t.amenity === 'restaurant' || t.food === 'yes') html += `<span style="${badgeStyle}">☕ Cafetería</span>`;
                            if (t.compressed_air === 'yes' || t.water_point === 'yes') html += `<span style="${badgeStyle}">💨 Aire/Agua</span>`;
                            if (t.atm === 'yes') html += `<span style="${badgeStyle}">🏧 Cajero</span>`;
                        }

                        if (html === '') html = `<span style="${badgeStyle} color:var(--text-muted); font-weight:normal;">Sin extras mapeados</span>`;

                        // 1. Guardamos en caché
                        window.osmCache[g.IDEESS] = html;

                        // 2. Pintamos en la tarjeta de la lista
                        let divList = document.getElementById('servicios-os-' + g.IDEESS);
                        if (divList) {
                            divList.style.display = "flex";
                            divList.style.flexWrap = "wrap";
                            divList.style.gap = "6px";
                            divList.innerHTML = html;
                        }

                        // 3. Pintamos en el PopUp del mapa (si está abierto en ese momento)
                        let openPop = document.querySelector(`.osm-pop-placeholder[data-id="${g.IDEESS}"]`);
                        if (openPop) openPop.innerHTML = html;
                    });
                } catch (e) {
                    console.error("Error OSM:", e);
                }
            }


                       // --- 1 Y 3: DIVIDIR GASTOS Y BITÁCORA ---
            let bitacora = [];
try { bitacora = JSON.parse(localStorage.getItem('gasofa_bitacora')) || []; } catch (e) { bitacora = []; }
            let currentAnotar = {};

                                   // ==========================================================
            // MOTOR CALCULADOR DE AHORROS GLOBALES (CORREGIDO PARA EVITAR ERRORES)
            // ==========================================================
                        function actualizarAhorroGlobal() {
                let total = 0;
                let ahorroPorCoche = {};
                let necesitaGuardar = false; // 1. Chivato de seguridad
                
                bitacora.forEach(b => {
                    let lts = parseFloat(b.litros) || 0;
                    let ahL = parseFloat(b.ahorroL) || 0.10; 
                    let ahorroEste = parseFloat(b.ahorro);
                    
                    // MAGIA ANTI-NaN: Si está corrupto, lo reescribimos y lo saneamos
                    if (isNaN(ahorroEste)) {
                        ahorroEste = lts * ahL;
                        if (isNaN(ahorroEste)) ahorroEste = 0;
                        b.ahorro = ahorroEste; 
                        necesitaGuardar = true; // 2. Solo activamos si de verdad hubo que arreglar datos
                    }
                    
                    total += ahorroEste;
                    
                    if (b.carId) {
                        if (!ahorroPorCoche[b.carId]) ahorroPorCoche[b.carId] = 0;
                        ahorroPorCoche[b.carId] += ahorroEste;
                    }
                });
                
                // 3. Guardamos en el móvil SOLO si hizo falta arreglar algo (Evita cuelgues constantes)
                if (necesitaGuardar) {
                    localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));
                }

                // Actualizamos las pantallas
                let badgeText = q('mapAhorroText');
                if (badgeText) badgeText.innerText = total.toFixed(2) + ' €';
                
                let garajeTotal = q('garajeTotalAhorroNum');
                if (garajeTotal) garajeTotal.innerText = total.toFixed(2) + ' €';
                
                if(document.getElementById('perfilAhorroTotal')) {
                    document.getElementById('perfilAhorroTotal').innerText = total.toFixed(2) + " €";
                }

                return ahorroPorCoche;
            }

            
            // Blindaje para asegurar que el navegador siempre encuentre la función
            window.actualizarAhorroGlobal = actualizarAhorroGlobal;

            // Arrancamos el motor al cargar la página
            document.addEventListener('DOMContentLoaded', actualizarAhorroGlobal);


            // ==========================================================
            // FUNCIONES DE GASTOS / BITÁCORA ACTUALIZADAS (CON PRECIO EDITABLE)
            // ==========================================================

            // Funciones de ayuda para formatear las fechas
            function getHoyYMD() {
                const d = new Date();
                let mes = '' + (d.getMonth() + 1), dia = '' + d.getDate(), anio = d.getFullYear();
                if (mes.length < 2) mes = '0' + mes; if (dia.length < 2) dia = '0' + dia;
                return [anio, mes, dia].join('-');
            }
            function esToYMD(esDate) {
                if (!esDate) return getHoyYMD();
                let partes = esDate.split('/'); if (partes.length !== 3) return getHoyYMD();
                let dia = partes[0].padStart(2, '0'), mes = partes[1].padStart(2, '0'), anio = partes[2];
                return `${anio}-${mes}-${dia}`;
            }
            function ymdToEs(ymdDate) {
                if (!ymdDate) return new Date().toLocaleDateString('es-ES');
                let partes = ymdDate.split('-'); if (partes.length !== 3) return new Date().toLocaleDateString('es-ES');
                return `${parseInt(partes[2])}/${parseInt(partes[1])}/${partes[0]}`;
            }

                                    function abrirAnotar(nombre, precio, ahorroPorLitro = 0.10) {
                // 🔒 CANDADO V2: COMPROBAMOS SI HAY SESIÓN INICIADA
                if (!window.auth || !window.auth.currentUser) {
                    mostrarToast("⚠️ Inicia sesión gratis en 'Mi Perfil' para activar el Historial de repostajes.");
                    if(typeof abrirPerfil === 'function') abrirPerfil();
                    return;
                }
                
                currentAnotar = { nombre, precio, ahorroPorLitro: parseFloat(ahorroPorLitro) || 0.10 };

                q('editBitacoraId').value = "";
                q('bitacoraTitle').innerText = "📓 Anotar Repostaje";
                q('bitacoraGasName').innerText = nombre;
                
                let inputPrecio = q('bitacoraPrecioManual');
                if(inputPrecio) inputPrecio.value = precio.toFixed(3);

                q('bitacoraLitros').value = "";
                q('bitacoraEuros').value = "";
                q('bitacoraKm').value = "";
                q('bitacoraFecha').value = getHoyYMD(); 

                let carSelect = q('bitacoraCarSelect');
                carSelect.innerHTML = '<option value="">Sin vehículo específico</option>';
                myCars.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });

                let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
                if (activeCar) carSelect.value = activeCar;

                q('bitacoraModal').style.display = 'flex';

                const getP = () => parseFloat(inputPrecio.value) || 0;

                q('bitacoraLitros').oninput = function () {
                    let p = getP();
                    if (this.value && p > 0) q('bitacoraEuros').value = (parseFloat(this.value) * p).toFixed(2);
                };
                q('bitacoraEuros').oninput = function () {
                    let p = getP();
                    if (this.value && p > 0) q('bitacoraLitros').value = (parseFloat(this.value) / p).toFixed(2);
                };
                inputPrecio.oninput = function () {
                    let lts = parseFloat(q('bitacoraLitros').value);
                    let p = getP();
                    if (!isNaN(lts) && lts > 0 && p > 0) {
                        q('bitacoraEuros').value = (lts * p).toFixed(2);
                    }
                };
            }

            function editarBitacora(id) {
                let record = bitacora.find(b => b.id == id);
                if (record) {
                    q('historialModal').style.display = 'none';
                    // Al editar, rescatamos el ahorro por litro original de ese día
                    currentAnotar = { nombre: record.nombre, precio: record.precioL, ahorroPorLitro: record.ahorroL || 0.10 };

                    q('editBitacoraId').value = id;
                    q('bitacoraTitle').innerText = "✏️ Editar Repostaje";
                    q('bitacoraGasName').innerText = record.nombre;
                    
                    let inputPrecio = q('bitacoraPrecioManual');
                    if(inputPrecio) inputPrecio.value = record.precioL.toFixed(3);

                    q('bitacoraLitros').value = record.litros;
                    q('bitacoraEuros').value = record.euros;
                    q('bitacoraKm').value = record.km || "";
                    q('bitacoraFecha').value = esToYMD(record.fecha); 

                    let carSelect = q('bitacoraCarSelect');
                    carSelect.innerHTML = '<option value="">Sin vehículo específico</option>';
                    myCars.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
                    if (record.carId) carSelect.value = record.carId;

                    const getP = () => parseFloat(inputPrecio.value) || 0;

                    q('bitacoraLitros').oninput = function () {
                        let p = getP();
                        if (this.value && p > 0) q('bitacoraEuros').value = (parseFloat(this.value) * p).toFixed(2);
                    };
                    q('bitacoraEuros').oninput = function () {
                        let p = getP();
                        if (this.value && p > 0) q('bitacoraLitros').value = (parseFloat(this.value) / p).toFixed(2);
                    };
                    inputPrecio.oninput = function () {
                        let lts = parseFloat(q('bitacoraLitros').value);
                        let p = getP();
                        if (!isNaN(lts) && lts > 0 && p > 0) {
                            q('bitacoraEuros').value = (lts * p).toFixed(2);
                        }
                    };

                    q('bitacoraModal').style.display = 'flex';
                }
            }

                        function guardarBitacora() {
                if (typeof gtag === 'function') gtag('event', 'guardar_repostaje', { 'gasolinera': currentAnotar.nombre });

                let lts = parseFloat(q('bitacoraLitros').value);
                let eur = parseFloat(q('bitacoraEuros').value);
                
                let inputPrecio = q('bitacoraPrecioManual');
                let precioFinal = inputPrecio ? parseFloat(inputPrecio.value) : currentAnotar.precio; 
                
                let kmActuales = parseFloat(q('bitacoraKm').value) || 0;
                let fechaFinal = ymdToEs(q('bitacoraFecha').value); 
                let idEdit = q('editBitacoraId').value;

                let carId = q('bitacoraCarSelect').value;
                let carName = "";
                if (carId) {
                    let foundCar = myCars.find(c => String(c.id) === String(carId));
                    if (foundCar) carName = foundCar.name;
                }

                if (!lts || !eur || isNaN(precioFinal)) { alert("⚠️ Rellena los litros, euros y el precio"); return; }

                let precioMaximoZona = currentAnotar.precio + currentAnotar.ahorroPorLitro;
                let nuevoAhorroPorLitro = precioMaximoZona - precioFinal;
                let nuevoAhorroTotal = nuevoAhorroPorLitro * lts;

                // CAPTURAMOS EL NOMBRE DE QUIEN ESTÁ PAGANDO
                let miNombre = "Conductor";
                if (window.auth && window.auth.currentUser && window.auth.currentUser.displayName) {
                    miNombre = window.auth.currentUser.displayName.split(" ")[0]; // Solo pilla el primer nombre (Ej: "Juan")
                }

                if (idEdit !== "") {
                    let index = bitacora.findIndex(b => b.id == idEdit);
                    if (index > -1) {
                        bitacora[index].litros = lts;
                        bitacora[index].euros = eur;
                        bitacora[index].precioL = precioFinal; 
                        bitacora[index].km = kmActuales;
                        bitacora[index].fecha = fechaFinal;
                        bitacora[index].carId = carId;
                        bitacora[index].carName = carName;
                        bitacora[index].ahorroL = nuevoAhorroPorLitro; 
                        bitacora[index].ahorro = nuevoAhorroTotal;
                        bitacora[index].usuario = miNombre; // Actualiza el nombre
                    }
                    bitacora.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
                } else {
                    bitacora.push({
                        id: Date.now(),
                        fecha: fechaFinal,
                        nombre: currentAnotar.nombre,
                        litros: lts,
                        euros: eur,
                        precioL: precioFinal, 
                        km: kmActuales,
                        carId: carId,
                        carName: carName,
                        usuario: miNombre, // GUARDA EL NOMBRE EN LA BITÁCORA
                        ahorroL: nuevoAhorroPorLitro, 
                        ahorro: nuevoAhorroTotal      
                    });
                    bitacora.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
                }

                localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));

                if (window.auth && window.auth.currentUser) {
                    const uid = window.auth.currentUser.uid;
                    
                    // 1. Guardado en la copia personal del usuario
                    window.setDoc(window.doc(window.db, "usuarios", uid), {
                        miBitacora: bitacora
                    }, { merge: true });

                    // 2. SI EL REPOSTAJE TIENE UN COCHE Y ESTÁ COMPARTIDO, LO ENVIAMOS AL BUZÓN COMPARTIDO
                    if (carId) {
                        let cocheActual = myCars.find(c => String(c.id) === String(carId));
                        if (cocheActual && cocheActual.compartido) {
                            let gastosEsteCoche = bitacora.filter(b => String(b.carId) === String(carId));
                            window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), {
                                repostajes: gastosEsteCoche
                            }, { merge: true }).catch(e => console.error("Error buzón compartido:", e));
                        }
                    }
                }
                
                if (typeof window.actualizarAhorroGlobal === 'function') {
                    window.actualizarAhorroGlobal(); 
                }
                
                q('bitacoraModal').style.display = 'none';

                if (q('historialModal').style.display === 'flex') {
                    actualizarListaHistorial();
                } else {
                    alert("✅ ¡Repostaje guardado!");
                }
            }



                        function abrirHistorial() {
                q('garageModal').style.display = 'none';
                q('historialModal').style.display = 'flex';

                let filterSelect = q('historialCarFilter');
                let valActual = filterSelect.value;

                filterSelect.innerHTML = '<option value="all">🚗 Todos los vehículos</option>';
                myCars.forEach(c => { filterSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });

                if (valActual && valActual !== "all" && myCars.some(c => String(c.id) === String(valActual))) {
                    filterSelect.value = valActual;
                } else {
                    filterSelect.value = "all";
                }

                // Reseteamos los nuevos filtros al abrir
                if(q('historialTipoFilter')) q('historialTipoFilter').value = 'all';
                if(q('historialMesFilter')) q('historialMesFilter').innerHTML = '<option value="all">📅 Histórico Total</option>';

          actualizarListaHistorial();
            }          

                                 function actualizarListaHistorial() {
    let lista = q('listaBitacora');
    
    let filterCarId = q('historialCarFilter').value;
    let filterTipo = q('historialTipoFilter') ? q('historialTipoFilter').value : 'all';
    let filterMes = q('historialMesFilter') ? q('historialMesFilter').value : 'all';

    let filtradosGas = filterCarId === "all" ? bitacora : bitacora.filter(b => String(b.carId) === String(filterCarId));
    let mantenimientoAct = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
    let filtradosTaller = filterCarId === "all" ? mantenimientoAct : mantenimientoAct.filter(m => String(m.carId) === String(filterCarId));

    let combinedBruto = [];
    filtradosGas.forEach(b => combinedBruto.push({ type: 'gas', date: b.fecha, obj: b }));
    filtradosTaller.forEach(m => combinedBruto.push({ type: 'taller', date: m.fecha, obj: m }));

    // 1. ORDENACIÓN PERFECTA
    combinedBruto.sort((a, b) => {
        let dateA = new Date(esToYMD(a.date)).getTime();
        let dateB = new Date(esToYMD(b.date)).getTime();
        if (dateA === dateB) return b.obj.id - a.obj.id;
        return dateB - dateA;
    });

    // 2. GENERAR LISTA DE MESES
    let selectMes = q('historialMesFilter');
    if (selectMes && selectMes.options.length <= 1 && combinedBruto.length > 0) {
        let mesesUnicos = new Set();
        combinedBruto.forEach(item => {
            let partes = item.date.split('/');
            if (partes.length === 3) mesesUnicos.add(`${partes[2]}-${partes[1]}`);
        });
        
        let mesesOrdenados = Array.from(mesesUnicos).sort().reverse();
        let htmlMeses = '<option value="all">📅 Histórico Total</option>';
        const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        
        mesesOrdenados.forEach(m => {
            let [y, mo] = m.split('-');
            htmlMeses += `<option value="${m}">${nombresMeses[parseInt(mo)-1]} ${y}</option>`;
        });
        
        let valActual = selectMes.value;
        selectMes.innerHTML = htmlMeses;
        if(Array.from(selectMes.options).some(o => o.value === valActual)) selectMes.value = valActual;
    }

    // 3. APLICAR FILTROS
    let combined = combinedBruto.filter(item => {
        let pasaTipo = (filterTipo === 'all' || filterTipo === item.type);
        let pasaMes = true;
        if (filterMes !== 'all') {
            let partes = item.date.split('/');
            if (partes.length === 3) pasaMes = (`${partes[2]}-${partes[1]}` === filterMes);
        }
        return pasaTipo && pasaMes;
    });

    let totalCombustible = 0;
    let totalTaller = 0;

    if (combined.length === 0) {
        lista.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding-top:15px;'>No hay gastos registrados para esta búsqueda.</p>";
        if (window.gastosChartInstance) window.gastosChartInstance.destroy();
        q('gastosChart').style.display = 'none';
        q('resumenMes').innerHTML = `💶 Total mostrado: <b>0.00€</b>`;
        return;
    }

    q('gastosChart').style.display = 'block';

    // --- GRÁFICA INTELIGENTE ---
    let monthlyData = {};
    combined.forEach(item => {
        let partes = item.date.split('/');
        if (partes.length === 3) {
            let key, label;
            if (filterMes === 'all') {
                key = `${partes[2]}-${partes[1]}`;
                label = `${partes[1]}/${partes[2].substring(2)}`; 
            } else {
                key = partes[0];
                label = `Día ${partes[0]}`; 
            }

            if (!monthlyData[key]) monthlyData[key] = { label: label, gas: 0, taller: 0 };
            
            if (item.type === 'gas') monthlyData[key].gas += item.obj.euros;
            else monthlyData[key].taller += item.obj.coste;
        }
    });

    let sortedKeys = Object.keys(monthlyData).sort();
    if (filterMes === 'all' && sortedKeys.length > 6) sortedKeys = sortedKeys.slice(-6);

    let chartLabels = sortedKeys.map(k => monthlyData[k].label);
    let chartGas = sortedKeys.map(k => monthlyData[k].gas);
    let chartTaller = sortedKeys.map(k => monthlyData[k].taller);

    if (window.gastosChartInstance) window.gastosChartInstance.destroy();

    const ctxGastos = q('gastosChart').getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e0e0e0' : '#4a4f56';
    const gridColor = isDark ? '#3a3b3c' : '#e4e6eb';

    window.gastosChartInstance = new Chart(ctxGastos, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                { label: '⛽ Combustible', data: chartGas, backgroundColor: 'rgba(30, 122, 68, 0.7)', borderColor: '#1e7a44', borderWidth: 1, borderRadius: 4 },
                { label: '🔧 Taller', data: chartTaller, backgroundColor: 'rgba(231, 76, 60, 0.7)', borderColor: '#c0392b', borderWidth: 1, borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { display: true, position: 'top', labels: { color: textColor, font: {size: 10} } }, 
                tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.parsed.y.toFixed(2) + ' €' } } 
            },
            scales: {
                y: { stacked: true, beginAtZero: true, ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
                x: { stacked: true, ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }
            }
        }
    });

    // --- PINTAR LA LISTA OPTIMIZADA Y SEGURA ---
    let htmlAcumulado = ''; // 1. Creamos la caja temporal

    combined.forEach((item, globalIndex) => {
        if (item.type === 'gas') {
            let b = item.obj;
            totalCombustible += b.euros;

            let badgeConsumo = "";
            let prevGasIndex = combined.findIndex((prev, i) => i > globalIndex && prev.type === 'gas' && String(prev.obj.carId) === String(b.carId) && prev.obj.km > 0);
            if (b.km > 0 && b.carId && prevGasIndex !== -1) {
                let repostajeAnterior = combined[prevGasIndex].obj;
                if (b.km > repostajeAnterior.km) {
                    let distanciaRecorrida = b.km - repostajeAnterior.km;
                    let consumoReal = (b.litros / distanciaRecorrida) * 100;
                    badgeConsumo = `<span class="badge-base badge-consumo" title="Basado en ${distanciaRecorrida}km">📊 Real: ${consumoReal.toFixed(1)} L/100</span>`;
                }
            }

            // ESCUDO DE SEGURIDAD (Hacking / XSS)
            let usuarioSeguro = b.usuario ? window.escaparHTML(b.usuario) : "";
            let cocheSeguro = b.carName ? window.escaparHTML(b.carName) : "";
            let nombreGasSeguro = b.nombre ? window.escaparHTML(b.nombre) : "Gasolinera";

            let userBadge = usuarioSeguro ? `<span class="badge-base" style="background:#34495e; color:white;">👤 ${usuarioSeguro}</span>` : "";
            let carBadge = cocheSeguro ? `<div class="flex-col-start"><span class="badge-base badge-coche">🚗 ${cocheSeguro}</span><div style="display:flex; gap:4px; margin-top:2px;">${userBadge}${badgeConsumo}</div></div>` : "";

            let cocheGastoGas = myCars.find(c => String(c.id) === String(b.carId));
            let esInvitadoGas = (cocheGastoGas && cocheGastoGas.compartido && cocheGastoGas.name.startsWith("🤝 "));
            let botonBorrarGas = esInvitadoGas ? '' : `<button class="btn-icon-only btn-icon-delete" onclick="borrarBitacora(${b.id})" title="Borrar">🗑️</button>`;

            htmlAcumulado += `
            <div class="card-hist-gas">
                <div style="flex:1; padding-right:10px;">
                    <div class="flex-row-center">
                        <span style="font-size:14px;">⛽</span>
                        <span class="txt-hist-titulo">${nombreGasSeguro}</span>
                    </div>
                    ${carBadge}
                    <div class="txt-hist-detalle">${b.fecha} • ${b.litros.toFixed(1)} L a ${b.precioL.toFixed(3)}€</div>
                    <div class="txt-ahorro-verde">​💰 Ahorro: +${(b.ahorro || (b.litros * (b.ahorroL || 0.10))).toFixed(2)}€</div>
                </div>
                <div class="flex-row-center" style="gap:8px;">
                    <span class="txt-gasto-rojo">-${b.euros.toFixed(2)}€</span>
                    <div class="btn-group-sm">
                        <button class="btn-icon-only btn-icon-edit" onclick="editarBitacora(${b.id})" title="Editar">✏️</button>
                        ${botonBorrarGas}
                    </div>
                </div>
            </div>`;


        } else {
            let m = item.obj;
            totalTaller += m.coste;

            // ESCUDO DE SEGURIDAD (Hacking / XSS)
            let tipoSeguro = m.tipo ? window.escaparHTML(m.tipo) : "Taller";
            let cocheSeguro = m.carName ? window.escaparHTML(m.carName) : "";
            let notasSeguras = m.notas ? window.escaparHTML(m.notas) : "";

            let botonFacturaHist = m.factura ? `<button class="btn-factura" onclick="window.abrirCamaraCompleta('${m.factura}', 'Factura: ${tipoSeguro}')">📄 Ver Factura</button>` : '';

            let cocheGastoTaller = myCars.find(c => String(c.id) === String(m.carId));
            let esInvitadoTaller = (cocheGastoTaller && cocheGastoTaller.compartido && cocheGastoTaller.name.startsWith("🤝 "));
            let botonBorrarTaller = esInvitadoTaller ? '' : `<button class="btn-icon-only btn-icon-delete" onclick="borrarTaller(${m.id}, true)" title="Borrar">🗑️</button>`;

            htmlAcumulado += `
            <div class="card-hist-taller">
                <div style="flex:1; padding-right:10px;">
                    <div class="flex-row-center">
                        <span style="font-size:14px;">🔧</span>
                        <span class="txt-hist-titulo">${tipoSeguro}</span>
                    </div>
                    <div class="flex-col-start">
                        <span class="badge-base badge-coche">🚗 ${cocheSeguro}</span>
                    </div>
                    <div class="txt-hist-detalle">${m.fecha} • 🛣️ ${m.km} km</div>
                    ${notasSeguras ? `<div class="box-notas" style="margin-top:4px;">📝 ${notasSeguras}</div>` : ''}
                    <div>${botonFacturaHist}</div>
                </div>
                <div class="flex-row-center" style="gap:8px;">
                    <span class="txt-gasto-rojo">-${m.coste.toFixed(2)}€</span>
                    <div class="btn-group-sm">
                        <button class="btn-icon-only btn-icon-edit" onclick="editarTaller(${m.id}, true)" title="Editar">✏️</button>
                        ${botonBorrarTaller}
                    </div>
                </div>
            </div>`;
        }
    });

    // 2. Volcamos todo de golpe al HTML (¡Mucho más rápido!)
    lista.innerHTML = htmlAcumulado;

    let totalMostrado = totalCombustible + totalTaller;
    q('resumenMes').innerHTML = `💶 Gasto total mostrado: <b>${totalMostrado.toFixed(2)}€</b><br><span style="font-size:11px; font-weight:normal; color:var(--text-main);">(⛽ ${totalCombustible.toFixed(2)}€ | 🔧 ${totalTaller.toFixed(2)}€)</span>`;
}


                        function borrarBitacora(id) {
                let registro = bitacora.find(b => b.id === id);
                if (registro) {
                    let cocheGasto = myCars.find(c => String(c.id) === String(registro.carId));
                    if (cocheGasto && cocheGasto.compartido && cocheGasto.name.startsWith("🤝 ")) {
                        alert("⚠️ Solo el administrador (creador) del vehículo puede borrar este gasto.");
                        return;
                    }
                }

                if (confirm("¿Seguro que quieres borrar este repostaje?")) {
                    bitacora = bitacora.filter(b => b.id !== id);
                    localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));
                    
                    // ☁️ BORRAR DE LA NUBE
                    if (window.auth && window.auth.currentUser) {
                        const uid = window.auth.currentUser.uid;
                        window.setDoc(window.doc(window.db, "usuarios", uid), {
                            miBitacora: bitacora
                        }, { merge: true });
                    }

                    if (typeof window.actualizarAhorroGlobal === 'function') window.actualizarAhorroGlobal();
                    actualizarListaHistorial();
                }
            }

            
            function cancelarEdicionBitacora() {
                q('bitacoraModal').style.display = 'none';
                if (q('editBitacoraId').value !== "") {
                    q('historialModal').style.display = 'flex';
                }
            }



            // --- SISTEMA DE NOTIFICACIONES PWA (VERSIÓN PRO COMPATIBLE CON ANDROID) ---

            // 1. Función maestra que decide cómo enviar la notificación (PC vs Móvil)
            function lanzarNotificacion(titulo, cuerpo) {
                const opciones = {
                    body: cuerpo,
                    icon: 'android-chrome-192x192.png',
                    badge: 'favicon-32x32.png', // Icono pequeñito para la barra superior de Android
                    vibrate: [200, 100, 200] // Hace vibrar el móvil
                };

                if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                    // Método obligatorio para Chrome en Android
                    navigator.serviceWorker.ready.then(function (registration) {
                        registration.showNotification(titulo, opciones);
                    });
                } else {
                    // Método tradicional para Safari o PC
                    new Notification(titulo, opciones);
                }
            }

            function solicitarPermisoNotificaciones() {
                if (!("Notification" in window)) {
                    alert("Tu dispositivo o navegador no soporta notificaciones.");
                    return;
                }
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        alert("¡Activadas! Te avisaremos cuando caduque tu ITV o Seguro.");
                        document.getElementById('btnNotificaciones').style.display = 'none';
                        // Mandamos una de prueba
                        lanzarNotificacion("¡Precio Combustibles!", "Las alertas del garaje están listas y funcionando.");
                    }
                });
            }

            function revisarAlertasAlEntrar() {
                if (!("Notification" in window) || Notification.permission !== "granted") return;

                const hoy = new Date();
                const ultimaNoti = localStorage.getItem('gasofa_last_noti');
                const fechaHoyStr = hoy.toDateString();

                // MODO PRUEBAS: Quita las dos barras "//" de la siguiente línea para forzar tests.
                // localStorage.removeItem('gasofa_last_noti'); 

                if (ultimaNoti === fechaHoyStr) return; // Ya avisó hoy

                let hayAvisos = false;

                myCars.forEach(car => {
                    if (car.itv) {
                        let diasItv = (new Date(car.itv) - hoy) / (1000 * 60 * 60 * 24);
                        // Si faltan 15 días o menos, y no lleva caducado más de un año (-365)
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


            window.addEventListener('load', () => {
                setTimeout(revisarAlertasAlEntrar, 3000);
            });

            // --- SISTEMA DE COPIA DE SEGURIDAD (CSV) ---

                        function exportarDatosCSV() {
                let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];

                if (bitacora.length === 0 && myCars.length === 0 && mantLocal.length === 0) {
                    alert("⚠️ No tienes datos para exportar.");
                    return;
                }

                if (typeof gtag === 'function') gtag('event', 'exportar_datos');

                // 1. Pedimos al usuario que elija el nombre del archivo
                let fechaHoy = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
                let nombrePersonalizado = prompt("Ponle un nombre a tu copia de seguridad:", `Copia_Precio_Combustibles_${fechaHoy}`);

                if (!nombrePersonalizado) return;

                if (!nombrePersonalizado.toLowerCase().endsWith('.csv')) {
                    nombrePersonalizado += '.csv';
                }

                // 2. Preparamos los datos (Cabecera ampliada con NOTAS)
                let csvContent = "TIPO;FECHA;NOMBRE_O_TIPO;LITROS;EUROS;PRECIO_L;KM;COCHE_ID;COCHE_NOMBRE;FUEL;CONSUMO;DEPOSITO;ITV;SEGURO;ACEITE;NOTAS\r\n";

                // REPOSTAJES
                bitacora.forEach(b => {
                    let fila = [
                        "REPOSTAJE", b.fecha, b.nombre ? b.nombre.replace(/;/g, ",") : "", b.litros, b.euros, b.precioL,
                        b.km || 0, b.carId || "", b.carName ? b.carName.replace(/;/g, ",") : "", "", "", "", "", "", "", ""
                    ];
                    csvContent += fila.join(";") + "\r\n";
                });
                
                // TALLER Y MANTENIMIENTO
                mantLocal.forEach(m => {
                    let fila = [
                        "TALLER", m.fecha, m.tipo ? m.tipo.replace(/;/g, ",") : "", "", m.coste, "",
                        m.km || 0, m.carId || "", m.carName ? m.carName.replace(/;/g, ",") : "", "", "", "", "", "", "", m.notas ? m.notas.replace(/;/g, ",") : ""
                    ];
                    csvContent += fila.join(";") + "\r\n";
                });

                // VEHÍCULOS
                myCars.forEach(c => {
                    let fila = [
                        "VEHICULO", "", c.name ? c.name.replace(/;/g, ",") : "", "", "", "", "",
                        c.id, c.name ? c.name.replace(/;/g, ",") : "", c.fuel || "", c.consumo || 0, c.deposito || 0,
                        c.itv || "", c.seguro || "", c.aceite || "", ""
                    ];
                    csvContent += fila.join(";") + "\r\n";
                });

                // 3. Convertimos el texto
                const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

                // 4. Descarga directa
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", nombrePersonalizado); 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url); 
            }



            function importarDatosCSV(input) {
                const file = input.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (e) {
                    const text = e.target.result;
                    const lineas = text.split("\n");

                    if (lineas.length < 2) return;

                    let nuevosRepostajes = [];
                    let nuevosCoches = [];

                    // Procesar cada línea (saltamos la cabecera)
                    for (let i = 1; i < lineas.length; i++) {
                        let columnas = lineas[i].split(";");
                        if (columnas.length < 3) continue;

                        let tipo = columnas[0].trim();

                        if (tipo === "REPOSTAJE") {
                            let fFecha = columnas[1].trim();
                            let fNombre = columnas[2].trim();
                            let fLitros = parseFloat(columnas[3]);
                            let fEuros = parseFloat(columnas[4]);

                            // 🛡️ FILTRO ANTI-DUPLICADOS: Buscamos si ya existe uno idéntico
                            let yaExiste = bitacora.some(b =>
                                b.fecha === fFecha &&
                                (b.nombre ? b.nombre.replace(/;/g, ",") : "") === fNombre &&
                                b.litros === fLitros &&
                                b.euros === fEuros
                            );

                            // Comprobamos también que no esté repetido dentro del propio archivo
                            let yaEnNuevos = nuevosRepostajes.some(b =>
                                b.fecha === fFecha &&
                                b.nombre === fNombre &&
                                b.litros === fLitros &&
                                b.euros === fEuros
                            );

                            if (!yaExiste && !yaEnNuevos) {
                                nuevosRepostajes.push({
                                    id: Date.now() + i, // ID temporal
                                    fecha: fFecha,
                                    nombre: fNombre,
                                    litros: fLitros,
                                    euros: fEuros,
                                    precioL: parseFloat(columnas[5]),
                                    km: parseFloat(columnas[6]),
                                    carId: columnas[7],
                                    carName: columnas[8] ? columnas[8].trim() : ""
                                });
                            }
                        } else if (tipo === "VEHICULO") {
                            let idCoche = columnas[7] ? columnas[7].trim() : Date.now() + i;
                            // Solo añadir si no existe ya un coche con ese ID
                            if (!myCars.find(c => String(c.id) === String(idCoche))) {
                                nuevosCoches.push({
                                    id: idCoche,
                                    name: columnas[2],
                                    fuel: columnas[9] || "Precio Gasoleo A",
                                    consumo: parseFloat(columnas[10]) || 0,
                                    deposito: parseFloat(columnas[11]) || 0,
                                    itv: columnas[12] || "",
                                    seguro: columnas[13] || "",
                                    aceite: columnas[14] ? columnas[14].trim() : ""
                                });
                            }
                        }
                    }

                    let mensaje = `Se han encontrado datos NUEVOS en el archivo:\n\n⛽ ${nuevosRepostajes.length} Repostajes nuevos\n🚗 ${nuevosCoches.length} Vehículos nuevos\n\n¿Quieres añadirlos a tu historial?`;

                    if (nuevosRepostajes.length === 0 && nuevosCoches.length === 0) {
                        alert("👍 Tu app ya está al día. No se han encontrado datos nuevos o diferentes en este archivo para importar.");
                        input.value = "";
                        return;
                    }

                    if (confirm(mensaje)) {
                        // Unimos lo nuevo con lo viejo y guardamos
                        bitacora = [...nuevosRepostajes, ...bitacora];
                        myCars = [...myCars, ...nuevosCoches];

                        localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));
                        localStorage.setItem('gasofa_cars', JSON.stringify(myCars));

                        alert("✅ Datos importados correctamente.");
                        location.reload();
                    }

                    // Vaciamos el input por si quieres subir el mismo archivo después
                    input.value = "";
                };
                reader.readAsText(file);
            }


            

      

            // Generador de Estrellas estilo Amazon (Visual)
            function generarEstrellasAmazon(media, totalValoraciones) {
                if (totalValoraciones === 0 || !media) {
                    return `<div style="font-size:10px; color:var(--text-muted); margin-bottom:4px;">
                                <span style="color:#bdc3c7; font-size:12px;">☆☆☆☆☆</span> <span style="vertical-align:top;">Aún sin valoraciones</span>
                            </div>`;
                }

                let estrellasHTML = '';
                let mediaRedondeada = Math.round(media * 2) / 2; // Redondea al 0.5 más cercano

                for (let i = 1; i <= 5; i++) {
                    if (i <= mediaRedondeada) {
                        estrellasHTML += '★'; // Llena
                    } else {
                        estrellasHTML += '☆'; // Vacía
                    }
                }

                return `<div style="display:flex; align-items:center; gap:4px; margin-bottom:4px; font-size:12px;">
                            <span style="color:#f1c40f; font-size:14px; letter-spacing:1px; margin-top:-2px;">${estrellasHTML}</span>
                            <span style="font-weight:900; color:var(--text-main);">${media.toFixed(1)}</span>
                            <span style="color:var(--text-muted); font-size:10px;">(${totalValoraciones})</span>
                        </div>`;
            }


            // --- SISTEMA DE VALORACIONES Y COMENTARIOS ---

            // Generamos un "DNI" secreto e invisible para cada móvil
            let miUsuarioID = localStorage.getItem('gasofa_uid');
            if (!miUsuarioID) {
                miUsuarioID = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('gasofa_uid', miUsuarioID);
            }

                        function abrirValoraciones(id, nombre) {
                q('revGasId').value = id;
                q('revGasName').innerText = nombre;
                q('revText').value = ""; 
                marcarEstrellas(0); 

                // Recuperamos el apodo si el usuario ya comentó alguna vez
                let apodoGuardado = localStorage.getItem('gasofa_apodo');
                if (apodoGuardado) {
                    q('revApodo').value = apodoGuardado;
                } else {
                    q('revApodo').value = "";
                }

                const list = q('revList');
                list.innerHTML = "<div style='text-align:center; color:var(--text-muted); font-size:12px; padding:20px;'>Conectando con la nube... ⏳</div>";
                q('reviewsModal').style.display = 'flex';

                // Pedimos los comentarios reales a la nube
                fetch(WEB_APP_URL + "?accion=obtenerValoraciones&idGas=" + id + "&t=" + Date.now())
                    .then(res => res.json())
                                       .then(data => {
                        if (data.length === 0) {
                            list.innerHTML = "<div style='text-align:center; color:var(--text-muted); font-size:12px; padding:20px;'>Aún no hay opiniones. ¡Sé el primero en valorar!</div>";
                            return;
                        }

                        let htmlOpiniones = ''; // 1. Caja temporal

                        // Pintamos cada comentario
                        data.forEach(rev => {
                            // 2. Pasamos los textos por el filtro de seguridad (que ya tenías, ¡muy bien hecho!)
                            let nombreLimpio = rev.apodo ? window.escaparHTML(rev.apodo) : "Anónimo";
                            let textoLimpio = window.escaparHTML(rev.texto);
                            
                            // 3. Acumulamos en la caja en vez de inyectar en pantalla
                            htmlOpiniones += `
                            <div class="card-valoracion">
                                <div class="card-val-header">
                                    <div class="card-val-user">
                                        <span class="txt-estrellas">${'★'.repeat(rev.estrellas)}${'☆'.repeat(5 - rev.estrellas)}</span>
                                        <span class="txt-apodo">👤 ${nombreLimpio}</span>
                                    </div>
                                    <span class="txt-fecha">${rev.fecha}</span>
                                </div>
                                <div class="txt-comentario">${textoLimpio}</div>
                            </div>`;
                        });

                        // 4. Inyectamos todas las opiniones de golpe
                        list.innerHTML = htmlOpiniones;
                    })

                    .catch(err => {
                        list.innerHTML = "<div style='text-align:center; color:#e74c3c; font-size:12px; padding:20px;'>❌ Error de conexión al cargar los comentarios.</div>";
                    });
            }


            function enviarValoracion() {
                let id = q('revGasId').value;
                let estrellas = parseInt(q('revStars').value);
                let texto = q('revText').value.trim();
                let apodo = q('revApodo').value.trim();

                if (estrellas === 0) { alert("⚠️ Por favor, selecciona al menos 1 estrella."); return; }
                if (apodo.length < 2) { alert("⚠️ Por favor, escribe tu nombre o apodo."); return; }
                if (texto.length < 4) { alert("⚠️ Escribe un comentario un poquito más largo."); return; }

                // Guardamos el apodo en el móvil para que no tenga que teclearlo la próxima vez
                localStorage.setItem('gasofa_apodo', apodo);

                q('revList').innerHTML = `<div style='text-align:center; color:var(--accent-green); font-size:13px; font-weight:bold; padding:20px;'>⏳ Guardando tu opinión para toda España...</div>`;

                // Enviamos el comentario a tu Google Apps Script
                let url = WEB_APP_URL + "?accion=guardarValoracion" +
                          "&idGas=" + encodeURIComponent(id) +
                          "&estrellas=" + estrellas +
                          "&apodo=" + encodeURIComponent(apodo) +
                          "&texto=" + encodeURIComponent(texto) +
                          "&userId=" + miUsuarioID;

                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        q('revText').value = "";
                        marcarEstrellas(0);
                        // Recargamos la lista
                        abrirValoraciones(id, q('revGasName').innerText);
                    })
                    .catch(err => {
                        alert("❌ Hubo un error al guardar. Revisa tu conexión a internet.");
                        abrirValoraciones(id, q('revGasName').innerText);
                    });
            }


            function marcarEstrellas(num) {
                q('revStars').value = num;
                let estrellas = q('starSelector').querySelectorAll('span');
                estrellas.forEach((estrella, index) => {
                    if (index < num) {
                        estrella.style.color = '#f1c40f'; // Color oro para las marcadas
                        estrella.style.transform = 'scale(1.1)';
                    } else {
                        estrella.style.color = '#bdc3c7'; // Color gris para las vacías
                        estrella.style.transform = 'scale(1)';
                    }
                });
            }

            // --- FUNCIONES DEL PARKING ---
            function guardarParking() {
                const btn = document.getElementById('btnGuardarCoche');
                btn.innerText = "⏳ Guardando..."; // Cambiamos el texto
                btn.disabled = true; // Bloqueamos el botón para que no le den 20 veces

                navigator.geolocation.getCurrentPosition(pos => {
                    const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude, fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                    localStorage.setItem('gasofa_parking', JSON.stringify(coords));

                    btn.innerText = "💾 Guardar Sitio"; // Lo volvemos a poner normal
                    btn.disabled = false;

                    alert("✅ Ubicación guardada. ¡Ya puedes irte tranquilo!");
                    actualizarUIResumenParking();
                }, () => {
                    btn.innerText = "💾 Guardar Sitio";
                    btn.disabled = false;
                    alert("❌ Error: Necesito el GPS para guardar el parking.");
                }, { enableHighAccuracy: true, timeout: 10000 });
            }

            function irAMiCoche() {
    let coords = null;
    try { coords = JSON.parse(localStorage.getItem('gasofa_parking')); } catch(e) {}

    if (coords && coords.lat && coords.lon) {
        // Enlace oficial universal moderno para forzar navegación a pie
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}&travel_mode=walking`;
        window.open(url, '_blank');
    } else {
        alert("⚠️ No he podido encontrar las coordenadas de tu parking.");
    }
}

            function borrarParking() {
                if (confirm("¿Seguro que quieres borrar la ubicación de tu coche?")) {
                    localStorage.removeItem('gasofa_parking');
                    actualizarUIResumenParking();
                }
            }

            function actualizarUIResumenParking() {
                const coords = JSON.parse(localStorage.getItem('gasofa_parking'));
                const btnGuardar = document.getElementById('btnGuardarCoche');
                const divGuardado = document.getElementById('botonesCocheGuardado');
                const info = document.getElementById('infoParking');

                if (coords) {
                    if (btnGuardar) btnGuardar.style.display = 'none'; // Ocultamos Guardar
                    if (divGuardado) divGuardado.style.display = 'flex'; // Mostramos los otros dos
                    if (info) info.innerText = `Aparcado a las ${coords.fecha}`;
                } else {
                    if (btnGuardar) btnGuardar.style.display = 'block'; // Mostramos Guardar
                    if (divGuardado) divGuardado.style.display = 'none'; // Ocultamos los otros dos
                    if (info) info.innerText = `No hay ninguna ubicación guardada.`;
                }
            }

            // --- CALCULADORA DE TENDENCIAS EN PANTALLA ---
            function actualizarCabeceraTendencias() {
                if (!q('tendenciaAyer') || !window.lastFiltradas || window.lastFiltradas.length === 0) return;

                let fTN = q("tipoCombustible").options[q("tipoCombustible").selectedIndex].text;

                if (!trendsLoaded) {
                    q('tendenciaAyer').innerHTML = "📊 " + fTN + ": Calculando tendencia exacta... ⏳";
                    return;
                }

                let sumaHoy = 0, sumaAyer = 0, comparables = 0;

                window.lastFiltradas.forEach(g => {
                    let tData = currentTrends[g.IDEESS];
                    // Si tenemos el dato de tendencia de esta gasolinera desde el servidor
                    if (tData && typeof tData.diff !== 'undefined') {
                        let precioHoy = g.pN;
                        let precioAyer = precioHoy - tData.diff; // Matemáticas: Ayer = Hoy - Diferencia

                        sumaHoy += precioHoy;
                        sumaAyer += precioAyer;
                        comparables++;
                    }
                });

                if (comparables > 0) {
                    let dif = (sumaHoy / comparables) - (sumaAyer / comparables);

                    // --- NUEVAS FRASES MÁS PRECISAS (ACTUALIZADAS A HOY) ---
                    let txt = Math.abs(dif) < 0.001
                        ? "Hoy la tendencia se mantiene igual ⚖️"
                        : (dif > 0 ? `La tendencia hoy es de <span style="color:#e74c3c;">▲ subida (+${dif.toFixed(3)}€)</span>`
                            : `La tendencia hoy es a la <span style="color:#27ae60;">▼ baja (-${Math.abs(dif).toFixed(3)}€)</span>`);
                    // ---------------------------------


                    let zonaStr = searchMode === 'provincia' ? "en provincia" : (searchMode === 'ruta' ? "en ruta" : "gasolineras mostradas en pantalla");

                    q('tendenciaAyer').innerHTML = "📊 " + fTN + ": " + txt + " <small>(" + zonaStr + ")</small>";
                } else {
                    q('tendenciaAyer').innerHTML = "📊 " + fTN + ": Datos de ayer no disponibles ➖";
                }

            }

            // --- NUEVO: CÁMARAS DE TRÁFICO DGT (Conectado a Google Sheets) ---
            let layerCamaras = L.markerClusterGroup({
                maxClusterRadius: 50,
                iconCreateFunction: function (cluster) {
                    // Cuadrado rojo para las agrupaciones
                    return L.divIcon({
                        html: '<div style="background-color: #e74c3c; color: white; border: 2px solid white; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"><span>' + cluster.getChildCount() + '</span></div>',
                        className: '',
                        iconSize: L.point(35, 35)
                    });
                }
            });

            let camarasCargadas = false;
            let camarasActivas = false;

            // Variable para saber si la foto está ampliada o no
            window.esZoomCamara = false;

            // Función para abrir la cámara por primera vez
            window.abrirCamaraCompleta = function (src, nombre) {

                // CHIVATO: Ver una cámara concreta
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ver_camara_especifica', {
                        'event_category': 'Trafico',
                        'carretera_camara': nombre
                    });
                }
                const img = document.getElementById('camaraModalImg');
                img.src = src;
                document.getElementById('camaraModalTitle').innerText = "🎥 " + nombre;
                document.getElementById('camaraModal').style.display = 'flex';

                // Resetear el zoom siempre que se abre una cámara nueva
                window.esZoomCamara = false;
                img.style.width = '100%';
                img.style.cursor = 'zoom-in';
                document.getElementById('camaraZoomText').innerText = "Toca la foto para hacer zoom • Toca fuera para cerrar";
            };

            // Función para hacer el Zoom al tocar la foto
            window.toggleZoomCamara = function (e, img) {
                e.stopPropagation(); // Evita que se cierre el modal al tocar
                const container = document.getElementById('camaraImgContainer');
                window.esZoomCamara = !window.esZoomCamara;

                if (window.esZoomCamara) {
                    // Hacemos la foto gigante (250%)
                    img.style.width = '250%';
                    img.style.cursor = 'zoom-out';
                    document.getElementById('camaraZoomText').innerText = "Desliza para ver los detalles • Toca la foto para alejar";

                    // Centramos el scroll automáticamente en medio de la foto
                    setTimeout(() => {
                        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
                        container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
                    }, 50);
                } else {
                    // Volvemos al tamaño normal
                    img.style.width = '100%';
                    img.style.cursor = 'zoom-in';
                    document.getElementById('camaraZoomText').innerText = "Toca la foto para hacer zoom • Toca fuera para cerrar";
                }
            };


            async function toggleCamarasTrafico() {
                const btn = document.getElementById('btnToggleCamaras');
                camarasActivas = !camarasActivas;

                // CHIVATO: Activar/Desactivar botón de cámaras general
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'clic_boton_camaras_dgt', {
                        'event_category': 'Trafico',
                        'accion': camarasActivas ? 'Activar' : 'Desactivar'
                    });
                }


                if (camarasActivas) {
                    btn.classList.add('active');

                    if (!camarasCargadas) {
                        try {
                            // Mensaje de carga mientras descarga las cámaras
                            btn.innerHTML = '⏳';

                            const response = await fetch(WEB_APP_URL + "?accion=obtenerCamaras");
                            const data = await response.json();

                            if (data.error) throw new Error(data.error);

                            data.forEach(cam => {
                                let iconCam = L.divIcon({
                                    className: '',
                                    html: '<div style="background:#e74c3c; color:white; padding:4px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.4); border:1px solid white; display:flex; align-items:center; justify-content:center; width:22px; height:22px; font-size:14px;">🎥</div>',
                                    iconSize: [30, 30],
                                    iconAnchor: [15, 15]
                                });

                                let nombreReal = cam.nombre || "Cámara DGT";

                                // ESCUDO ANTI-ERRORES: Limpiamos el nombre para que el click nunca falle
                                let nombreSeguro = nombreReal.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                                // Anti-Caché: Para que la foto se actualice
                                let urlCamara = cam.url + "?t=" + new Date().getTime();

                                let popupContent = `
                        <div style="text-align:center; min-width: 250px;">
                            <h4 style="margin: 0 0 5px 0; color:#e74c3c; font-size:13px;">🎥 ${nombreReal}</h4>
                            <img src="${urlCamara}" alt="Cámara DGT" style="width:100%; border-radius:8px; border:1px solid var(--border-color); min-height: 150px; background: #eee; cursor: pointer; display:block;" onerror="this.src='https://via.placeholder.com/250x150.png?text=Cámara+no+disponible'" onclick="window.abrirCamaraCompleta(this.src, '${nombreSeguro}')">
                            <p style="font-size:10px; color:var(--text-muted); margin: 5px 0 0 0;">Toca la foto para ampliarla</p>
                        </div>
                    `;

                                let marker = L.marker([parseFloat(cam.lat.toString().replace(',', '.')), parseFloat(cam.lon.toString().replace(',', '.'))], { icon: iconCam, pane: "puntos_camaras" })
                                    .bindPopup(popupContent);

                                layerCamaras.addLayer(marker);
                            });
                            camarasCargadas = true;
                            btn.innerHTML = '🎥'; // Volvemos a poner la cámara

                        } catch (error) {
                            console.error("Error cargando cámaras:", error);
                            btn.innerHTML = '🎥';
                            alert("No se ha podido conectar con tu base de datos de cámaras.");
                        }
                    }
                    map.addLayer(layerCamaras);
                } else {
                    btn.classList.remove('active');
                    map.removeLayer(layerCamaras);
                }
            }

            async function mostrarTendenciaZona() {

                // CHIVATO: Ver gráfica de tendencias globales de la zona/provincia
                if (typeof gtag !== 'undefined') {
                    let fTN = document.getElementById("tipoCombustible").options[document.getElementById("tipoCombustible").selectedIndex].text;
                    gtag('event', 'ver_tendencias_zona', {
                        'event_category': 'Interaccion_Usuario',
                        'tipo_combustible': fTN // Así sabrás si miran más la tendencia del Diesel o de la Gasolina
                    });
                }
                if (!window.lastFiltradas || window.lastFiltradas.length === 0) {
                    alert("Busca primero gasolineras en una zona.");
                    return;
                }

                const topGasolineras = window.lastFiltradas.slice(0, 200);
                const idsEnPantalla = topGasolineras.map(g => g.IDEESS).join(",");
                const fT = document.getElementById("tipoCombustible").value;

                const modal = document.getElementById('chartModal');
                const st = document.getElementById('chartStatus');
                const ctxElement = document.getElementById('priceChart');

                modal.style.display = 'flex';
                document.getElementById('modalTitle').innerText = "📊 Tendencia de Variación";
                document.getElementById('modalHorario').innerText = "Subidas/Bajadas medias de " + topGasolineras.length + " gasolineras de la zona";

                document.getElementById('modalFavHeart').style.display = 'none';
                document.getElementById('chartTimeButtons').style.display = 'none';

                // --- DESTRUCTOR DE GRÁFICAS FANTASMA ---
                let chartExistente = Chart.getChart(ctxElement);
                if (chartExistente) chartExistente.destroy();
                if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
                // ---------------------------------------

                st.style.display = 'flex';
                document.getElementById('chartSpinner').style.display = 'block';
                document.getElementById('chartText').innerText = "Analizando el histórico de la zona...";

                try {
                    const url = WEB_APP_URL + "?accion=obtenerTendenciaMasiva&ids=" + idsEnPantalla + "&combustible=" + encodeURIComponent(fT);
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.error || !data.labels || data.labels.length === 0) {
                        throw new Error(data.error || "Datos insuficientes");
                    }

                    st.style.display = 'none';
                    document.getElementById('chartTimeButtons').style.display = 'flex';

                    const tColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333';
                    const gColor = document.body.classList.contains('dark-mode') ? '#333' : '#ddd';

                    // --- COLORES INFALIBLES (Nunca se pondrá azul) ---
                    const coloresFondo = data.datasets[0].data.map(val => val > 0 ? 'rgba(231, 76, 60, 0.7)' : 'rgba(39, 174, 96, 0.7)');
                    const coloresBorde = data.datasets[0].data.map(val => val > 0 ? '#c0392b' : '#1e7a44');

                    data.datasets[0].backgroundColor = coloresFondo;
                    data.datasets[0].borderColor = coloresBorde;
                    data.datasets[0].borderWidth = 2;
                    data.datasets[0].borderRadius = 4;

                    window.fullChartData = JSON.parse(JSON.stringify(data));

                    chartInstance = new Chart(ctxElement.getContext('2d'), {
                        type: 'bar',
                        data: data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            let val = context.parsed.y;
                                            let signo = val > 0 ? "+" : "";
                                            return " Diferencia: " + signo + val.toFixed(3) + " €/L";
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    ticks: { color: tColor },
                                    grid: {
                                        color: (context) => context.tick.value === 0 ? tColor : gColor,
                                        lineWidth: (context) => context.tick.value === 0 ? 2 : 1
                                    }
                                },
                                x: { ticks: { color: tColor }, grid: { display: false } }
                            }
                        }
                    });

                    const botonesTiempo = document.querySelectorAll('#chartTimeButtons .time-btn');
                    if (botonesTiempo.length > 2) {
                        updateChartRange(30, botonesTiempo[2]);
                    }

                } catch (e) {
                    document.getElementById('chartSpinner').style.display = 'none';
                    document.getElementById('chartText').innerHTML = "❌ Error al calcular la tendencia masiva.<br><small>" + e.message + "</small>";
                    console.error(e);
                }
            }

function activarSwipeModales() {
    const modales = document.querySelectorAll('.modal-bg');
    
    modales.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        if (!content) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let haHabidoMovimiento = false; // Nueva marca para saber si el usuario ha arrastrado de verdad
        
        content.addEventListener('touchstart', e => {
            let listaInterior = e.target.closest('[style*="overflow-y:auto"], [style*="overflow-y: auto"]');
            if (listaInterior && listaInterior.scrollTop > 5) return;

            if (content.scrollTop > 5) {
                isDragging = false;
                return;
            }

            startY = e.touches[0].clientY;
            currentY = startY; // Sincronizamos para limpiar cualquier memoria antigua
            isDragging = true;
            haHabidoMovimiento = false; // Al empezar el toque, asumimos que aún no se mueve
            content.style.transition = 'none';
        }, { passive: true });
        
        content.addEventListener('touchmove', e => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            let deltaY = currentY - startY;
            
            if (deltaY > 0) {
                haHabidoMovimiento = true; // Confirmamos que el dedo se está desplazando hacia abajo
                content.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });
        
        content.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Si solo ha sido un toque rápido (clic sin arrastrar), cancelamos el cierre automático
            if (!haHabidoMovimiento) {
                content.style.transform = '';
                return;
            }
            
            let deltaY = currentY - startY;
            content.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
            if (deltaY > 120) {
                modal.style.display = 'none';
                setTimeout(() => { content.style.transform = ''; }, 300);
            } else {
                content.style.transform = '';
            }
            startY = 0;
            currentY = 0;
        });
    });
}

            // --- NUEVO: BOTÓN SUBIR Y OCULTAR LISTA ---
            const listCont = q('list-container');
            
            // Botón flotante de subir
            listCont.addEventListener('scroll', function() {
                const btnSubir = q('btnSubir');
                if(this.scrollTop > 350) btnSubir.style.display = 'flex';
                else btnSubir.style.display = 'none';
            });

            // Arrastrar lista hacia abajo para ver el mapa
            let startYList = 0, currentYList = 0, isDraggingList = false;

            listCont.addEventListener('touchstart', e => {
                // ESCUDO ANTI-FANTASMAS: No arrastramos si tocamos un desplegable, input o botón
                const ignorarTags = ['SELECT', 'BUTTON', 'INPUT', 'A'];
                if (e.target && ignorarTags.includes(e.target.tagName)) return;
                if (e.target.closest('button') || e.target.closest('select')) return;

                if (listCont.scrollTop <= 5) { // Solo si la lista está arriba del todo
                    startYList = e.touches[0].clientY;
                    currentYList = startYList; // <-- REINICIO CLAVE (Evita que sume swipes anteriores)
                    isDraggingList = true;
                    listCont.style.transition = 'none';
                }
            }, { passive: true });

            // Evento 2: Arrastrar el dedo
            listCont.addEventListener('touchmove', e => {
                if (!isDraggingList) return;
                currentYList = e.touches[0].clientY;
                let delta = currentYList - startYList;
                if (delta > 0) {
                    listCont.style.transform = `translateY(${delta}px)`;
                    // ESCUDO: Evitamos que el navegador tire de la página entera hacia arriba
                    if (e.cancelable) e.preventDefault(); 
                }
            }, { passive: false });

            // Evento 3: Soltar el dedo
            listCont.addEventListener('touchend', () => {
                if (!isDraggingList) return;
                isDraggingList = false;
                let delta = currentYList - startYList;
                listCont.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                
                if (delta > 120) { 
                    listCont.classList.add('hidden-down');
                    document.body.classList.add('map-full');
                    q('btnVerLista').style.display = 'flex';
                    q('btnSubir').style.display = 'none'; // ¡Escondemos la flecha!
                    vibrar(60);

                    // MAGIA ANTI HUECO GRIS: Obligamos al mapa a pintar las calles
                    let mapFix = setInterval(() => { if(map) map.invalidateSize(); }, 50);
                    setTimeout(() => clearInterval(mapFix), 450);
                }
                listCont.style.transform = ''; 
                
                // Limpiamos memoria para el próximo toque
                startYList = 0;
                currentYList = 0;
            });
            
                        // --- NUEVA IDEA: SISTEMA DE COMPARTIR NATIVO ---
            window.compartirNativo = function(nombre, textoCodificado) {
                // El texto nos llega codificado para URLs, lo decodificamos a texto normal
                let textoReal = decodeURIComponent(textoCodificado);
                
                if (navigator.share) {
                    // Si el móvil lo soporta, abrimos el menú nativo de Android/iOS
                    navigator.share({
                        title: 'Precio en ' + nombre,
                        text: textoReal
                    }).catch(console.error); // Ignoramos el error si el usuario le da a "Cancelar"
                } else {
                    // Plan B (Para PCs o navegadores antiguos): Copiamos el texto y mostramos un Toast
                    navigator.clipboard.writeText(textoReal).then(() => {
                        if (typeof mostrarToast === 'function') {
                            mostrarToast("📋 ¡Copiado para compartir!");
                        } else {
                            alert("¡Texto copiado al portapapeles!");
                        }
                    });
                }
            };


                        // Función para el nuevo botón verde de Mostrar Lista
            window.restaurarLista = function() {
                listCont.classList.remove('hidden-down');
                document.body.classList.remove('map-full')
                q('btnVerLista').style.display = 'none';
                // Si la lista ya estaba escroleada hacia abajo, recuperamos la flecha
                if (listCont.scrollTop > 350) q('btnSubir').style.display = 'flex';
                vibrar(30);

                
                // MAGIA ANTI HUECO GRIS
                let mapFix = setInterval(() => { if(map) map.invalidateSize(); }, 50);
                setTimeout(() => clearInterval(mapFix), 450);
            };


            // --- IDEA 1: SISTEMA DE TOASTS (Avisos Premium) ---
            window.mostrarToast = function(msg) {
                const t = q('toastBox');
                if(!t) return;
                
                t.innerText = msg;
                let bg = 'var(--accent-green)';
                if(msg.includes('❌') || msg.includes('⚠️')) bg = '#e74c3c';
                
                t.style.background = bg;
                t.style.bottom = "85px"; // Por encima de la barra inferior
                vibrar(50);
                
                clearTimeout(window.toastTimer);
                window.toastTimer = setTimeout(() => { t.style.bottom = "-100px"; }, 3500);
            };

            // TRUCAZO: Sobrescribimos el `alert` antiguo para que TODA la app use el Toast sin tener que cambiar el código línea por línea
            window.alert = function(msg) {
                mostrarToast(msg);
            };

            // --- ESCUDO ANTI CLICKS FANTASMA EN MODALES ---
            document.querySelectorAll('.modal-bg').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    // Si el usuario toca exactamente el fondo oscuro, cerramos la ventana
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                    e.stopPropagation(); // Evitamos que el click llegue al mapa que hay debajo
                });
                modal.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                }, {passive: true});
            });

            // --- CALCULADORA DE MEDIA NACIONAL EN TIEMPO REAL ---
            window.calcularMediaNacional = function () {
                if (!cacheGasolineras || cacheGasolineras.length === 0) return;

                const fT = document.getElementById("tipoCombustible").value;
                const fTN = document.getElementById("tipoCombustible").options[document.getElementById("tipoCombustible").selectedIndex].text;

                let suma = 0;
                let contador = 0;

                cacheGasolineras.forEach(g => {
                    let precioStr = (fT === "AdBlue") ? g["AdBlue"] : g[fT];

                    if (precioStr) {
                        let precio = parseFloat(precioStr.replace(",", "."));
                        // Filtramos precios a cero o errores para que la media sea exacta
                        if (!isNaN(precio) && precio > 0.1 && precio < 5) {
                            suma += precio;
                            contador++;
                        }
                    }
                });

                if (contador > 0) {
                    let media = suma / contador;
                    let divMedia = document.getElementById("mediaNacionalTop");
                    if (divMedia) {
                        divMedia.innerHTML = `🇪🇸 Media en España (${fTN}): <b style="color:var(--text-main); font-size:13px;">${media.toFixed(3)} €/L</b>`;
                    }
                }
            };

                        // ==========================================================
            // SISTEMA DE MINI-TUTORIAL (ONBOARDING)
            // ==========================================================
            let pasoTutorialActivo = 1;

            window.mostrarPasoTutorial = function(paso) {
                document.getElementById('tut-step-1').style.display = paso === 1 ? 'block' : 'none';
                document.getElementById('tut-step-2').style.display = paso === 2 ? 'block' : 'none';
                document.getElementById('tut-step-3').style.display = paso === 3 ? 'block' : 'none';
                document.getElementById('tut-step-4').style.display = paso === 4 ? 'block' : 'none';
                document.getElementById('tut-step-5').style.display = paso === 5 ? 'block' : 'none';
                document.getElementById('tut-step-6').style.display = paso === 6 ? 'block' : 'none';
                
                const dots = document.querySelectorAll('.tut-dot');
                dots.forEach((dot, index) => {
                    if (paso === 1) dot.style.background = (index === 0) ? 'var(--accent)' : 'var(--border-color)';
                    if (paso === 2) dot.style.background = (index === 1) ? 'var(--accent-orange)' : 'var(--border-color)';
                    if (paso === 3) dot.style.background = (index === 2) ? 'var(--accent-green)' : 'var(--border-color)';
                    if (paso === 4) dot.style.background = (index === 3) ? '#9b59b6' : 'var(--border-color)';
                    if (paso === 5) dot.style.background = (index === 4) ? '#e74c3c' : 'var(--border-color)';
                    if (paso === 6) dot.style.background = (index === 5) ? '#3498db' : 'var(--border-color)';
                });

                const btn = document.getElementById('btnTutNext');
                if (paso === 6) {
                    btn.innerText = "¡Empezar a ahorrar! 🚀";
                    btn.style.background = "#3498db"; // Azul Taller para finalizar
                } else {
                    btn.innerText = "Siguiente ➡️";
                    if (paso === 1) btn.style.background = "var(--accent)"; 
                    if (paso === 2) btn.style.background = "var(--accent-orange)"; 
                    if (paso === 3) btn.style.background = "var(--accent-green)"; 
                    if (paso === 4) btn.style.background = "#9b59b6"; 
                    if (paso === 5) btn.style.background = "#e74c3c";
                }
            };

            window.avanzarTutorial = function() {
                if (typeof vibrar === 'function') vibrar(30);
                if (pasoTutorialActivo < 6) {
                    pasoTutorialActivo++;
                    mostrarPasoTutorial(pasoTutorialActivo);
                } else {
                    cerrarTutorial();
                }
            };


                        // ==========================================================
            // MOTOR PREDICTIVO (SEMÁFORO INTELIGENTE DESGLOSADO)
            // ==========================================================
            window.calcularSemaforoPredictivo = function(precio, tData) {
                let score = 0; 
                let detalleInercia = { txt: "Estable (Últimos 7 días sin cambios graves)", color: "var(--text-muted)", icon: "⚖️" };
                if (tData) {
                    if (tData.dir === 1) { score += 1.5; detalleInercia = { txt: "Ligera tendencia alcista (Subiendo)", color: "#e74c3c", icon: "📈" }; }
                    if (tData.dir === -1) { score -= 1.5; detalleInercia = { txt: "Ligera tendencia bajista (Bajando)", color: "var(--accent-green)", icon: "📉" }; }
                    
                    // Análisis extendido a 7 días
                    if (tData.c >= 7 && tData.dir === 1) { score += 2; detalleInercia = { txt: "Alerta: Lleva 7 días subiendo", color: "#c0392b", icon: "🚀" }; }
                    else if (tData.c >= 3 && tData.dir === 1) { score += 1; detalleInercia = { txt: "Inercia alcista sostenida (+3 días)", color: "#e74c3c", icon: "📈" }; }
                    
                    if (tData.c >= 7 && tData.dir === -1) { score -= 2; detalleInercia = { txt: "Gran bajada: Lleva 7 días bajando", color: "#1e7a44", icon: "⏬" }; }
                    else if (tData.c >= 3 && tData.dir === -1) { score -= 1; detalleInercia = { txt: "Inercia bajista sostenida (+3 días)", color: "var(--accent-green)", icon: "📉" }; }
                }
                
                let hoy = new Date(); let dia = hoy.getDay(); 
                let detalleSemana = { txt: "Día neutro para repostar", color: "var(--text-muted)", icon: "📅" };
                if (dia === 4 || dia === 5) { score += 1.5; detalleSemana = { txt: "Jueves/Viernes (Suelen subir precios)", color: "#e74c3c", icon: "⚠️" }; }
                if (dia === 0 || dia === 6) { score -= 1.5; detalleSemana = { txt: "Fin de semana (Suelen bajar el lunes)", color: "var(--accent-green)", icon: "📉" }; }
                
                let mes = hoy.getMonth(); let diaMes = hoy.getDate();
                let detalleCalendario = { txt: "Mes normal de demanda", color: "var(--text-muted)", icon: "🛣️" };
                
                // 1. VERANO (Julio/Agosto y Quincena)
                if ((mes === 6 || mes === 7) && (diaMes >= 28 || diaMes <= 3 || (diaMes >= 13 && diaMes <= 16))) { 
                    score += 2.5; detalleCalendario = { txt: "Operación Salida (Verano)", color: "#e74c3c", icon: "🏖️" }; 
                } 
                
                // 2. SEMANA SANTA (Cálculo matemático exacto para cualquier año)
                let y = hoy.getFullYear();
                let a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), n = h + l - 7 * m + 114;
                let mesPascua = Math.floor(n / 31) - 1; let diaPascua = (n % 31) + 1;
                let domingoResurreccion = new Date(y, mesPascua, diaPascua);
                let diasParaPascua = (domingoResurreccion - hoy) / (1000 * 60 * 60 * 24);
                
                // Si faltan entre 2 y 12 días para el Domingo de Resurrección (Abarca desde el Viernes de Dolores hasta el Jueves Santo)
                if (diasParaPascua >= 2 && diasParaPascua <= 12) { 
                    score += 2.5; detalleCalendario = { txt: "Operación Salida (Semana Santa)", color: "#e74c3c", icon: "⛪" }; 
                }
                
                // 3. PUENTES NACIONALES Y NAVIDAD EN ESPAÑA
                // Puente de Mayo (1 de mayo) -> Alerta del 27 al 30 de abril
                if (mes === 3 && diaMes >= 27) { score += 2; detalleCalendario = { txt: "Operación Salida (Puente de Mayo)", color: "#e74c3c", icon: "🎒" }; }
                // Puente del Pilar / Hispanidad (12 de Octubre) -> Alerta del 8 al 11
                if (mes === 8 && diaMes >= 8 && diaMes <= 11) { score += 2; detalleCalendario = { txt: "Operación Salida (Puente del Pilar)", color: "#e74c3c", icon: "🎒" }; }
                // Todos los Santos (1 de Noviembre) -> Alerta del 28 al 31 de octubre
                if (mes === 9 && diaMes >= 28) { score += 2; detalleCalendario = { txt: "Operación Salida (Todos los Santos)", color: "#e74c3c", icon: "🎒" }; }
                // Constitución e Inmaculada (6 y 8 de Diciembre) -> Alerta del 2 al 5 de diciembre
                if (mes === 10 && diaMes >= 2 && diaMes <= 5) { score += 2.5; detalleCalendario = { txt: "Operación Salida (Puente de Diciembre)", color: "#e74c3c", icon: "❄️" }; }
                // Navidades (Nochebuena y Nochevieja) -> Alerta del 20 al 23 y del 27 al 30 de diciembre
                if (mes === 11 && ((diaMes >= 20 && diaMes <= 23) || (diaMes >= 27 && diaMes <= 30))) { score += 2.5; detalleCalendario = { txt: "Operación Salida (Navidad)", color: "#e74c3c", icon: "🎄" }; }

                let resultado;
                if (score >= 2) resultado = { color: "var(--accent-green)", icon: "🟢", texto: "LLENAR HOY (Prev. Subida)" };
                else if (score <= -1.5) resultado = { color: "#e74c3c", icon: "🔴", texto: "ESPERAR (Prev. Bajada)" };
                else resultado = { color: "#f39c12", icon: "🟡", texto: "ESTABLE (Sin alertas)" };

                return { resultado: resultado, detalles: { inercia: detalleInercia, semana: detalleSemana, calendario: detalleCalendario } };
            };
            
            window.abrirInfoPrediccion = function(e, nombre, jsonDetalles, icon, texto, color) {
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
            };

            window.cerrarTutorial = function() {
                document.getElementById('tutorialModal').style.display = 'none';
                localStorage.setItem('gasofa_tutorial_visto', 'true');
            };
                       // ==========================================================
            // LÓGICA V2: HISTORIAL DE TALLER Y MANTENIMIENTO
            // ==========================================================

            // COMPRESOR DE IMÁGENES GRATUITO (Convierte fotos pesadas a texto ultraligero Base64)
            window.comprimirImagenBase64 = function(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = event => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800; // Resolución ideal para tickets
                            const MAX_HEIGHT = 800;
                            let width = img.width; let height = img.height;

                            if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                            else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                            
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.6)); // Se comprime al 60% de calidad
                        };
                        img.onerror = error => reject(error);
                    };
                    reader.onerror = error => reject(error);
                });
            };

            window.abrirTaller = function() {
                let carSelect = q('tallerCarSelect');
                carSelect.innerHTML = '<option value="">🚘 Selecciona el vehículo...</option>';
                myCars.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
                let activeCar = q('activeCarSelect') ? q('activeCarSelect').value : "";
                if (activeCar) carSelect.value = activeCar;

                q('tallerFecha').value = getHoyYMD(); q('editTallerId').value = "";
                q('tallerKm').value = ""; q('tallerCoste').value = ""; q('tallerNotas').value = "";
                if(q('tallerFactura')) q('tallerFactura').value = ""; // Limpia la foto
                if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional"; // Limpia el texto
                if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸"; // Limpia el icono

                if(typeof renderTaller === 'function') renderTaller();
                q('tallerModal').style.display = 'flex';
            };

            window.guardarTaller = async function() {
            if (typeof gtag === 'function') {
    let tipoParaChivato = document.getElementById('tallerTipo') ? document.getElementById('tallerTipo').value : 'Desconocido';
    let tieneFoto = (document.getElementById('tallerFactura') && document.getElementById('tallerFactura').files.length > 0) ? 'Sí' : 'No';
    gtag('event', 'guardar_gasto_taller', { 'tipo_reparacion': tipoParaChivato, 'sube_factura': tieneFoto });
}

                let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];

                let idEdit = q('editTallerId').value;
                let carId = q('tallerCarSelect').value;
                let fecha = q('tallerFecha').value;
                let km = parseFloat(q('tallerKm').value) || 0;
                let tipo = q('tallerTipo').value;
                let coste = parseFloat(q('tallerCoste').value);
                let notas = q('tallerNotas').value.trim();

                if (!carId || isNaN(coste)) { alert("⚠️ Selecciona un vehículo y escribe el coste."); return; }
                
                // 🔒 Candado de sesión obligatorio si quieren guardar taller
                if (!window.auth || !window.auth.currentUser) {
                    alert("⚠️ Inicia sesión en 'Mi Perfil' para poder guardar gastos en la nube.");
                    return;
                }

                let foundCar = myCars.find(c => String(c.id) === String(carId));
                let carName = foundCar ? foundCar.name : "Vehículo";
                let fechaEs = ymdToEs(fecha);

                // --- MAGIA: GESTIÓN DE LA FOTO ---
                let fotoBase64 = "";
                if (idEdit !== "") { // Rescatar foto antigua si estábamos editando
                    let oldRecord = mantLocal.find(m => String(m.id) === String(idEdit));
                    if (oldRecord && oldRecord.factura) fotoBase64 = oldRecord.factura;
                }

                const fileInput = q('tallerFactura');
                if (fileInput && fileInput.files.length > 0) {
                    try {
                        const loading = document.getElementById('loading-overlay');
                        if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Comprimiendo factura..."; }
                        
                        fotoBase64 = await comprimirImagenBase64(fileInput.files[0]);
                        
                        if(loading) loading.style.display = "none";
                    } catch(err) {
                        if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
                        alert("❌ Error al leer la imagen de tu móvil."); return;
                    }
                }
                // ---------------------------------

                if (idEdit !== "") {
                    let index = mantLocal.findIndex(m => String(m.id) === String(idEdit));
                    if (index > -1) mantLocal[index] = { id: parseInt(idEdit), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoBase64 };
                } else {
                    mantLocal.push({ id: Date.now(), carId, carName, fecha: fechaEs, km, tipo, coste, notas, factura: fotoBase64 });
                }

                mantLocal.sort((a, b) => new Date(esToYMD(b.fecha)) - new Date(esToYMD(a.fecha)));
                localStorage.setItem('gasofa_taller', JSON.stringify(mantLocal));

                                // ☁️ SUBIDA A LA NUBE
                if (window.auth && window.auth.currentUser) {
                    let sizeStr = JSON.stringify(mantLocal).length;
                    if (sizeStr > 800000) alert("⚠️ Tienes muchas fotos guardadas. Pronto llegarás al límite de espacio de tu historial. Considera borrar facturas muy antiguas.");
                    window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), {
                        miTaller: mantLocal
                    }, { merge: true }).catch(e => console.error("Error nube Taller:", e));

                    // NUEVO: SI EL COCHE ES COMPARTIDO, ENVIAMOS EL TALLER AL BUZÓN COMÚN
                    if (carId) {
                        let cocheActual = myCars.find(c => String(c.id) === String(carId));
                        if (cocheActual && cocheActual.compartido) {
                            let tallerEsteCoche = mantLocal.filter(m => String(m.carId) === String(carId));
                            window.setDoc(window.doc(window.db, "gastos_compartidos", String(carId)), {
                                taller: tallerEsteCoche
                            }, { merge: true });
                        }
                    }
                }


                q('editTallerId').value = ""; q('tallerCoste').value = ""; q('tallerNotas').value = "";
                if(q('tallerFactura')) q('tallerFactura').value = "";
                if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional";
                if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸";
                
                if(typeof renderTaller === 'function') renderTaller();
                if(q('historialModal') && q('historialModal').style.display === 'flex') {
                    if(typeof actualizarListaHistorial === 'function') actualizarListaHistorial();
                }
                q('tallerModal').style.display = 'none';
            };

            window.editarTaller = function(id, desdeHistorial = false) {
                let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                let record = mantLocal.find(m => String(m.id) === String(id));
                if (record) {
                    if (desdeHistorial) q('historialModal').style.display = 'none';
                    else q('tallerModal').style.display = 'none';

                    q('editTallerId').value = id;
                    let carSelect = q('tallerCarSelect');
                    carSelect.innerHTML = '<option value="">🚘 Selecciona el vehículo...</option>';
                    myCars.forEach(c => { carSelect.innerHTML += `<option value="${c.id}">🚗 ${c.name}</option>`; });
                    
                    q('tallerCarSelect').value = record.carId; q('tallerFecha').value = esToYMD(record.fecha);
                    q('tallerKm').value = record.km || ""; q('tallerTipo').value = record.tipo;
                    q('tallerCoste').value = record.coste; q('tallerNotas').value = record.notas || "";
                    if(q('tallerFactura')) q('tallerFactura').value = ""; // Limpiamos el cajón visual
                    if(q('textoEstadoFoto')) q('textoEstadoFoto').innerText = "Opcional";
                    if(q('iconoEstadoFoto')) q('iconoEstadoFoto').innerText = "📸";

                    q('tallerModal').style.display = 'flex';
                }
            };

            

            window.borrarTaller = function(id, desdeHistorial = false) {
                let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                let registro = mantLocal.find(m => String(m.id) === String(id));
                
                if (registro) {
                    let cocheGasto = myCars.find(c => String(c.id) === String(registro.carId));
                    if (cocheGasto && cocheGasto.compartido && cocheGasto.name.startsWith("🤝 ")) {
                        alert("⚠️ Solo el administrador (creador) del vehículo puede borrar este gasto de taller.");
                        return;
                    }
                }

                if (confirm("¿Borrar este gasto de taller?")) {
                    let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                    
                    // 1. Averiguamos de qué coche era este gasto ANTES de borrarlo
                    let carIdDelGasto = mantLocal.find(m => String(m.id) === String(id))?.carId;

                    // 2. Lo borramos localmente
                    mantLocal = mantLocal.filter(m => String(m.id) !== String(id));
                    localStorage.setItem('gasofa_taller', JSON.stringify(mantLocal));
                    
                    // 3. Lo borramos de la nube
                    if (window.auth && window.auth.currentUser) {
                        window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { miTaller: mantLocal }, { merge: true });
                        
                        // 4. NUEVO: Si el coche era compartido, actualizamos el buzón común
                        if (carIdDelGasto) {
                            let cocheActual = myCars.find(c => String(c.id) === String(carIdDelGasto));
                            if (cocheActual && cocheActual.compartido) {
                                let tallerEsteCoche = mantLocal.filter(m => String(m.carId) === String(carIdDelGasto));
                                window.setDoc(window.doc(window.db, "gastos_compartidos", String(carIdDelGasto)), { 
                                    taller: tallerEsteCoche 
                                }, { merge: true });
                            }
                        }
                    }
                    
                    if(typeof renderTaller === 'function') renderTaller();
                    if(desdeHistorial && typeof actualizarListaHistorial === 'function') actualizarListaHistorial();
                }
            };

                         window.renderTaller = function() { 
                // Vaciada porque ahora los gastos del taller se ven en el Historial 
            };
                

            // ==========================================================
            // LÓGICA V2: PERFIL DE USUARIO Y LOGIN DE FIREBASE
            // ==========================================================
            window.abrirPerfil = function() {
                // Quitamos la clase 'active' de todos los botones inferiores y se la damos al perfil
                document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
                const btnPerfil = q("nav-perfil");
                if(btnPerfil) btnPerfil.classList.add('active');
                
                // Cerramos el panel de filtros si estuviera abierto
                if (!q("controls").classList.contains("collapsed")) toggleControls();
                
                q('perfilModal').style.display = 'flex';
            };

            window.cerrarPerfil = function() {
                q('perfilModal').style.display = 'none';
                // Devolvemos el color activo al modo en el que estemos (zona, ruta o provincia)
                document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
                if(q("nav-" + searchMode)) q("nav-" + searchMode).classList.add('active');
            };

            window.loginConGoogleUI = async function() {
            if (typeof gtag === 'function') gtag('event', 'login', { 'metodo': 'Google' });

                if(!window.auth || !window.googleProvider) {
                    mostrarToast("⏳ Conectando con el servidor, un segundo...");
                    return;
                }
                try {
                    q("loading-overlay").style.display = "flex";
                    q("loading-text").innerText = "Iniciando sesión...";
                    await window.signInWithPopup(window.auth, window.googleProvider);
                    q("loading-overlay").style.display = "none";
                    mostrarToast("✅ ¡Bienvenido!");
                } catch (error) {
                    q("loading-overlay").style.display = "none";
                    mostrarToast("❌ Error al iniciar sesión");
                    console.error("Error Login:", error);
                }
            };

            window.logoutUI = async function() {
                if(confirm("¿Seguro que quieres cerrar sesión? Tus datos locales no se borrarán.")){
                    try {
                        await window.signOut(window.auth);
                        mostrarToast("👋 Sesión cerrada");
                    } catch (error) {
                        console.error("Error Logout:", error);
                    }
                }
            };
           
                  // ==========================================================
            // GARAJE COMPARTIDO MULTIUSUARIO
            // ==========================================================
            window.generarCodigoCompartir = async function(idCoche) {
            if (typeof gtag === 'function') gtag('event', 'compartir_coche_generar');

                if (!window.auth || !window.auth.currentUser) {
                    alert("⚠️ Inicia sesión en 'Mi Perfil' para compartir tu vehículo.");
                    return;
                }
                const coche = myCars.find(c => String(c.id) === String(idCoche));
                if (!coche) return;

                // ACTIVAMOS EL MODO COMPARTIDO PARA ESTE COCHE
                coche.compartido = true;
                localStorage.setItem('gasofa_cars', JSON.stringify(myCars));
                await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), { misCoches: myCars }, { merge: true });

                           // VOLCAMOS EL HISTORIAL PREVIO AL BUZÓN COMPARTIDO
            let gastosPrevios = bitacora.filter(b => String(b.carId) === String(idCoche));
            let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
            let tallerPrevio = mantLocal.filter(m => String(m.carId) === String(idCoche));

            if (gastosPrevios.length > 0 || tallerPrevio.length > 0) {
                await window.setDoc(window.doc(window.db, "gastos_compartidos", String(idCoche)), {
                    repostajes: gastosPrevios,
                    taller: tallerPrevio
                }, { merge: true }).catch(e => console.error("Error volcando historial previo:", e));
            }

                 // ENCENDEMOS EL RADAR DE ESTE COCHE AL INSTANTE
                if(typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();

                // Generamos un código aleatorio de 8 caracteres complejos
                const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
                let codigo = '';
                for (let i = 0; i < 8; i++) {
                    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
                }

                try {
                    const loading = document.getElementById('loading-overlay');
                    if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Generando invitación..."; }

                    // Guardamos el código en una carpeta pública temporal "invitaciones"
                    await window.setDoc(window.doc(window.db, "invitaciones", codigo), {
                        cocheData: coche,
                        creador: window.auth.currentUser.uid,
                        fecha: Date.now()
                    });

                    if(loading) loading.style.display = "none";
                    
                    // Mostramos el código
                    prompt(`✅ ¡Vehículo listo para compartir!\n\nPásale este código a tu familiar/empleado. (Solo se puede usar 1 vez):`, codigo);
                    
                } catch (error) {
                    if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
                    alert("❌ Error al conectar con el servidor. Revisa tu internet.");
                }
            };

            window.unirseCocheCompartido = async function() {
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

                    // Buscamos el código en la nube
                    const docRef = window.doc(window.db, "invitaciones", codigo);
                    const docSnap = await window.getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const cocheInvitacion = data.cocheData;

                        // Comprobar si ya tienes este coche (para evitar duplicados)
                        if (myCars.find(c => String(c.id) === String(cocheInvitacion.id))) {
                            if(loading) loading.style.display = "none";
                            alert("⚠️ Ya tienes este coche en tu garaje.");
                            return;
                        }

                        // Le ponemos una marca para saber que es un coche compartido
                        cocheInvitacion.name = "🤝 " + cocheInvitacion.name; 
                        cocheInvitacion.compartido = true; // Aseguramos que el invitado tenga permisos de escritura global

                        myCars.push(cocheInvitacion);
                        localStorage.setItem('gasofa_cars', JSON.stringify(myCars));

                        // Guardar en la nube del invitado
                        await window.setDoc(window.doc(window.db, "usuarios", window.auth.currentUser.uid), {
                            misCoches: myCars
                        }, { merge: true });

                        // ¡SEGURIDAD: DESTRUIR LA INVITACIÓN!
                        await window.deleteDoc(docRef);

                        if(loading) loading.style.display = "none";
                        if (typeof window.iniciarRadaresCompartidos === 'function') window.iniciarRadaresCompartidos();
                        
                        alert(`🚗 ¡Perfecto! Te has unido a: ${cocheInvitacion.name}`);
                        
                        input.value = "";
                        if (typeof renderCars === 'function') renderCars();
                        if (typeof updateCarSelect === 'function') updateCarSelect();

                    } else {
                        if(loading) loading.style.display = "none";
                        alert("❌ El código no existe o ya ha sido utilizado por otra persona.");
                    }

                } catch (error) {
                    if(document.getElementById('loading-overlay')) document.getElementById('loading-overlay').style.display = "none";
                    alert("❌ Error al conectar con el servidor.");
                }
            };
    
                // ==========================================================
            // CREADOR DE INFORMES PDF (CON IVA)
            // ==========================================================
            window.descargarPDFHistorial = function() {
            if (typeof gtag === 'function') gtag('event', 'descargar_pdf_informe');

                const loading = document.getElementById('loading-overlay');
                if(loading) { loading.style.display = "flex"; document.getElementById('loading-text').innerText = "Generando PDF..."; }
                
                // 1. Qué estamos viendo ahora mismo en pantalla
                let filterCarId = q('historialCarFilter').value;
                let filterTipo = q('historialTipoFilter') ? q('historialTipoFilter').value : 'all';
                let filterMes = q('historialMesFilter') ? q('historialMesFilter').value : 'all';
                
                let textCoche = q('historialCarFilter').options[q('historialCarFilter').selectedIndex].text;
                let textMes = q('historialMesFilter').options[q('historialMesFilter').selectedIndex].text;

                // 2. Extraer datos (Igual que en la pantalla)
                let filtradosGas = filterCarId === "all" ? bitacora : bitacora.filter(b => String(b.carId) === String(filterCarId));
                let mantenimientoAct = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
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

                combined.sort((a, b) => new Date(esToYMD(b.date)).getTime() - new Date(esToYMD(a.date)).getTime());

                if (combined.length === 0) {
                    if(loading) loading.style.display = "none";
                    alert("⚠️ No hay gastos en este periodo para hacer el informe.");
                    return;
                }

                // 3. Rellenar las etiquetas del folio invisible
                q('pdfFiltroCoche').innerText = textCoche.replace('🚗 ', '');
                q('pdfFiltroMes').innerText = textMes.replace('📅 ', '');
                q('pdfFechaEmision').innerText = new Date().toLocaleDateString('es-ES');

                // 4. Echar una foto a la gráfica de Chart.js y ponerla en el folio
                let canvas = q('gastosChart');
                let imgGrafica = q('pdfGraficaImg');
                if (canvas && canvas.style.display !== 'none' && combined.length > 0) {
                    // Ponemos el fondo blanco por si acaso, para que no salga transparente en el PDF
                    let ctx = canvas.getContext('2d');
                    ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
                    
                    imgGrafica.src = canvas.toDataURL("image/jpeg", 1.0);
                    imgGrafica.style.display = 'block';
                } else {
                    imgGrafica.style.display = 'none';
                }

                                     // 5. Rellenar la tabla y añadir la fila de totales directamente
                let tbody = q('pdfTablaBody');
                let totalSuma = 0;
                let htmlAcumuladoPDF = ''; 

                combined.forEach(item => {
                    let concepto = item.type === 'gas' ? `⛽ Repostaje (${item.obj.nombre})` : `🔧 Taller (${item.obj.tipo})`;
                    
                    let usuarioSeguro = item.obj.usuario ? window.escaparHTML(item.obj.usuario) : '';
                    let pagador = usuarioSeguro ? `<br><small style="color:#777">👤 ${usuarioSeguro}</small>` : '';
                    
                    let cocheLimpio = item.obj.carName ? window.escaparHTML(item.obj.carName) : "-";
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

                               // CALCULAMOS LOS TOTALES FINALES
                let totalBase = totalSuma / 1.21;
                let totalIVA = totalSuma - totalBase;

                // CREAMOS UN ESTILO A PRUEBA DE CORTES PARA LAS CELDAS
                let estiloCelda = "padding: 14px 8px; font-weight: bold; font-size: 13px; border-top: 2px solid #1e7a44; border-bottom: 2px solid #1e7a44; line-height: 1.2;";

                // INYECTAMOS LA FILA DE TOTALES EXACTAMENTE COMO UNA FILA MÁS DE LA TABLA
                htmlAcumuladoPDF += `
                    <tr style="background-color: #f9fafb;">
                        <td colspan="3" style="text-align: right; ${estiloCelda}">TOTALES:</td>
                        <td style="text-align: right; ${estiloCelda}">${totalBase.toFixed(2)} €</td>
                        <td style="text-align: right; ${estiloCelda}">${totalIVA.toFixed(2)} €</td>
                        <td style="text-align: right; color: #e74c3c; ${estiloCelda}">${totalSuma.toFixed(2)} €</td>
                    </tr>
                `;

                // Volcamos todo de golpe al folio (Nuestra optimización de rendimiento)
                tbody.innerHTML = htmlAcumuladoPDF;

          

                // 6. Imprimir! (Llamamos a la librería html2pdf)
                let elemento = q('plantillaPDF');
                let opt = {
                    margin:       0,
                    filename:     `Informe_${textCoche.replace(/ /g, '_')}_${textMes.replace(/ /g, '_')}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(elemento).save().then(() => {
                    if(loading) loading.style.display = "none";
                    mostrarToast("📄 ¡PDF generado con éxito!");
                }).catch(err => {
                    if(loading) loading.style.display = "none";
                    alert("❌ Error al generar el PDF.");
                    console.error(err);
                });
            };

           window.iniciarRadaresCompartidos = function() {
    if (!window.auth || !window.auth.currentUser) return;
    
    // 1. Apagamos radares viejos para evitar duplicados
    if (window.radaresActivos) {
        window.radaresActivos.forEach(apagar => apagar());
    }
    window.radaresActivos = [];

    // 2. Encendemos el radar solo para coches compartidos
    if (myCars && myCars.length > 0) {
        myCars.forEach(car => {
            if (!car.compartido) return;

            let apagarRadar = window.onSnapshot(window.doc(window.db, "gastos_compartidos", String(car.id)), (docSnapCompartido) => {
                if (docSnapCompartido.exists()) {
                    let dataCompartida = docSnapCompartido.data();
                    let huboCambiosUI = false;

                    // --- 1. REPOSTAJES COMBUSTIBLE (Añadir, Editar y Borrar) ---
                    if (dataCompartida.repostajes) {
                        let viejaStr = JSON.stringify(bitacora.filter(b => String(b.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.repostajes);
                        
                        if (viejaStr !== nuevaStr) {
                            let nuevaBitacora = bitacora.filter(b => String(b.carId) !== String(car.id));
                            nuevaBitacora = nuevaBitacora.concat(dataCompartida.repostajes);
                            bitacora = nuevaBitacora;
                            bitacora.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem('gasofa_bitacora', JSON.stringify(bitacora));
                            huboCambiosUI = true;
                        }
                    }

                    // --- 2. GASTOS DE TALLER (Añadir, Editar y Borrar) ---
                    if (dataCompartida.taller) {
                        let mantLocal = JSON.parse(localStorage.getItem('gasofa_taller')) || [];
                        let viejaStr = JSON.stringify(mantLocal.filter(m => String(m.carId) === String(car.id)));
                        let nuevaStr = JSON.stringify(dataCompartida.taller);

                        if (viejaStr !== nuevaStr) {
                            let nuevoTaller = mantLocal.filter(m => String(m.carId) !== String(car.id));
                            nuevoTaller = nuevoTaller.concat(dataCompartida.taller);
                            nuevoTaller.sort((a, b) => new Date(esToYMD(b.fecha)).getTime() - new Date(esToYMD(a.fecha)).getTime());
                            localStorage.setItem('gasofa_taller', JSON.stringify(nuevoTaller));
                            huboCambiosUI = true;
                        }
                    }

                    // --- ACTUALIZAMOS LA PANTALLA EN TIEMPO REAL ---
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
};

           
           // ==========================================================
// 🌉 PUENTE HTML-JS (Hace públicas las funciones para los botones)
// ==========================================================
window.q = q; 
window.abrirPerfil = abrirPerfil;
window.cerrarPerfil = cerrarPerfil;
window.abrirTaller = abrirTaller;
window.guardarTaller = guardarTaller;
window.openDiscounts = openDiscounts;
window.saveDescCard = saveDescCard;
window.restaurarLista = restaurarLista;
window.toggleControls = toggleControls;
window.setMode = setMode;
window.buscarPorCP = buscarPorCP;
window.calcularRuta = calcularRuta;
window.irAMiUbicacion = irAMiUbicacion;
window.toggleCamarasTrafico = toggleCamarasTrafico;
window.openGarage = openGarage;
window.closeGarage = closeGarage;
window.guardarParking = guardarParking;
window.irAMiCoche = irAMiCoche;
window.borrarParking = borrarParking;
window.abrirMisVehiculos = abrirMisVehiculos;
window.cerrarMisVehiculos = cerrarMisVehiculos;
window.saveCar = saveCar;
window.editCar = editCar;
window.deleteCar = deleteCar;
window.exportarDatosCSV = exportarDatosCSV;
window.importarDatosCSV = importarDatosCSV;
window.toggleTheme = toggleTheme;
window.abrirHistorial = abrirHistorial;
window.actualizarListaHistorial = actualizarListaHistorial;
window.cancelarEdicionBitacora = cancelarEdicionBitacora;
window.guardarBitacora = guardarBitacora;
window.editarBitacora = editarBitacora;
window.borrarBitacora = borrarBitacora;
window.cerrarGrafico = cerrarGrafico;
window.mostrarTendenciaZona = mostrarTendenciaZona;
window.llenarATope = llenarATope;
window.applyCarSettings = applyCarSettings;
window.enviarValoracion = enviarValoracion;
window.marcarEstrellas = marcarEstrellas;
window.abrirValoraciones = abrirValoraciones;
window.generarCodigoCompartir = generarCodigoCompartir;
window.unirseCocheCompartido = unirseCocheCompartido;
window.descargarPDFHistorial = descargarPDFHistorial;


// 👇 --- CORREGIDOS (Anotar e Histórico) --- 👇
window.abrirAnotar = abrirAnotar;
window.mostrarHistorico = mostrarHistorico;

window.updateChartRange = updateChartRange;
window.cerrarTutorial = cerrarTutorial;
window.avanzarTutorial = avanzarTutorial;
window.toggleZoomCamara = toggleZoomCamara;
