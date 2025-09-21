import React, { useState } from 'react';

const SeizureMemoForm = () => {
  const [formData, setFormData] = useState({
    document_title: "Seizure Memo",
    case_details: { fir_no: "", police_station: "", district: "", date: "" },
    seizure_details: {
      date_of_seizure: "",
      time_of_seizure: "",
      place_of_seizure: "",
      seizing_officer: "",
      items_seized: "",
      estimated_value: "",
      recovery_circumstances: ""
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Seizure Memo</h1>
      </div>
      <form className="space-y-8">
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FIR No.</label>
              <input type="text" value={formData.case_details.fir_no} onChange={(e) => handleInputChange('case_details', 'fir_no', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
              <input type="text" value={formData.case_details.police_station} onChange={(e) => handleInputChange('case_details', 'police_station', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </section>
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seizure Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Seizure</label>
                <input type="date" value={formData.seizure_details.date_of_seizure} onChange={(e) => handleInputChange('seizure_details', 'date_of_seizure', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Seizure</label>
                <input type="time" value={formData.seizure_details.time_of_seizure} onChange={(e) => handleInputChange('seizure_details', 'time_of_seizure', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seizing Officer</label>
                <input type="text" value={formData.seizure_details.seizing_officer} onChange={(e) => handleInputChange('seizure_details', 'seizing_officer', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items Seized</label>
              <textarea value={formData.seizure_details.items_seized} onChange={(e) => handleInputChange('seizure_details', 'items_seized', e.target.value)} rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Detailed description of items seized" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recovery Circumstances</label>
              <textarea value={formData.seizure_details.recovery_circumstances} onChange={(e) => handleInputChange('seizure_details', 'recovery_circumstances', e.target.value)} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Circumstances under which items were recovered" />
            </div>
          </div>
        </section>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
          <button type="button" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Submit Memo</button>
        </div>
      </form>
    </div>
  );
};

export default SeizureMemoForm;