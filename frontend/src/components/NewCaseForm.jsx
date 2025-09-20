import { useState } from 'react'
import axios from 'axios'
import CaseAnalysisReport from './CaseAnalysisReport'
import DynamicQuestionForm from './DynamicQuestionForm'

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
  const [showAnalysisReport, setShowAnalysisReport] = useState(false)
  const [showDynamicQuestions, setShowDynamicQuestions] = useState(false)
  const [dynamicQuestions, setDynamicQuestions] = useState([])
  const [currentCaseId, setCurrentCaseId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedCase, setCompletedCase] = useState(null)

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
      // Submit the case to the backend and get dynamic questions
      const response = await axios.post('http://localhost:3001/api/submit-case', formData);
      
      if (response.data.success) {
        setCurrentCaseId(response.data.caseId);
        setDynamicQuestions(response.data.questions);
        setShowDynamicQuestions(true);
      } else {
        console.error('Failed to submit case:', response.data.error);
        alert('Failed to submit case. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting case:', error);
      alert('Error submitting case. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleContinueEditing = () => {
    setShowAnalysisReport(false)
  }

  const handleQuestionsComplete = (caseData) => {
    setCompletedCase(caseData);
    setShowDynamicQuestions(false);
    setShowAnalysisReport(true);
  }

  const handleBackFromQuestions = () => {
    setShowDynamicQuestions(false);
  }

  // If showing dynamic questions, render that component
  if (showDynamicQuestions) {
    return (
      <DynamicQuestionForm
        caseId={currentCaseId}
        questions={dynamicQuestions}
        onComplete={handleQuestionsComplete}
        onBack={handleBackFromQuestions}
      />
    )
  }

  // If showing analysis report, render that component
  if (showAnalysisReport) {
    return (
      <CaseAnalysisReport 
        formData={completedCase ? { ...formData, ...completedCase } : formData}
        onBack={onBack}
        onContinueEditing={handleContinueEditing}
        caseType="new"
      />
    )
  }

  const sections = [
    'Basic Information',
    'Victim Details', 
    'Evidence & References'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files, type) => {
    if (type === 'evidence') {
      setFormData(prev => ({ ...prev, evidenceFiles: [...prev.evidenceFiles, ...files] }))
    } else if (type === 'previous-case') {
      setFormData(prev => ({ ...prev, previousCasePdf: files[0] }))
    }
  }

  const getCompletionPercentage = () => {
    const fields = Object.keys(formData)
    const filledFields = fields.filter(field => {
      const value = formData[field]
      if (Array.isArray(value)) return value.length > 0
      return value && value.toString().trim() !== ''
    })
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case ID *
              </label>
              <input
                type="text"
                value={formData.caseId}
                onChange={(e) => handleInputChange('caseId', e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-shadow duration-200"
                placeholder="e.g., FIR001/2025"
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
                className="w-full px-4 py-3 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-shadow duration-200"
                placeholder="Enter a descriptive case title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Description *
                <span className="text-sm text-blue-600 font-normal"> (Applicable laws will be automatically determined)</span>
              </label>
              <textarea
                value={formData.caseDescription}
                onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-shadow duration-200"
                placeholder="Provide detailed description of the case, including key facts, circumstances, and nature of the offense. Be as specific as possible for accurate legal framework determination."
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Victim Age *
                </label>
                <input
                  type="number"
                  value={formData.victimAge}
                  onChange={(e) => handleInputChange('victimAge', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500">Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files), 'evidence')}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  Choose Files
                </label>
              </div>
              {formData.evidenceFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                  <div className="space-y-2">
                    {formData.evidenceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Case Reference
              </label>
              <input
                type="text"
                value={formData.previousCaseRef}
                onChange={(e) => handleInputChange('previousCaseRef', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder="Search for related case number or reference"
              />
              
              <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Upload Previous Case PDF (Optional)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files), 'previous-case')}
                  className="hidden"
                  id="previous-case-upload"
                />
                <label htmlFor="previous-case-upload" className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  Upload PDF
                </label>
                {formData.previousCasePdf && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {formData.previousCasePdf.name}</p>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm lg:text-base">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-center lg:justify-end space-x-4">
            <div className="text-center lg:text-right">
              <p className="text-xs lg:text-sm font-medium text-gray-700">Form Completion</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">{getCompletionPercentage()}%</p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 relative">
              <div className="w-full h-full bg-gray-200 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-full h-full bg-blue-600 rounded-full transform origin-center"
                style={{ 
                  background: `conic-gradient(#3b82f6 ${getCompletionPercentage() * 3.6}deg, #e5e7eb 0deg)`,
                  borderRadius: '50%'
                }}
              ></div>
              <div className="absolute top-1 left-1 lg:top-2 lg:left-2 w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 rounded-full"></div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">New Case Registration</h1>
        <p className="text-sm lg:text-base text-gray-600">Complete all sections to register a new legal case</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 lg:sticky lg:top-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm lg:text-base">Sections</h3>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full text-left p-2 lg:p-3 rounded-lg transition-colors ${
                      currentSection === index
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <span className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentSection === index ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-xs lg:text-sm font-medium">{section}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">{sections[currentSection]}</h2>
              {renderSection()}

              {/* Navigation Buttons */}
              <div className="flex flex-col lg:flex-row justify-between mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 space-y-3 lg:space-y-0">
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
    </div>
  )
}

export default NewCaseForm