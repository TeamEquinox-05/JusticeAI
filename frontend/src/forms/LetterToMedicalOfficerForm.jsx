import React, { useState, useEffect } from 'react';

const LetterToMedicalOfficerForm = ({ initialData = {}, onComplete = () => {}, caseData = {} }) => {
  const [formData, setFormData] = useState({
    document_title: "Letter to Medical Officer",
    case_details: { fir_no: "", police_station: "", district: "", date: "" },
    medical_officer_details: { name: "", hospital_name: "", address: "" },
    examination_request: { patient_name: "", patient_age: "", examination_type: "", urgency_level: "", specific_instructions: "" }
  });

  // Auto-generate medical examination request based on case data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const generateMedicalRequest = () => {
        const isMinorCase = initialData.caseClassification?.includes('POCSO');
        const caseType = initialData.caseClassification || 'Criminal Case';
        const timeframe = isMinorCase ? '24 hours' : '72 hours';
        
        const specificInstructions = `Dear Sir/Madam,

Re: Medical Examination Request - ${caseType} - FIR No. ${initialData.caseId || 'N/A'}

I have the honor to request you to conduct a medical examination for the victim in the above mentioned case.

Case Details:
- FIR No: ${initialData.caseId || 'N/A'}
- Date of Incident: ${initialData.incidentDate || 'N/A'}
- Case Classification: ${caseType}
- Location: ${initialData.victimLocation || 'N/A'}

Patient Information:
- Age: ${initialData.victimAge || 'N/A'}
- Gender: ${initialData.victimGender || 'N/A'}

${isMinorCase ? 
`URGENT - POCSO Case:
This case involves a minor victim. As per POCSO Act provisions:
- Medical examination must be conducted within ${timeframe}
- Female medical officer should conduct examination for female victims
- Parent/guardian consent required
- Child-friendly environment to be maintained
- Trauma counseling may be required` :
`Medical Examination Requirements:
- Examination to be conducted within ${timeframe} of incident
- Standard protocols for sexual assault cases to be followed
- Proper documentation and evidence collection required
- Victim consent and comfort to be prioritized`}

Specific Requirements:
1. Complete medical examination as per protocol
2. Documentation of injuries, if any
3. Collection of forensic evidence as applicable
4. Medical certificate for court proceedings
5. ${isMinorCase ? 'Age determination if required' : 'Psychological assessment if needed'}

The examination should be conducted with utmost care and sensitivity, considering the traumatic nature of the incident.

Please provide the medical report at the earliest for further legal proceedings.

Thank you for your cooperation.

Yours faithfully,
[Investigating Officer Name]
[Designation]
[Police Station]`;

        return {
          patientName: `Victim (Name withheld for privacy)`,
          patientAge: initialData.victimAge || 'N/A',
          examinationType: isMinorCase ? 'POCSO Medical Examination' : 'Sexual Assault Medical Examination',
          urgencyLevel: isMinorCase ? 'Urgent - Within 24 hours' : 'High Priority - Within 72 hours',
          specificInstructions
        };
      };

      const generatedRequest = generateMedicalRequest();

      setFormData(prevData => ({
        ...prevData,
        case_details: {
          fir_no: initialData.caseId || "",
          police_station: initialData.victimLocation?.split(',')[0] || "",
          district: initialData.victimLocation?.split(',')[1]?.trim() || "",
          date: initialData.incidentDate || ""
        },
        examination_request: {
          patient_name: generatedRequest.patientName,
          patient_age: generatedRequest.patientAge,
          examination_type: generatedRequest.examinationType,
          urgency_level: generatedRequest.urgencyLevel,
          specific_instructions: generatedRequest.specificInstructions
        }
      }));
    }
  }, [initialData]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Letter to Medical Officer</h1>
      </div>
      <form className="space-y-8">
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Officer Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Officer Name</label>
              <input type="text" value={formData.medical_officer_details.name} onChange={(e) => handleInputChange('medical_officer_details', 'name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic Name</label>
              <input type="text" value={formData.medical_officer_details.hospital_name} onChange={(e) => handleInputChange('medical_officer_details', 'hospital_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </section>
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Examination Request</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input type="text" value={formData.examination_request.patient_name} onChange={(e) => handleInputChange('examination_request', 'patient_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Age</label>
                <input type="number" value={formData.examination_request.patient_age} onChange={(e) => handleInputChange('examination_request', 'patient_age', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Examination Required</label>
              <select value={formData.examination_request.examination_type} onChange={(e) => handleInputChange('examination_request', 'examination_type', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Examination Type</option>
                <option value="General Medical Examination">General Medical Examination</option>
                <option value="Injury Assessment">Injury Assessment</option>
                <option value="Age Determination">Age Determination</option>
                <option value="Mental Health Assessment">Mental Health Assessment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Instructions</label>
              <textarea value={formData.examination_request.specific_instructions} onChange={(e) => handleInputChange('examination_request', 'specific_instructions', e.target.value)} rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Specific medical examination requirements and instructions" />
            </div>
          </div>
        </section>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              localStorage.setItem('justiceAI_LetterToMedicalOfficerForm_draft', JSON.stringify(formData));
              alert('Draft saved successfully!');
            }}
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              console.log('Letter to Medical Officer submitted:', formData);
              onComplete();
              alert('Letter to Medical Officer submitted successfully!');
            }}
          >
            Submit Letter
          </button>
        </div>
      </form>
    </div>
  );
};

export default LetterToMedicalOfficerForm;