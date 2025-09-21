import React, { useState, useEffect } from 'react';

const FIRForm = () => {
  const [formData, setFormData] = useState({
    form_details: {
      form_name: "FORM-IF1 - (Integrated Form)",
      report_title: "FIRST INFORMATION REPORT",
      legal_provision: "(Under Section 154 Cr.P.C)"
    },
    fir_registration: {
      district: "",
      police_station: "",
      fir_no: "",
      date: ""
    },
    offense_details: {
      acts_and_sections: [
        { act: "", sections: "" },
        { act: "", sections: "" },
        { act: "", sections: "" }
      ],
      other_acts_sections: ""
    },
    timeline_of_events: {
      occurrence_of_offence: {
        day: "",
        date: "",
        time: ""
      },
      information_received_at_ps: {
        date: "",
        time: ""
      },
      general_diary_reference: {
        entry_nos: "",
        time: ""
      }
    },
    information_type: "",
    place_of_occurrence: {
      direction_and_distance_from_ps: "",
      beat_no: "",
      address: "",
      if_outside_limit: {
        police_station: "",
        district: ""
      }
    },
    complainant_informant_details: {
      name: "",
      father_or_husband_name: "",
      date_or_year_of_birth: "",
      nationality: "",
      passport_details: {
        passport_no: "",
        date_of_issue: "",
        place_of_issue: ""
      },
      occupation: "",
      address: ""
    },
    accused_details: "",
    reporting_delay_reason: "",
    property_details: {
      particulars_of_properties_stolen_involved: "",
      total_value_of_properties: ""
    },
    case_references: {
      inquest_report_or_ud_case_no: ""
    },
    fir_contents: "",
    action_taken: "",
    signatures: {
      complainant_or_informant_signature: "",
      officer_in_charge: {
        signature: "",
        name: "",
        rank: "",
        no: ""
      }
    },
    dispatch_to_court: {
      date_and_time: ""
    }
  });

  // Load auto-filled data if available
  useEffect(() => {
    const autoFilledData = localStorage.getItem('justiceAI_FIRForm_data');
    if (autoFilledData) {
      try {
        const parsedData = JSON.parse(autoFilledData);
        setFormData(parsedData);
        // Clear the localStorage after loading
        localStorage.removeItem('justiceAI_FIRForm_data');
      } catch (error) {
        console.error('Error loading auto-filled data:', error);
      }
    }
  }, []);

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

  const addActSection = () => {
    setFormData(prev => ({
      ...prev,
      offense_details: {
        ...prev.offense_details,
        acts_and_sections: [...prev.offense_details.acts_and_sections, { act: "", sections: "" }]
      }
    }));
  };

  const removeActSection = (index) => {
    setFormData(prev => ({
      ...prev,
      offense_details: {
        ...prev.offense_details,
        acts_and_sections: prev.offense_details.acts_and_sections.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {formData.form_details.report_title}
        </h1>
        <p className="text-lg text-gray-600">{formData.form_details.form_name}</p>
        <p className="text-md text-gray-500">{formData.form_details.legal_provision}</p>
      </div>

      <form className="space-y-8">
        {/* FIR Registration Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">FIR Registration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={formData.fir_registration.district}
                onChange={(e) => handleInputChange('fir_registration', 'district', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter district name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
              <input
                type="text"
                value={formData.fir_registration.police_station}
                onChange={(e) => handleInputChange('fir_registration', 'police_station', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter police station name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FIR No.</label>
              <input
                type="text"
                value={formData.fir_registration.fir_no}
                onChange={(e) => handleInputChange('fir_registration', 'fir_no', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter FIR number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.fir_registration.date}
                onChange={(e) => handleInputChange('fir_registration', 'date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Offense Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Offense Details</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Acts and Sections</h3>
              <button
                type="button"
                onClick={addActSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Act/Section
              </button>
            </div>
            
            {formData.offense_details.acts_and_sections.map((actSection, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Act</label>
                  <input
                    type="text"
                    value={actSection.act}
                    onChange={(e) => handleInputChange('offense_details', 'acts_and_sections', e.target.value, index, 'act')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Indian Penal Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sections</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={actSection.sections}
                      onChange={(e) => handleInputChange('offense_details', 'acts_and_sections', e.target.value, index, 'sections')}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 302, 307"
                    />
                    {formData.offense_details.acts_and_sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActSection(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Acts & Sections</label>
            <textarea
              value={formData.offense_details.other_acts_sections}
              onChange={(e) => handleInputChange('offense_details', 'other_acts_sections', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any other applicable acts and sections"
            />
          </div>
        </section>

        {/* Timeline of Events */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Timeline of Events</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Occurrence of Offence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={formData.timeline_of_events.occurrence_of_offence.day}
                    onChange={(e) => handleInputChange('timeline_of_events', 'occurrence_of_offence', e.target.value, null, 'day')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.timeline_of_events.occurrence_of_offence.date}
                    onChange={(e) => handleInputChange('timeline_of_events', 'occurrence_of_offence', e.target.value, null, 'date')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.timeline_of_events.occurrence_of_offence.time}
                    onChange={(e) => handleInputChange('timeline_of_events', 'occurrence_of_offence', e.target.value, null, 'time')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Information Received at Police Station</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.timeline_of_events.information_received_at_ps.date}
                    onChange={(e) => handleInputChange('timeline_of_events', 'information_received_at_ps', e.target.value, null, 'date')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.timeline_of_events.information_received_at_ps.time}
                    onChange={(e) => handleInputChange('timeline_of_events', 'information_received_at_ps', e.target.value, null, 'time')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">General Diary Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry No(s)</label>
                  <input
                    type="text"
                    value={formData.timeline_of_events.general_diary_reference.entry_nos}
                    onChange={(e) => handleInputChange('timeline_of_events', 'general_diary_reference', e.target.value, null, 'entry_nos')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter entry numbers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.timeline_of_events.general_diary_reference.time}
                    onChange={(e) => handleInputChange('timeline_of_events', 'general_diary_reference', e.target.value, null, 'time')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Type */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Information Type</h2>
          <div className="space-y-3">
            {['Written', 'Oral', 'Telephonic', 'Electronic', 'Other'].map((type) => (
              <label key={type} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="information_type"
                  value={type}
                  checked={formData.information_type === type}
                  onChange={(e) => handleInputChange('', 'information_type', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Place of Occurrence */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Place of Occurrence</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction and Distance from Police Station</label>
              <input
                type="text"
                value={formData.place_of_occurrence.direction_and_distance_from_ps}
                onChange={(e) => handleInputChange('place_of_occurrence', 'direction_and_distance_from_ps', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2 km North of Police Station"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beat No.</label>
                <input
                  type="text"
                  value={formData.place_of_occurrence.beat_no}
                  onChange={(e) => handleInputChange('place_of_occurrence', 'beat_no', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter beat number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.place_of_occurrence.address}
                onChange={(e) => handleInputChange('place_of_occurrence', 'address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address of the place of occurrence"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">If Outside Police Station Limit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
                  <input
                    type="text"
                    value={formData.place_of_occurrence.if_outside_limit.police_station}
                    onChange={(e) => handleInputChange('place_of_occurrence', 'if_outside_limit', e.target.value, null, 'police_station')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Police station having jurisdiction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={formData.place_of_occurrence.if_outside_limit.district}
                    onChange={(e) => handleInputChange('place_of_occurrence', 'if_outside_limit', e.target.value, null, 'district')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="District having jurisdiction"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Complainant/Informant Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Complainant/Informant Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.complainant_informant_details.name}
                  onChange={(e) => handleInputChange('complainant_informant_details', 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name of complainant/informant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
                <input
                  type="text"
                  value={formData.complainant_informant_details.father_or_husband_name}
                  onChange={(e) => handleInputChange('complainant_informant_details', 'father_or_husband_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Father's or husband's name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date/Year of Birth</label>
                <input
                  type="text"
                  value={formData.complainant_informant_details.date_or_year_of_birth}
                  onChange={(e) => handleInputChange('complainant_informant_details', 'date_or_year_of_birth', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY or Year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input
                  type="text"
                  value={formData.complainant_informant_details.nationality}
                  onChange={(e) => handleInputChange('complainant_informant_details', 'nationality', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Indian"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={formData.complainant_informant_details.occupation}
                  onChange={(e) => handleInputChange('complainant_informant_details', 'occupation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Occupation/profession"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.complainant_informant_details.address}
                onChange={(e) => handleInputChange('complainant_informant_details', 'address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address of complainant/informant"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Passport Details (if applicable)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport No.</label>
                  <input
                    type="text"
                    value={formData.complainant_informant_details.passport_details.passport_no}
                    onChange={(e) => handleInputChange('complainant_informant_details', 'passport_details', e.target.value, null, 'passport_no')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Passport number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Issue</label>
                  <input
                    type="date"
                    value={formData.complainant_informant_details.passport_details.date_of_issue}
                    onChange={(e) => handleInputChange('complainant_informant_details', 'passport_details', e.target.value, null, 'date_of_issue')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place of Issue</label>
                  <input
                    type="text"
                    value={formData.complainant_informant_details.passport_details.place_of_issue}
                    onChange={(e) => handleInputChange('complainant_informant_details', 'passport_details', e.target.value, null, 'place_of_issue')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Place of issue"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accused Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accused Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Details of Accused (Known/Unknown)</label>
            <textarea
              value={formData.accused_details}
              onChange={(e) => handleInputChange('', 'accused_details', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide details of accused persons if known, or mention 'Unknown' if identity is not known"
            />
          </div>
        </section>

        {/* Reporting Delay Reason */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Reason for Delay in Reporting</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (if any)</label>
            <textarea
              value={formData.reporting_delay_reason}
              onChange={(e) => handleInputChange('', 'reporting_delay_reason', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain any delay in reporting the incident"
            />
          </div>
        </section>

        {/* Property Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Particulars of Properties Stolen/Involved</label>
              <textarea
                value={formData.property_details.particulars_of_properties_stolen_involved}
                onChange={(e) => handleInputChange('property_details', 'particulars_of_properties_stolen_involved', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of stolen or involved properties"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Value of Properties (₹)</label>
              <input
                type="number"
                value={formData.property_details.total_value_of_properties}
                onChange={(e) => handleInputChange('property_details', 'total_value_of_properties', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Total estimated value in rupees"
              />
            </div>
          </div>
        </section>

        {/* Case References */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Case References</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inquest Report/UD Case No. (if any)</label>
            <input
              type="text"
              value={formData.case_references.inquest_report_or_ud_case_no}
              onChange={(e) => handleInputChange('case_references', 'inquest_report_or_ud_case_no', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Related inquest report or UD case number"
            />
          </div>
        </section>

        {/* FIR Contents */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">FIR Contents</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Details of the Incident</label>
            <textarea
              value={formData.fir_contents}
              onChange={(e) => handleInputChange('', 'fir_contents', e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed narration of the incident as reported by the complainant/informant"
            />
          </div>
        </section>

        {/* Action Taken */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Action Taken</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken by Police</label>
            <textarea
              value={formData.action_taken}
              onChange={(e) => handleInputChange('', 'action_taken', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Details of immediate action taken by the police"
            />
          </div>
        </section>

        {/* Signatures */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Signatures</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complainant/Informant Signature</label>
              <input
                type="text"
                value={formData.signatures.complainant_or_informant_signature}
                onChange={(e) => handleInputChange('signatures', 'complainant_or_informant_signature', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digital signature or name"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Officer in Charge Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                  <input
                    type="text"
                    value={formData.signatures.officer_in_charge.signature}
                    onChange={(e) => handleInputChange('signatures', 'officer_in_charge', e.target.value, null, 'signature')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digital signature or name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.signatures.officer_in_charge.name}
                    onChange={(e) => handleInputChange('signatures', 'officer_in_charge', e.target.value, null, 'name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Officer's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                  <input
                    type="text"
                    value={formData.signatures.officer_in_charge.rank}
                    onChange={(e) => handleInputChange('signatures', 'officer_in_charge', e.target.value, null, 'rank')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Officer's rank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Number</label>
                  <input
                    type="text"
                    value={formData.signatures.officer_in_charge.no}
                    onChange={(e) => handleInputChange('signatures', 'officer_in_charge', e.target.value, null, 'no')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Service/badge number"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dispatch to Court */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dispatch to Court</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date and Time of Dispatch</label>
            <input
              type="datetime-local"
              value={formData.dispatch_to_court.date_and_time}
              onChange={(e) => handleInputChange('dispatch_to_court', 'date_and_time', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit FIR
          </button>
        </div>
      </form>
    </div>
  );
};

export default FIRForm;