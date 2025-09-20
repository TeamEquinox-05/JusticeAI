import { useState, useEffect } from 'react'
import ReferenceSourceViewer from './ReferenceSourceViewer'

const CaseAnalysisReport = ({ formData, onBack, onContinueEditing, caseType = 'new' }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [analysisReport, setAnalysisReport] = useState(null)

  // Generate analysis report based on form data
  // Fetch analysis from backend AI instead of using hardcoded data
  const fetchAnalysisReport = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze case');
      }
      
      // Use the AI-generated analysis
      return {
        caseClassification: data.analysis.caseType || 'Pending Classification',
        complianceScore: data.analysis.complianceScore || 0,
        completionPercentage: getCompletionPercentage(),
        missingFields: detectMissingFields(),
        requiredDocuments: extractRequiredDocuments(data.analysis),
        legalRequirements: extractLegalRequirements(data.analysis),
        investigationSteps: data.analysis.investigationSteps || [],
        relatedCases: extractRelatedCases(data.analysis),
        urgentActions: extractUrgentActions(data.analysis),
        timelineCompliance: determineTimelineCompliance(data.analysis),
        riskAssessment: determineRiskAssessment(data.analysis),
        // Include all original AI analysis data
        aiAnalysis: data.analysis
      };
    } catch (error) {
      console.error('Error fetching analysis:', error);
      // Return minimal fallback data if API fails
      return {
        caseClassification: 'Analysis Failed',
        complianceScore: 0,
        completionPercentage: getCompletionPercentage(),
        missingFields: detectMissingFields(),
        requiredDocuments: [],
        legalRequirements: [],
        investigationSteps: [],
        relatedCases: [],
        urgentActions: [`ERROR: ${error.message}. Please try again.`],
        timelineCompliance: 'Unknown',
        riskAssessment: 'Unknown'
      };
    }
  }
  
  // Helper function to detect missing fields from form data
  const detectMissingFields = () => {
    const missingFields = [];
    const requiredFields = [
      'caseId', 'caseTitle', 'caseDescription', 
      'victimAge', 'victimGender', 'incidentDate', 
      'incidentTime', 'victimLocation'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        missingFields.push(field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'));
      }
    });
    
    return missingFields;
  }
  
  // Helper functions to extract data from AI analysis
  const extractRequiredDocuments = (analysis) => {
    // Extract documents from investigationSteps that involve documentation
    const documentSteps = analysis.investigationSteps?.filter(step => 
      step.title.toLowerCase().includes('document') ||
      step.title.toLowerCase().includes('report') ||
      step.title.toLowerCase().includes('record') ||
      step.title.toLowerCase().includes('certificate') ||
      step.description?.toLowerCase().includes('document') ||
      step.description?.toLowerCase().includes('collect')
    ) || [];
    
    return documentSteps.map(step => step.title);
  }
  
  const extractLegalRequirements = (analysis) => {
    // Extract legal requirements from applicable sections and compliance alerts
    const requirements = [];
    
    // From applicable sections
    if (analysis.applicableSections) {
      analysis.applicableSections.forEach(section => {
        requirements.push(`${section.act} ${section.section}: ${section.title}`);
      });
    }
    
    // From compliance alerts
    if (analysis.complianceAlerts) {
      analysis.complianceAlerts.forEach(alert => {
        requirements.push(`${alert.title} (${alert.section || 'Procedural Requirement'})`);
      });
    }
    
    return requirements;
  }
  
  const extractRelatedCases = (analysis) => {
    // Extract case references from judicial guidance
    return analysis.judicialGuidance ? 
      analysis.judicialGuidance.map(guidance => `${guidance.name} - ${guidance.citation || 'Citation not available'}`) : 
      [];
  }
  
  const extractUrgentActions = (analysis) => {
    // Extract urgent actions from compliance alerts with high priority
    const urgentActions = [];
    
    if (analysis.complianceAlerts) {
      analysis.complianceAlerts.forEach(alert => {
        if (alert.priority === 'critical' || alert.priority === 'high') {
          urgentActions.push(`${alert.title}: ${alert.description}`);
        }
      });
    }
    
    return urgentActions;
  }
  
  const determineTimelineCompliance = (analysis) => {
    // Determine timeline compliance based on compliance score
    if (!analysis.complianceScore) return 'Unknown';
    
    if (analysis.complianceScore >= 80) return 'Fully Compliant';
    if (analysis.complianceScore >= 60) return 'Mostly Compliant';
    if (analysis.complianceScore >= 40) return 'Partially Compliant';
    return 'Non-Compliant';
  }
  
  const determineRiskAssessment = (analysis) => {
    // Determine risk based on compliance alerts and score
    if (!analysis.complianceScore) return 'Unknown Risk';
    
    const criticalAlerts = analysis.complianceAlerts?.filter(alert => 
      alert.priority === 'critical'
    ).length || 0;
    
    if (criticalAlerts > 2 || analysis.complianceScore < 40) return 'High Risk';
    if (criticalAlerts > 0 || analysis.complianceScore < 70) return 'Medium Risk';
    return 'Low Risk';
  }

  const getCompletionPercentage = () => {
    if (!formData) return 0
    const fields = Object.keys(formData)
    const filledFields = fields.filter(field => {
      const value = formData[field]
      if (Array.isArray(value)) return value.length > 0
      return value && value.toString().trim() !== ''
    })
    return Math.round((filledFields.length / fields.length) * 100)
  }

  // Fetch analysis report from backend AI
  useEffect(() => {
    const getAnalysisReport = async () => {
      try {
        setIsLoading(true);
        const report = await fetchAnalysisReport();
        setAnalysisReport(report);
      } catch (error) {
        console.error('Error getting analysis report:', error);
        // Handle error state if needed
      } finally {
        setIsLoading(false);
      }
    };
    
    getAnalysisReport();
  }, [formData]); // Re-run when form data changes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 lg:p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-navy-900 to-blue-700 bg-clip-text text-transparent mb-2">Analyzing Case Details</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">AI is processing your case information and generating compliance report...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs lg:text-sm text-gray-500">Checking legal requirements and generating recommendations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors self-start"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm lg:text-base">Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
              <button 
                onClick={onContinueEditing}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:ring-2 hover:ring-blue-500 transform hover:-translate-y-1 transition-all duration-200 text-sm lg:text-base"
              >
                Continue Editing
              </button>
              <button className="px-4 py-2 lg:px-6 lg:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:ring-2 hover:ring-green-500 transform hover:-translate-y-1 transition-all duration-200 text-sm lg:text-base">
                Download Report
              </button>
              <button className="px-4 py-2 lg:px-6 lg:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:ring-2 hover:ring-gray-500 transform hover:-translate-y-1 transition-all duration-200 text-sm lg:text-base">
                Save to Cases
              </button>
            </div>
          </div>

          {/* Report Header */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-navy-900 to-blue-700 bg-clip-text text-transparent mb-2">Case Analysis Report</h1>
                <p className="text-gray-600 text-sm lg:text-base">AI-Generated Legal Compliance Assessment</p>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{analysisReport.complianceScore}%</div>
                <div className="text-sm lg:text-base text-gray-600">Compliance Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Source Viewer - For PDF-driven questions and analysis */}
        <ReferenceSourceViewer caseData={formData} analysisData={analysisReport} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Classification */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-blue-500">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Case Classification</h3>
              <p className="text-blue-700 font-medium text-sm lg:text-base">{analysisReport.caseClassification}</p>
              <p className="text-gray-600 text-xs lg:text-sm mt-2">
                Form completion: {analysisReport.completionPercentage}% | Timeline: {analysisReport.timelineCompliance}
              </p>
            </div>

            {/* Urgent Actions */}
            {analysisReport.urgentActions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-red-500">
                <h3 className="text-lg lg:text-xl font-bold text-red-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Urgent Actions Required
                </h3>
                <ul className="space-y-2">
                  {analysisReport.urgentActions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2 text-red-700">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm lg:text-base font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Fields */}
            {analysisReport.missingFields.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg lg:text-xl font-bold text-yellow-800 mb-3">Missing Required Fields</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {analysisReport.missingFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-yellow-700">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm lg:text-base">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-purple-500">
              <h3 className="text-lg lg:text-xl font-bold text-purple-800 mb-3">Required Documents Checklist</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {analysisReport.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-start space-x-2 text-purple-700">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm lg:text-base">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Requirements */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-indigo-500">
              <h3 className="text-lg lg:text-xl font-bold text-indigo-800 mb-3">Legal Compliance Requirements</h3>
              <ul className="space-y-2">
                {analysisReport.legalRequirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2 text-indigo-700">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm lg:text-base">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Investigation Steps */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6 border-l-4 border-green-500">
              <h3 className="text-lg lg:text-xl font-bold text-green-800 mb-3">Investigation Roadmap</h3>
              <ol className="space-y-3">
                {analysisReport.investigationSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3 text-green-700">
                    <span className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center text-xs lg:text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="text-sm lg:text-base">
                      <div className="font-medium">{step.title}</div>
                      {step.description && <div className="text-xs text-gray-600 mt-1">{step.description}</div>}
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          step.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'completed' ? 'Completed' : 
                           step.status === 'pending' ? 'Pending' : 
                           step.status}
                        </span>
                        {step.timeline && <span className="text-xs text-gray-500 ml-2">{step.timeline}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">Risk Assessment</h3>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${
                  analysisReport.riskAssessment === 'High Risk' ? 'text-red-600' :
                  analysisReport.riskAssessment === 'Medium Risk' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {analysisReport.riskAssessment}
                </div>
                <p className="text-xs lg:text-sm text-gray-600">Based on case complexity and missing elements</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">Case Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs lg:text-sm text-gray-600">Form Completion</span>
                  <span className="text-xs lg:text-sm font-medium">{analysisReport.completionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs lg:text-sm text-gray-600">Missing Fields</span>
                  <span className="text-xs lg:text-sm font-medium">{analysisReport.missingFields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs lg:text-sm text-gray-600">Required Documents</span>
                  <span className="text-xs lg:text-sm font-medium">{analysisReport.requiredDocuments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs lg:text-sm text-gray-600">Investigation Steps</span>
                  <span className="text-xs lg:text-sm font-medium">{analysisReport.investigationSteps.length}</span>
                </div>
              </div>
            </div>

            {/* Related Cases */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">Related Cases</h3>
              <ul className="space-y-2">
                {analysisReport.relatedCases.map((caseRef, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-700">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-xs lg:text-sm">{caseRef}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:ring-2 hover:ring-blue-500 transform hover:-translate-y-1 transition-all duration-200 text-xs lg:text-sm">
                  Generate PDF Report
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:ring-2 hover:ring-green-500 transform hover:-translate-y-1 transition-all duration-200 text-xs lg:text-sm">
                  Export to Legal Database
                </button>
                <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:ring-2 hover:ring-orange-500 transform hover:-translate-y-1 transition-all duration-200 text-xs lg:text-sm">
                  Schedule Court Filing
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 text-xs lg:text-sm">
                  Share with Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseAnalysisReport