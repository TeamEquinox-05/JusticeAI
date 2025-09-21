import React, { useState, useEffect } from 'react';

const LetterToPoliceSurgeonForm = ({ initialData = {}, onComplete = () => {}, caseData = {} }) => {
  const [formData, setFormData] = useState({
    document_title: "Letter to Police Surgeon",
    case_details: { fir_no: "", police_station: "", district: "", date: "" },
    surgeon_details: { name: "", hospital_name: "", address: "" },
    examination_request: { subject_name: "", subject_age: "", examination_type: "", specific_requirements: "", urgency: "" }
  });

  // Auto-generate police surgeon examination request based on case data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const generateSurgeonRequest = () => {
        const isMinorCase = initialData.caseClassification?.includes('POCSO');
        const caseType = initialData.caseClassification || 'Criminal Case';
        
        const specificRequirements = `Dear Sir/Madam,

Re: Police Surgeon Examination - ${caseType} - FIR No. ${initialData.caseId || 'N/A'}

I have the honor to request you to conduct a police surgeon examination for the victim in the above mentioned case.

Case Details:
- FIR No: ${initialData.caseId || 'N/A'}
- Date of Incident: ${initialData.incidentDate || 'N/A'}
- Case Classification: ${caseType}
- Risk Assessment: ${initialData.riskAssessment || 'Medium Risk'}

Subject Information:
- Age: ${initialData.victimAge || 'N/A'}
- Gender: ${initialData.victimGender || 'N/A'}

${isMinorCase ? 
`POCSO Case Examination Requirements:
- Child-friendly examination environment
- Parent/guardian presence required
- Female surgeon for female victim examination
- Trauma-informed approach mandatory
- Detailed documentation for court proceedings
- Coordination with Child Welfare Committee` :
`Adult Victim Examination Requirements:
- Standard forensic examination protocols
- Evidence collection as per guidelines
- Detailed injury documentation
- Medical certificate preparation
- Victim consent and comfort prioritized`}

Specific Examination Requirements:
1. Complete forensic medical examination
2. Documentation of physical injuries
3. Collection of biological evidence
4. Photographic documentation (with consent)
5. Medical opinion for court proceedings
6. ${isMinorCase ? 'Age verification if required' : 'Psychological trauma assessment'}
7. Chain of custody maintenance for evidence

Legal Provisions:
${isMinorCase ? 
`- POCSO Act 2012 compliance required
- Juvenile Justice Act provisions applicable` :
`- Indian Penal Code Section 376 provisions
- Criminal Procedure Code guidelines`}

The examination should be conducted with extreme sensitivity considering the traumatic nature of the incident. Please provide a comprehensive medical report for court proceedings.

Thank you for your professional assistance.

Yours faithfully,
[Investigating Officer Name]
[Designation]  
[Police Station]`;

        return {
          subjectName: 'Victim (Identity protected)',
          subjectAge: initialData.victimAge || 'N/A',
          examinationType: isMinorCase ? 'POCSO Forensic Examination' : 'Sexual Assault Forensic Examination',
          urgency: isMinorCase ? 'Urgent - POCSO Case' : 'High Priority',
          specificRequirements
        };
      };

      const generatedRequest = generateSurgeonRequest();

      setFormData(prevData => ({
        ...prevData,
        case_details: {
          fir_no: initialData.caseId || "",
          police_station: initialData.victimLocation?.split(',')[0] || "",
          district: initialData.victimLocation?.split(',')[1]?.trim() || "",
          date: initialData.incidentDate || ""
        },
        examination_request: {
          subject_name: generatedRequest.subjectName,
          subject_age: generatedRequest.subjectAge,
          examination_type: generatedRequest.examinationType,
          specific_requirements: generatedRequest.specificRequirements,
          urgency: generatedRequest.urgency
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
          <button 
            type="button" 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              localStorage.setItem('justiceAI_LetterToPoliceSurgeonForm_draft', JSON.stringify(formData));
              alert('Draft saved successfully!');
            }}
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              console.log('Letter to Police Surgeon submitted:', formData);
              onComplete();
              alert('Letter to Police Surgeon submitted successfully!');
            }}
          >
            Submit Letter
          </button>
        </div>
      </form>
    </div>
  );
};

export default LetterToPoliceSurgeonForm;