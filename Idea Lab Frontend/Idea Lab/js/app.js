/* ==========================================================================
   SMART TRAFFIC MANAGEMENT SYSTEM FOR UNEVEN TRAFFIC DISTRIBUTION
   NAGPUR CITY, MAHARASHTRA, INDIA
   React 18 Architecture with Real Interactive Navigation Map (Google Maps Inspired)
   Pure White Theme • Real Road Geometries • Real-Time Route Redistribution
   ========================================================================== */

const { useState, useEffect, useRef, useMemo, createElement: e } = React;

// ==========================================================================
// 1. REAL INTERACTIVE NAGPUR MAP COMPONENT (Google Maps Like Experience)
// ==========================================================================
function NagpurTrafficMap({
  routes,
  selectedRoute,
  origin,
  destination,
  showTraffic,
  setShowTraffic,
  timePeriod,
  setTimePeriod,
  injectIncident,
  setInjectIncident,
  isLoadingRoute,
  mapFocusCounter,
  onSelectRoute,
  onCurrentLocationFound
}) {
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const routeLayersRef = useRef([]);
  const markerLayersRef = useRef([]);
  const userLocationMarkerRef = useRef(null);
  const simVehicleMarkerRef = useRef(null);
  const simIntervalRef = useRef(null);

  const [isSimulatingTrip, setIsSimulatingTrip] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Initialize Real Leaflet Interactive Map (Centered on Nagpur City Zero Mile)
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapInstance.current) return;

    // Center on Nagpur City Center (Latitude: 21.1458, Longitude: 79.0882)
    const map = L.map(mapRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Clean Zoom Control (Top-Right)
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap Tile Layer (OSM)
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    leafletMapInstance.current = map;
    map._baseTileLayer = tileLayer;

    return () => {
      map.remove();
      leafletMapInstance.current = null;
    };
  }, []);

  // Perfectly align map bounds to Source, Destination, and Active Route
  const fitMapToRoute = () => {
    const map = leafletMapInstance.current;
    if (!map) return;
    map.invalidateSize();

    const points = [];
    if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
      points.push([origin.lat, origin.lng]);
    }
    if (destination && typeof destination.lat === 'number' && typeof destination.lng === 'number') {
      points.push([destination.lat, destination.lng]);
    }
    if (selectedRoute && selectedRoute.waypoints && selectedRoute.waypoints.length > 0) {
      selectedRoute.waypoints.forEach(pt => {
        if (Array.isArray(pt) && pt.length >= 2) points.push([pt[0], pt[1]]);
      });
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        paddingTopLeft: [70, 70],
        paddingBottomRight: [70, 70],
        maxZoom: 15,
        animate: true
      });
    } else if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    }
  };

  // Ensure map container size and alignment settle properly on mount and window resize
  useEffect(() => {
    const timer = setTimeout(() => {
      const map = leafletMapInstance.current;
      if (map) {
        map.invalidateSize();
        fitMapToRoute();
      }
    }, 200);

    const handleResize = () => {
      const map = leafletMapInstance.current;
      if (map) map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [origin, destination, selectedRoute]);

  // Smoothly align map bounds to route whenever user clicks Find Best Route
  useEffect(() => {
    if (mapFocusCounter) {
      const map = leafletMapInstance.current;
      if (map) {
        map.invalidateSize();
        fitMapToRoute();
      }
    }
  }, [mapFocusCounter]);

  // Update Markers & Real Road Polylines when origin, destination, routes, or traffic toggles change
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map) return;

    // Clear previous markers & route polylines
    markerLayersRef.current.forEach(layer => map.removeLayer(layer));
    markerLayersRef.current = [];

    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (simVehicleMarkerRef.current) {
      map.removeLayer(simVehicleMarkerRef.current);
      simVehicleMarkerRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
      setIsSimulatingTrip(false);
    }

    if (!origin || !destination) return;

    // 1. RENDER INACTIVE ROUTES FIRST (Drawn behind the selected route)
    routes.forEach(route => {
      const isSelected = selectedRoute && selectedRoute.id === route.id;
      if (isSelected) return;

      const poly = L.polyline(route.waypoints, {
        color: '#94a3b8',
        weight: 5,
        opacity: 0.65,
        dashArray: '6, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      poly.on('click', () => onSelectRoute(route));
      poly.bindTooltip(`<strong>${route.name}</strong><br/>${route.durationMin} min • ${route.distKm} km • ${route.trafficLevel} Traffic`, { sticky: true });
      routeLayersRef.current.push(poly);
    });

    // 2. RENDER SELECTED ACTIVE ROUTE (Drawn smoothly on top from source to destination)
    if (selectedRoute && selectedRoute.waypoints && selectedRoute.waypoints.length > 0) {
      const pts = selectedRoute.waypoints;

      // Clean white contrast underlay so route line stands out against OSM map
      const casing = L.polyline(pts, {
        color: '#ffffff',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routeLayersRef.current.push(casing);

      if (!showTraffic) {
        // Uniform clean route line
        const mainLine = L.polyline(pts, {
          color: '#1a73e8',
          weight: 6,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        mainLine.bindTooltip(`<strong>${selectedRoute.name}</strong><br/>Avg Speed: ${selectedRoute.avgSpeed} km/h • Clean Route`, { sticky: true });
        routeLayersRef.current.push(mainLine);
      } else {
        // Traffic-colored multi-segment route using per-segment data
        const numPts = pts.length;
        const isEarly15 = (timePeriod === 'early15');
        const segments = selectedRoute.segments;

        // Color map for segment status values
        const STATUS_COLORS = {
          red: '#dc2626',
          orange: '#ea580c',
          yellow: '#ca8a04',
          green: '#16a34a'
        };

        // Helper: determine color from congestion percentage
        function congestionToColor(pct) {
          if (pct > 75) return STATUS_COLORS.red;
          if (pct > 55) return STATUS_COLORS.orange;
          if (pct > 35) return STATUS_COLORS.yellow;
          return STATUS_COLORS.green;
        }

        if (segments && segments.length > 0) {
          // Distribute waypoints proportionally across defined segments by their lengthKm
          const totalSegKm = segments.reduce((s, seg) => s + (seg.lengthKm || 1), 0);
          const totalPairs = numPts - 1; // number of point-to-point pairs

          let pairIdx = 0; // tracks which waypoint pair we're at

          segments.forEach((seg, sIdx) => {
            const segFraction = (seg.lengthKm || 1) / totalSegKm;
            // How many waypoint pairs belong to this segment
            let segPairCount;
            if (sIdx === segments.length - 1) {
              // Last segment takes all remaining pairs
              segPairCount = totalPairs - pairIdx;
            } else {
              segPairCount = Math.max(1, Math.round(segFraction * totalPairs));
              // Don't exceed remaining pairs
              segPairCount = Math.min(segPairCount, totalPairs - pairIdx);
            }

            // Determine this segment's color
            const segColor = seg.status ? (STATUS_COLORS[seg.status] || congestionToColor(seg.congestion || 0)) : congestionToColor(seg.congestion || 0);
            const segCongestion = seg.congestion || 0;

            // Draw each waypoint pair in this segment
            for (let j = 0; j < segPairCount && (pairIdx + j) < totalPairs; j++) {
              const idx = pairIdx + j;
              const segPoly = L.polyline([pts[idx], pts[idx + 1]], {
                color: segColor,
                weight: 6,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);

              segPoly.bindTooltip(
                `<strong>${selectedRoute.name}</strong><br/>` +
                `📍 <em>${seg.name}</em><br/>` +
                `${seg.status === 'red' ? '🔴' : seg.status === 'orange' ? '🟠' : seg.status === 'yellow' ? '🟡' : '🟢'} Congestion: <b style="color:${segColor};">${segCongestion}%</b> ${isEarly15 ? '(🔮 15-Min Forecast)' : ''}<br/>` +
                `Speed: ${selectedRoute.avgSpeed} km/h • ETA: ${selectedRoute.durationMin} min`,
                { sticky: true }
              );
              routeLayersRef.current.push(segPoly);
            }

            pairIdx += segPairCount;
          });
        } else {
          // Fallback: no segment data available — use overall route congestion
          const fallbackColor = congestionToColor(selectedRoute.congestionPct || 0);
          for (let i = 0; i < numPts - 1; i++) {
            const segPoly = L.polyline([pts[i], pts[i + 1]], {
              color: fallbackColor,
              weight: 6,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            segPoly.bindTooltip(
              `<strong>${selectedRoute.name}</strong><br/>` +
              `Congestion: <b style="color:${fallbackColor};">${selectedRoute.congestionPct}%</b> ${isEarly15 ? '(🔮 15-Min Forecast)' : ''}<br/>` +
              `Speed: ${selectedRoute.avgSpeed} km/h • ETA: ${selectedRoute.durationMin} min`,
              { sticky: true }
            );
            routeLayersRef.current.push(segPoly);
          }
        }

        // Add per-segment congestion callout badges along the route
        if (segments && segments.length > 0 && pts.length > 2) {
          const totalSegKm = segments.reduce((s, seg) => s + (seg.lengthKm || 1), 0);
          let cumFraction = 0;

          segments.forEach((seg) => {
            const segFraction = (seg.lengthKm || 1) / totalSegKm;
            // Place badge at the midpoint of this segment
            const badgeFraction = cumFraction + segFraction / 2;
            const badgePtIdx = Math.min(Math.floor(badgeFraction * (pts.length - 1)), pts.length - 1);
            const badgePt = pts[badgePtIdx];
            const segColor = seg.status ? (STATUS_COLORS[seg.status] || congestionToColor(seg.congestion || 0)) : congestionToColor(seg.congestion || 0);
            const segCongestion = seg.congestion || 0;

            const badgeIcon = L.divIcon({
              className: 'map-midpoint-callout',
              html: `<div class="midpoint-badge ${isEarly15 ? 'badge-early15' : ''}" style="border-left: 4px solid ${segColor};">
                <span class="badge-icon">${seg.status === 'red' ? '🔴' : seg.status === 'orange' ? '🟠' : seg.status === 'yellow' ? '🟡' : '🟢'}</span>
                <span class="badge-text"><b style="color:${segColor};">${segCongestion}%</b> ${seg.name.length > 25 ? seg.name.substring(0, 22) + '…' : seg.name} ${isEarly15 ? '<span class="bubble-tag">🔮 15m</span>' : ''}</span>
              </div>`,
              iconSize: [240, 30],
              iconAnchor: [120, 15]
            });
            const badgeMarker = L.marker(badgePt, { icon: badgeIcon, zIndexOffset: 800 }).addTo(map);
            routeLayersRef.current.push(badgeMarker);

            cumFraction += segFraction;
          });
        } else if (pts.length > 2) {
          // Fallback single midpoint badge
          const midPt = pts[Math.floor(pts.length / 2)];
          const congPct = selectedRoute ? selectedRoute.congestionPct : 0;
          const congColor = congPct > 75 ? '#dc2626' : (congPct > 40 ? '#ea580c' : '#16a34a');

          const midCalloutIcon = L.divIcon({
            className: 'map-midpoint-callout',
            html: `<div class="midpoint-badge ${isEarly15 ? 'badge-early15' : ''}" style="border-left: 4px solid ${congColor};">
              <span class="badge-icon">${isEarly15 ? '🔮' : '⚡'}</span>
              <span class="badge-text"><b style="color:${congColor};">${congPct}%</b> Congestion ${isEarly15 ? '(15m Forecast)' : ''}</span>
            </div>`,
            iconSize: [200, 30],
            iconAnchor: [100, 15]
          });
          const midMarker = L.marker(midPt, { icon: midCalloutIcon, zIndexOffset: 800 }).addTo(map);
          routeLayersRef.current.push(midMarker);
        }
      }
    }

    const isEarly15 = (timePeriod === 'early15');
    const congPct = selectedRoute ? selectedRoute.congestionPct : 0;
    const congColor = congPct > 75 ? '#dc2626' : (congPct > 40 ? '#ea580c' : '#16a34a');

    // 3. SOURCE MARKER: 🔵 Blue marker = Source with permanent congestion percentage tooltip
    const sourceIcon = L.divIcon({
      className: 'nagpur-marker-source',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const srcMarker = L.marker([origin.lat, origin.lng], { icon: sourceIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<strong style="color:#1a73e8;">🔵 Source (Origin)</strong><br/><b>${origin.name}</b><br/><span style="font-size:11px;color:#64748b;">${origin.desc || 'Nagpur'}</span><br/><b style="color:${congColor};">${congPct}% Congestion</b> ${isEarly15 ? '(🔮 15-Min Forecast)' : ''}`);

    srcMarker.bindTooltip(
      `<div class="map-marker-bubble source-bubble">
        <div class="bubble-title">🔵 ${origin.name.split(',')[0]}</div>
        <div class="bubble-sub">Traffic: <b style="color:${congColor};">${congPct}% Congestion</b> ${isEarly15 ? '<span class="bubble-tag">🔮 15m</span>' : ''}</div>
      </div>`,
      { permanent: true, direction: 'top', offset: [0, -12], className: 'custom-map-tooltip' }
    );
    markerLayersRef.current.push(srcMarker);

    // 4. DESTINATION MARKER: 🔴 Red marker = Destination with permanent congestion percentage tooltip
    const destIcon = L.divIcon({
      className: 'nagpur-marker-dest',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const dstMarker = L.marker([destination.lat, destination.lng], { icon: destIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<strong style="color:#dc2626;">🔴 Destination</strong><br/><b>${destination.name}</b><br/><span style="font-size:11px;color:#64748b;">${destination.desc || 'Nagpur'}</span><br/><b style="color:${congColor};">${congPct}% Congestion</b> ${isEarly15 ? '(🔮 15-Min Forecast)' : ''}`);

    dstMarker.bindTooltip(
      `<div class="map-marker-bubble dest-bubble">
        <div class="bubble-title">🔴 ${destination.name.split(',')[0]}</div>
        <div class="bubble-sub">ETA: <b>${selectedRoute ? selectedRoute.durationMin : 0} min</b> • <b style="color:${congColor};">${congPct}% Load</b></div>
      </div>`,
      { permanent: true, direction: 'top', offset: [0, -12], className: 'custom-map-tooltip' }
    );
    markerLayersRef.current.push(dstMarker);

    // Automatically align map bounds from Source to Destination
    fitMapToRoute();

  }, [origin, destination, routes, selectedRoute, showTraffic, timePeriod]);

  // Trip Animation Simulation along real road geometry
  const handleStartTripSimulation = () => {
    if (!selectedRoute || !selectedRoute.waypoints.length) return;
    const map = leafletMapInstance.current;
    if (!map) return;

    if (isSimulatingTrip) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (simVehicleMarkerRef.current) map.removeLayer(simVehicleMarkerRef.current);
      setIsSimulatingTrip(false);
      return;
    }

    setIsSimulatingTrip(true);

    const vehicleDivIcon = L.divIcon({
      html: '<div style="background:#1a73e8;color:#ffffff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid #ffffff;"><i class="fa-solid fa-location-arrow fa-rotate-45" style="font-size:12px;"></i></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const pts = selectedRoute.waypoints;
    let stepIndex = 0;
    const totalSteps = pts.length;

    const vMarker = L.marker(pts[0], { icon: vehicleDivIcon }).addTo(map);
    simVehicleMarkerRef.current = vMarker;

    simIntervalRef.current = setInterval(() => {
      stepIndex++;
      if (stepIndex < totalSteps) {
        vMarker.setLatLng(pts[stepIndex]);
      } else {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
        setIsSimulatingTrip(false);
      }
    }, 700);
  };

  // Recenter on Central Nagpur (Zero Mile)
  const handleRecenterNagpur = () => {
    const map = leafletMapInstance.current;
    if (map) {
      map.setView([21.1458, 79.0882], 13);
    }
  };

  // Browser Geolocation ("Current Location" button - Section 29)
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const map = leafletMapInstance.current;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (userLocationMarkerRef.current && map) {
          map.removeLayer(userLocationMarkerRef.current);
        }

        const gpsIcon = L.divIcon({
          html: '<div style="background:#2563eb;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px #2563eb;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        if (map) {
          const uMarker = L.marker([lat, lng], { icon: gpsIcon }).addTo(map).bindPopup('<b>Your Current Location</b>').openPopup();
          userLocationMarkerRef.current = uMarker;
          map.setView([lat, lng], 15);
        }

        if (onCurrentLocationFound) {
          onCurrentLocationFound(lat, lng);
        }
      },
      (err) => {
        setGpsLoading(false);
        // Fallback: Center to Zero Mile
        handleRecenterNagpur();
        alert('Location access denied or unavailable. Centered map on Nagpur Central Zero Mile.');
      },
      { timeout: 7000 }
    );
  };

  return e('div', { className: 'nav-map-container' },
    // Real Interactive Leaflet Map Canvas
    e('div', { id: 'nagpur-traffic-map', ref: mapRef }),

    // Loading overlay
    isLoadingRoute && e('div', { className: 'map-loading-overlay' },
      e('i', { className: 'fa-solid fa-spinner fa-spin' }),
      ' Finding best route along Nagpur roads...'
    ),

    // FLOATING LIVE CONGESTION HUD ON MAP (Source -> Destination with Congestion %)
    selectedRoute && origin && destination && e('div', { className: `map-floating-panel map-route-hud-panel ${timePeriod === 'early15' ? 'hud-early15' : ''}` },
      e('div', { className: 'hud-content' },
        e('div', { className: 'hud-nodes' },
          e('span', { className: 'hud-source' }, '🔵 ' + origin.name.split(',')[0]),
          e('i', { className: 'fa-solid fa-arrow-right hud-arrow' }),
          e('span', { className: 'hud-dest' }, '🔴 ' + destination.name.split(',')[0])
        ),
        e('div', { className: 'hud-stats' },
          e('span', {
            className: 'hud-congestion-badge',
            style: {
              background: selectedRoute.congestionPct > 75 ? '#dc2626' : (selectedRoute.congestionPct > 40 ? '#ea580c' : '#16a34a')
            }
          }, `${selectedRoute.congestionPct}% Congestion`),
          timePeriod === 'early15' && e('span', { className: 'hud-forecast-tag' }, '🔮 15-Min Forecast'),
          e('span', { className: 'hud-time' }, `${selectedRoute.durationMin} min (${selectedRoute.distKm} km)`)
        )
      )
    ),

    // TIME-OF-DAY TRAFFIC SELECTOR (Section 17 & 27)
    e('div', { className: 'map-floating-panel map-time-selector-panel' },
      e('div', { className: 'time-label' },
        e('i', { className: 'fa-regular fa-clock' }), ' Traffic Period:'
      ),
      e('div', { className: 'time-btn-group' },
        window.TIME_PERIODS && Object.values(window.TIME_PERIODS).map(tp =>
          e('button', {
            key: tp.id,
            className: `time-btn time-${tp.id} ${timePeriod === tp.id ? 'active' : ''}`,
            onClick: () => setTimePeriod(tp.id),
            title: `${tp.label} (${tp.timeRange})`
          }, tp.label)
        )
      )
    ),

    // TRAFFIC STATUS LEGEND (Section 9 & 15)
    e('div', { className: 'map-floating-panel map-legend' },
      e('div', { className: 'legend-title' },
        e('i', { className: 'fa-solid fa-traffic-light' }), ' Traffic Status'
      ),
      e('div', { className: 'legend-items-list' },
        e('div', { className: 'legend-row' },
          e('span', { className: 'legend-dot dot-green' }),
          e('span', null, '🟢 Low Traffic (< 40%)')
        ),
        e('div', { className: 'legend-row' },
          e('span', { className: 'legend-dot dot-yellow' }),
          e('span', null, '🟡 Moderate (40–65%)')
        ),
        e('div', { className: 'legend-row' },
          e('span', { className: 'legend-dot dot-orange' }),
          e('span', null, '🟠 Heavy (65–85%)')
        ),
        e('div', { className: 'legend-row' },
          e('span', { className: 'legend-dot dot-red' }),
          e('span', null, '🔴 Severe (> 85%)')
        )
      )
    ),

    // MAP ACTION CONTROLS (GPS, Align Route, Recenter, Trip Sim, Incident Toggle)
    e('div', { className: 'map-floating-panel map-sim-controls' },
      e('button', {
        className: 'map-control-btn btn-align-route',
        onClick: fitMapToRoute,
        title: 'Align map perfectly from Source to Destination'
      }, e('i', { className: 'fa-solid fa-arrows-to-eye text-blue' }), ' Align Source → Dest'),
      e('button', {
        className: 'map-control-btn',
        onClick: handleCurrentLocation,
        title: 'Center on your real current location (GPS)'
      }, e('i', { className: gpsLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-crosshairs text-blue' }), ' Current Location'),
      e('button', {
        className: 'map-control-btn',
        onClick: handleRecenterNagpur,
        title: 'Recenter on Central Nagpur (Zero Mile)'
      }, e('i', { className: 'fa-solid fa-location-dot text-blue' }), ' Center Zero Mile'),
      e('button', {
        className: 'map-control-btn',
        onClick: () => setShowTraffic(!showTraffic),
        title: 'Toggle Traffic Overlay Visibility'
      }, e('i', { className: showTraffic ? 'fa-solid fa-eye text-green' : 'fa-solid fa-eye-slash text-muted' }), showTraffic ? ' Traffic: ON' : ' Traffic: OFF'),
      e('button', {
        className: 'map-control-btn',
        onClick: handleStartTripSimulation,
        title: 'Animate a vehicle along the chosen route'
      }, e('i', { className: isSimulatingTrip ? 'fa-solid fa-stop text-red' : 'fa-solid fa-play text-green' }), isSimulatingTrip ? ' Stop Trip' : ' Simulate Trip'),
      e('button', {
        className: 'map-control-btn incident-btn',
        onClick: () => setInjectIncident(!injectIncident),
        title: 'Simulate high bottleneck congestion on Wardha Road'
      }, e('i', { className: 'fa-solid fa-triangle-exclamation' }), injectIncident ? ' Clear Bottleneck' : ' Inject Bottleneck')
    )
  );
}

// ==========================================================================
// 2. LOGIN PAGE COMPONENT (Clean White Executive Design)
// ==========================================================================
function LoginPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('commuter@nagpur.gov.in');
  const [password, setPassword] = useState('nagpur123');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMsg, setForgotMsg] = useState(false);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!email || !password) return;
    onLoginSuccess({
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: email.includes('control') ? 'Traffic Control Officer' : 'Nagpur Commuter'
    });
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return e('div', { className: 'login-page-container' },
    e('div', { className: 'login-card' },
      e('div', { className: 'login-logo-header' },
        e('div', { className: 'login-logo-icon' }, e('i', { className: 'fa-solid fa-traffic-light' })),
        e('h2', { className: 'login-title' }, 'Smart Traffic Management'),
        e('p', { className: 'login-subtitle' }, 'Smart Traffic Management System for Uneven Traffic Distribution'),
        e('span', { className: 'login-city-pill' },
          e('i', { className: 'fa-solid fa-location-dot' }), ' Nagpur City, Maharashtra, India'
        )
      ),

      e('div', { className: 'login-tabs-row' },
        e('div', {
          className: `login-tab ${authMode === 'login' ? 'active' : ''}`,
          onClick: () => setAuthMode('login')
        }, 'Sign In'),
        e('div', {
          className: `login-tab ${authMode === 'signup' ? 'active' : ''}`,
          onClick: () => setAuthMode('signup')
        }, 'Create Account')
      ),

      e('form', { className: 'login-form', onSubmit: handleSubmit },
        e('div', { className: 'form-group' },
          e('label', { className: 'form-label' }, 'Email or Username'),
          e('div', { className: 'form-input-box' },
            e('i', { className: 'fa-regular fa-envelope' }),
            e('input', {
              type: 'text',
              className: 'form-input',
              placeholder: 'Enter email or username',
              value: email,
              onChange: (ev) => setEmail(ev.target.value),
              required: true
            })
          )
        ),
        e('div', { className: 'form-group' },
          e('label', { className: 'form-label' }, 'Password'),
          e('div', { className: 'form-input-box' },
            e('i', { className: 'fa-solid fa-lock' }),
            e('input', {
              type: 'password',
              className: 'form-input',
              placeholder: 'Enter your password',
              value: password,
              onChange: (ev) => setPassword(ev.target.value),
              required: true
            })
          )
        ),
        e('div', { className: 'form-options-row' },
          e('label', { className: 'remember-label' },
            e('input', {
              type: 'checkbox',
              checked: rememberMe,
              onChange: (ev) => setRememberMe(ev.target.checked)
            }),
            ' Remember Me'
          ),
          e('span', {
            className: 'link-forgot',
            onClick: () => setForgotMsg(true)
          }, 'Forgot Password?')
        ),
        forgotMsg && e('div', { style: { fontSize: '0.76rem', color: '#1a73e8', textAlign: 'center' } },
          'Password reset link generated for your demo account.'
        ),
        e('button', { type: 'submit', className: 'btn-login-submit' },
          e('i', { className: authMode === 'login' ? 'fa-solid fa-right-to-bracket' : 'fa-solid fa-user-plus' }),
          authMode === 'login' ? ' Login to System' : ' Register & Continue'
        )
      ),

      e('div', { className: 'demo-credentials-section' },
        e('div', { className: 'section-label' }, 'Quick Demo Credentials'),
        e('div', { className: 'demo-chips-grid' },
          e('button', {
            type: 'button',
            className: 'demo-chip-btn',
            onClick: () => handleFillDemo('commuter@nagpur.gov.in', 'nagpur123')
          },
            e('div', { className: 'demo-chip-title' }, '👤 Nagpur Commuter'),
            e('div', null, 'Daily City Driver')
          ),
          e('button', {
            type: 'button',
            className: 'demo-chip-btn',
            onClick: () => handleFillDemo('traffic.control@nagpur.gov.in', 'officer2026')
          },
            e('div', { className: 'demo-chip-title' }, '👮 Control Room'),
            e('div', null, 'Nagpur Traffic Police')
          )
        )
      )
    )
  );
}

// ==========================================================================
// 3. MAIN DASHBOARD & ROOT APPLICATION COORDINATOR
// ==========================================================================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ name: 'NAGPUR COMMUTER', email: 'commuter@nagpur.gov.in', role: 'Commuter' });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'routes' | 'traffic'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nagpur_traffic_theme') || 'dark';
  });
  const [showTraffic, setShowTraffic] = useState(true);
  const [timePeriod, setTimePeriod] = useState('current');
  const [injectIncident, setInjectIncident] = useState(true);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapFocusCounter, setMapFocusCounter] = useState(0);

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nagpur_traffic_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Nagpur Locations Dataset
  const locationsList = window.NAGPUR_LOCATIONS || [];

  // Default Demo Pair: Source = Ajni Square, Destination = Sitabuldi
  const defaultSource = locationsList.find(l => l.id === 'ajni_sq') || locationsList[0];
  const defaultDest = locationsList.find(l => l.id === 'sitabuldi') || locationsList[1];

  const [originLocation, setOriginLocation] = useState(defaultSource);
  const [destLocation, setDestLocation] = useState(defaultDest);

  const [sourceQuery, setSourceQuery] = useState(defaultSource ? defaultSource.name : 'Ajni Square, Nagpur');
  const [destQuery, setDestQuery] = useState(defaultDest ? defaultDest.name : 'Sitabuldi, Nagpur');

  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);

  // Transportation Mode: 'bike' | 'car' | 'auto'
  const [vehicleMode, setVehicleMode] = useState('car');

  // Reroute Alert Dismiss State
  const [rerouteDismissed, setRerouteDismissed] = useState(false);

  // User Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Routes state
  const [routes, setRoutes] = useState(() => {
    return window.generateNagpurRoutes ? window.generateNagpurRoutes(defaultSource, defaultDest, 'car', 'current', true) : [];
  });

  const recommendedRoute = useMemo(() => routes.find(r => r.isRecommended) || routes[0], [routes]);
  const [selectedRouteId, setSelectedRouteId] = useState('route-2');

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || recommendedRoute || routes[0];
  }, [routes, selectedRouteId, recommendedRoute]);

  // Recalculate routes whenever origin, dest, vehicleMode, timePeriod, or incident changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingRoute(true);

    if (window.calculateRealNagpurRoutesAsync) {
      window.calculateRealNagpurRoutesAsync(originLocation, destLocation, vehicleMode, timePeriod, injectIncident)
        .then(newRoutes => {
          if (!isCancelled && newRoutes && newRoutes.length > 0) {
            setRoutes(newRoutes);
            const best = newRoutes.find(r => r.isRecommended) || newRoutes[0];
            if (best) setSelectedRouteId(best.id);
            setRerouteDismissed(false);
            setIsLoadingRoute(false);
          }
        })
        .catch(() => {
          if (!isCancelled) setIsLoadingRoute(false);
        });
    } else {
      setIsLoadingRoute(false);
    }

    return () => { isCancelled = true; };
  }, [originLocation, destLocation, vehicleMode, timePeriod, injectIncident]);

  // Swap Source and Destination
  const handleSwapAddresses = () => {
    const tempQuery = sourceQuery;
    setSourceQuery(destQuery);
    setDestQuery(tempQuery);

    const tempLoc = originLocation;
    setOriginLocation(destLocation);
    setDestLocation(tempLoc);
    setRerouteDismissed(false);
  };

  // Quick Preset Selection
  const handleQuickPreset = (srcId, dstId) => {
    const s = locationsList.find(l => l.id === srcId);
    const d = locationsList.find(l => l.id === dstId);
    if (s && d) {
      setOriginLocation(s);
      setDestLocation(d);
      setSourceQuery(s.name);
      setDestQuery(d.name);
      setRerouteDismissed(false);
      setMapFocusCounter(c => c + 1);
    }
  };

  // Resolve user-typed address query to matching Nagpur location
  const resolveLocationFromQuery = (query, fallbackLoc) => {
    if (!query) return fallbackLoc;
    const q = query.trim().toLowerCase();
    const exact = locationsList.find(l => l.name.toLowerCase() === q || l.id.toLowerCase() === q);
    if (exact) return exact;
    const starts = locationsList.find(l => l.name.toLowerCase().startsWith(q));
    if (starts) return starts;
    const partial = locationsList.find(l => l.name.toLowerCase().includes(q) || (l.desc && l.desc.toLowerCase().includes(q)));
    if (partial) return partial;
    return fallbackLoc;
  };

  // Find Best Route handler - resolves inputs, calculates route, selects best, fits map
  const handleFindBestRoute = () => {
    setSourceDropdownOpen(false);
    setDestDropdownOpen(false);

    const resolvedOrigin = resolveLocationFromQuery(sourceQuery, originLocation);
    const resolvedDest = resolveLocationFromQuery(destQuery, destLocation);

    if (resolvedOrigin && resolvedOrigin.id !== originLocation.id) {
      setOriginLocation(resolvedOrigin);
      setSourceQuery(resolvedOrigin.name);
    }
    if (resolvedDest && resolvedDest.id !== destLocation.id) {
      setDestLocation(resolvedDest);
      setDestQuery(resolvedDest.name);
    }

    setIsLoadingRoute(true);
    setRerouteDismissed(false);

    if (window.calculateRealNagpurRoutesAsync) {
      window.calculateRealNagpurRoutesAsync(resolvedOrigin, resolvedDest, vehicleMode, timePeriod, injectIncident)
        .then(newRoutes => {
          if (newRoutes && newRoutes.length > 0) {
            setRoutes(newRoutes);
            const best = newRoutes.find(r => r.isRecommended) || newRoutes[0];
            if (best) setSelectedRouteId(best.id);
            setMapFocusCounter(c => c + 1);
          }
          setIsLoadingRoute(false);
        })
        .catch(() => {
          setIsLoadingRoute(false);
        });
    } else {
      setIsLoadingRoute(false);
    }
  };

  // Geocoding helper when typing custom address
  const handleSelectCustomLocation = (isSource, loc) => {
    if (isSource) {
      setOriginLocation(loc);
      setSourceQuery(loc.name);
      setSourceDropdownOpen(false);
    } else {
      setDestLocation(loc);
      setDestQuery(loc.name);
      setDestDropdownOpen(false);
    }
    setRerouteDismissed(false);
  };

  // Current Location handler
  const handleCurrentLocationFound = (lat, lng) => {
    const currentLoc = {
      id: 'current_loc',
      name: 'Current Location, Nagpur',
      zone: 'Real GPS',
      lat: lat,
      lng: lng,
      desc: 'Detected via browser geolocation'
    };
    setOriginLocation(currentLoc);
    setSourceQuery('Current Location, Nagpur');
  };

  if (!isAuthenticated) {
    return e(LoginPage, {
      onLoginSuccess: (usr) => {
        setUser(usr);
        setIsAuthenticated(true);
      }
    });
  }

  const currentPeriodData = (window.TIME_PERIODS && window.TIME_PERIODS[timePeriod]) || {
    activeVehicles: 1240,
    avgCitySpeed: 31,
    congestedCount: 12,
    freeFlowCount: 28,
    distributionIndex: 68
  };

  return e('div', { id: 'root' },
    // TOP NAVIGATION BAR (Section 4 & Clean White Design)
    e('header', { className: 'app-header' },
      e('div', { className: 'brand-section', onClick: () => setActiveTab('home') },
        e('div', { className: 'brand-icon' }, e('i', { className: 'fa-solid fa-traffic-light' })),
        e('div', { className: 'brand-details' },
          e('h1', null, 'Smart Traffic Management'),
          e('span', { className: 'nagpur-tag' },
            e('i', { className: 'fa-solid fa-location-dot' }), ' Nagpur City, Maharashtra'
          )
        )
      ),

      // Navigation Links
      e('nav', { className: 'nav-links-group' },
        e('button', {
          className: `nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`,
          onClick: () => setActiveTab('home')
        }, e('i', { className: 'fa-solid fa-house' }), ' Home'),
        e('button', {
          className: `nav-tab-btn ${activeTab === 'routes' ? 'active' : ''}`,
          onClick: () => setActiveTab('routes')
        }, e('i', { className: 'fa-solid fa-route' }), ' Routes'),
        e('button', {
          className: `nav-tab-btn ${activeTab === 'traffic' ? 'active' : ''}`,
          onClick: () => setActiveTab('traffic')
        }, e('i', { className: 'fa-solid fa-car' }), ' Traffic')
      ),

      // User & Live Status Section
      e('div', { className: 'header-user-section' },
        e('div', { className: 'live-network-badge' },
          e('span', { className: 'pulse-dot' }),
          ' OSM Nagpur Map: ACTIVE'
        ),
        // Dark / Light Mode Switcher Button
        e('button', {
          className: 'theme-toggle-btn',
          onClick: toggleTheme,
          title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          'aria-label': 'Toggle theme'
        },
          e('i', { className: theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon' }),
          e('span', { className: 'theme-toggle-text' }, theme === 'dark' ? 'Light Mode' : 'Dark Mode')
        ),
        e('div', { className: 'user-badge', onClick: () => setProfileModalOpen(true) },
          e('div', { className: 'user-avatar' }, user.name.charAt(0)),
          e('span', null, user.name),
          e('button', {
            className: 'btn-logout',
            onClick: (ev) => {
              ev.stopPropagation();
              setIsAuthenticated(false);
            },
            title: 'Logout'
          }, e('i', { className: 'fa-solid fa-right-from-bracket' }))
        )
      )
    ),

    // MAIN CONTENT WORKSPACE
    e('main', { className: 'main-workspace' },
      // ====================================================================
      // TAB 1: HOME / DASHBOARD (Search + Real Map + Routes + Comparison)
      // ====================================================================
      activeTab === 'home' && e('div', { className: 'navigator-layout' },
        // LEFT SEARCH & ROUTE INFORMATION SIDEBAR
        e('div', { className: 'nav-sidebar' },
          e('div', { className: 'nav-sidebar-scroll' },
            // MAIN SEARCH INTERFACE (Section 5 & 9)
            e('div', { className: 'search-box-card' },
              e('div', { className: 'search-box-header' },
                e('h2', null, e('i', { className: 'fa-solid fa-magnifying-glass text-blue' }), ' Where do you want to go?'),
                e('span', { className: 'sim-mode-pill' }, 'Nagpur City')
              ),

              e('div', { className: 'search-inputs-wrapper' },
                e('div', { className: 'route-bullets-col' },
                  e('div', { className: 'bullet-source', title: 'Source (Blue Marker)' }),
                  e('div', { className: 'bullet-line' }),
                  e('div', { className: 'bullet-dest', title: 'Destination (Red Marker)' })
                ),

                e('div', { className: 'inputs-fields-col' },
                  // Source Input Field
                  e('div', { className: 'input-container' },
                    e('input', {
                      type: 'text',
                      className: 'nav-input',
                      placeholder: 'Enter source address in Nagpur',
                      value: sourceQuery,
                      onFocus: () => setSourceDropdownOpen(true),
                      onChange: (ev) => setSourceQuery(ev.target.value),
                      onKeyDown: (ev) => { if (ev.key === 'Enter') handleFindBestRoute(); }
                    }),
                    sourceQuery && e('button', {
                      className: 'input-clear-btn',
                      onClick: () => setSourceQuery('')
                    }, e('i', { className: 'fa-solid fa-xmark' })),

                    sourceDropdownOpen && e('div', { className: 'autocomplete-dropdown' },
                      locationsList.filter(l => l.name.toLowerCase().includes(sourceQuery.toLowerCase())).map(loc =>
                        e('div', {
                          key: loc.id,
                          className: 'autocomplete-item',
                          onClick: () => handleSelectCustomLocation(true, loc)
                        },
                          e('span', { className: 'autocomplete-item-name' }, loc.name),
                          e('span', { className: 'autocomplete-item-zone' }, loc.zone)
                        )
                      )
                    )
                  ),

                  // Destination Input Field
                  e('div', { className: 'input-container' },
                    e('input', {
                      type: 'text',
                      className: 'nav-input',
                      placeholder: 'Enter destination address in Nagpur',
                      value: destQuery,
                      onFocus: () => setDestDropdownOpen(true),
                      onChange: (ev) => setDestQuery(ev.target.value),
                      onKeyDown: (ev) => { if (ev.key === 'Enter') handleFindBestRoute(); }
                    }),
                    destQuery && e('button', {
                      className: 'input-clear-btn',
                      onClick: () => setDestQuery('')
                    }, e('i', { className: 'fa-solid fa-xmark' })),

                    destDropdownOpen && e('div', { className: 'autocomplete-dropdown' },
                      locationsList.filter(l => l.name.toLowerCase().includes(destQuery.toLowerCase())).map(loc =>
                        e('div', {
                          key: loc.id,
                          className: 'autocomplete-item',
                          onClick: () => handleSelectCustomLocation(false, loc)
                        },
                          e('span', { className: 'autocomplete-item-name' }, loc.name),
                          e('span', { className: 'autocomplete-item-zone' }, loc.zone)
                        )
                      )
                    )
                  )
                ),

                // Address Swap Button
                e('div', { className: 'swap-btn-col' },
                  e('button', {
                    className: 'btn-swap',
                    onClick: handleSwapAddresses,
                    title: 'Swap Source and Destination'
                  }, e('i', { className: 'fa-solid fa-arrow-down-up-across-line' }))
                )
              ),

              // Popular Nagpur Corridor Quick Chips
              e('div', { className: 'quick-routes-bar' },
                e('button', {
                  className: 'quick-route-chip',
                  onClick: () => handleQuickPreset('ajni_sq', 'sitabuldi')
                }, '📍 Ajni Sq → Sitabuldi'),
                e('button', {
                  className: 'quick-route-chip',
                  onClick: () => handleQuickPreset('sadar', 'gittikhadan')
                }, '📍 Sadar → Gittikhadan'),
                e('button', {
                  className: 'quick-route-chip',
                  onClick: () => handleQuickPreset('manish_nagar', 'civil_lines')
                }, '📍 Manish Nagar → Civil Lines'),
                e('button', {
                  className: 'quick-route-chip',
                  onClick: () => handleQuickPreset('dharampeth', 'itwari')
                }, '📍 Dharampeth → Itwari'),
                e('button', {
                  className: 'quick-route-chip',
                  onClick: () => handleQuickPreset('hingna_road', 'sitabuldi')
                }, '📍 Hingna → Sitabuldi')
              )
            ),

            // VEHICLE / MODE SELECTION (Section 6 & 30)
            e('div', { className: 'vehicle-mode-container' },
              e('div', { className: 'section-label' },
                e('span', null, 'Transport Mode'),
                e('span', { style: { color: '#1a73e8', textTransform: 'none' } }, window.VEHICLE_CONFIGS[vehicleMode]?.label)
              ),
              e('div', { className: 'mode-cards-grid' },
                window.VEHICLE_CONFIGS && Object.values(window.VEHICLE_CONFIGS).map(vm =>
                  e('div', {
                    key: vm.id,
                    className: `mode-card ${vehicleMode === vm.id ? 'active' : ''}`,
                    onClick: () => setVehicleMode(vm.id)
                  },
                    e('div', { className: 'mode-icon' }, e('i', { className: `fa-solid ${vm.icon}` })),
                    e('div', { className: 'mode-title' }, vm.name),
                    e('div', { className: 'mode-speed-tag' }, `${vm.minSpeed}–${vm.maxSpeed} km/h`)
                  )
                )
              )
            ),

            // FIND BEST ROUTE BUTTON (Section 5)
            e('button', {
              className: `btn-find-route ${isLoadingRoute ? 'loading' : ''}`,
              onClick: handleFindBestRoute,
              disabled: isLoadingRoute,
              title: 'Find optimal route along Nagpur road network'
            },
              isLoadingRoute
                ? [e('i', { key: 'spin', className: 'fa-solid fa-spinner fa-spin' }), ' Finding Best Route...']
                : [e('i', { key: 'icon', className: 'fa-solid fa-route' }), ' Find Best Route']
            ),

            // REROUTING NOTIFICATION BANNER (Section 11 & 17)
            selectedRoute && selectedRoute.hasSevereCongestion && !rerouteDismissed && e('div', { className: 'reroute-alert-banner' },
              e('div', { className: 'reroute-alert-header' },
                e('i', { className: 'fa-solid fa-triangle-exclamation' }),
                e('span', null, 'Heavy traffic detected on your current route')
              ),
              e('div', { className: 'reroute-alert-body' },
                'We found a faster alternative route saving travel time by redistributing traffic onto parallel underutilized avenues.'
              ),
              e('div', { className: 'reroute-alert-stats' },
                e('div', null, 'Current Route: ', e('span', { className: 'stat-curr' }, `${selectedRoute.durationMin} min (${selectedRoute.trafficLevel})`)),
                e('div', null, 'Alternative Route: ', e('span', { className: 'stat-alt' }, `${recommendedRoute.durationMin} min (${recommendedRoute.trafficLevel})`))
              ),
              e('div', { className: 'reroute-alert-actions' },
                e('button', {
                  className: 'btn-use-alt',
                  onClick: () => {
                    setSelectedRouteId(recommendedRoute.id);
                    setRerouteDismissed(true);
                  }
                }, e('i', { className: 'fa-solid fa-bolt' }), ' Use Alternative Route'),
                e('button', {
                  className: 'btn-keep-curr',
                  onClick: () => setRerouteDismissed(true)
                }, 'Keep Current Route')
              )
            ),

            // UNEVEN TRAFFIC DISTRIBUTION CONCEPT CARD (Section 12 & 14)
            e('div', { className: 'distribution-concept-card' },
              e('div', { className: 'concept-card-title' },
                e('i', { className: 'fa-solid fa-diagram-project' }), ' Uneven Traffic Distribution Balancing'
              ),
              e('div', { className: 'concept-card-desc' },
                'Instead of directing every vehicle through the same shortest road, our system analyzes congestion and intelligently distributes vehicles across suitable alternative routes to reduce traffic congestion and improve overall travel time.'
              ),
              e('div', { className: 'concept-tagline' },
                'Uneven Traffic Distribution → Intelligent Route Redistribution → Reduced Congestion'
              ),
              e('div', { className: 'concept-metrics-grid' },
                e('div', { className: 'concept-metric-box' },
                  e('div', { className: 'concept-metric-label' }, 'Congested Arterial Load'),
                  e('div', { className: 'concept-metric-value', style: { color: '#dc2626' } }, `${selectedRoute.hasSevereCongestion ? selectedRoute.congestionPct : 84}%`)
                ),
                e('div', { className: 'concept-metric-box' },
                  e('div', { className: 'concept-metric-label' }, 'Redistributed Alternative'),
                  e('div', { className: 'concept-metric-value', style: { color: '#16a34a' } }, `${recommendedRoute.congestionPct}%`)
                )
              )
            ),

            // ROUTE INFORMATION PANEL (Section 13)
            selectedRoute && e('div', { className: 'stat-card' },
              e('div', { className: 'section-label' }, 'Active Route Summary'),
              e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                e('span', { style: { fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' } }, selectedRoute.name),
                e('span', { className: `route-badge ${selectedRoute.trafficBadge}` }, selectedRoute.trafficLevel)
              ),
              e('div', { className: 'route-metrics-row' },
                e('span', { className: `route-eta ${selectedRoute.isRecommended ? 'fastest' : (selectedRoute.hasSevereCongestion ? 'delayed' : '')}` }, `${selectedRoute.durationMin} min`),
                e('span', { className: 'route-dist' }, `Distance: ${selectedRoute.distKm} km`),
                e('span', { className: 'route-speed' }, `Avg Speed: ${selectedRoute.avgSpeed} km/h`)
              ),
              e('p', { style: { fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' } }, selectedRoute.description)
            ),

            // 15-MINUTE EARLY PREDICTION AI ALERT BANNER
            timePeriod === 'early15' && e('div', { className: 'early-prediction-banner' },
              e('div', { className: 'early-prediction-banner-header' },
                e('span', null, e('i', { className: 'fa-solid fa-wand-magic-sparkles' }), ' 15-Min ML Early Warning Active'),
                e('span', { className: 'forecast-pill' }, 'T + 15 min Lookahead')
              ),
              e('div', { className: 'early-prediction-banner-body' },
                '🔮 XGBoost predictive engine forecasts severe congestion forming within 15 minutes on direct arterials. Traffic is proactively redirected to parallel relief avenues before bottlenecks lock up.'
              )
            ),

            // ALTERNATIVE ROUTES PANEL (Section 10 & 14)
            e('div', { className: 'routes-list-container' },
              e('div', { className: 'section-label' }, `Available Routes (${routes.length})`),
              routes.map(r => {
                const isSelected = selectedRoute.id === r.id;
                return e('div', {
                  key: r.id,
                  className: `route-card ${isSelected ? 'selected' : ''} ${r.isRecommended ? 'recommended-border' : ''}`,
                  onClick: () => setSelectedRouteId(r.id)
                },
                  e('div', { className: 'route-card-header' },
                    e('span', { className: 'route-name' },
                      r.name,
                      r.isRecommended && e('span', { style: { color: '#16a34a', fontSize: '0.74rem', fontWeight: 800 } }, timePeriod === 'early15' ? ' ★ 15-MIN PROACTIVE REROUTE' : ' ★ RECOMMENDED')
                    ),
                    e('span', { className: `route-badge ${r.trafficBadge}` }, r.trafficLevel)
                  ),

                  // 15-Min Proactive Badges
                  r.earlyWarningActive && e('div', { className: 'route-early-warning-badge' },
                    e('i', { className: 'fa-solid fa-triangle-exclamation' }),
                    '15-Min Surge Predicted: Bottleneck forming'
                  ),
                  (r.isRecommended && timePeriod === 'early15') && e('div', { className: 'route-early-bypass-badge' },
                    e('i', { className: 'fa-solid fa-wand-magic-sparkles' }),
                    'Proactive Early Bypass: Saves 14 min before congestion forms'
                  ),

                  e('div', { className: 'route-metrics-row' },
                    e('span', { className: `route-eta ${r.isRecommended ? 'fastest' : (r.hasSevereCongestion ? 'delayed' : '')}` }, `${r.durationMin} min`),
                    e('span', { className: 'route-dist' }, `${r.distKm} km`),
                    e('span', { className: 'route-speed' }, `Avg: ${r.avgSpeed} km/h`),
                    e('span', { style: { fontSize: '0.74rem', color: r.congestionPct < 40 ? '#16a34a' : (r.congestionPct > 70 ? '#dc2626' : '#ca8a04') } }, `${r.congestionPct}% Congestion`)
                  ),
                  e('div', { className: 'route-traffic-desc' },
                    e('i', { className: 'fa-solid fa-check text-blue' }),
                    e('span', null, r.redistributionAdvantage || r.description)
                  ),
                  // Segment Color Preview Bar
                  e('div', { className: 'segment-color-bar' },
                    r.segments.map((seg, idx) =>
                      e('div', {
                        key: idx,
                        className: `seg-block seg-${seg.status}`,
                        title: `${seg.name}: ${seg.status} traffic (${seg.lengthKm} km)`
                      })
                    )
                  )
                );
              })
            ),

            // ROUTE COMPARISON TABLE (Section 18)
            e('div', { className: 'table-container' },
              e('div', { style: { padding: '10px 14px', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' } },
                e('i', { className: 'fa-solid fa-code-compare text-blue' }), ' Route Comparison Table'
              ),
              e('table', { className: 'comparison-table' },
                e('thead', null,
                  e('tr', null,
                    e('th', null, 'Route'),
                    e('th', null, 'Distance'),
                    e('th', null, 'Time'),
                    e('th', null, 'Traffic'),
                    e('th', null, 'Status')
                  )
                ),
                e('tbody', null,
                  routes.map(r =>
                    e('tr', {
                      key: r.id,
                      className: `${selectedRoute.id === r.id ? 'selected-row' : ''} ${r.isRecommended ? 'recommended-row' : ''}`,
                      onClick: () => setSelectedRouteId(r.id),
                      style: { cursor: 'pointer' }
                    },
                      e('td', { style: { fontWeight: 700 } }, r.routeNum),
                      e('td', null, `${r.distKm} km`),
                      e('td', { style: { fontWeight: 700, color: r.isRecommended ? '#16a34a' : '#0f172a' } }, `${r.durationMin} min`),
                      e('td', null, e('span', { className: `route-badge ${r.trafficBadge}` }, r.trafficLevel)),
                      e('td', { style: { fontSize: '0.74rem', color: r.isRecommended ? '#16a34a' : '#64748b', fontWeight: 600 } }, r.isRecommended ? 'Recommended' : 'Alternative')
                    )
                  )
                )
              )
            ),

            // SELECTED PATH SEGMENTS (Section 9)
            selectedRoute && e('div', { className: 'turn-by-turn-section' },
              e('div', { className: 'section-label' }, 'Road Segments Breakdown'),
              selectedRoute.segments.map((step, idx) =>
                e('div', { key: idx, className: 'step-row' },
                  e('div', { className: `step-icon ${step.status}` },
                    step.status === 'red' ? e('i', { className: 'fa-solid fa-triangle-exclamation' }) :
                    step.status === 'yellow' ? e('i', { className: 'fa-solid fa-arrow-turn-up' }) :
                    e('i', { className: 'fa-solid fa-arrow-up' })
                  ),
                  e('div', { className: 'step-text' },
                    e('div', { className: 'step-road' }, step.name),
                    e('div', { className: 'step-sub' }, `${step.lengthKm} km • Condition: ${step.status.toUpperCase()} (${step.congestion || 30}% density)`)
                  )
                )
              )
            )
          )
        ),

        // RIGHT REAL NAGPUR INTERACTIVE MAP (OSM)
        e(NagpurTrafficMap, {
          routes,
          selectedRoute,
          origin: originLocation,
          destination: destLocation,
          showTraffic,
          setShowTraffic,
          timePeriod,
          setTimePeriod,
          injectIncident,
          setInjectIncident,
          isLoadingRoute,
          mapFocusCounter,
          onSelectRoute: (r) => setSelectedRouteId(r.id),
          onCurrentLocationFound: handleCurrentLocationFound
        })
      ),

      // ====================================================================
      // TAB 2: CORRIDORS MATRIX
      // ====================================================================
      activeTab === 'routes' && e('div', { className: 'view-container' },
        e('div', { className: 'view-header' },
          e('h2', { className: 'view-title' }, 'Nagpur City Road Corridors & Saturation Matrix'),
          e('p', { className: 'view-subtitle' }, 'Monitoring volume, capacity, and uneven traffic distribution indices across major Nagpur arterials.')
        ),
        e('div', { className: 'cards-grid-4' },
          window.NAGPUR_CORRIDORS && window.NAGPUR_CORRIDORS.map(c =>
            e('div', { key: c.id, className: 'stat-card' },
              e('div', { className: 'stat-card-title' }, c.name),
              e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } },
                e('span', { className: 'stat-card-value', style: { color: c.level === 'red' ? '#dc2626' : c.level === 'orange' ? '#ea580c' : c.level === 'yellow' ? '#ca8a04' : '#16a34a' } }, `${c.congestion}%`),
                e('span', { className: `route-badge badge-${c.level}` }, c.status)
              ),
              e('div', { style: { background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden', margin: '8px 0' } },
                e('div', { style: { background: c.level === 'red' ? '#dc2626' : c.level === 'orange' ? '#ea580c' : c.level === 'yellow' ? '#ca8a04' : '#16a34a', width: `${c.congestion}%`, height: '100%' } })
              ),
              e('div', { style: { fontSize: '0.76rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' } },
                e('span', null, `Volume: ${c.volume} veh/hr`),
                e('span', null, `Capacity: ${c.capacity} veh/hr`)
              )
            )
          )
        )
      ),

      // ====================================================================
      // TAB 3: LIVE TRAFFIC HOTSPOTS & ANALYTICS (Section 15 & 16)
      // ====================================================================
      activeTab === 'traffic' && e('div', { className: 'view-container' },
        e('div', { className: 'view-header' },
          e('h2', { className: 'view-title' }, 'Nagpur Traffic Operations & Bottleneck Telemetry'),
          e('p', { className: 'view-subtitle' }, 'Monitoring Ajni Square, Wardha Road, Rahate Square, Dhantholi, Sitabuldi, and Katol Road.')
        ),

        // TRAFFIC ANALYTICS (Section 15)
        e('div', { className: 'analytics-bar-grid' },
          e('div', { className: 'stat-card' },
            e('div', { className: 'stat-card-title' }, 'Active Traffic'),
            e('div', { className: 'stat-card-value text-blue' }, `${currentPeriodData.activeVehicles.toLocaleString()} vehicles`),
            e('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, 'Nagpur telemetry count')
          ),
          e('div', { className: 'stat-card' },
            e('div', { className: 'stat-card-title' }, 'Average Speed'),
            e('div', { className: 'stat-card-value', style: { color: '#16a34a' } }, `${currentPeriodData.avgCitySpeed} km/h`),
            e('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, 'Nagpur arterial average')
          ),
          e('div', { className: 'stat-card' },
            e('div', { className: 'stat-card-title' }, 'Congested Roads'),
            e('div', { className: 'stat-card-value', style: { color: '#dc2626' } }, currentPeriodData.congestedCount),
            e('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, 'Saturation > 70%')
          ),
          e('div', { className: 'stat-card' },
            e('div', { className: 'stat-card-title' }, 'Low Traffic Roads'),
            e('div', { className: 'stat-card-value', style: { color: '#16a34a' } }, currentPeriodData.freeFlowCount),
            e('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, 'Free flow corridors')
          ),
          e('div', { className: 'stat-card' },
            e('div', { className: 'stat-card-title' }, 'Traffic Distribution'),
            e('div', { className: 'stat-card-value text-blue' }, `${currentPeriodData.distributionIndex}% Balanced`),
            e('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, 'Redistribution index')
          )
        ),

        // NAGPUR TRAFFIC HOTSPOTS (Section 16)
        e('div', { className: 'section-label', style: { fontSize: '0.92rem', margin: '20px 0 10px 0' } }, 'Traffic Hotspots in Nagpur'),
        e('div', { className: 'cards-grid-4' },
          window.NAGPUR_HOTSPOTS && window.NAGPUR_HOTSPOTS.map(h => {
            const adjustedCongestion = Math.min(98, Math.round(h.baseCongestion * currentPeriodData.activeVehicles / 1240));
            const predicted15Min = Math.min(98, Math.round(h.baseCongestion * 1.42));
            const isEscalating = predicted15Min > adjustedCongestion + 10;
            return e('div', { key: h.id, className: 'hotspot-card' },
              e('div', { className: 'hotspot-header' },
                e('div', { className: 'hotspot-name' }, h.name),
                e('span', { className: `route-badge badge-${h.level}` }, h.status)
              ),
              e('div', { className: 'hotspot-landmark' }, h.landmark),
              e('div', { className: 'hotspot-meter-bar' },
                e('div', { style: { background: h.level === 'red' ? '#dc2626' : h.level === 'orange' ? '#ea580c' : '#ca8a04', width: `${adjustedCongestion}%`, height: '100%' } })
              ),
              e('div', { className: 'hotspot-meter-row' },
                e('span', { style: { fontSize: '0.76rem', color: '#475569' } }, `Current: ${adjustedCongestion}%`),
                e('span', { style: { fontSize: '0.76rem', color: '#dc2626', fontWeight: 700 } }, h.delayMin)
              ),
              // 15-Min Lookahead Forecast Row
              e('div', { className: 'hotspot-forecast-row' },
                e('span', { style: { color: '#64748b' } }, '🔮 T+15m ML Forecast:'),
                e('span', { className: 'forecast-surge-tag' },
                  isEscalating ? `⚠️ ${predicted15Min}% (Surge)` : `${predicted15Min}% (Stable)`
                )
              ),
              e('div', { className: 'hotspot-advice' },
                e('i', { className: 'fa-solid fa-route' }), ' ', h.alternateAdvice
              )
            );
          })
        )
      )
    ),

    // USER PROFILE MODAL
    profileModalOpen && e('div', { className: 'modal-overlay', onClick: () => setProfileModalOpen(false) },
      e('div', { className: 'modal-dialog', onClick: (ev) => ev.stopPropagation() },
        e('button', { className: 'modal-close-btn', onClick: () => setProfileModalOpen(false) }, e('i', { className: 'fa-solid fa-xmark' })),
        e('h3', { style: { color: '#0f172a', fontSize: '1.15rem', marginBottom: '6px' } }, 'User Profile & Preferences'),
        e('p', { style: { color: '#64748b', fontSize: '0.8rem', marginBottom: '14px' } }, 'Smart Traffic Management System - Nagpur City'),
        e('div', { style: { background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', marginBottom: '14px' } },
          e('div', { style: { fontSize: '0.84rem', color: '#1a73e8', fontWeight: 700 } }, user.name),
          e('div', { style: { fontSize: '0.78rem', color: '#475569' } }, `Email: ${user.email}`),
          e('div', { style: { fontSize: '0.78rem', color: '#475569' } }, `Role: ${user.role}`)
        ),
        e('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          e('button', {
            className: 'btn-keep-curr',
            onClick: () => {
              setProfileModalOpen(false);
              setIsAuthenticated(false);
            }
          }, 'Logout'),
          e('button', {
            className: 'btn-use-alt',
            onClick: () => setProfileModalOpen(false)
          }, 'Close')
        )
      )
    )
  );
}

// Render the application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
});
