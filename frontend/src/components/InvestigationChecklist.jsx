import { useState } from 'react';

const InvestigationChecklist = ({ steps, onUpdateStep }) => {
  const [expandedSteps, setExpandedSteps] = useState({});
  
  const toggleStepExpand = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };
  
  const handleStatusChange = (stepId, newStatus) => {
    if (onUpdateStep) {
      onUpdateStep(stepId, { status: newStatus });
    }
  };
  
  // Group steps by their status
  const pendingSteps = steps.filter(step => step.status === 'pending');
  const completedSteps = steps.filter(step => step.status === 'completed');
  const notRequiredSteps = steps.filter(step => step.status === 'not_required');
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl lg:text-2xl font-bold text-blue-700">{steps.length}</div>
            <div className="text-xs font-medium text-blue-600">Total Steps</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl lg:text-2xl font-bold text-green-700">{completedSteps.length}</div>
            <div className="text-xs font-medium text-green-600">Completed</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-xl lg:text-2xl font-bold text-yellow-700">{pendingSteps.length}</div>
            <div className="text-xs font-medium text-yellow-600">Pending</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl lg:text-2xl font-bold text-gray-700">{notRequiredSteps.length}</div>
            <div className="text-xs font-medium text-gray-600">Not Required</div>
          </div>
        </div>
      </div>
      
      {/* Pending Steps Section */}
      {pendingSteps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
            <h3 className="text-lg font-bold text-yellow-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Steps ({pendingSteps.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {pendingSteps.map((step, index) => (
              <div key={index} className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-yellow-700 font-medium text-sm">{index + 1}</span>
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-3">
                        {step.timeline && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {step.timeline}
                          </span>
                        )}
                        {step.officer && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {step.officer}
                          </span>
                        )}
                        {step.mandatory && (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleStatusChange(step.id, 'completed')}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs font-medium"
                    >
                      Mark Complete
                    </button>
                    <button 
                      onClick={() => handleStatusChange(step.id, 'not_required')}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-xs font-medium"
                    >
                      Not Required
                    </button>
                    <button 
                      onClick={() => toggleStepExpand(step.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedSteps[step.id] ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedSteps[step.id] && (
                  <div className="mt-3 pl-9 text-sm text-gray-600">
                    <p className="mb-2">{step.description}</p>
                    
                    {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700 mb-1">Required Documents:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
                          {step.requiredDocuments.map((doc, docIndex) => (
                            <li key={docIndex}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.legalReference && (
                      <div className="mt-2 text-xs font-medium text-blue-600">
                        Legal Reference: {step.legalReference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Steps Section */}
      {completedSteps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-lg font-bold text-green-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed Steps ({completedSteps.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {completedSteps.map((step, index) => (
              <div key={index} className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-3">
                        {step.completedDate && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Completed: {step.completedDate}
                          </span>
                        )}
                        {step.completedBy && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            By: {step.completedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleStatusChange(step.id, 'pending')}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs font-medium"
                    >
                      Mark Pending
                    </button>
                    <button 
                      onClick={() => toggleStepExpand(step.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedSteps[step.id] ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedSteps[step.id] && (
                  <div className="mt-3 pl-9 text-sm text-gray-600">
                    <p className="mb-2">{step.description}</p>
                    
                    {step.notes && (
                      <div className="mt-2 bg-green-50 p-2 rounded text-green-700 border border-green-100">
                        <strong>Notes:</strong> {step.notes}
                      </div>
                    )}
                    
                    {step.evidenceIds && step.evidenceIds.length > 0 && (
                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700 mb-1">Associated Evidence:</h5>
                        <div className="flex flex-wrap gap-2">
                          {step.evidenceIds.map((id, i) => (
                            <span key={i} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Not Required Steps Section */}
      {notRequiredSteps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Not Required ({notRequiredSteps.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {notRequiredSteps.map((step, index) => (
              <div key={index} className="p-4 lg:p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-700 line-through mb-1">{step.title}</h4>
                      <div className="text-xs text-gray-500">
                        {step.notRequiredReason && (
                          <span>Reason: {step.notRequiredReason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleStatusChange(step.id, 'pending')}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs font-medium"
                    >
                      Mark Pending
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationChecklist;