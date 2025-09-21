import { useState } from 'react'
import axios from 'axios'
import CaseAnalysisReport from './CaseAnalysisReport'

const ExistingCaseUpload = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showAnalysisReport, setShowAnalysisReport] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)

  // Mock extracted data (in real app, this would come from AI analysis)
  const extractedData = {
    caseTitle: "State vs. John Doe - Cybercrime Investigation",
    caseNumber: "CYB/2024/001789",
    dateRegistered: "2024-01-15",
    jurisdiction: "Mumbai Cyber Crime Cell",
    accusedName: "John Doe",
    victimDetails: {
      name: "ABC Corporation",
      type: "Corporate Entity",
      location: "Mumbai, Maharashtra"
    },
    charges: ["IT Act Section 66", "IPC Section 420", "BNS Section 318"],
    status: "Under Investigation",
    lastUpdated: "2024-09-15"
  }

  // Convert extracted data to form data format for analysis
  const getFormDataFromExtracted = () => {
    return {
      caseId: extractedData.caseNumber,
      caseTitle: extractedData.caseTitle,
      caseDescription: `${extractedData.charges.join(', ')} - ${extractedData.status}`,
      victimAge: '', // Not available in extracted data
      victimGender: '',
      victimLocation: extractedData.victimDetails.location,
      incidentDate: extractedData.dateRegistered,
      incidentTime: '',
      evidenceFiles: uploadedFile ? [uploadedFile] : [],
      previousCaseRef: '',
      previousCasePdf: uploadedFile
    }
  }

  const handleAnalyzeCase = async () => {
    try {
      // Here you would typically upload the file to the server and get an analysis ID
      // For now, we'll simulate this process
      setIsAnalyzing(true);
      
      // Create form data for file upload
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      
      // In a real implementation, you would upload the file and get back a case ID
      // const response = await axios.post('http://localhost:3001/api/upload-case', formData);
      // const caseId = response.data.caseId;
      
      // For demo purposes, we'll simulate a successful upload with a mock ID
      const mockCaseId = `EXISTING-${Date.now().toString()}`;
      setAnalysisId(mockCaseId);
      
      // Now we can show the analysis report with the ID
      setShowAnalysisReport(true);
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing case:", error);
      setIsAnalyzing(false);
      alert("Failed to analyze the case. Please try again.");
    }
  }

  const handleContinueEditing = () => {
    setShowAnalysisReport(false)
  }

  // If showing analysis report, render that component
  if (showAnalysisReport) {
    return (
      <CaseAnalysisReport 
        caseId={analysisId}
        // Provide form data as fallback
        formData={getFormDataFromExtracted()}
        onBack={onBack}
        onContinueEditing={handleContinueEditing}
        caseType="existing"
      />
    )
  }

  const aiInsights = {
    complianceScore: 78,
    missingSteps: [
      "Forensic evidence documentation incomplete",
      "Victim impact statement pending",
      "Digital evidence chain of custody needs verification"
    ],
    complianceIssues: [
      "Timeline documentation gaps between incident and FIR",
      "Missing cross-reference to related cybercrime cases"
    ],
    relatedJudgments: [
      {
        title: "State vs. ABC Tech Solutions - Similar cybercrime pattern",
        court: "Mumbai Sessions Court",
        year: "2023",
        relevance: "High"
      },
      {
        title: "XYZ Corp vs. John Smith - Data breach precedent",
        court: "Delhi High Court", 
        year: "2022",
        relevance: "Medium"
      }
    ]
  }

  const handleFileUpload = (files) => {
    const file = files[0]
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setUploadedFile(file)
      setIsAnalyzing(true)
      
      // Simulate AI analysis
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisComplete(true)
      }, 3000)
    } else {
      alert('Please upload a PDF or document file')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Case Document</h3>
          <p className="text-gray-600 mb-4">AI is extracting case details and generating insights...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (analysisComplete) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleAnalyzeCase}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Compliance Report
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Download Updated Case File
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Edit Details
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-navy-900 mb-2">Case Analysis Complete</h1>
          <p className="text-gray-600">Review extracted information and AI-generated insights</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted Case Summary */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Extracted Case Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                  <p className="text-gray-900 font-medium">{extractedData.caseTitle}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <p className="text-gray-900 font-medium">{extractedData.caseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Registered</label>
                  <p className="text-gray-900">{extractedData.dateRegistered}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                  <p className="text-gray-900">{extractedData.jurisdiction}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accused</label>
                  <p className="text-gray-900">{extractedData.accusedName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {extractedData.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Victim Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name/Entity</label>
                    <p className="text-gray-900">{extractedData.victimDetails.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{extractedData.victimDetails.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{extractedData.victimDetails.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Applicable Charges</h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData.charges.map((charge, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {charge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Judgments */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Related Legal Precedents</h2>
              <div className="space-y-4">
                {aiInsights.relatedJudgments.map((judgment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{judgment.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{judgment.court} • {judgment.year}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        judgment.relevance === 'High' ? 'bg-red-100 text-red-800' :
                        judgment.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {judgment.relevance} Relevance
                      </span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Full Judgment →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - AI Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Compliance Score */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">SOP Compliance Score</h3>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2" fill="transparent"/>
                    <circle 
                      cx="12" cy="12" r="10" 
                      stroke={aiInsights.complianceScore >= 80 ? "#10b981" : aiInsights.complianceScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="2" 
                      fill="transparent"
                      strokeDasharray={`${aiInsights.complianceScore * 0.628} 62.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{aiInsights.complianceScore}%</span>
                  </div>
                </div>
                <p className={`text-sm font-medium ${
                  aiInsights.complianceScore >= 80 ? 'text-green-600' : 
                  aiInsights.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {aiInsights.complianceScore >= 80 ? 'Good Compliance' : 
                   aiInsights.complianceScore >= 60 ? 'Needs Improvement' : 'Critical Issues'}
                </p>
              </div>
            </div>

            {/* Missing Steps */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Missing Steps</h3>
              <div className="space-y-3">
                {aiInsights.missingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Issues */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Compliance Issues</h3>
              <div className="space-y-3">
                {aiInsights.complianceIssues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-yellow-600 text-xs">⚠</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 lg:mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4 lg:mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm lg:text-base">Back to Dashboard</span>
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Upload Existing Case</h1>
        <p className="text-sm lg:text-base text-gray-600">Upload your case document to extract information and get AI insights</p>
      </div>

      {/* Upload Card */}
      <div className="max-w-4xl mx-auto">
        <div 
          className={`bg-white rounded-lg shadow-lg border-2 border-dashed transition-all duration-300 ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 lg:p-12 text-center">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">Upload Case Document</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6 max-w-md mx-auto">
              Drag and drop your case file here, or click to browse. 
              Supported formats: PDF, DOC, DOCX
            </p>
            
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              className="hidden"
              id="case-file-upload"
            />
            
            <label 
              htmlFor="case-file-upload"
              className="inline-block bg-green-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors font-medium text-sm lg:text-base"
            >
              Choose File to Upload
            </label>
            
            <p className="text-xs lg:text-sm text-gray-500 mt-3 lg:mt-4">Maximum file size: 25MB</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Extraction</h3>
            <p className="text-gray-600 text-sm">AI automatically extracts case details, dates, parties, and charges from your document</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Compliance Check</h3>
            <p className="text-gray-600 text-sm">Identifies missing steps and compliance issues according to legal SOPs</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Legal Insights</h3>
            <p className="text-gray-600 text-sm">Suggests related case laws, precedents, and legal strategies</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExistingCaseUpload