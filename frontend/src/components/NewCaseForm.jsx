import { useState } from 'react'
import axios from 'axios'
import CaseAnalysisReport from './CaseAnalysisReport'

const NewCaseForm = ({ onBack }) => {
  const [formData, setFormData] = useState({
    caseId: '',
    caseTitle: '',
    caseDescription: '',
    victimAge: '',
    victimGender: '',
    victimLocation: '',
    incidentDate: '',
    incidentTime: '',
    evidenceFiles: [],
    previousCaseRef: '',
    previousCasePdf: null
  })

  const [currentSection, setCurrentSection] = useState(0)
  const [currentCaseId, setCurrentCaseId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [showAnalysisReport, setShowAnalysisReport] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...files]
      }))
    }
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }))
  }

  const handleSubmitCase = async () => {
    // Validate required fields
    const requiredFields = ['caseId', 'caseTitle', 'caseDescription'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Since we're now using a direct API endpoint for case creation,
      // we can skip the submit-case endpoint and directly use the case endpoint
      const response = await axios.post('http://localhost:3001/api/case', { 
        formData: formData 
      });
      
      if (response.data.success) {
        const caseAnalysis = response.data.analysis;
        const caseId = caseAnalysis.caseId;
        setCurrentCaseId(caseId);
        
        // Store the analysis data
        setAnalysisData(caseAnalysis);
        
        // Only store the case ID in localStorage, not the analysis data
        // The Dashboard will fetch fresh analysis data when it loads
        localStorage.setItem('justiceAI_caseId', caseId);
        
        // Show success message and display analysis report
        setIsRedirecting(true);
        setTimeout(() => {
          setIsRedirecting(false);
          setShowAnalysisReport(true);
        }, 1500);
      } else {
        throw new Error(response.data.error || 'Failed to create case analysis');
      }
    } catch (error) {
      console.error('Error submitting case:', error);
      alert('Error submitting case. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate a fallback error report if analysis data fetching fails
  const generateErrorReport = () => {
    return {
      caseClassification: "Unknown",
      complianceScore: 0,
      missingFields: ["Error fetching data"],
      requiredDocuments: ["Error fetching data"],
      legalReferences: [],
      caseAnalysisReport: "Failed to generate case analysis. Please try again."
    };
  }

  // If redirecting, show a success message
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Case Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">Loading case analysis report...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // If showing analysis report, render that component
  if (showAnalysisReport && analysisData) {
    return (
      <CaseAnalysisReport 
        caseId={currentCaseId}
        analysisData={analysisData}
        onBack={onBack}
      />
    );
  }

  // Form sections
  const sections = [
    { title: "Case Information", icon: "document-text" },
    { title: "Victim Details", icon: "user" },
    { title: "Evidence Collection", icon: "document-duplicate" }
  ]

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case ID *
              </label>
              <input 
                type="text"
                value={formData.caseId}
                onChange={(e) => handleInputChange('caseId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a unique case identifier"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Title *
              </label>
              <input 
                type="text"
                value={formData.caseTitle}
                onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a descriptive title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Description *
              </label>
              <textarea 
                rows="5"
                value={formData.caseDescription}
                onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a detailed description of the case"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference to Previous Case (if applicable)
              </label>
              <input
                type="text"
                value={formData.previousCaseRef}
                onChange={(e) => handleInputChange('previousCaseRef', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter previous case number if related"
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={formData.victimAge}
                  onChange={(e) => handleInputChange('victimAge', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="120"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.victimGender}
                  onChange={(e) => handleInputChange('victimGender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.victimLocation}
                onChange={(e) => handleInputChange('victimLocation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, State, District"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date *
                </label>
                <input
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Time
                </label>
                <input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Evidence Upload
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, Images (max. 10MB)
                  </p>
                </label>
              </div>
            </div>

            {formData.evidenceFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files ({formData.evidenceFiles.length})</h4>
                <ul className="space-y-2">
                  {formData.evidenceFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Main form render
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-800">New Case Entry</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {sections.map((section, index) => (
            <div key={index} className="flex-1">
              <div 
                className={`flex flex-col items-center ${index > 0 ? 'ml-6' : ''}`}
              >
                <div className="flex items-center justify-center w-full">
                  {/* Line before */}
                  {index > 0 && (
                    <div 
                      className={`h-1 flex-1 ${
                        index <= currentSection ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                  
                  {/* Circle */}
                  <div 
                    className={`relative flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full transition-colors duration-300 ${
                      index < currentSection
                        ? 'bg-green-500'
                        : index === currentSection
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index < currentSection ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold text-white">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Line after */}
                  {index < sections.length - 1 && (
                    <div 
                      className={`h-1 flex-1 ${
                        index < currentSection ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>
                <span className="mt-2 text-xs text-center block w-full text-gray-500">
                  {section.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white p-6 lg:p-8 rounded-xl shadow-lg">
          {/* Current Section Title */}
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
            {sections[currentSection].title}
          </h2>
          
          {/* Form Fields */}
          {renderSection()}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              <span className="text-xs text-gray-500">
                Step {currentSection + 1} of {sections.length}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="px-4 py-2 lg:px-6 lg:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
              >
                Previous
              </button>
              
              {currentSection < sections.length - 1 ? (
                <button
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                >
                  Next Section
                </button>
              ) : (
                <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
                  <button className="px-4 py-2 lg:px-6 lg:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm lg:text-base">
                    Save Draft
                  </button>
                  <button 
                    onClick={handleSubmitCase}
                    disabled={isSubmitting}
                    className="px-4 py-2 lg:px-6 lg:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Case'
                    )}
                  </button>
                  <button className="px-4 py-2 lg:px-6 lg:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base">
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewCaseForm