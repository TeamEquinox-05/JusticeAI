import { useState, useEffect } from 'react'
import axios from 'axios'

const CaseAnalysisReport = ({ formData, onBack, onContinueEditing, caseType = 'new', caseId, analysisData = null }) => {
  const [isLoading, setIsLoading] = useState(!analysisData)
  const [analysisReport, setAnalysisReport] = useState(analysisData || {
    caseClassification: "Pending",
    complianceScore: 0,
    missingFields: [],
    requiredDocuments: [],
    legalReferences: [],
    investigationSteps: {},
    caseAnalysisReport: ""
  })
  const [error, setError] = useState(null)

  // Function to toggle the completion status of an investigation step
  const toggleStep = async (stepName) => {
    if (!analysisReport.investigationSteps || !analysisReport.investigationSteps[stepName]) {
      console.error(`Step "${stepName}" not found in investigation steps`);
      return;
    }
    
    // Get current completion status of this step
    const isCurrentlyCompleted = analysisReport.investigationSteps[stepName].completed;
    
    // Create a copy of the analysis report to update locally
    const updatedReport = { 
      ...analysisReport,
      investigationSteps: {
        ...analysisReport.investigationSteps,
        [stepName]: {
          ...analysisReport.investigationSteps[stepName],
          completed: !isCurrentlyCompleted
        }
      }
    };
    
    // Update local state immediately for better UX
    setAnalysisReport(updatedReport);
    
    try {
      // Send update to backend
      await axios.post('http://localhost:3001/api/update-steps', {
        caseId: caseId,
        stepName: stepName,
        completed: !isCurrentlyCompleted
      });
      
      console.log(`Step "${stepName}" ${isCurrentlyCompleted ? 'uncompleted' : 'completed'} successfully`);
    } catch (err) {
      console.error('Error updating step status:', err);
      
      // Revert the change if the API call fails
      setAnalysisReport(analysisReport);
    }
  };
  
  // Fetch case analysis data from backend if not provided directly
  useEffect(() => {
    // If analysisData was provided directly, use it and skip the fetch
    if (analysisData) {
      setAnalysisReport(analysisData);
      setIsLoading(false);
      return;
    }
    
    const fetchCaseAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine the appropriate payload based on whether we have caseId or formData
        const payload = caseId ? { caseId } : { caseDetails: formData };
        
        // Make API call to get the case analysis
        const response = await axios.post('http://localhost:3001/api/case', payload);
        
        if (response.data.success) {
          setAnalysisReport(response.data.analysis);
        } else {
          throw new Error(response.data.error || 'Failed to fetch case analysis');
        }
      } catch (err) {
        console.error('Error fetching case analysis:', err);
        setError(err.message || 'An error occurred while fetching case analysis');
        
        // Set a minimal error report
        const errorReport = generateErrorReport();
        setAnalysisReport(errorReport);
      } finally {
        setIsLoading(false);
      }
    };

    // Wait a moment before fetching to give the appearance of analysis being performed
    const timer = setTimeout(() => {
      fetchCaseAnalysis();
    }, 1000);

    return () => clearTimeout(timer);
  }, [analysisData, caseId, formData]);

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
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-medium text-gray-900">Analyzing case details...</h2>
          </div>
          <p className="mt-4 text-gray-500 text-center">Our AI is processing your case information to generate a comprehensive report.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analysisReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 ml-3">Analysis Failed</h2>
          </div>
          <p className="mt-4 text-gray-500 text-center">{error}</p>
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main report content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack} 
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Case Analysis Report</h1>
          {onContinueEditing && (
            <button
              onClick={onContinueEditing}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Continue Editing
            </button>
          )}
        </div>

        {/* Case ID and Classification */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="text-sm font-medium text-gray-500">Case ID</div>
                <div className="text-xl font-bold text-gray-900">{caseId || "New Case"}</div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="text-sm font-medium text-gray-500">Classification</div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {analysisReport?.caseClassification || "Unclassified"}
                </span>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500">Compliance Score</div>
                <div className="mt-1 relative">
                  <svg className="w-16 h-16" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={analysisReport?.complianceScore >= 90 ? "#34D399" : analysisReport?.complianceScore >= 70 ? "#FBBF24" : "#EF4444"}
                      strokeWidth="3"
                      strokeDasharray={`${analysisReport?.complianceScore || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                    {analysisReport?.complianceScore || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missing Fields */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Missing Required Fields
              </h2>
              <ul className="space-y-2">
                {analysisReport?.missingFields?.map((field, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">{field}</span>
                  </li>
                ))}
                {analysisReport?.missingFields?.length === 0 && (
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">All required fields complete</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Required Documents
              </h2>
              <ul className="space-y-2">
                {analysisReport?.requiredDocuments?.map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                )) || (
                  <li className="text-gray-500 italic">No required documents available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Legal References */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Legal References
              </h2>
              <ul className="space-y-3">
                {analysisReport?.legalReferences?.map((ref, index) => (
                  <li key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div className="font-medium text-gray-800">{ref.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{ref.description}</div>
                  </li>
                )) || (
                  <li className="text-gray-500 italic">No legal references available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Legal Requirements */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                Legal Requirements
              </h2>
              <ul className="space-y-3">
                {analysisReport?.legalRequirements?.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{req}</span>
                  </li>
                )) || (
                  <li className="text-gray-500 italic">No legal requirements available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Investigation Steps */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Investigation Steps Checklist
              </h2>
              <div className="space-y-3">
                {analysisReport?.investigationSteps && Object.keys(analysisReport.investigationSteps).length > 0 ? (
                  Object.entries(analysisReport.investigationSteps).map(([stepName, stepData], index) => {
                    const isCompleted = stepData.completed;
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start p-2 rounded-md transition-colors ${isCompleted ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      >
                        <div 
                          className="cursor-pointer flex items-center" 
                          onClick={() => toggleStep(stepName)}
                        >
                          <div className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center`}>
                            {isCompleted && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-gray-700 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {stepName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 italic">No investigation steps available</div>
                )}
              </div>
              {analysisReport?.investigationSteps && Object.keys(analysisReport.investigationSteps).length > 0 && (
                <div className="mt-4 text-right">
                  <span className="text-sm text-gray-500">
                    {Object.values(analysisReport.investigationSteps).filter(step => step.completed).length} of {Object.keys(analysisReport.investigationSteps).length} steps completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Case Analysis Report */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Case Analysis Report
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>{analysisReport?.caseAnalysisReport || "No case analysis report available."}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Return to Dashboard
          </button>
          
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Export Report
          </button>
          
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            Continue to Case Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseAnalysisReport;