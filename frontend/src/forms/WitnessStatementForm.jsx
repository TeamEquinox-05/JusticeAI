import React, { useState, useEffect } from 'react';

const WitnessStatementForm = ({ initialData, onComplete, caseData }) => {
  const [formData, setFormData] = useState({
    document_title: "Witness Statement Record",
    case_reference: {
      fir_no: "",
      date: "",
      police_station: "",
      district: ""
    },
    witness_details: {
      name: "",
      age: "",
      gender: "",
      father_or_husband_name: "",
      address: "",
      contact_number: "",
      occupation: ""
    },
    statement_meta_data: {
      date_of_recording: "",
      time_of_recording: "",
      place_of_recording: "",
      recording_officer_name: "",
      recording_officer_rank: ""
    },
    statement_content: {
      witness_narrative: "",
      facts_observed: "",
      identification_details: ""
    }
  });

  // Auto-populate form with case data
  useEffect(() => {
    if (caseData) {
      setFormData(prev => ({
        ...prev,
        case_reference: {
          fir_no: caseData.firNumber || "",
          date: caseData.dateTime?.split(' ')[0] || "",
          police_station: caseData.policeStation || "",
          district: caseData.district || ""
        },
        incident_details: {
          date: caseData.dateTime?.split(' ')[0] || "",
          time: caseData.dateTime?.split(' ')[1] || "",
          location: caseData.location || "",
          brief_description: caseData.incidentDescription || ""
        }
      }));
    }
  }, [caseData]);

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
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {formData.document_title}
        </h1>
      </div>

      <form className="space-y-8">
        {/* Case Reference */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FIR No.</label>
              <input
                type="text"
                value={formData.case_reference.fir_no}
                onChange={(e) => handleInputChange('case_reference', 'fir_no', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="FIR number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.case_reference.date}
                onChange={(e) => handleInputChange('case_reference', 'date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
              <input
                type="text"
                value={formData.case_reference.police_station}
                onChange={(e) => handleInputChange('case_reference', 'police_station', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Police station name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={formData.case_reference.district}
                onChange={(e) => handleInputChange('case_reference', 'district', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="District name"
              />
            </div>
          </div>
        </section>

        {/* Witness Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Witness Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.witness_details.name}
                  onChange={(e) => handleInputChange('witness_details', 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Witness full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.witness_details.age}
                  onChange={(e) => handleInputChange('witness_details', 'age', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.witness_details.gender}
                  onChange={(e) => handleInputChange('witness_details', 'gender', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
                <input
                  type="text"
                  value={formData.witness_details.father_or_husband_name}
                  onChange={(e) => handleInputChange('witness_details', 'father_or_husband_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Father's or husband's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={formData.witness_details.occupation}
                  onChange={(e) => handleInputChange('witness_details', 'occupation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Occupation"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.witness_details.address}
                onChange={(e) => handleInputChange('witness_details', 'address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address"
              />
            </div>
          </div>
        </section>

        {/* Statement Content */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Witness Statement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Witness Narrative</label>
              <textarea
                value={formData.statement_content.witness_narrative}
                onChange={(e) => handleInputChange('statement_content', 'witness_narrative', e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Record the witness statement as narrated..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facts Observed</label>
              <textarea
                value={formData.statement_content.facts_observed}
                onChange={(e) => handleInputChange('statement_content', 'facts_observed', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Specific facts observed by the witness..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identification Details</label>
              <textarea
                value={formData.statement_content.identification_details}
                onChange={(e) => handleInputChange('statement_content', 'identification_details', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Details of any persons/objects identified by witness..."
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              localStorage.setItem('caseSwift_WitnessStatementForm_draft', JSON.stringify(formData));
              alert('Statement saved as draft');
            }}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              localStorage.setItem('caseSwift_WitnessStatementForm_complete', JSON.stringify(formData));
              if (onComplete) onComplete('WitnessStatementForm');
              alert('Witness statement submitted successfully');
            }}
          >
            Submit Statement
          </button>
        </div>
      </form>
    </div>
  );
};

export default WitnessStatementForm;