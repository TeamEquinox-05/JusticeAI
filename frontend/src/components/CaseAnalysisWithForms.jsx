import { useState, useEffect } from 'react'
import { FormAutoFill } from '../utils/FormAutoFill'
import ChatModal from './ChatModal'

const CaseAnalysisWithForms = ({ analysisData, originalCaseData, sessionId, caseId, onBack, legalProcessSteps, stepsResponse, onContinueToForms }) => {
  const [recommendedForms, setRecommendedForms] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [autoFilledForms, setAutoFilledForms] = useState({})

  useEffect(() => {
    if (analysisData) {
      const parsedData = FormAutoFill.parseServerResponse(analysisData)
      if (parsedData) {
        const forms = FormAutoFill.getRecommendedForms(parsedData)
        setRecommendedForms(forms)

        // Pre-populate forms with available data
        const filledForms = {
          ChargeSheetForm: FormAutoFill.populateChargeSheetForm(parsedData),
          FIRForm: FormAutoFill.populateFIRForm(parsedData, originalCaseData),
          VictimStatementForm: FormAutoFill.populateVictimStatementForm(parsedData, originalCaseData)
        }
        setAutoFilledForms(filledForms)
      }
    }
  }, [analysisData, originalCaseData])

  const handleDownloadForm = (formType) => {
    const formData = autoFilledForms[formType]
    if (formData) {
      // Create downloadable JSON file
      const dataStr = JSON.stringify(formData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formType}_${caseId}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleOpenForm = (formType) => {
    // Store the auto-filled data in localStorage for the form to use
    const formData = autoFilledForms[formType]
    if (formData) {
      localStorage.setItem(`caseSwift_${formType}_data`, JSON.stringify(formData))
      // In a real app, you would navigate to the form component
      alert(`${formType} data has been prepared. The form would open with pre-filled data.`)
    }
  }

  const getAnalysisSteps = () => {
    try {
      const parsedData = FormAutoFill.parseServerResponse(analysisData)
      if (!parsedData) return []

      const steps = []

      // Step 1: FIR Registration
      steps.push({
        title: "File FIR (First Information Report)",
        description: "Register the case with police authorities",
        status: "required",
        forms: ["FIRForm"],
        timeline: "Immediate"
      })

      // Step 2: Investigation phase
      steps.push({
        title: "Investigation Phase",
        description: "Police investigation and evidence collection",
        status: "pending",
        forms: ["VictimStatementForm", "WitnessStatementForm"],
        timeline: "30-60 days"
      })

      // Step 3: Charge sheet if required
      if (parsedData.reportSummary?.type_of_final_report === 'Chargesheet') {
        steps.push({
          title: "File Charge Sheet",
          description: "Submit final investigation report to court",
          status: "pending",
          forms: ["ChargeSheetForm"],
          timeline: "After investigation"
        })
      }

      // Step 4: Court proceedings
      steps.push({
        title: "Court Proceedings",
        description: "Trial and legal proceedings",
        status: "future",
        forms: [],
        timeline: "6 months - 2 years"
      })

      return steps
    } catch (error) {
      console.error('Error getting analysis steps:', error)
      return []
    }
  }

  const parseLegalProcessSteps = (stepsData) => {
    if (!stepsData) return []
    
    try {
      let content = stepsData
      
      // Handle different data types
      if (typeof stepsData === 'object' && stepsData !== null) {
        // If it's already an object, extract the content
        content = stepsData.response || stepsData.content || JSON.stringify(stepsData)
      } else if (typeof stepsData === 'string') {
        // For strings, use as-is (don't attempt JSON parsing)
        content = stepsData
      } else {
        // For other types, convert to string
        content = String(stepsData)
      }
      
      // Ensure content is a string
      if (typeof content !== 'string') {
        content = JSON.stringify(content)
      }
      
      // Split by numbered points and clean up
      const stepLines = content.split(/\d+\.\s/).filter(line => line.trim())
      
      return stepLines.map((step, index) => {
        const cleanStep = step.trim().replace(/^\*\*|\*\*$/g, '').replace(/\*\*/g, '')
        const [title, ...descParts] = cleanStep.split(':')
        
        return {
          title: title.trim(),
          description: descParts.join(':').trim() || cleanStep,
          status: index === 0 ? 'required' : 'pending',
          forms: [],
          timeline: 'As needed'
        }
      })
    } catch (error) {
      console.error('Error parsing legal process steps:', error)
      return []
    }
  }

  const analysisSteps = getAnalysisSteps()
  const legalSteps = parseLegalProcessSteps(legalProcessSteps)
  
  // Debug logging
  console.log('Legal Process Steps Data:', legalProcessSteps)
  console.log('Parsed Legal Steps:', legalSteps)

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
          <h1 className="text-xl font-bold text-gray-800">Case Analysis & Forms</h1>
          <div className="flex items-center space-x-4">
            {/* Chat Icon */}
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              title="Chat with Case Assistant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal 
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          sessionId={sessionId}
          caseId={caseId}
        />

        {/* Case Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Case: {caseId}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Session ID</h3>
              <p className="text-blue-600 font-mono text-sm">{sessionId}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Status</h3>
              <p className="text-green-600">Analysis Complete</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Next Steps</h3>
              <p className="text-yellow-600">{analysisSteps.length} steps identified</p>
            </div>
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {legalProcessSteps ? 'AI-Generated Legal Process Steps' : 'Legal Process Steps'}
          </h2>
          <div className="space-y-4">
            {(legalSteps.length > 0 ? legalSteps : analysisSteps).map((step, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    <p className="text-blue-600 text-xs mt-1">Timeline: {step.timeline}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    step.status === 'required' ? 'bg-red-100 text-red-800' :
                    step.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Continue to Forms Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Process Forms?</h2>
            <p className="text-gray-600 mb-6">
              Continue to the form filling dashboard to complete all required legal documents for this case. 
              All forms will be pre-populated with the case analysis data.
            </p>
            <button
              onClick={onContinueToForms}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Continue to Form Filling Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseAnalysisWithForms