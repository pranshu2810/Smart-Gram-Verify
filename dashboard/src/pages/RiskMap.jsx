import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FiMapPin as MapPin,
  FiLayers as Layers,
  FiAlertTriangle as ShieldAlert,
  FiCheckCircle as CheckCircle2,
  FiClock as Clock,
  FiCompass as Compass,
  FiSliders as Sliders,
  FiFilter as Filter,
  FiEye as Eye,
  FiRefreshCw as RefreshCw,
  FiSearch as Search,
  FiExternalLink as ExternalLink,
  FiInfo as Info
} from 'react-icons/fi';

const PRESET_CENTERS = [
  { id: 'bhopal', name: 'Bhopal District HQ', lat: 23.2599, lng: 77.4126, village: 'HQ' },
  { id: 'barkheda', name: 'Barkheda GP (Berasia)', lat: 23.6345, lng: 77.4231, village: 'Barkheda' },
  { id: 'piparia', name: 'Piparia GP (Sehore)', lat: 23.1992, lng: 77.0851, village: 'Piparia' },
  { id: 'berasia', name: 'Berasia Block Center', lat: 23.6312, lng: 77.4300, village: 'Berasia' },
  { id: 'sehore', name: 'Sehore District Center', lat: 23.2035, lng: 77.0872, village: 'Sehore' },
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 75];

export default function RiskMap() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const centerMarkerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(PRESET_CENTERS[0]);
  const [customCenter, setCustomCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [stageFilter, setStageFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [mapData, setMapData] = useState({ points: [], summary: {} });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isClickToSetCenter, setIsClickToSetCenter] = useState(false);

  // Active center coordinates
  const activeLat = customCenter ? customCenter.lat : selectedCenter.lat;
  const activeLng = customCenter ? customCenter.lng : selectedCenter.lng;

  // Fetch risk map points from API
  const fetchMapData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/dashboard/risk-map', {
        params: {
          lat: activeLat,
          lng: activeLng,
          radiusKm: radiusKm
        }
      });
      if (res.data?.success) {
        setMapData(res.data.data);
        if (res.data.data.points?.length > 0 && !selectedPoint) {
          setSelectedPoint(res.data.data.points[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching risk map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [activeLat, activeLng, radiusKm]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: 10,
        zoomControl: true
      });

      // OpenStreetMap Free Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create LayerGroups for clean updates
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;

      // Handle map click for custom radius center
      map.on('click', (e) => {
        setCustomCenter({
          id: 'custom',
          name: `Custom Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      });
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center, radius circle, and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Pan map smoothly to active center
    map.panTo([activeLat, activeLng], { animate: true, duration: 0.8 });

    // 1. Draw or Update Center Marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
    }
    const centerIcon = L.divIcon({
      className: 'custom-center-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(99, 102, 241, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 22px; height: 22px; border-radius: 9999px; background: #4f46e5; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 900;">★</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    centerMarkerRef.current = L.marker([activeLat, activeLng], { icon: centerIcon })
      .bindTooltip(`<b>Radius Center</b><br>${customCenter ? customCenter.name : selectedCenter.name}`, { direction: 'top' })
      .addTo(map);

    // 2. Draw or Update Radius Circle
    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
    }
    const circle = L.circle([activeLat, activeLng], {
      radius: radiusKm * 1000,
      color: '#4f46e5',
      weight: 2,
      opacity: 0.8,
      dashArray: '6, 6',
      fillColor: '#6366f1',
      fillOpacity: 0.08
    }).addTo(map);
    circleLayerRef.current = circle;

    // 3. Draw Construction Site Markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      const filtered = (mapData.points || []).filter(pt => {
        if (stageFilter !== 'all' && pt.currentStage.toLowerCase() !== stageFilter.toLowerCase()) return false;
        if (riskFilter !== 'all' && pt.riskTier.toLowerCase() !== riskFilter.toLowerCase()) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return pt.name.toLowerCase().includes(q) || 
                 pt.householdId.toLowerCase().includes(q) || 
                 pt.village.toLowerCase().includes(q);
        }
        return true;
      });

      filtered.forEach((pt) => {
        if (!pt.registeredLocation?.latitude || !pt.registeredLocation?.longitude) return;

        const isHighRisk = pt.riskTier === 'high' || pt.isDuplicateSuspect;
        const isMedRisk = pt.riskTier === 'medium';
        const isComplete = pt.progressPct === 100;

        let bgGrad = isHighRisk 
          ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
          : isMedRisk 
          ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
          : isComplete 
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'linear-gradient(135deg, #3b82f6, #2563eb)';

        let pulseColor = isHighRisk ? 'rgba(239, 68, 68, 0.4)' : isMedRisk ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.25)';

        const stageInitial = pt.currentStage ? pt.currentStage.charAt(0) : 'F';

        const customIcon = L.divIcon({
          className: `house-marker-${pt._id}`,
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${isHighRisk ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: ${pulseColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 9999px;
                background: ${bgGrad};
                border: 2px solid #ffffff;
                box-shadow: 0 4px 10px rgba(15, 23, 42, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: -0.5px;
              ">
                ${stageInitial}
              </div>
              <div style="
                position: absolute;
                bottom: -15px;
                background: #0f172a;
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                padding: 1px 4px;
                border-radius: 4px;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">
                ${pt.progressPct}%
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([pt.registeredLocation.latitude, pt.registeredLocation.longitude], {
          icon: customIcon
        });

        // Popup content
        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">${pt.householdId}</span>
              <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: ${isHighRisk ? '#fee2e2; color: #991b1b' : isMedRisk ? '#fef3c7; color: #92400e' : '#dcfce7; color: #166534'};">
                ${pt.riskTier?.toUpperCase()} RISK
              </span>
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${pt.name}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">Village: <b>${pt.village}</b> (${pt.block})</div>
            
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">
                <span>Stage: ${pt.currentStage}</span>
                <span>${pt.progressPct}% Done</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${pt.progressPct}%; height: 100%; background: ${isComplete ? '#10b981' : '#4f46e5'}; border-radius: 9999px;"></div>
              </div>
            </div>

            ${pt.distanceKm !== null ? `
              <div style="font-size: 11px; font-weight: 700; color: #6366f1;">
                📍 ${pt.distanceKm} km from center
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPoint(pt);
        });

        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [activeLat, activeLng, radiusKm, mapData, stageFilter, riskFilter, searchQuery]);

  const filteredPoints = (mapData.points || []).filter(pt => {
    if (stageFilter !== 'all' && pt.currentStage.toLowerCase() !== stageFilter.toLowerCase()) return false;
    if (riskFilter !== 'all' && pt.riskTier.toLowerCase() !== riskFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return pt.name.toLowerCase().includes(q) || 
             pt.householdId.toLowerCase().includes(q) || 
             pt.village.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-[#28485A] animate-fadeIn">
      {/* Page Title & Controls */}
      <div className="card p-5 border border-white/50 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🗺️</span>
            <h1 className="text-xl font-black text-[#28485A]">
              Geo Risk & Construction Progress Map
            </h1>
            <span className="badge badge-sky text-xs">
              Leaflet + OpenStreetMap
            </span>
          </div>
          <p className="text-xs text-[#607887]">
            Real-time visual monitoring of rural housing milestones, risk clusters, and GPS-verified construction radius.
          </p>
        </div>

        {/* Center Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 border border-white/50 text-xs backdrop-blur-xs">
            <MapPin className="w-3.5 h-3.5 text-[#28485A]" />
            <span className="font-bold text-[#607887]">Center:</span>
            <select
              value={customCenter ? 'custom' : selectedCenter.id}
              onChange={(e) => {
                if (e.target.value === 'custom') return;
                const found = PRESET_CENTERS.find(c => c.id === e.target.value);
                if (found) {
                  setSelectedCenter(found);
                  setCustomCenter(null);
                }
              }}
              className="bg-transparent font-extrabold text-[#28485A] border-none p-0 focus:ring-0 cursor-pointer text-xs"
            >
              {PRESET_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {customCenter && <option value="custom">{customCenter.name}</option>}
            </select>
          </div>

          <button
            onClick={fetchMapData}
            className="p-2 rounded-xl bg-white/40 hover:bg-white/60 text-[#28485A] border border-white/50 transition-colors shadow-2xs backdrop-blur-xs"
            title="Refresh Map Points"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Radius Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-4 border border-white/50 shadow-xs">
          <div className="text-[11px] font-bold text-[#607887] uppercase mb-1">Sites in {radiusKm}km Radius</div>
          <div className="text-2xl font-black text-[#28485A]">{mapData.summary?.totalInRadius || 0}</div>
          <div className="text-[10px] text-[#28485A] font-bold mt-1">Geo-located houses</div>
        </div>

        <div className="card p-4 border border-white/50 shadow-xs">
          <div className="text-[11px] font-bold text-[#607887] uppercase mb-1">Avg Construction Done</div>
          <div className="text-2xl font-black text-[#86C8C5]">{mapData.summary?.avgProgress || 0}%</div>
          <div className="w-full h-1.5 bg-white/40 border border-white/50 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#86C8C5] to-[#A9CDE0] rounded-full" style={{ width: `${mapData.summary?.avgProgress || 0}%` }} />
          </div>
        </div>

        <div className="card p-4 border border-white/50 shadow-xs">
          <div className="text-[11px] font-bold text-[#607887] uppercase mb-1">In-Progress Work</div>
          <div className="text-2xl font-black text-[#A9CDE0]">{mapData.summary?.inProgressCount || 0}</div>
          <div className="text-[10px] text-[#607887] font-bold mt-1">Active site stages</div>
        </div>

        <div className="card p-4 border border-white/50 shadow-xs">
          <div className="text-[11px] font-bold text-[#607887] uppercase mb-1">Completed Houses</div>
          <div className="text-2xl font-black text-[#86C8C5]">{mapData.summary?.completedCount || 0}</div>
          <div className="text-[10px] text-[#28485A] font-bold mt-1">100% milestone verified</div>
        </div>

        <div className="card p-4 border border-rose-300/50 bg-rose-100/30 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase mb-1">High Risk in Radius</div>
          <div className="text-2xl font-black text-rose-700">{mapData.summary?.highRiskCount || 0}</div>
          <div className="text-[10px] text-rose-800 font-bold mt-1">Requires audit inspection</div>
        </div>
      </div>

      {/* Main Map & Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Map View (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Map Interactive Toolbar */}
          <div className="card p-3.5 border border-white/50 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            {/* Radius Selector */}
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#28485A]" />
              <span className="font-extrabold text-[#28485A]">Inspection Radius:</span>
              <div className="flex items-center gap-1">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold transition-all ${
                      radiusKm === r
                        ? 'bg-[#A9CDE0] text-[#28485A] shadow-xs border border-white/50'
                        : 'bg-white/40 text-[#607887] hover:bg-white/60'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#607887]" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="input-field py-1 px-2.5 text-xs font-bold"
              >
                <option value="all">All Stages</option>
                <option value="foundation">Foundation (20%)</option>
                <option value="plinth">Plinth (40%)</option>
                <option value="lintel">Lintel (65%)</option>
                <option value="roof">Roof (85%)</option>
                <option value="completion">Completion (100%)</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field py-1 px-2.5 text-xs font-bold"
              >
                <option value="all">All Risk Tiers</option>
                <option value="low">Low Risk (🟢)</option>
                <option value="medium">Medium Risk (🟡)</option>
                <option value="high">High Risk (🔴)</option>
              </select>
            </div>
          </div>

          {/* Leaflet Map Box */}
          <div className="relative rounded-2xl overflow-hidden border border-white/50 shadow-sm bg-white/40 h-[520px]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded-xl bg-white/85 backdrop-blur-md border border-white/60 shadow-md text-[11px] font-bold text-[#28485A] space-y-1.5">
              <div className="text-[10px] text-[#607887] uppercase font-black">Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#86C8C5]" />
                <span>Low Risk / Verified Site</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B4B8D9]" />
                <span>Medium Risk / In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>High Risk / AI Anomaly Suspect</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-white/40">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A9CDE0]" />
                <span>Radius Center (★)</span>
              </div>
            </div>

            {/* Click to pick tip */}
            <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/60 shadow-sm text-xs font-extrabold text-[#28485A] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Click anywhere on map to set custom radius center</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Site Detail & List (1 col) */}
        <div className="space-y-4">
          {/* Active House Card */}
          {selectedPoint ? (
            <div className="card p-5 border border-white/50 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/50 border border-white/60 text-[#28485A] uppercase font-mono">
                    {selectedPoint.householdId}
                  </span>
                  <h3 className="text-base font-black text-[#28485A] mt-1.5">{selectedPoint.name}</h3>
                  <p className="text-xs text-[#607887]">S/O {selectedPoint.fatherName}</p>
                </div>

                <span className={`badge ${
                  selectedPoint.riskTier === 'high'
                    ? 'badge-critical'
                    : selectedPoint.riskTier === 'medium'
                    ? 'badge-medium'
                    : 'badge-teal'
                }`}>
                  {selectedPoint.riskTier} RISK
                </span>
              </div>

              {/* Progress Bar */}
              <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 space-y-2 backdrop-blur-xs">
                <div className="flex justify-between text-xs font-bold text-[#28485A]">
                  <span>Current Milestone:</span>
                  <span className="text-[#28485A] font-extrabold">{selectedPoint.currentStage}</span>
                </div>
                <div className="w-full h-2.5 bg-white/50 border border-white/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#86C8C5] to-[#A9CDE0]"
                    style={{ width: `${selectedPoint.progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#607887] font-bold">
                  <span>Work Completed</span>
                  <span>{selectedPoint.progressPct}%</span>
                </div>
              </div>

              {/* Location details */}
              <div className="space-y-1.5 text-xs text-[#28485A]">
                <div className="flex justify-between py-1 border-b border-white/30">
                  <span className="text-[#607887]">Gram Panchayat:</span>
                  <span className="font-extrabold text-[#28485A]">{selectedPoint.village}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/30">
                  <span className="text-[#607887]">Block / District:</span>
                  <span className="font-extrabold text-[#28485A]">{selectedPoint.block}, {selectedPoint.district}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/30">
                  <span className="text-[#607887]">Distance from Center:</span>
                  <span className="font-black text-[#28485A]">{selectedPoint.distanceKm ? `${selectedPoint.distanceKm} km` : 'Center'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#607887]">BPL ID / Category:</span>
                  <span className="font-bold text-[#28485A]">{selectedPoint.bplNumber} ({selectedPoint.category})</span>
                </div>
              </div>

              {/* Action Button */}
              {selectedPoint.latestInspection && (
                <button
                  onClick={() => navigate(`/inspections/${selectedPoint.latestInspection._id}`)}
                  className="w-full py-2.5 px-3 rounded-xl btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Latest Evidence</span>
                </button>
              )}
            </div>
          ) : (
            <div className="card p-6 border border-white/50 text-center text-[#607887] text-xs font-bold">
              Click any pin on the map to view house details.
            </div>
          )}

          {/* Quick List in Radius */}
          <div className="card p-4 border border-white/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#28485A]">
                Houses in Range ({filteredPoints.length})
              </span>
              <span className="text-[10px] text-[#607887] font-bold">{radiusKm} km radius</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredPoints.slice(0, 10).map(pt => (
                <div
                  key={pt._id}
                  onClick={() => {
                    setSelectedPoint(pt);
                    if (mapInstanceRef.current && pt.registeredLocation?.latitude) {
                      mapInstanceRef.current.panTo([pt.registeredLocation.latitude, pt.registeredLocation.longitude]);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPoint?._id === pt._id
                      ? 'bg-[#A9CDE0]/30 border-[#A9CDE0] shadow-xs text-[#28485A]'
                      : 'bg-white/40 hover:bg-white/60 border-white/50 text-[#28485A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#28485A]">{pt.name}</span>
                    <span className="text-[10px] font-black text-[#28485A]">{pt.progressPct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#607887] mt-0.5">
                    <span>{pt.village}</span>
                    <span>{pt.distanceKm ? `${pt.distanceKm}km` : '0km'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
