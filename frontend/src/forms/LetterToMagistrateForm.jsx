import React, { useState } from 'react';

const LetterToMagistrateForm = () => {
  const [formData, setFormData] = useState({
    document_title: "Letter to Magistrate",
    case_details: { fir_no: "", police_station: "", district: "", date: "" },
    magistrate_details: { name: "", court_name: "", address: "" },
    letter_content: { subject: "", purpose: "", detailed_request: "", supporting_documents: "" }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Letter to Magistrate</h1>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Magistrate Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Magistrate Name</label>
              <input type="text" value={formData.magistrate_details.name} onChange={(e) => handleInputChange('magistrate_details', 'name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Court Name</label>
              <input type="text" value={formData.magistrate_details.court_name} onChange={(e) => handleInputChange('magistrate_details', 'court_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </section>
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Letter Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input type="text" value={formData.letter_content.subject} onChange={(e) => handleInputChange('letter_content', 'subject', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Subject of the letter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <textarea value={formData.letter_content.purpose} onChange={(e) => handleInputChange('letter_content', 'purpose', e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Purpose of writing this letter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Request</label>
              <textarea value={formData.letter_content.detailed_request} onChange={(e) => handleInputChange('letter_content', 'detailed_request', e.target.value)} rows={8} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Detailed explanation of the request to the magistrate" />
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

export default LetterToMagistrateForm;