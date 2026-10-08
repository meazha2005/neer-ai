'use client';

import React, { useState } from 'react';
import { WaterComplaint } from '@/types';
import { AlertCircle, X, Send, MapPin, CheckCircle, UploadCloud } from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (complaint: WaterComplaint) => void;
  currentLocation: { lat: number; lng: number; name?: string };
}

export default function ComplaintModal({ isOpen, onClose, onSubmit, currentLocation }: ComplaintModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WaterComplaint['category']>('Canal Leakage');
  const [district, setDistrict] = useState('Erode');
  const [locationName, setLocationName] = useState(currentLocation.name || 'Selected Map Location');
  const [lat, setLat] = useState(currentLocation.lat);
  const [lng, setLng] = useState(currentLocation.lng);
  const [complainantName, setComplainantName] = useState('');
  const [phone, setPhone] = useState('');
  const [urgency, setUrgency] = useState<WaterComplaint['urgency']>('Medium');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !complainantName || !phone || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    const newId = `WTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: WaterComplaint = {
      id: newId,
      title,
      category,
      district,
      locationName,
      lat,
      lng,
      complainantName,
      phone,
      urgency,
      status: 'Pending',
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newComplaint);
    setGeneratedId(newId);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setTitle('');
    setComplainantName('');
    setPhone('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-blue-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-blue-950">NEER-AI Grievance Redressal</h3>
              <p className="text-xs text-slate-500 font-medium">Water Resources & Irrigation Public Ticket Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Complaint Submitted Successfully!</h4>
            <p className="text-sm text-slate-600">
              Your water issue ticket has been registered with NEER-AI Hydrology Central Command.
            </p>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 font-mono text-sm text-blue-900 inline-block font-extrabold">
              Ticket ID: {generatedId}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              The assigned Zonal Executive Engineer will review the reported GPS location shortly.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/20"
            >
              Close & View on Admin Center
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Summary / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Canal embankment cracked near irrigation branch"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Category & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WaterComplaint['category'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Canal Leakage">Canal Leakage</option>
                  <option value="Dry Borewell">Dry Borewell</option>
                  <option value="Contaminated Supply">Contaminated Supply</option>
                  <option value="Dam Sluice Malfunction">Dam Sluice Malfunction</option>
                  <option value="Illegal Extraction">Illegal Extraction</option>
                  <option value="Pipeline Burst">Pipeline Burst</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level *</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as WaterComplaint['urgency'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Low">Low - Routine maintenance</option>
                  <option value="Medium">Medium - Crop stress risk</option>
                  <option value="High">High - Crop loss imminent</option>
                  <option value="Emergency">Emergency - Flooding / Drought</option>
                </select>
              </div>
            </div>

            {/* District & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Erode / Thanjavur / Dharmapuri"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Village / Landmark *</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Block 4, North canal sluice"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* GPS Coordinates (Auto tagged from map) */}
            <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <MapPin className="w-4 h-4" />
                <span>GPS Location Tag:</span>
              </div>
              <div className="font-mono text-blue-950 font-bold">
                Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
              </div>
            </div>

            {/* Complainant Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="e.g. R. Subramanian"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 12345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the water problem, duration, affected acreage, and nearest landmarks..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              ></textarea>
            </div>

            {/* Photo Upload Simulation */}
            <div className="border border-dashed border-blue-300 rounded-xl p-3.5 text-center bg-blue-50/40 text-xs text-slate-600">
              <UploadCloud className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <span className="font-semibold text-blue-900">Attach photo evidence (Geo-tagged JPG/PNG)</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Simulated file attachment ready</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition"
              >
                <Send className="w-3.5 h-3.5" /> Submit Grievance
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
