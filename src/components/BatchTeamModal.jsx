import React, { useState } from 'react';
import { X, Users, Download, Upload, Plus, Trash2, Check, Sparkles, Search, FileSpreadsheet } from 'lucide-react';
import { SAMPLE_TEAM_DATA } from '../utils/constants';
import { compileSignatureToHtml, downloadHtmlFile } from '../utils/compiler';

export function BatchTeamModal({
  isOpen,
  onClose,
  variables,
  setVariables,
  canvasConfig,
  layers,
  onApplyTeamMember
}) {
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'variables'
  const [teamList, setTeamList] = useState(SAMPLE_TEAM_DATA);
  const [search, setSearch] = useState('');
  const [csvText, setCsvText] = useState('');
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarVal, setNewVarVal] = useState('');
  const [batchStatus, setBatchStatus] = useState('');

  // Add Member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    FullName: '',
    JobTitle: '',
    Company: variables.Company || 'Company Inc.',
    Email: '',
    Phone: '',
    Website: variables.Website || 'https://yourwebsite.com',
    AvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  });

  if (!isOpen) return null;

  // Add custom variable
  const handleAddVariable = () => {
    if (!newVarKey.trim()) return;
    const cleanKey = newVarKey.trim().replace(/[^a-zA-Z0-9_]/g, '');
    setVariables(prev => ({ ...prev, [cleanKey]: newVarVal }));
    setNewVarKey('');
    setNewVarVal('');
  };

  // Delete variable
  const handleDeleteVariable = (key) => {
    const updated = { ...variables };
    delete updated[key];
    setVariables(updated);
  };

  // Add new team member to list
  const handleAddMember = () => {
    if (!newMember.FullName.trim()) return;
    setTeamList(prev => [newMember, ...prev]);
    setNewMember({
      FullName: '',
      JobTitle: '',
      Company: variables.Company || '',
      Email: '',
      Phone: '',
      Website: variables.Website || '',
      AvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    });
    setShowAddForm(false);
    setBatchStatus('Team member added!');
  };

  // Delete team member
  const handleDeleteMember = (idxToDelete) => {
    setTeamList(prev => prev.filter((_, idx) => idx !== idxToDelete));
  };

  // Batch download HTML for all team members
  const handleBatchDownloadAll = () => {
    setBatchStatus('Generating and downloading signatures...');
    teamList.forEach((member, idx) => {
      setTimeout(() => {
        const memberVars = { ...variables, ...member };
        const html = compileSignatureToHtml(canvasConfig, layers, memberVars, { fullDocument: true });
        const filename = `${member.FullName.replace(/\s+/g, '_')}_Signature.html`;
        downloadHtmlFile(filename, html);
      }, idx * 250);
    });

    setTimeout(() => {
      setBatchStatus(`Downloaded ${teamList.length} signatures!`);
    }, teamList.length * 250 + 500);
  };

  // Download sample CSV template
  const handleDownloadCsvTemplate = () => {
    const csvContent = "FullName,JobTitle,Company,Email,Phone,Website,AvatarUrl\n" +
      "Alexander Vance,VP of Product,Vortex Dynamics,alex@vortex.io,+1 555-234-5678,https://vortex.io,https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300\n" +
      "Sophia Rodriguez,Lead Architect,Vortex Dynamics,sophia@vortex.io,+1 555-456-7890,https://vortex.io,https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300";
    
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = 'team_signature_template.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Parse CSV / Tabular paste
  const handleParseCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(/,|\t/).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const parsed = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,|\t/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length === headers.length) {
        const obj = {};
        headers.forEach((h, index) => {
          obj[h] = values[index];
        });
        parsed.push(obj);
      }
    }

    if (parsed.length > 0) {
      setTeamList(parsed);
      setBatchStatus(`Imported ${parsed.length} team members from CSV!`);
      setCsvText('');
    }
  };

  const filteredTeam = teamList.filter(m =>
    m.FullName.toLowerCase().includes(search.toLowerCase()) ||
    (m.Email && m.Email.toLowerCase().includes(search.toLowerCase())) ||
    (m.JobTitle && m.JobTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 720 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Users size={18} color="#38bdf8" />
            <span>Dynamic Variables & Team Batch Studio</span>
          </div>
          <button className="tool-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel-header)' }}>
          <button
            className={`dock-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Members ({teamList.length})
          </button>
          <button
            className={`dock-tab ${activeTab === 'variables' ? 'active' : ''}`}
            onClick={() => setActiveTab('variables')}
          >
            Manage Placeholders
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: 440 }}>
          {activeTab === 'team' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Controls Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px', flex: 1, maxWidth: 280 }}>
                  <Search size={13} color="var(--text-dim)" />
                  <input
                    type="text"
                    placeholder="Search by name, title, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 12, padding: 0 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px 10px' }}
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus size={13} />
                    <span>Add Member</span>
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px 10px' }}
                    onClick={handleDownloadCsvTemplate}
                    title="Download CSV format template"
                  >
                    <FileSpreadsheet size={13} color="#10b981" />
                    <span>CSV Template</span>
                  </button>

                  <button
                    className="btn-primary"
                    onClick={handleBatchDownloadAll}
                    style={{ padding: '6px 12px', fontSize: 11 }}
                  >
                    <Download size={13} />
                    <span>Download All ({teamList.length})</span>
                  </button>
                </div>
              </div>

              {batchStatus && (
                <div style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-cyan)', borderRadius: 6, fontSize: 12, color: 'var(--accent-cyan)' }}>
                  {batchStatus}
                </div>
              )}

              {/* Add Member Form Drawer */}
              {showAddForm && (
                <div className="prop-group" style={{ background: 'var(--bg-card-hover)', borderColor: 'var(--border-active)' }}>
                  <span className="prop-group-title">New Team Member Details</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      className="prop-input-full"
                      value={newMember.FullName}
                      onChange={(e) => setNewMember({ ...newMember, FullName: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      className="prop-input-full"
                      value={newMember.JobTitle}
                      onChange={(e) => setNewMember({ ...newMember, JobTitle: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Email"
                      className="prop-input-full"
                      value={newMember.Email}
                      onChange={(e) => setNewMember({ ...newMember, Email: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      className="prop-input-full"
                      value={newMember.Phone}
                      onChange={(e) => setNewMember({ ...newMember, Phone: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn-primary" style={{ fontSize: 11, padding: '5px 12px' }} onClick={handleAddMember}>
                      Save Member
                    </button>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Team Members List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredTeam.map((member, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {member.AvatarUrl && (
                        <img
                          src={member.AvatarUrl}
                          alt={member.FullName}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{member.FullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {member.JobTitle} • {member.Email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => {
                          onApplyTeamMember(member);
                          onClose();
                        }}
                      >
                        <Sparkles size={12} color="#6366f1" />
                        <span>Apply to Canvas</span>
                      </button>
                      <button
                        className="tool-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => handleDeleteMember(idx)}
                        title="Delete member"
                      >
                        <Trash2 size={13} color="#f43f5e" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CSV Import Box */}
              <div className="prop-group" style={{ marginTop: 6 }}>
                <span className="prop-group-title">Paste or Import CSV Table</span>
                <textarea
                  rows={2}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste CSV rows: FullName,JobTitle,Company,Email,Phone,Website,AvatarUrl..."
                  style={{ width: '100%', padding: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                />
                <button
                  className="btn-secondary"
                  onClick={handleParseCsv}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Upload size={13} />
                  <span>Parse CSV Rows</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                These dynamic tags automatically replace <code>{'{Key}'}</code> inside text elements, buttons, and links.
              </p>

              {/* Variables Dictionary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ width: 120, fontSize: 12, color: 'var(--accent-cyan)', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: 4 }}>
                      {`{${key}}`}
                    </code>
                    <input
                      type="text"
                      className="prop-input-full"
                      value={val}
                      onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                    />
                    <button
                      className="tool-btn"
                      onClick={() => handleDeleteVariable(key)}
                      title="Delete variable"
                    >
                      <Trash2 size={13} color="#f43f5e" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Variable */}
              <div className="prop-group" style={{ marginTop: 10 }}>
                <span className="prop-group-title">Add Custom Variable</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Key (e.g. TwitterHandle)"
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value)}
                    style={{ width: 180, padding: '6px 10px', fontSize: 12 }}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. @alex_vance)"
                    value={newVarVal}
                    onChange={(e) => setNewVarVal(e.target.value)}
                    className="prop-input-full"
                  />
                  <button className="btn-secondary" onClick={handleAddVariable}>
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
