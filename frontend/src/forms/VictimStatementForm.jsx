import React, { useState, useEffect } from 'react';

const VictimStatementForm = ({ initialData, onComplete, caseData }) => {
  const [formData, setFormData] = useState({
    document_title: "Victim's Statement Record",
    case_reference: {
      fir_no: "",
      date: "",
      police_station: "",
      district: ""
    },
    victim_details: {
      name: "",
      age: "",
      gender: "",
      father_or_husband_name: "",
      address: "",
      contact_number: ""
    },
    accused_details: [
      {
        name: "",
        alias: "",
        address: "",
        physical_description: "",
        relationship_to_victim: ""
      }
    ],
    statement_meta_data: {
      date_of_recording: "",
      time_of_recording: "",
      place_of_recording: "",
      recording_officer_name: "",
      recording_officer_rank: ""
    },
    statement_content: {
      chronological_narrative: ""
    },
    compliance_checklist: {
      was_statement_recorded_by_woman_officer: "",
      was_guardian_present_for_minor_victim: "",
      was_statement_recorded_at_victim_residence_or_choice_location: ""
    }
  });

  // Load auto-filled data if available
  useEffect(() => {
    const autoFilledData = localStorage.getItem('caseSwift_VictimStatementForm_data');
    if (autoFilledData) {
      try {
        const parsedData = JSON.parse(autoFilledData);
        setFormData(parsedData);
        // Clear the localStorage after loading
        localStorage.removeItem('caseSwift_VictimStatementForm_data');
      } catch (error) {
        console.error('Error loading auto-filled data:', error);
      }
    }
  }, []);

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
          description: caseData.incidentDescription || ""
        },
        victim_information: {
          name: caseData.victimDetails?.name || "",
          age: caseData.victimDetails?.age || "",
          gender: caseData.victimDetails?.gender || "",
          address: caseData.victimDetails?.address || "",
          guardian_name: caseData.victimDetails?.guardianName || "",
          guardian_relationship: caseData.victimDetails?.guardianRelationship || "",
          contact_number: caseData.victimDetails?.contactNumber || ""
        }
      }));
    }
  }, [caseData]);

  const handleInputChange = (section, field, value, index = null, subField = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (index !== null && subField) {
        newData[section][field][index][subField] = value;
      } else if (subField) {
        newData[section][field][subField] = value;
      } else if (index !== null) {
        newData[section][field][index] = value;
      } else {
        newData[section][field] = value;
      }
      
      return newData;
    });
  };

  const addAccused = () => {
    setFormData(prev => ({
      ...prev,
      accused_details: [...prev.accused_details, {
        name: "",
        alias: "",
        address: "",
        physical_description: "",
        relationship_to_victim: ""
      }]
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

        {/* Victim Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Victim Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.victim_details.name}
                  onChange={(e) => handleInputChange('victim_details', 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Victim's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.victim_details.age}
                  onChange={(e) => handleInputChange('victim_details', 'age', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.victim_details.gender}
                  onChange={(e) => handleInputChange('victim_details', 'gender', e.target.value)}
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
                  value={formData.victim_details.father_or_husband_name}
                  onChange={(e) => handleInputChange('victim_details', 'father_or_husband_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Father's or husband's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={formData.victim_details.contact_number}
                  onChange={(e) => handleInputChange('victim_details', 'contact_number', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.victim_details.address}
                onChange={(e) => handleInputChange('victim_details', 'address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address"
              />
            </div>
          </div>
        </section>

        {/* Accused Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Accused Details</h2>
            <button
              type="button"
              onClick={addAccused}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Accused
            </button>
          </div>
          {formData.accused_details.map((accused, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Accused {index + 1}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={accused.name}
                      onChange={(e) => handleInputChange('accused_details', 'name', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Accused name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alias</label>
                    <input
                      type="text"
                      value={accused.alias}
                      onChange={(e) => handleInputChange('accused_details', 'alias', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Known aliases"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={accused.address}
                    onChange={(e) => handleInputChange('accused_details', 'address', e.target.value, index)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Accused address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Physical Description</label>
                  <textarea
                    value={accused.physical_description}
                    onChange={(e) => handleInputChange('accused_details', 'physical_description', e.target.value, index)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Physical description of the accused"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Victim</label>
                  <input
                    type="text"
                    value={accused.relationship_to_victim}
                    onChange={(e) => handleInputChange('accused_details', 'relationship_to_victim', e.target.value, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Relationship to victim (if any)"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Statement Metadata */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statement Recording Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Recording</label>
                <input
                  type="date"
                  value={formData.statement_meta_data.date_of_recording}
                  onChange={(e) => handleInputChange('statement_meta_data', 'date_of_recording', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Recording</label>
                <input
                  type="time"
                  value={formData.statement_meta_data.time_of_recording}
                  onChange={(e) => handleInputChange('statement_meta_data', 'time_of_recording', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place of Recording</label>
                <input
                  type="text"
                  value={formData.statement_meta_data.place_of_recording}
                  onChange={(e) => handleInputChange('statement_meta_data', 'place_of_recording', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Place where statement was recorded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recording Officer Name</label>
                <input
                  type="text"
                  value={formData.statement_meta_data.recording_officer_name}
                  onChange={(e) => handleInputChange('statement_meta_data', 'recording_officer_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Officer who recorded the statement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recording Officer Rank</label>
                <input
                  type="text"
                  value={formData.statement_meta_data.recording_officer_rank}
                  onChange={(e) => handleInputChange('statement_meta_data', 'recording_officer_rank', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Officer rank"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Statement Content */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statement Content</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chronological Narrative</label>
            <textarea
              value={formData.statement_content.chronological_narrative}
              onChange={(e) => handleInputChange('statement_content', 'chronological_narrative', e.target.value)}
              rows={10}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Record the victim's statement in chronological order as narrated by the victim. Include all relevant details of the incident..."
            />
          </div>
        </section>

        {/* Compliance Checklist */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Checklist</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Was statement recorded by woman officer?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="woman_officer"
                    value="Yes"
                    checked={formData.compliance_checklist.was_statement_recorded_by_woman_officer === "Yes"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_statement_recorded_by_woman_officer', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="woman_officer"
                    value="No"
                    checked={formData.compliance_checklist.was_statement_recorded_by_woman_officer === "No"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_statement_recorded_by_woman_officer', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Was guardian present for minor victim?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="guardian_present"
                    value="Yes"
                    checked={formData.compliance_checklist.was_guardian_present_for_minor_victim === "Yes"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_guardian_present_for_minor_victim', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="guardian_present"
                    value="No"
                    checked={formData.compliance_checklist.was_guardian_present_for_minor_victim === "No"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_guardian_present_for_minor_victim', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="guardian_present"
                    value="N/A"
                    checked={formData.compliance_checklist.was_guardian_present_for_minor_victim === "N/A"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_guardian_present_for_minor_victim', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">N/A (Adult victim)</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Was statement recorded at victim's residence or choice location?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="choice_location"
                    value="Yes"
                    checked={formData.compliance_checklist.was_statement_recorded_at_victim_residence_or_choice_location === "Yes"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_statement_recorded_at_victim_residence_or_choice_location', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="choice_location"
                    value="No"
                    checked={formData.compliance_checklist.was_statement_recorded_at_victim_residence_or_choice_location === "No"}
                    onChange={(e) => handleInputChange('compliance_checklist', 'was_statement_recorded_at_victim_residence_or_choice_location', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              localStorage.setItem('caseSwift_VictimStatementForm_draft', JSON.stringify(formData));
              alert('Statement saved as draft');
            }}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              localStorage.setItem('caseSwift_VictimStatementForm_complete', JSON.stringify(formData));
              if (onComplete) onComplete('VictimStatementForm');
              alert('Victim statement submitted successfully');
            }}
          >
            Submit Statement
          </button>
        </div>
      </form>
    </div>
  );
};

export default VictimStatementForm;