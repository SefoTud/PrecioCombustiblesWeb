// Archivo: camaras.js

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyeIN2o-dHcyXw-ZAhUKboaotrOJcv-VM7ABYxzEkUsU4q19pKLrEFj64PanMyYSt_-/exec";

let layerCamaras = L.markerClusterGroup({
    maxClusterRadius: 50,
    iconCreateFunction: function (cluster) {
        return L.divIcon({
            html: '<div style="background-color: #e74c3c; color: white; border: 2px solid white; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"><span>' + cluster.getChildCount() + '</span></div>',
            className: '',
            iconSize: L.point(35, 35)
        });
    }
});

let camarasCargadas = false;
let camarasActivas = false;
window.esZoomCamara = false;

export function abrirCamaraCompleta(src, nombre) {
    if (typeof gtag !== 'undefined') gtag('event', 'ver_camara_especifica', { 'event_category': 'Trafico', 'carretera_camara': nombre });
    
    const img = document.getElementById('camaraModalImg');
    if(!img) return;
    
    img.src = src;
    document.getElementById('camaraModalTitle').innerText = "🎥 " + nombre;
    document.getElementById('camaraModal').style.display = 'flex';

    window.esZoomCamara = false;
    img.style.width = '100%';
    img.style.cursor = 'zoom-in';
    const text = document.getElementById('camaraZoomText');
    if(text) text.innerText = "Toca la foto para hacer zoom • Toca fuera para cerrar";
}

export function toggleZoomCamara(e, img) {
    e.stopPropagation(); 
    const container = document.getElementById('camaraImgContainer');
    window.esZoomCamara = !window.esZoomCamara;

    if (window.esZoomCamara) {
        img.style.width = '250%';
        img.style.cursor = 'zoom-out';
        const text = document.getElementById('camaraZoomText');
        if(text) text.innerText = "Desliza para ver los detalles • Toca la foto para alejar";
        setTimeout(() => {
            container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
        }, 50);
    } else {
        img.style.width = '100%';
        img.style.cursor = 'zoom-in';
        const text = document.getElementById('camaraZoomText');
        if(text) text.innerText = "Toca la foto para hacer zoom • Toca fuera para cerrar";
    }
}

export async function toggleCamarasTrafico() {
    const btn = document.getElementById('btnToggleCamaras');
    if(!btn) return;
    
    camarasActivas = !camarasActivas;

    if (typeof gtag !== 'undefined') gtag('event', 'clic_boton_camaras_dgt', { 'event_category': 'Trafico', 'accion': camarasActivas ? 'Activar' : 'Desactivar' });

    if (camarasActivas) {
        btn.classList.add('active');

        if (!camarasCargadas) {
            try {
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
                    let nombreSeguro = nombreReal.replace(/'/g, "\\'").replace(/"/g, '"');
                    
                    // PREVENIR ENLACES ROTOS
                    let urlBase = cam.url || "";
                    let urlCamara = urlBase.includes('?') ? urlBase + "&t=" + new Date().getTime() : urlBase + "?t=" + new Date().getTime();

                    // MODO INCÓGNITO ACTIVADO (referrerpolicy="no-referrer")
                    let popupContent = `
                        <div style="text-align:center; min-width: 250px;">
                            <h4 style="margin: 0 0 5px 0; color:#e74c3c; font-size:13px;">🎥 ${nombreReal}</h4>
                            <img src="${urlCamara}" alt="Cámara DGT" referrerpolicy="no-referrer" style="width:100%; border-radius:8px; border:1px solid var(--border-color); min-height: 150px; background: #eee; cursor: pointer; display:block;" onerror="this.onerror=null; this.src='https://via.placeholder.com/250x150.png?text=Camara+Offline';" onclick="window.abrirCamaraCompleta(this.src, '${nombreSeguro}')">
                            <p style="font-size:10px; color:var(--text-muted); margin: 5px 0 0 0;">Toca la foto para ampliarla</p>
                        </div>
                    `;

                    let lat = parseFloat(cam.lat.toString().replace(',', '.'));
                    let lon = parseFloat(cam.lon.toString().replace(',', '.'));

                    let marker = L.marker([lat, lon], { icon: iconCam, pane: "puntos_camaras" })
                        .bindPopup(popupContent);

                    layerCamaras.addLayer(marker);
                });
                camarasCargadas = true;
                btn.innerHTML = '🎥'; 
                if (typeof window.mostrarToast === 'function') window.mostrarToast("✅ Cámaras cargadas", "exito");

            } catch (error) {
                console.error("Error cargando cámaras:", error);
                btn.innerHTML = '🎥';
                if (typeof window.mostrarToast === 'function') window.mostrarToast("❌ Error al conectar con las cámaras", "error");
            }
        }
        if(window.map) window.map.addLayer(layerCamaras);
    } else {
        btn.classList.remove('active');
        if(window.map) window.map.removeLayer(layerCamaras);
        if (typeof window.mostrarToast === 'function') window.mostrarToast("🎥 Cámaras ocultadas");
    }
}

window.abrirCamaraCompleta = abrirCamaraCompleta;
window.toggleZoomCamara = toggleZoomCamara;
window.toggleCamarasTrafico = toggleCamarasTrafico;
