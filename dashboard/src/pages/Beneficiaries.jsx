import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { StatusBadge, EmptyState } from '../components/Layout';

export default function Beneficiaries() {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedDossier, setSelectedDossier] = useState(null);

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    householdId: '',
    village: 'Barkheda',
    block: 'Berasia',
    district: 'Bhopal',
    category: 'OBC',
    address: '',
    phone: '',
    aadhaarLast4: '',
    'registeredLocation.latitude': '23.2599',
    'registeredLocation.longitude': '77.4126'
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, [search, page]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await api.get('/beneficiaries', { params });
      setBeneficiaries(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((p) => ({
            ...p,
            'registeredLocation.latitude': pos.coords.latitude.toFixed(4),
            'registeredLocation.longitude': pos.coords.longitude.toFixed(4)
          }));
        },
        () => {
          // Default to Barkheda Bhopal coords
          setForm((p) => ({
            ...p,
            'registeredLocation.latitude': '23.6345',
            'registeredLocation.longitude': '77.4231'
          }));
        }
      );
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        householdId: form.householdId ? form.householdId.trim() : undefined,
        village: form.village.trim(),
        block: form.block.trim(),
        district: form.district.trim(),
        category: form.category,
        address: form.address.trim() || `${form.village}, ${form.block}`,
        phone: form.phone.trim() || undefined,
        aadhaarLast4: form.aadhaarLast4.trim() ? form.aadhaarLast4.trim().slice(-4) : undefined,
        registeredLocation: {
          latitude: parseFloat(form['registeredLocation.latitude']) || 23.2599,
          longitude: parseFloat(form['registeredLocation.longitude']) || 77.4126
        }
      };

      const res = await api.post('/beneficiaries', payload);
      if (res.data.success) {
        setFormSuccess(`✓ Beneficiary "${res.data.data?.name}" registered successfully with ID: ${res.data.data?.householdId}`);
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess('');
        }, 1500);

        setForm({
          name: '',
          fatherName: '',
          householdId: '',
          village: 'Barkheda',
          block: 'Berasia',
          district: 'Bhopal',
          category: 'OBC',
          address: '',
          phone: '',
          aadhaarLast4: '',
          'registeredLocation.latitude': '23.2599',
          'registeredLocation.longitude': '77.4126'
        });
        fetchBeneficiaries();
      } else {
        setFormError(res.data.message || 'Creation failed');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to register beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">Beneficiary Directory</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            Official PMAY-G registry of sanctioned rural housing households
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormError('');
            setFormSuccess('');
          }}
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
          {showForm ? '✕ Close Form' : '+ Add New Beneficiary'}
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by beneficiary name, village, or address..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input-field"
        />
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 border border-white/50 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-white/40 pb-3">
            <div>
              <h3 className="text-base font-display font-bold text-[#28485A]">Register New Sanctioned Household</h3>
              <p className="text-xs text-[#607887] font-medium mt-0.5">Enrolls applicant into the PMAY-G verification and stage disbursement lifecycle</p>
            </div>
            <button
              type="button"
              onClick={handleAutoGPS}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#86C8C5]/20 text-[#28485A] font-bold border border-[#86C8C5]/50 hover:bg-[#86C8C5]/30 transition-all flex items-center gap-1 backdrop-blur-xs"
            >
              📍 Auto-Detect GPS
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-100/50 border border-rose-300/60 text-rose-800 text-xs font-bold backdrop-blur-xs">
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#86C8C5]/25 border border-[#86C8C5]/60 text-[#28485A] text-xs font-bold backdrop-blur-xs">
              {formSuccess}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Father / Husband's Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramdas Ahirwar"
                value={form.fatherName}
                onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Household ID (Optional)</label>
              <input
                type="text"
                placeholder="Auto-generated if left blank"
                value={form.householdId}
                onChange={(e) => setForm((p) => ({ ...p, householdId: e.target.value }))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Aadhaar (Last 4 Digits or Full)</label>
              <input
                type="text"
                maxLength={14}
                placeholder="XXXX-XXXX-4523"
                value={form.aadhaarLast4}
                onChange={(e) => setForm((p) => ({ ...p, aadhaarLast4: e.target.value }))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Mobile Phone</label>
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Social Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="input-field font-semibold"
              >
                {['SC', 'ST', 'OBC', 'General', 'Minority'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Gram Panchayat / Village *</label>
              <input
                type="text"
                placeholder="e.g. Barkheda"
                value={form.village}
                onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Block *</label>
              <input
                type="text"
                placeholder="e.g. Berasia"
                value={form.block}
                onChange={(e) => setForm((p) => ({ ...p, block: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">District *</label>
              <input
                type="text"
                placeholder="e.g. Bhopal"
                value={form.district}
                onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Site Address / Landmark *</label>
              <input
                type="text"
                placeholder="e.g. Near Primary School, Ward 4"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Geofence Latitude (GPS)</label>
              <input
                type="text"
                value={form['registeredLocation.latitude']}
                onChange={(e) => setForm((p) => ({ ...p, 'registeredLocation.latitude': e.target.value }))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#28485A] mb-1 block">Geofence Longitude (GPS)</label>
              <input
                type="text"
                value={form['registeredLocation.longitude']}
                onChange={(e) => setForm((p) => ({ ...p, 'registeredLocation.longitude': e.target.value }))}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/40 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md"
            >
              {submitting ? 'Registering Applicant...' : '✓ Save & Enroll Beneficiary'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary py-2.5 px-4 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden border border-white/50 shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-[#28485A] font-bold">
            <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading beneficiary registry...
          </div>
        ) : beneficiaries.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No beneficiaries found"
            message="Add beneficiaries or adjust your search filter above"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="glass-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">Beneficiary & Household</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">Village GP</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">Gov Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">Active Milestone</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">📸 Photo AI</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">🎥 Video AI (Qwen)</th>
                  <th className="text-left py-3.5 px-4 text-xs font-extrabold text-[#28485A]">⚖️ Dual Synthesized Risk</th>
                  <th className="text-right py-3.5 px-4 text-xs font-extrabold text-[#28485A]">AI Forensics Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {beneficiaries.map((b) => {
                  const insp = b.latestInspection;
                  const synth = insp?.dualEvidenceSynthesis || null;
                  const hasVideo = Boolean(
                    insp?.videoEvidence?.verdict ||
                    insp?.videoEvidence?.sha256 ||
                    (synth && synth.hasVideoEvidence && synth.videoRiskScore !== null)
                  );

                  const photoRisk = synth?.photoRiskScore ?? (insp?.riskScore?.score ?? null);
                  const videoRisk = hasVideo ? (synth?.videoRiskScore ?? insp?.videoEvidence?.aiGeneratedRiskScore ?? null) : null;
                  const dualScore = synth?.finalCompositeScore ?? (insp?.riskScore?.score ?? null);

                  return (
                    <tr key={b._id} className="hover:bg-white/35 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#28485A] flex items-center gap-1.5">
                          <span>{b.name}</span>
                          {b.isDuplicateSuspect && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                              Suspect
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-[#28485A]">
                            {b.householdId || 'Pending ID'}
                          </span>
                          <span className="text-white/60 text-xs">•</span>
                          <span className="text-xs text-[#607887] font-medium">{b.fatherName || 'S/o Unknown'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#28485A] text-xs">{b.village}</div>
                        <div className="text-[11px] text-[#607887] font-medium">{b.block}, {b.district}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.govVerificationStatus || 'pending'} />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="badge badge-lavender">
                          {insp?.officerSelectedStage || 'Foundation'}
                        </span>
                      </td>

                      {/* Photo Risk */}
                      <td className="py-3.5 px-4">
                        {photoRisk !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black font-mono ${photoRisk > 40 ? 'text-rose-600' : 'text-[#28485A]'}`}>
                              {photoRisk}/100
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/40 text-[#607887] font-medium border border-white/50">
                              YOLOv8
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#607887] italic">No Photo</span>
                        )}
                      </td>

                      {/* Video Risk */}
                      <td className="py-3.5 px-4">
                        {hasVideo && videoRisk !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black font-mono ${videoRisk > 40 ? 'text-rose-600' : 'text-[#28485A]'}`}>
                              {videoRisk}/100
                            </span>
                            <span className="badge badge-lavender">
                              Qwen VL
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#607887] bg-white/40 px-2 py-0.5 rounded border border-white/50 inline-block">
                            ⏳ Pending Video
                          </span>
                        )}
                      </td>

                      {/* Dual Synthesized Risk */}
                      <td className="py-3.5 px-4">
                        {dualScore !== null ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black font-mono ${
                                dualScore > 50 ? 'text-rose-600' : dualScore > 25 ? 'text-amber-600' : 'text-[#28485A]'
                              }`}>
                                {dualScore}/100
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                (synth?.finalDecision === 'APPROVE' || dualScore <= 25)
                                  ? 'badge-teal'
                                  : (synth?.finalDecision === 'REJECT' || dualScore > 50)
                                  ? 'badge-critical'
                                  : 'badge-medium'
                              }`}>
                                {synth?.finalDecision || (dualScore <= 25 ? 'APPROVE' : 'REVIEW')}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#607887] font-medium mt-0.5">
                              {hasVideo ? 'Cross-modal Dual Average' : 'Single Modal (Photo Only)'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#607887] italic">Pending Audit</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Video Inspector Button */}
                          <button
                            title="Inspect or upload walkthrough video for this beneficiary"
                            onClick={() => navigate(`/video-inspector?beneficiaryId=${b._id}&stage=${insp?.officerSelectedStage || 'Plinth'}`)}
                            className="p-1.5 rounded-lg bg-white/40 hover:bg-[#B4B8D9]/30 text-[#28485A] border border-white/50 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <span>🎥</span>
                            <span className="hidden xl:inline">Video AI</span>
                          </button>

                          {/* 3D Twin Button */}
                          <button
                            title="Reconstruct 3D Spatial Twin & LiDAR model for this house"
                            onClick={() => navigate(`/spatial-twin?beneficiaryId=${b._id}&stage=${insp?.officerSelectedStage || 'Plinth'}`)}
                            className="p-1.5 rounded-lg bg-white/40 hover:bg-[#86C8C5]/30 text-[#28485A] border border-white/50 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <span>🏛️</span>
                            <span className="hidden xl:inline">3D Twin</span>
                          </button>

                          {/* Inspection Link */}
                          {insp ? (
                            <button
                              title="View Full Inspection Audit"
                              onClick={() => navigate(`/inspections/${insp._id}`)}
                              className="p-1.5 rounded-lg bg-white/40 hover:bg-[#A9CDE0]/40 text-[#28485A] border border-white/50 text-xs font-bold transition-all shadow-2xs"
                            >
                              🔍
                            </button>
                          ) : (
                            <button
                              title="View Beneficiary Details"
                              onClick={() => setSelectedDossier(b)}
                              className="p-1.5 rounded-lg bg-white/40 hover:bg-white/60 text-[#28485A] border border-white/50 text-xs font-bold transition-all shadow-2xs"
                            >
                              📋
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary py-1.5 px-3.5 text-xs font-bold disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-xs font-bold text-[#28485A]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary py-1.5 px-3.5 text-xs font-bold disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Beneficiary Dossier Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#28485A]/30 backdrop-blur-md animate-fadeIn">
          <div className="card max-w-xl w-full p-6 shadow-2xl border border-white/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#28485A]">{selectedDossier.name}</h3>
                  <p className="text-xs text-[#607887] font-mono">Household ID: {selectedDossier.householdId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 text-[#28485A] font-bold flex items-center justify-center border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/40 rounded-xl border border-white/50">
                <span className="text-[#607887] block">Father's Name</span>
                <strong className="text-[#28485A]">{selectedDossier.fatherName}</strong>
              </div>
              <div className="p-3 bg-white/40 rounded-xl border border-white/50">
                <span className="text-[#607887] block">Gram Panchayat</span>
                <strong className="text-[#28485A]">{selectedDossier.village}, {selectedDossier.block}</strong>
              </div>
              <div className="p-3 bg-white/40 rounded-xl border border-white/50">
                <span className="text-[#607887] block">Social Category</span>
                <strong className="text-[#28485A]">{selectedDossier.category}</strong>
              </div>
              <div className="p-3 bg-white/40 rounded-xl border border-white/50">
                <span className="text-[#607887] block">Gov Verification Status</span>
                <strong className="text-[#28485A] font-bold">{selectedDossier.govVerificationStatus || 'Verified'}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-white/40 flex gap-2">
              <button
                onClick={() => {
                  const bId = selectedDossier._id;
                  setSelectedDossier(null);
                  navigate(`/video-inspector?beneficiaryId=${bId}`);
                }}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                🎥 Open Video AI Inspector
              </button>
              <button
                onClick={() => {
                  const bId = selectedDossier._id;
                  setSelectedDossier(null);
                  navigate(`/spatial-twin?beneficiaryId=${bId}`);
                }}
                className="btn-secondary flex-1 py-2 text-xs font-bold"
              >
                🏛️ Open 3D Spatial Twin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
