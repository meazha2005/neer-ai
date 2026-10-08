'use client';

import React, { useState } from 'react';
import { WaterComplaint } from '@/types';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  MapPin,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';

interface AdminDashboardProps {
  complaints: WaterComplaint[];
  onUpdateComplaint: (updated: WaterComplaint) => void;
  onLocateOnMap: (lat: number, lng: number, name: string) => void;
}

export default function AdminDashboard({ complaints, onUpdateComplaint, onLocateOnMap }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<WaterComplaint | null>(null);
  const [officerInput, setOfficerInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const investigating = complaints.filter((c) => c.status === 'Investigating').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const emergency = complaints.filter((c) => c.urgency === 'Emergency' || c.urgency === 'High').length;

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = (ticket: WaterComplaint, newStatus: WaterComplaint['status']) => {
    const updated: WaterComplaint = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      assignedOfficer: officerInput || ticket.assignedOfficer,
      resolutionNotes: resolutionInput || ticket.resolutionNotes,
    };
    onUpdateComplaint(updated);
    setSelectedTicket(updated);
  };

  const getUrgencyBadge = (urgency: WaterComplaint['urgency']) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-black animate-pulse';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-300 font-bold';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-300 font-semibold';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  const getStatusBadge = (status: WaterComplaint['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Investigating':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-6 shadow-sm text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-blue-950">
              NEER-AI Grievance Command Center
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              State Hydrological Directorate • Real-Time Redressal Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exported complaints log to CSV report format.')}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-800 flex items-center justify-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4 sm:mt-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Total Tickets</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{total}</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-amber-800 font-bold">Pending Review</div>
          <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{pending}</div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-blue-800 font-bold">Investigating</div>
          <div className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">{investigating}</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-purple-800 font-bold">In Progress</div>
          <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{inProgress}</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-emerald-800 font-bold">Resolved</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">{resolved}</div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-[11px] text-rose-800 font-bold">High / Urgent</div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{emergency}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID, district, keyword..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Investigating">Investigating</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Canal Leakage">Canal Leakage</option>
            <option value="Dry Borewell">Dry Borewell</option>
            <option value="Contaminated Supply">Contaminated Supply</option>
            <option value="Dam Sluice Malfunction">Dam Sluice Malfunction</option>
            <option value="Illegal Extraction">Illegal Extraction</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List View (Shown on small screens) */}
      <div className="block md:hidden mt-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">No grievances found matching search.</div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedTicket(item);
                setOfficerInput(item.assignedOfficer || '');
                setResolutionInput(item.resolutionNotes || '');
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                selectedTicket?.id === item.id
                  ? 'bg-blue-50 border-blue-400 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-black text-blue-700">{item.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="font-bold text-xs sm:text-sm text-slate-900 mt-1">{item.title}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.category} • {item.district}</div>

              <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-full text-[10px] border font-semibold ${getUrgencyBadge(item.urgency)}`}>
                  {item.urgency} Urgency
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocateOnMap(item.lat, item.lng, `${item.id}: ${item.title}`);
                  }}
                  className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold inline-flex items-center gap-1 transition"
                >
                  <MapPin className="w-3 h-3 text-blue-600" /> Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block mt-4 border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-blue-50/70 border-b border-blue-100 text-blue-950 font-bold">
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Title & Category</th>
              <th className="p-3">District & Location</th>
              <th className="p-3">Complainant</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  No grievances found matching the current search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-50/40 transition cursor-pointer ${
                    selectedTicket?.id === item.id ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                  }`}
                  onClick={() => {
                    setSelectedTicket(item);
                    setOfficerInput(item.assignedOfficer || '');
                    setResolutionInput(item.resolutionNotes || '');
                  }}
                >
                  <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <span className="text-[10px] text-slate-500 font-medium">{item.category}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800 font-semibold">{item.district}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{item.locationName}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800 font-medium">{item.complainantName}</div>
                    <div className="text-[10px] text-slate-500">{item.phone}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getUrgencyBadge(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLocateOnMap(item.lat, item.lng, `${item.id}: ${item.title}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold inline-flex items-center gap-1 border border-blue-200 transition"
                      title="View GPS location on main Leaflet Map"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" /> Focus Map
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Ticket Action Panel (Fully responsive) */}
      {selectedTicket && (
        <div className="mt-5 sm:mt-6 bg-blue-50/40 border border-blue-200 rounded-xl p-4 sm:p-5 animate-in fade-in duration-150">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-blue-200/80 pb-3">
            <div>
              <span className="font-mono text-xs text-blue-700 font-bold">{selectedTicket.id}</span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{selectedTicket.title}</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Reported by {selectedTicket.complainantName} ({selectedTicket.phone}) • {new Date(selectedTicket.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handleStatusChange(selectedTicket, 'Investigating')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold hover:bg-blue-200 transition cursor-pointer"
              >
                Investigate
              </button>
              <button
                onClick={() => handleStatusChange(selectedTicket, 'In Progress')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold hover:bg-purple-200 transition cursor-pointer"
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange(selectedTicket, 'Resolved')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Resolve
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Issue Description:</div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                {selectedTicket.description}
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-800 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>GPS: {selectedTicket.lat.toFixed(4)}, {selectedTicket.lng.toFixed(4)} ({selectedTicket.locationName})</span>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Officer / Executive Engineer:
                </label>
                <input
                  type="text"
                  value={officerInput}
                  onChange={(e) => setOfficerInput(e.target.value)}
                  placeholder="e.g. Er. K. Ramesh (AE, WRD Bhavani)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resolution Notes / Work Order Status:
                </label>
                <textarea
                  rows={2}
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  placeholder="Add site inspection notes, sandbag reinforcement, pump repairs..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                ></textarea>
              </div>

              <button
                onClick={() => handleStatusChange(selectedTicket, selectedTicket.status)}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Save Officer & Notes Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
