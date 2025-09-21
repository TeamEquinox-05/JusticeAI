import React, { useState, useEffect } from 'react';

const ChargeSheetForm = () => {
  const [formData, setFormData] = useState({
    form_details: {
      form_name: "FORM IF5",
      document_title: "FINAL FORM/REPORT (Under Section 173 CR. P.C.)"
    },
    court_name: "",
    case_identification: {
      district: "",
      police_station: "",
      year: "",
      fir_no: "",
      fir_date: "",
      final_report_or_chargesheet_no: "",
      final_report_date: "",
      acts_and_sections: [
        { act: "", section: "" },
        { act: "", section: "" },
        { act: "", section: "" }
      ],
      other_acts_and_sections: "",
      report_type: ""
    },
    report_summary: {
      type_of_final_report: "",
      reason_if_unoccurred: "",
      investigating_officer_name: "",
      investigating_officer_rank: ""
    },
    complainant_details: {
      name: "",
      father_or_husband_name: ""
    },
    seized_properties_relied_upon: [
      {
        property_description: "",
        estimated_value_in_rs: "",
        ps_property_register_no: "",
        recovered_from_or_where: "",
        disposal: ""
      }
    ],
    accused_charge_sheeted: [
      {
        name: "",
        is_name_verified: "",
        father_or_husband_name: "",
        date_or_year_of_birth: "",
        sex: "",
        nationality: "",
        passport_info: {
          passport_no: "",
          date_of_issue: "",
          place_of_issue: ""
        },
        religion: "",
        is_sc_st: "",
        occupation: "",
        address: "",
        is_address_verified: "",
        provisional_criminal_no: "",
        regular_criminal_no: "",
        date_of_arrest: "",
        date_of_release_on_bail: "",
        date_forwarded_to_court: "",
        charged_under_acts_sections: "",
        sureties_names_and_addresses: "",
        previous_convictions: "",
        status_of_accused: ""
      }
    ],
    witnesses_to_be_examined: [
      {
        name: "",
        father_or_husband_name: "",
        date_or_year_of_birth: "",
        occupation: "",
        address: "",
        type_of_evidence_to_be_tendered: ""
      }
    ],
    investigation_findings: {
      action_if_fr_is_false: "",
      result_of_laboratory_analysis: "",
      brief_facts_of_case: ""
    },
    submission_details: {
      is_refer_notice_served: "",
      refer_notice_date: "",
      despatched_on_date: "",
      forwarding_officer: {
        name: "",
        rank: "",
        number: ""
      },
      submitting_investigating_officer: {
        signature: "",
        name: "",
        rank: "",
        number: ""
      }
    }
  });

  // Load auto-filled data if available
  useEffect(() => {
    const autoFilledData = localStorage.getItem('justiceAI_ChargeSheetForm_data');
    if (autoFilledData) {
      try {
        const parsedData = JSON.parse(autoFilledData);
        setFormData(parsedData);
        // Clear the localStorage after loading
        localStorage.removeItem('justiceAI_ChargeSheetForm_data');
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

  const addAccused = () => {
    setFormData(prev => ({
      ...prev,
      accused_charge_sheeted: [...prev.accused_charge_sheeted, {
        name: "",
        is_name_verified: "",
        father_or_husband_name: "",
        date_or_year_of_birth: "",
        sex: "",
        nationality: "",
        passport_info: {
          passport_no: "",
          date_of_issue: "",
          place_of_issue: ""
        },
        religion: "",
        is_sc_st: "",
        occupation: "",
        address: "",
        is_address_verified: "",
        provisional_criminal_no: "",
        regular_criminal_no: "",
        date_of_arrest: "",
        date_of_release_on_bail: "",
        date_forwarded_to_court: "",
        charged_under_acts_sections: "",
        sureties_names_and_addresses: "",
        previous_convictions: "",
        status_of_accused: ""
      }]
    }));
  };

  const addWitness = () => {
    setFormData(prev => ({
      ...prev,
      witnesses_to_be_examined: [...prev.witnesses_to_be_examined, {
        name: "",
        father_or_husband_name: "",
        date_or_year_of_birth: "",
        occupation: "",
        address: "",
        type_of_evidence_to_be_tendered: ""
      }]
    }));
  };

  const addProperty = () => {
    setFormData(prev => ({
      ...prev,
      seized_properties_relied_upon: [...prev.seized_properties_relied_upon, {
        property_description: "",
        estimated_value_in_rs: "",
        ps_property_register_no: "",
        recovered_from_or_where: "",
        disposal: ""
      }]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {formData.form_details.document_title}
        </h1>
        <p className="text-lg text-gray-600">{formData.form_details.form_name}</p>
      </div>

      <form className="space-y-8">
        {/* Court Name */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Court Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Court Name</label>
            <input
              type="text"
              value={formData.court_name}
              onChange={(e) => handleInputChange('', 'court_name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Name of the court where the case will be filed"
            />
          </div>
        </section>

        {/* Case Identification */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Identification</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  value={formData.case_identification.district}
                  onChange={(e) => handleInputChange('case_identification', 'district', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="District name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Police Station</label>
                <input
                  type="text"
                  value={formData.case_identification.police_station}
                  onChange={(e) => handleInputChange('case_identification', 'police_station', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Police station name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={formData.case_identification.year}
                  onChange={(e) => handleInputChange('case_identification', 'year', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Year of case"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FIR No.</label>
                <input
                  type="text"
                  value={formData.case_identification.fir_no}
                  onChange={(e) => handleInputChange('case_identification', 'fir_no', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="FIR number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FIR Date</label>
                <input
                  type="date"
                  value={formData.case_identification.fir_date}
                  onChange={(e) => handleInputChange('case_identification', 'fir_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Report/Charge Sheet No.</label>
                <input
                  type="text"
                  value={formData.case_identification.final_report_or_chargesheet_no}
                  onChange={(e) => handleInputChange('case_identification', 'final_report_or_chargesheet_no', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Final report/charge sheet number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Report Date</label>
                <input
                  type="date"
                  value={formData.case_identification.final_report_date}
                  onChange={(e) => handleInputChange('case_identification', 'final_report_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={formData.case_identification.report_type}
                onChange={(e) => handleInputChange('case_identification', 'report_type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Report Type</option>
                <option value="Charge Sheet">Charge Sheet</option>
                <option value="Final Report">Final Report</option>
                <option value="Cancellation Report">Cancellation Report</option>
              </select>
            </div>
          </div>
        </section>

        {/* Report Summary */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Summary</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Final Report</label>
              <select
                value={formData.report_summary.type_of_final_report}
                onChange={(e) => handleInputChange('report_summary', 'type_of_final_report', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="Charge Sheet Filed">Charge Sheet Filed</option>
                <option value="Final Report - True but Untraced">Final Report - True but Untraced</option>
                <option value="Final Report - False">Final Report - False</option>
                <option value="Final Report - Non-cognizable">Final Report - Non-cognizable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (if unoccurred)</label>
              <textarea
                value={formData.report_summary.reason_if_unoccurred}
                onChange={(e) => handleInputChange('report_summary', 'reason_if_unoccurred', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide reason if the case is found to be unoccurred"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investigating Officer Name</label>
                <input
                  type="text"
                  value={formData.report_summary.investigating_officer_name}
                  onChange={(e) => handleInputChange('report_summary', 'investigating_officer_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name of investigating officer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investigating Officer Rank</label>
                <input
                  type="text"
                  value={formData.report_summary.investigating_officer_rank}
                  onChange={(e) => handleInputChange('report_summary', 'investigating_officer_rank', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rank of investigating officer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Complainant Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Complainant Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.complainant_details.name}
                onChange={(e) => handleInputChange('complainant_details', 'name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complainant's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
              <input
                type="text"
                value={formData.complainant_details.father_or_husband_name}
                onChange={(e) => handleInputChange('complainant_details', 'father_or_husband_name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Father's or husband's name"
              />
            </div>
          </div>
        </section>

        {/* Seized Properties */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Seized Properties Relied Upon</h2>
            <button
              type="button"
              onClick={addProperty}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Property
            </button>
          </div>
          {formData.seized_properties_relied_upon.map((property, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Description</label>
                  <textarea
                    value={property.property_description}
                    onChange={(e) => handleInputChange('seized_properties_relied_upon', 'property_description', e.target.value, index)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description of seized property"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={property.estimated_value_in_rs}
                    onChange={(e) => handleInputChange('seized_properties_relied_upon', 'estimated_value_in_rs', e.target.value, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Estimated value in rupees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PS Property Register No.</label>
                  <input
                    type="text"
                    value={property.ps_property_register_no}
                    onChange={(e) => handleInputChange('seized_properties_relied_upon', 'ps_property_register_no', e.target.value, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Police station property register number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recovered From/Where</label>
                  <input
                    type="text"
                    value={property.recovered_from_or_where}
                    onChange={(e) => handleInputChange('seized_properties_relied_upon', 'recovered_from_or_where', e.target.value, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Place/person from where recovered"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disposal</label>
                <input
                  type="text"
                  value={property.disposal}
                  onChange={(e) => handleInputChange('seized_properties_relied_upon', 'disposal', e.target.value, index)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Disposal details"
                />
              </div>
            </div>
          ))}
        </section>

        {/* Accused Charge Sheeted */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Accused Charge Sheeted</h2>
            <button
              type="button"
              onClick={addAccused}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Accused
            </button>
          </div>
          {formData.accused_charge_sheeted.map((accused, index) => (
            <div key={index} className="mb-8 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Accused {index + 1}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={accused.name}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'name', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name of accused"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
                    <input
                      type="text"
                      value={accused.father_or_husband_name}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'father_or_husband_name', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's or husband's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date/Year of Birth</label>
                    <input
                      type="text"
                      value={accused.date_or_year_of_birth}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'date_or_year_of_birth', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DD/MM/YYYY or Year"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <select
                      value={accused.sex}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'sex', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={accused.nationality}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'nationality', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nationality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                    <input
                      type="text"
                      value={accused.religion}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'religion', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Religion"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      value={accused.occupation}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'occupation', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Occupation"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={accused.address}
                    onChange={(e) => handleInputChange('accused_charge_sheeted', 'address', e.target.value, index)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Complete address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Arrest</label>
                    <input
                      type="date"
                      value={accused.date_of_arrest}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'date_of_arrest', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Release on Bail</label>
                    <input
                      type="date"
                      value={accused.date_of_release_on_bail}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'date_of_release_on_bail', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Forwarded to Court</label>
                    <input
                      type="date"
                      value={accused.date_forwarded_to_court}
                      onChange={(e) => handleInputChange('accused_charge_sheeted', 'date_forwarded_to_court', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Charged Under Acts/Sections</label>
                  <textarea
                    value={accused.charged_under_acts_sections}
                    onChange={(e) => handleInputChange('accused_charge_sheeted', 'charged_under_acts_sections', e.target.value, index)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acts and sections under which charged"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Witnesses */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Witnesses to be Examined</h2>
            <button
              type="button"
              onClick={addWitness}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Witness
            </button>
          </div>
          {formData.witnesses_to_be_examined.map((witness, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Witness {index + 1}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={witness.name}
                      onChange={(e) => handleInputChange('witnesses_to_be_examined', 'name', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Witness name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
                    <input
                      type="text"
                      value={witness.father_or_husband_name}
                      onChange={(e) => handleInputChange('witnesses_to_be_examined', 'father_or_husband_name', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's or husband's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      value={witness.occupation}
                      onChange={(e) => handleInputChange('witnesses_to_be_examined', 'occupation', e.target.value, index)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Occupation"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={witness.address}
                    onChange={(e) => handleInputChange('witnesses_to_be_examined', 'address', e.target.value, index)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Complete address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Evidence to be Tendered</label>
                  <textarea
                    value={witness.type_of_evidence_to_be_tendered}
                    onChange={(e) => handleInputChange('witnesses_to_be_examined', 'type_of_evidence_to_be_tendered', e.target.value, index)}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type of evidence the witness will provide"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Investigation Findings */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Investigation Findings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action if FIR is False</label>
              <textarea
                value={formData.investigation_findings.action_if_fr_is_false}
                onChange={(e) => handleInputChange('investigation_findings', 'action_if_fr_is_false', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Action taken if FIR is found to be false"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Result of Laboratory Analysis</label>
              <textarea
                value={formData.investigation_findings.result_of_laboratory_analysis}
                onChange={(e) => handleInputChange('investigation_findings', 'result_of_laboratory_analysis', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Results from forensic laboratory analysis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brief Facts of Case</label>
              <textarea
                value={formData.investigation_findings.brief_facts_of_case}
                onChange={(e) => handleInputChange('investigation_findings', 'brief_facts_of_case', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of case facts and investigation findings"
              />
            </div>
          </div>
        </section>

        {/* Submission Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Submission Details</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Is Refer Notice Served?</label>
                <select
                  value={formData.submission_details.is_refer_notice_served}
                  onChange={(e) => handleInputChange('submission_details', 'is_refer_notice_served', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refer Notice Date</label>
                <input
                  type="date"
                  value={formData.submission_details.refer_notice_date}
                  onChange={(e) => handleInputChange('submission_details', 'refer_notice_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Despatched on Date</label>
              <input
                type="date"
                value={formData.submission_details.despatched_on_date}
                onChange={(e) => handleInputChange('submission_details', 'despatched_on_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Forwarding Officer</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.submission_details.forwarding_officer.name}
                    onChange={(e) => handleInputChange('submission_details', 'forwarding_officer', e.target.value, null, 'name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Forwarding officer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                  <input
                    type="text"
                    value={formData.submission_details.forwarding_officer.rank}
                    onChange={(e) => handleInputChange('submission_details', 'forwarding_officer', e.target.value, null, 'rank')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Officer rank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Number</label>
                  <input
                    type="text"
                    value={formData.submission_details.forwarding_officer.number}
                    onChange={(e) => handleInputChange('submission_details', 'forwarding_officer', e.target.value, null, 'number')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Service number"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Submitting Investigating Officer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.submission_details.submitting_investigating_officer.name}
                    onChange={(e) => handleInputChange('submission_details', 'submitting_investigating_officer', e.target.value, null, 'name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Investigating officer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                  <input
                    type="text"
                    value={formData.submission_details.submitting_investigating_officer.rank}
                    onChange={(e) => handleInputChange('submission_details', 'submitting_investigating_officer', e.target.value, null, 'rank')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Officer rank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Number</label>
                  <input
                    type="text"
                    value={formData.submission_details.submitting_investigating_officer.number}
                    onChange={(e) => handleInputChange('submission_details', 'submitting_investigating_officer', e.target.value, null, 'number')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Service number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                  <input
                    type="text"
                    value={formData.submission_details.submitting_investigating_officer.signature}
                    onChange={(e) => handleInputChange('submission_details', 'submitting_investigating_officer', e.target.value, null, 'signature')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digital signature or name"
                  />
                </div>
              </div>
            </div>
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
            Submit Charge Sheet
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChargeSheetForm;