import React, { useState } from 'react';

const ArrestMemoForm = () => {
  const [formData, setFormData] = useState({
    document_title: "Arrest Memo",
    case_details: {
      fir_no: "",
      date: "",
      police_station: "",
      district: "",
      acts_and_sections: ""
    },
    arrested_person_details: {
      name: "",
      age: "",
      father_or_husband_name: "",
      address: "",
      occupation: "",
      identification_marks: ""
    },
    arrest_details: {
      date_of_arrest: "",
      time_of_arrest: "",
      place_of_arrest: "",
      arresting_officer: "",
      circumstances_of_arrest: "",
      resistance_offered: ""
    },
    search_details: {
      articles_recovered: "",
      search_conducted_by: "",
      search_witnesses: ""
    },
    medical_examination: {
      medical_officer_name: "",
      examination_date: "",
      examination_time: "",
      injuries_found: ""
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Arrest Memo</h1>
      </div>

      <form className="space-y-8">
        {/* Case Details */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.case_details.date}
                onChange={(e) => handleInputChange('case_details', 'date', e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={formData.case_details.district}
                onChange={(e) => handleInputChange('case_details', 'district', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Acts and Sections</label>
            <textarea
              value={formData.case_details.acts_and_sections}
              onChange={(e) => handleInputChange('case_details', 'acts_and_sections', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Acts and sections under which arrest is made"
            />
          </div>
        </section>

        {/* Arrested Person Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Arrested Person Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.arrested_person_details.name}
                  onChange={(e) => handleInputChange('arrested_person_details', 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.arrested_person_details.age}
                  onChange={(e) => handleInputChange('arrested_person_details', 'age', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's/Husband's Name</label>
                <input
                  type="text"
                  value={formData.arrested_person_details.father_or_husband_name}
                  onChange={(e) => handleInputChange('arrested_person_details', 'father_or_husband_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.arrested_person_details.address}
                onChange={(e) => handleInputChange('arrested_person_details', 'address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identification Marks</label>
              <textarea
                value={formData.arrested_person_details.identification_marks}
                onChange={(e) => handleInputChange('arrested_person_details', 'identification_marks', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Visible identification marks on the arrested person"
              />
            </div>
          </div>
        </section>

        {/* Arrest Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Arrest Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Arrest</label>
                <input
                  type="date"
                  value={formData.arrest_details.date_of_arrest}
                  onChange={(e) => handleInputChange('arrest_details', 'date_of_arrest', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Arrest</label>
                <input
                  type="time"
                  value={formData.arrest_details.time_of_arrest}
                  onChange={(e) => handleInputChange('arrest_details', 'time_of_arrest', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arresting Officer</label>
                <input
                  type="text"
                  value={formData.arrest_details.arresting_officer}
                  onChange={(e) => handleInputChange('arrest_details', 'arresting_officer', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Place of Arrest</label>
              <textarea
                value={formData.arrest_details.place_of_arrest}
                onChange={(e) => handleInputChange('arrest_details', 'place_of_arrest', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Circumstances of Arrest</label>
              <textarea
                value={formData.arrest_details.circumstances_of_arrest}
                onChange={(e) => handleInputChange('arrest_details', 'circumstances_of_arrest', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed circumstances leading to arrest"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button type="button" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Submit Arrest Memo
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArrestMemoForm;