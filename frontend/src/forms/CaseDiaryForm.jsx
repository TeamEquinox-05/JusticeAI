import React, { useState } from 'react';

const CaseDiaryForm = () => {
  const [formData, setFormData] = useState({
    document_title: "Case Diary",
    case_details: {
      fir_no: "",
      date: "",
      police_station: "",
      district: ""
    },
    diary_entry: {
      entry_date: "",
      entry_time: "",
      investigating_officer: "",
      activities_conducted: "",
      evidence_collected: "",
      witnesses_examined: "",
      progress_made: "",
      next_steps: ""
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Case Diary</h1>
      </div>

      <form className="space-y-8">
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FIR No.</label>
              <input
                type="text"
                value={formData.case_details.fir_no}
                onChange={(e) => handleInputChange('case_details', 'fir_no', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
              <input
                type="text"
                value={formData.case_details.police_station}
                onChange={(e) => handleInputChange('case_details', 'police_station', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Diary Entry</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Date</label>
                <input
                  type="date"
                  value={formData.diary_entry.entry_date}
                  onChange={(e) => handleInputChange('diary_entry', 'entry_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Time</label>
                <input
                  type="time"
                  value={formData.diary_entry.entry_time}
                  onChange={(e) => handleInputChange('diary_entry', 'entry_time', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investigating Officer</label>
                <input
                  type="text"
                  value={formData.diary_entry.investigating_officer}
                  onChange={(e) => handleInputChange('diary_entry', 'investigating_officer', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activities Conducted</label>
              <textarea
                value={formData.diary_entry.activities_conducted}
                onChange={(e) => handleInputChange('diary_entry', 'activities_conducted', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of investigation activities conducted today"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Collected</label>
              <textarea
                value={formData.diary_entry.evidence_collected}
                onChange={(e) => handleInputChange('diary_entry', 'evidence_collected', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Details of evidence collected during today's investigation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress Made</label>
              <textarea
                value={formData.diary_entry.progress_made}
                onChange={(e) => handleInputChange('diary_entry', 'progress_made', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Summary of progress made in the investigation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
              <textarea
                value={formData.diary_entry.next_steps}
                onChange={(e) => handleInputChange('diary_entry', 'next_steps', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Planned activities for upcoming investigation"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button type="button" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Submit Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseDiaryForm;