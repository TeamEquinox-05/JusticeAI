import React, { useState } from 'react';

const LetterToPoliceSurgeonForm = () => {
  const [formData, setFormData] = useState({
    document_title: "Letter to Police Surgeon",
    case_details: { fir_no: "", police_station: "", district: "", date: "" },
    surgeon_details: { name: "", hospital_name: "", address: "" },
    examination_request: { subject_name: "", subject_age: "", examination_type: "", specific_requirements: "", urgency: "" }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Letter to Police Surgeon</h1>
      </div>
      <form className="space-y-8">
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Police Surgeon Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police Surgeon Name</label>
              <input type="text" value={formData.surgeon_details.name} onChange={(e) => handleInputChange('surgeon_details', 'name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Institution</label>
              <input type="text" value={formData.surgeon_details.hospital_name} onChange={(e) => handleInputChange('surgeon_details', 'hospital_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </section>
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Forensic Examination Request</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                <input type="text" value={formData.examination_request.subject_name} onChange={(e) => handleInputChange('examination_request', 'subject_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Age</label>
                <input type="number" value={formData.examination_request.subject_age} onChange={(e) => handleInputChange('examination_request', 'subject_age', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Forensic Examination</label>
              <select value={formData.examination_request.examination_type} onChange={(e) => handleInputChange('examination_request', 'examination_type', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Examination Type</option>
                <option value="Post-mortem Examination">Post-mortem Examination</option>
                <option value="Injury Documentation">Injury Documentation</option>
                <option value="Sexual Assault Examination">Sexual Assault Examination</option>
                <option value="Toxicology Analysis">Toxicology Analysis</option>
                <option value="DNA Sample Collection">DNA Sample Collection</option>
                <option value="Other Forensic Examination">Other Forensic Examination</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Requirements</label>
              <textarea value={formData.examination_request.specific_requirements} onChange={(e) => handleInputChange('examination_request', 'specific_requirements', e.target.value)} rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Detailed requirements for the forensic examination" />
            </div>
          </div>
        </section>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
          <button type="button" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Submit Letter</button>
        </div>
      </form>
    </div>
  );
};

export default LetterToPoliceSurgeonForm;