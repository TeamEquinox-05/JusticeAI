import { useState, useEffect } from 'react'
import axios from 'axios'

const Cases = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const [casesData, setCasesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' })
  const [prompt, setPrompt] = useState('')
  const [isPromptLoading, setIsPromptLoading] = useState(false)
  const [promptResponse, setPromptResponse] = useState(null)

  // Fetch case data from backend
  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/cases');
        if (response.data.success) {
          setCasesData(response.data.cases);
        } else {
          throw new Error(response.data.error || 'Failed to fetch cases');
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError(err.message || 'An error occurred while fetching cases');
        // Set some sample data as fallback
        setCasesData([{
          id: 'ERROR',
          title: 'Error Loading Cases',
          victimCode: 'N/A',
          offenseType: 'N/A',
          status: 'error',
          priority: 'high',
          progress: 0,
          assignedOfficer: 'N/A',
          dateCreated: new Date().toISOString().split('T')[0],
          lastUpdated: 'now',
          location: 'N/A',
          description: 'Failed to load cases from the server. Please try again later.',
          pendingTasks: [],
          evidence: [],
          timeline: []
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);
  
  // Function to handle prompt submission
  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || isPromptLoading || !selectedCase) return;
    
    setIsPromptLoading(true);
    setPromptResponse(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/case/edit', {
        caseId: selectedCase.id,
        prompt: prompt.trim()
      });
      
      if (response.status === 200) {
        setPromptResponse({
          success: true,
          message: 'Your prompt was submitted successfully.'
        });
        setPrompt(''); // Clear the prompt input
      } else {
        throw new Error('Failed to process your prompt');
      }
    } catch (err) {
      console.error('Error submitting prompt:', err);
      setPromptResponse({
        success: false,
        message: err.message || 'An error occurred while processing your prompt'
      });
    } finally {
      setIsPromptLoading(false);
      // Auto-clear response message after 5 seconds
      setTimeout(() => {
        setPromptResponse(null);
      }, 5000);
    }
  };

  // Function to toggle investigation step completion status
  const toggleInvestigationStep = async (caseId, stepName, currentStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateMessage({ text: 'Updating...', type: 'info' });
    
    try {
      const response = await axios.post('http://localhost:3001/api/update-steps', {
        caseId,
        stepName,
        completed: !currentStatus
      });
      
      if (response.data.success) {
        // Update the case in the local state
        const updatedCasesData = casesData.map(caseItem => {
          if (caseItem.id === caseId) {
            // Deep clone the case to avoid mutation
            const updatedCase = JSON.parse(JSON.stringify(caseItem));
            
            // Update the investigation step status
            if (updatedCase.investigationSteps && updatedCase.investigationSteps[stepName] !== undefined) {
              updatedCase.investigationSteps[stepName].completed = !currentStatus;
            }
            
            // Recalculate progress percentage
            const totalSteps = Object.keys(updatedCase.investigationSteps || {}).length;
            const completedSteps = Object.values(updatedCase.investigationSteps || {}).filter(step => step.completed).length;
            updatedCase.progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            
            return updatedCase;
          }
          return caseItem;
        });
        
        setCasesData(updatedCasesData);
        setSelectedCase(updatedCasesData.find(c => c.id === caseId));
        setUpdateMessage({ text: 'Updated successfully!', type: 'success' });
      } else {
        throw new Error(response.data.error || 'Failed to update investigation step');
      }
    } catch (err) {
      console.error('Error updating investigation step:', err);
      setUpdateMessage({ text: err.message || 'Failed to update. Please try again.', type: 'error' });
    } finally {
      setIsUpdating(false);
      // Clear update message after 3 seconds
      setTimeout(() => {
        setUpdateMessage({ text: '', type: '' });
      }, 3000);
    }
  };
    
  const filterOptions = [
    { id: 'all', name: 'All Cases', count: casesData.length },
    { id: 'active', name: 'Active', count: casesData.filter(c => c.status === 'active').length },
    { id: 'under_review', name: 'Under Review', count: casesData.filter(c => c.status === 'under_review').length },
    { id: 'completed', name: 'Completed', count: casesData.filter(c => c.status === 'completed').length }
  ]

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCases = casesData.filter(caseItem => {
    // Make sure all the required properties exist before filtering
    if (!caseItem || typeof caseItem !== 'object') return false;
    
    const matchesFilter = selectedFilter === 'all' || caseItem.status === selectedFilter
    const matchesSearch = (caseItem.id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (caseItem.offenseType?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    return matchesFilter && matchesSearch
  })

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedCase(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Cases</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedCase.id}</h1>
                <p className="text-lg text-gray-600 mt-1">{selectedCase.title}</p>
              </div>
              <div className="flex space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCase.status)}`}>
                  {selectedCase.status ? selectedCase.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedCase.priority)}`}>
                  {selectedCase.priority ? selectedCase.priority.toUpperCase() : 'UNKNOWN'} PRIORITY
                </span>
              </div>
            </div>
          </div>

          {/* Case Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case Overview */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Case Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Victim Code</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCase.victimCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Offense Type</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCase.offenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned Officer</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCase.assignedOfficer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCase.location}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{selectedCase.description}</p>
                </div>
              </div>

              {/* Evidence */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Evidence</h2>
                <div className="space-y-3">
                  {selectedCase.evidence.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Case Timeline</h2>
                <div className="space-y-4">
                  {selectedCase.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.status === 'completed' ? 'bg-green-500' :
                        event.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{event.event}</p>
                          <span className="text-sm text-gray-500">{event.date}</span>
                        </div>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          event.status === 'completed' ? 'bg-green-100 text-green-700' :
                          event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legal References */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Legal References</h2>
                {selectedCase.legalReferences ? (
                  <div className="space-y-4">
                    {selectedCase.legalReferences.map((reference, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-900">{reference.title}</h3>
                        <p className="text-gray-700 text-sm mt-1">{reference.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No legal references available</p>
                )}
              </div>
              
              {/* Legal Requirements */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Legal Requirements</h2>
                {selectedCase.legalRequirements ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCase.legalRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span className="text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No legal requirements available</p>
                )}
              </div>
              
              {/* Investigation Steps Checklist */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Investigation Steps</h2>
                  {selectedCase.investigationSteps && (
                    <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {Object.values(selectedCase.investigationSteps).filter(step => step.completed).length} / {Object.keys(selectedCase.investigationSteps).length} Completed
                    </div>
                  )}
                </div>
                
                {selectedCase.investigationSteps ? (
                  <div className="space-y-3">
                    {updateMessage.text && (
                      <div className={`p-3 rounded-lg text-sm ${
                        updateMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                        updateMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {updateMessage.text}
                      </div>
                    )}
                    
                    {Object.entries(selectedCase.investigationSteps).map(([stepName, step], index) => (
                      <div 
                        key={index}
                        onClick={() => toggleInvestigationStep(selectedCase.id, stepName, step.completed)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          step.completed ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                            step.completed 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'border-gray-400 bg-white'
                          }`}>
                            {step.completed && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`${step.completed ? 'text-gray-700' : 'text-gray-900'}`}>
                            {stepName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {step.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No investigation steps available</p>
                )}
              </div>
              
              {/* Related Cases */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Related Cases</h2>
                {selectedCase.relatedCases && selectedCase.relatedCases.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCase.relatedCases.map((relatedCase, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-700">{relatedCase}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No related cases available</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Investigation Completion</span>
                    <span className="font-medium">{selectedCase.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${selectedCase.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Compliance Score */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Compliance Score</span>
                    <span className="font-medium">{selectedCase.complianceScore || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div 
                      className={`h-3 rounded-full ${
                        (selectedCase.complianceScore >= 80) ? 'bg-green-500' : 
                        (selectedCase.complianceScore >= 60) ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedCase.complianceScore || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Risk Assessment */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Risk Assessment</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                      selectedCase.riskAssessment?.includes('High') ? 'bg-red-100 text-red-800' : 
                      selectedCase.riskAssessment?.includes('Medium') ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedCase.riskAssessment || 'Low Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks</h3>
                <div className="space-y-3">
                  {selectedCase.pendingTasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 shadow-sm rounded-lg">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update Status</span>
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Add Evidence</span>
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Report</span>
                  </button>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span>Duplicate Case</span>
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export Case</span>
                  </button>
                </div>
                
                {/* AI Prompt Box */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Assistant
                  </h4>
                  
                  {promptResponse && (
                    <div className={`p-3 mb-3 rounded-lg text-sm ${
                      promptResponse.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {promptResponse.message}
                    </div>
                  )}
                  
                  <form onSubmit={handlePromptSubmit} className="space-y-2">
                    <div className="relative">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here (e.g., 'Add a new witness statement')"
                        className="w-full h-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow duration-200"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPromptLoading || !prompt.trim()}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white transition-all duration-200 ${
                        isPromptLoading || !prompt.trim() 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isPromptLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Case Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor and manage all legal cases in your system</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors flex-1 lg:flex-none ${
                    selectedFilter === filter.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="block lg:inline">{filter.name}</span>
                  <span className="block lg:inline lg:ml-1">({filter.count})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-shadow duration-200 w-full lg:w-64 text-sm lg:text-base"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-4 lg:p-6"
            >
              {/* Case Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-2 lg:space-y-0">
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-blue-600 hover:text-blue-800">
                    {caseItem.id}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500">{caseItem.victimCode}</p>
                </div>
                <div className="flex space-x-2 self-start lg:self-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status ? caseItem.status.replace('_', ' ') : 'Unknown'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                    {caseItem.priority || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Case Title */}
              <h4 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{caseItem.title}</h4>
              
              {/* Offense Type */}
              <p className="text-xs lg:text-sm text-gray-600 mb-3">{caseItem.offenseType}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs lg:text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{caseItem.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${caseItem.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Case Details */}
              <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                <div className="flex flex-col lg:flex-row lg:justify-between space-y-1 lg:space-y-0">
                  <span>Officer:</span>
                  <span className="font-medium text-gray-900 lg:text-gray-600">{caseItem.assignedOfficer}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between space-y-1 lg:space-y-0">
                  <span>Created:</span>
                  <span className="text-gray-900 lg:text-gray-600">{caseItem.dateCreated}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between space-y-1 lg:space-y-0">
                  <span>Updated:</span>
                  <span className="text-gray-900 lg:text-gray-600">{caseItem.lastUpdated}</span>
                </div>
              </div>

              {/* Pending Tasks Indicator */}
              {caseItem.pendingTasks.length > 0 && (
                <div className="mt-4 flex items-center space-x-2">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs lg:text-sm text-yellow-600 font-medium">
                    {caseItem.pendingTasks.length} pending task{caseItem.pendingTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-500">No cases match your current filter and search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cases