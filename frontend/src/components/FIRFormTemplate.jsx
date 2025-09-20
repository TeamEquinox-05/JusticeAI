import React, { useState } from 'react';

const FIRFormTemplate = ({ formData, onFormSubmit, onBack, isSubmitting }) => {
  const [firFormData, setFirFormData] = useState({
    ...formData,
    district: formData.district || '',
    policeStation: formData.policeStation || '',
    year: new Date().getFullYear(),
    firNumber: formData.caseId || '',
    firDate: formData.dateOfFIR || new Date().toISOString().split('T')[0],
    act1: '',
    sections1: '',
    act2: '',
    sections2: '',
    act3: '',
    sections3: '',
    otherActsSections: '',
    occurrenceDay: formData.occurrenceDay || new Date(formData.incidentDate || new Date()).toLocaleDateString('en-US', { weekday: 'long' }),
    occurrenceDate: formData.incidentDate || new Date().toISOString().split('T')[0],
    occurrenceTime: formData.incidentTime || '',
    infoReceivedDate: new Date().toISOString().split('T')[0],
    infoReceivedTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    generalDiaryReference: '',
    generalDiaryTime: '',
    informationType: 'Written',
    placeDirection: '',
    beatNumber: '',
    placeAddress: formData.victimLocation || formData.placeOfOccurrence || '',
    outsidePS: '',
    outsideDistrict: '',
    complainantName: formData.complainantName || '',
    complainantFatherName: '',
    complainantDOB: '',
    complainantNationality: 'Indian',
    complainantPassportNo: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    complainantOccupation: '',
    complainantAddress: '',
    accusedDetails: '',
    delayReasons: '',
    stolenProperties: '',
    totalValueStolen: '',
    inquestReport: '',
    firContents: formData.caseDescription || '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFirFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation based on fields marked with * in the form
    if (!firFormData.district) newErrors.district = 'Required';
    if (!firFormData.policeStation) newErrors.policeStation = 'Required';
    if (!firFormData.occurrenceDate) newErrors.occurrenceDate = 'Required';
    if (!firFormData.placeAddress) newErrors.placeAddress = 'Required';
    if (!firFormData.complainantName) newErrors.complainantName = 'Required';
    if (!firFormData.firContents) newErrors.firContents = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Combine the FIR form data with the existing form data and submit
      const combinedData = {
        ...formData,
        district: firFormData.district,
        policeStation: firFormData.policeStation,
        dateOfFIR: firFormData.firDate,
        victimLocation: firFormData.placeAddress,
        complainantName: firFormData.complainantName,
        complainantFatherName: firFormData.complainantFatherName,
        complainantDOB: firFormData.complainantDOB,
        complainantNationality: firFormData.complainantNationality,
        complainantOccupation: firFormData.complainantOccupation,
        complainantAddress: firFormData.complainantAddress,
        accusedDetails: firFormData.accusedDetails,
        caseDescription: firFormData.firContents,
        // Additional FIR specific fields
        firDetails: {
          ...firFormData
        }
      };
      
      onFormSubmit(combinedData);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">←</span> Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800">FIRST INFORMATION REPORT</h2>
        <div></div>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">(Under Section 154 Cr.P.C)</p>
        <p className="text-sm text-gray-600">FORM – IF1 - (Integrated Form)</p>
      </div>
      
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          <p className="font-medium">Please fill in all required fields</p>
          <ul className="list-disc pl-5 mt-1">
            {Object.keys(errors).map(field => (
              <li key={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. Dist. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={firFormData.district}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="District name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                P.S. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="policeStation"
                value={firFormData.policeStation}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.policeStation ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Police Station"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={firFormData.year}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                F.I.R. No.
              </label>
              <input
                type="text"
                name="firNumber"
                value={firFormData.firNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="firDate"
                value={firFormData.firDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Section 2 - Acts & Sections */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">2. Acts & Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (i) Act
              </label>
              <input
                type="text"
                name="act1"
                value={firFormData.act1}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., BNS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sections
              </label>
              <input
                type="text"
                name="sections1"
                value={firFormData.sections1}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 65(1), 66"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (ii) Act
              </label>
              <input
                type="text"
                name="act2"
                value={firFormData.act2}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sections
              </label>
              <input
                type="text"
                name="sections2"
                value={firFormData.sections2}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (iii) Act
              </label>
              <input
                type="text"
                name="act3"
                value={firFormData.act3}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sections
              </label>
              <input
                type="text"
                name="sections3"
                value={firFormData.sections3}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              (iv) Other Acts & Sections
            </label>
            <input
              type="text"
              name="otherActsSections"
              value={firFormData.otherActsSections}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Applicable acts and sections will be determined automatically after analysis
            </p>
          </div>
        </div>

        {/* Section 3 - Occurrence Details */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">3. Occurrence Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (a) Day of Occurrence
              </label>
              <input
                type="text"
                name="occurrenceDay"
                value={firFormData.occurrenceDay}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Monday"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="occurrenceDate"
                value={firFormData.occurrenceDate}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.occurrenceDate ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="occurrenceTime"
                value={firFormData.occurrenceTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (b) Information received at P.S. Date
              </label>
              <input
                type="date"
                name="infoReceivedDate"
                value={firFormData.infoReceivedDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="infoReceivedTime"
                value={firFormData.infoReceivedTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (c) General Diary Reference: Entry No(s)
              </label>
              <input
                type="text"
                name="generalDiaryReference"
                value={firFormData.generalDiaryReference}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="generalDiaryTime"
                value={firFormData.generalDiaryTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Section 4 - Information Type */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-md font-medium text-gray-700 mr-4">4. Type of information:</span>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="informationType"
                  value="Written"
                  checked={firFormData.informationType === 'Written'}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Written</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="informationType"
                  value="Oral"
                  checked={firFormData.informationType === 'Oral'}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Oral</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5 - Place of Occurrence */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">5. Place of occurrence:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (a) Direction and Distance from P.S.
              </label>
              <input
                type="text"
                name="placeDirection"
                value={firFormData.placeDirection}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 5 km North"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beat No.
              </label>
              <input
                type="text"
                name="beatNumber"
                value={firFormData.beatNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              (b) Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="placeAddress"
              value={firFormData.placeAddress}
              onChange={handleInputChange}
              rows="2"
              className={`w-full p-2 border rounded-md ${errors.placeAddress ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter detailed address of occurrence location"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (c) In case outside limit of this Police Station, then the name of P.S.
              </label>
              <input
                type="text"
                name="outsidePS"
                value={firFormData.outsidePS}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <input
                type="text"
                name="outsideDistrict"
                value={firFormData.outsideDistrict}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Section 6 - Complainant/Informant Details */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">6. Complainant/Informant:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (a) Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="complainantName"
                value={firFormData.complainantName}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.complainantName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (b) Father's/Husband's Name
              </label>
              <input
                type="text"
                name="complainantFatherName"
                value={firFormData.complainantFatherName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (c) Date/Year of Birth
              </label>
              <input
                type="text"
                name="complainantDOB"
                value={firFormData.complainantDOB}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="DD/MM/YYYY or age in years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (d) Nationality
              </label>
              <input
                type="text"
                name="complainantNationality"
                value={firFormData.complainantNationality}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (e) Passport No.
              </label>
              <input
                type="text"
                name="complainantPassportNo"
                value={firFormData.complainantPassportNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Issue
              </label>
              <input
                type="date"
                name="passportIssueDate"
                value={firFormData.passportIssueDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Issue
              </label>
              <input
                type="text"
                name="passportIssuePlace"
                value={firFormData.passportIssuePlace}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                (f) Occupation
              </label>
              <input
                type="text"
                name="complainantOccupation"
                value={firFormData.complainantOccupation}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              (g) Address
            </label>
            <textarea
              name="complainantAddress"
              value={firFormData.complainantAddress}
              onChange={handleInputChange}
              rows="2"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Complete address with PIN code if available"
            ></textarea>
          </div>
        </div>

        {/* Section 7 - Accused Details */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            7. Details of known/suspected/unknown accused with full particulars
          </h3>
          <div>
            <textarea
              name="accusedDetails"
              value={firFormData.accusedDetails}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter name, parentage, address and other identifying details of the accused (if known)"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Attach separate sheet if necessary</p>
          </div>
        </div>

        {/* Section 8 - Delay Reasons */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            8. Reasons for delay in reporting by the complainant/Informant
          </h3>
          <div>
            <textarea
              name="delayReasons"
              value={firFormData.delayReasons}
              onChange={handleInputChange}
              rows="2"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Explain any delay in reporting the incident"
            ></textarea>
          </div>
        </div>

        {/* Section 9 - Stolen Properties */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            9. Particulars of properties stolen/involved
          </h3>
          <div>
            <textarea
              name="stolenProperties"
              value={firFormData.stolenProperties}
              onChange={handleInputChange}
              rows="2"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter details of any stolen or involved property"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Attach separate sheet if necessary</p>
          </div>
        </div>

        {/* Section 10 - Total Value */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center">
            <label className="text-md font-medium text-gray-700 mr-2">
              10. Total value of properties stolen/involved:
            </label>
            <input
              type="text"
              name="totalValueStolen"
              value={firFormData.totalValueStolen}
              onChange={handleInputChange}
              className="w-60 p-2 border border-gray-300 rounded-md ml-2"
              placeholder="Value in INR"
            />
          </div>
        </div>

        {/* Section 11 - Inquest Report */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center">
            <label className="text-md font-medium text-gray-700 mr-2">
              11. Inquest Report/U.D. Case No., if any:
            </label>
            <input
              type="text"
              name="inquestReport"
              value={firFormData.inquestReport}
              onChange={handleInputChange}
              className="w-60 p-2 border border-gray-300 rounded-md ml-2"
            />
          </div>
        </div>

        {/* Section 12 - FIR Contents */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            12. F.I.R. Contents <span className="text-red-500">*</span>
          </h3>
          <div>
            <textarea
              name="firContents"
              value={firFormData.firContents}
              onChange={handleInputChange}
              rows="6"
              className={`w-full p-2 border rounded-md ${errors.firContents ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter the full statement of the complainant describing the incident in detail"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              This statement forms the basis for the investigation. Attach separate sheets if required.
            </p>
          </div>
        </div>

        {/* Section 13-15 - Action Taken, Signatures */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            13. Action taken
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              Since the above report reveals commission of offence(s) u/s as mentioned at Item No. 2., registered the case and took up the investigation/directed
              ........................ Rank ............... to take up the investigation/transferred to P.S. .............................. on point of jurisdiction.
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              F.I.R. read over to the complainant/Informant, admitted to be correctly recorded and copy given to the Complainant/Informant free of cost.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                14. Signature/Thumb-impression of the complainant/informant
              </h4>
              <div className="h-16 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">Digital signature will be captured</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Signature of the Officer-in-charge, Police Station
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Officer name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Rank & No.</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Rank & Number"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">
              15. Date & time of despatch to the court
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
              text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transition-colors
              flex items-center justify-center w-full md:w-auto min-w-[200px]
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Continue to AI Questions'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FIRFormTemplate;