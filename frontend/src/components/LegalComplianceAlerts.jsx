import { useState } from 'react';

const LegalComplianceAlerts = ({ alerts, onResolve, onViewDetails }) => {
  const [expandedAlerts, setExpandedAlerts] = useState({});
  
  const toggleAlertExpand = (alertId) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [alertId]: !prev[alertId]
    }));
  };
  
  // Group alerts by priority
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');
  const highAlerts = alerts.filter(alert => alert.priority === 'high');
  const mediumAlerts = alerts.filter(alert => alert.priority === 'medium');
  
  // If no alerts, show success message
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">All Legal Requirements Met</h3>
        <p className="text-green-700 max-w-md">
          Great job! All mandatory legal steps and requirements have been properly addressed for this case.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border-l-4 border-red-500">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Compliance Issues Detected
        </h2>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-red-700">{criticalAlerts.length}</div>
            <div className="text-xs font-medium text-red-600">Critical</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-orange-700">{highAlerts.length}</div>
            <div className="text-xs font-medium text-orange-600">High Priority</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-yellow-700">{mediumAlerts.length}</div>
            <div className="text-xs font-medium text-yellow-600">Medium Priority</div>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm">
          {alerts.length} compliance issues require your attention. These issues may impact the legal validity of your case and should be addressed promptly.
        </p>
      </div>
      
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-red-800 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Critical Compliance Issues
          </h3>
          
          {criticalAlerts.map((alert, index) => (
            <div 
              key={index} 
              className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {alert.section && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                          {alert.section}
                        </span>
                      )}
                      {alert.timeline && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {alert.timeline}
                        </span>
                      )}
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Critical Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAlertExpand(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedAlerts[alert.id] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedAlerts[alert.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {alert.remediation && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Recommended Action:</h5>
                        <p className="text-sm text-gray-600">{alert.remediation}</p>
                      </div>
                    )}
                    
                    {alert.legalConsequence && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Legal Consequences:</h5>
                        <p className="text-sm text-gray-600">{alert.legalConsequence}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      {onResolve && (
                        <button 
                          onClick={() => onResolve(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      {onViewDetails && (
                        <button 
                          onClick={() => onViewDetails(alert.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View Legal Details
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* High Priority Alerts */}
      {highAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-orange-800 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            High Priority Issues
          </h3>
          
          {highAlerts.map((alert, index) => (
            <div 
              key={index} 
              className="bg-white border-l-4 border-orange-500 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="font-semibold text-orange-800">{alert.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {alert.section && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {alert.section}
                        </span>
                      )}
                      {alert.timeline && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {alert.timeline}
                        </span>
                      )}
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        High Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAlertExpand(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedAlerts[alert.id] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedAlerts[alert.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {alert.remediation && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Recommended Action:</h5>
                        <p className="text-sm text-gray-600">{alert.remediation}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      {onResolve && (
                        <button 
                          onClick={() => onResolve(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      {onViewDetails && (
                        <button 
                          onClick={() => onViewDetails(alert.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View Legal Details
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Medium Priority Alerts */}
      {mediumAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-yellow-800 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Medium Priority Issues
          </h3>
          
          {mediumAlerts.map((alert, index) => (
            <div 
              key={index} 
              className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="font-semibold text-yellow-800">{alert.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {alert.section && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {alert.section}
                        </span>
                      )}
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Medium Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAlertExpand(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedAlerts[alert.id] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedAlerts[alert.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {alert.remediation && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Recommended Action:</h5>
                        <p className="text-sm text-gray-600">{alert.remediation}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      {onResolve && (
                        <button 
                          onClick={() => onResolve(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      {onViewDetails && (
                        <button 
                          onClick={() => onViewDetails(alert.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View Legal Details
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LegalComplianceAlerts;