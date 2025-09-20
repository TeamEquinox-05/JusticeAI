import { useState, useEffect } from 'react';
import axios from 'axios';
import LegalComplianceAlerts from './LegalComplianceAlerts';
import InvestigationChecklist from './InvestigationChecklist';
import JudicialGuidance from './JudicialGuidance';
import DocumentGenerator from './DocumentGenerator';

const LegalAssistant = ({ caseData, onBack, onSave }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // When component mounts, fetch legal analysis
    analyzeCaseDetails();
  }, []);
  
  const analyzeCaseDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call backend API for legal analysis
      const response = await axios.post('http://localhost:3001/api/analyze-case', caseData);
      
      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        setError('Failed to analyze case details.');
      }
    } catch (err) {
      console.error('Error during case analysis:', err);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResolveAlert = async (alertId) => {
    try {
      // Call backend API to resolve compliance alert
      const response = await axios.post(`http://localhost:3001/api/case/${caseData.caseId}/resolve-alert`, { alertId });
      
      if (response.data.success) {
        // Update local analysis state with updated alerts
        setAnalysis(prev => ({
          ...prev,
          complianceAlerts: prev.complianceAlerts.filter(alert => alert.id !== alertId)
        }));
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };
  
  const handleUpdateInvestigationStep = async (stepId, status) => {
    try {
      // Call backend API to update investigation step
      const response = await axios.post(`http://localhost:3001/api/case/${caseData.caseId}/update-step`, { 
        stepId, 
        status 
      });
      
      if (response.data.success) {
        // Update local analysis state with updated steps
        setAnalysis(prev => ({
          ...prev,
          investigationSteps: prev.investigationSteps.map(step => 
            step.id === stepId ? { ...step, status } : step
          )
        }));
      }
    } catch (err) {
      console.error('Error updating investigation step:', err);
    }
  };
  
  const handleEditDocument = async (docType, content) => {
    try {
      // Call backend API to update document
      const response = await axios.post(`http://localhost:3001/api/case/${caseData.caseId}/update-document`, {
        documentType: docType,
        content
      });
      
      if (response.data.success) {
        // Update local analysis state with updated document
        setAnalysis(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: {
              ...prev.documents[docType],
              content
            }
          }
        }));
      }
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };
  
  const handleDownloadDocument = (docType) => {
    const content = docType === 'fir' 
      ? analysis?.documents?.fir?.content
      : analysis?.documents?.chargesheet?.content;
    
    if (!content) return;
    
    const title = docType === 'fir' ? 'First_Information_Report' : 'Charge_Sheet';
    const caseRef = caseData.caseId || 'case';
    const filename = `${title}_${caseRef}.html`;
    
    // Create HTML document with proper styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 2cm;
          }
          h1, h2, h3 {
            font-weight: bold;
            margin-bottom: 0.5em;
          }
          h1 {
            text-align: center;
            font-size: 18pt;
          }
          h2 {
            font-size: 14pt;
          }
          p {
            margin: 0.5em 0;
          }
          .header {
            text-align: center;
            margin-bottom: 2em;
          }
          .footer {
            margin-top: 3em;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            margin-top: 5em;
          }
          @media print {
            body {
              font-size: 12pt;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${docType === 'fir' ? 'FIRST INFORMATION REPORT' : 'CHARGE SHEET'}</h1>
          <p>(Under Section ${docType === 'fir' ? '154 Cr.P.C.' : '173 Cr.P.C.'})</p>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Place:</strong> _____________________</p>
          </div>
          <div style="text-align: right;">
            <div class="signature"></div>
            <p><strong>Signature of Officer</strong></p>
            <p><strong>(Name, Rank & Designation)</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-xl w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Case Details</h2>
          <p className="text-gray-600 mb-4">
            AI is analyzing your case to determine applicable legal sections, procedures, and recommendations...
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-xl w-full text-center">
          <div className="flex justify-center mb-4 text-red-600">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={analyzeCaseDetails} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors self-start"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onSave(analysis)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
              >
                Save Analysis
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Print Report
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Legal Analysis Report
            </h1>
            <p className="text-gray-600">
              AI-generated legal guidance for case #{caseData.caseId || 'N/A'}: {caseData.caseTitle || 'Untitled Case'}
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === 'sections' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Applicable Legal Sections
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === 'checklist' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Investigation Checklist
              </div>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === 'alerts' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Legal Compliance Alerts
                {analysis.complianceAlerts?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    {analysis.complianceAlerts.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('judgments')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === 'judgments' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                Judicial Guidance
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === 'documents' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document Generator
              </div>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicable Legal Sections */}
            {activeTab === 'sections' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Applicable Legal Sections
                </h2>
                
                <div className="space-y-6">
                  {analysis.applicableSections.map((section, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {section.act} Section {section.section} - {section.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{section.plainLanguage}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {section.tags?.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Investigation Checklist */}
            {activeTab === 'checklist' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Investigation Checklist
                </h2>
                
                <InvestigationChecklist 
                  steps={analysis.investigationSteps || []} 
                  onUpdateStep={handleUpdateInvestigationStep} 
                />
              </div>
            )}
            
            {/* Legal Compliance Alerts */}
            {activeTab === 'alerts' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Legal Compliance Alerts
                </h2>
                
                <LegalComplianceAlerts 
                  alerts={analysis.complianceAlerts || []} 
                  onResolve={handleResolveAlert}
                  onViewDetails={(alertId) => {
                    // Find the corresponding legal section and switch to it
                    const alert = analysis.complianceAlerts.find(a => a.id === alertId);
                    if (alert && alert.section) {
                      setActiveTab('sections');
                      // Ideally would scroll to that section
                    }
                  }}
                />
              </div>
            )}
            
            {/* Judicial Guidance */}
            {activeTab === 'judgments' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Judicial Guidance
                </h2>
                
                <JudicialGuidance judgments={analysis.judicialGuidance || []} />
              </div>
            )}
            
            {/* Document Generator */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Document Generator
                </h2>
                
                <DocumentGenerator 
                  documentData={{
                    fir: {
                      content: analysis.firDraft,
                      caseRef: caseData.caseId || 'case',
                      generatedAt: new Date().toISOString(),
                      sections: analysis.applicableSections?.map(s => `${s.act} Section ${s.section}`) || []
                    },
                    chargesheet: analysis.chargesheetDraft ? {
                      content: analysis.chargesheetDraft,
                      caseRef: caseData.caseId || 'case',
                      generatedAt: new Date().toISOString(),
                      sections: analysis.applicableSections?.map(s => `${s.act} Section ${s.section}`) || []
                    } : null
                  }}
                  onDownload={handleDownloadDocument}
                  onEdit={handleEditDocument}
                />
              </div>
            )}
          </div>
          
          {/* Sidebar - Takes 1/3 of the width on large screens */}
          <div className="space-y-6">
            {/* Case Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Case Summary</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Case ID</p>
                  <p className="font-medium text-gray-900">{caseData.caseId || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Case Title</p>
                  <p className="font-medium text-gray-900">{caseData.caseTitle || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Victim Age</p>
                  <p className="font-medium text-gray-900">{caseData.victimAge || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Victim Gender</p>
                  <p className="font-medium text-gray-900">{caseData.victimGender || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Incident Date</p>
                  <p className="font-medium text-gray-900">{caseData.incidentDate || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Incident Location</p>
                  <p className="font-medium text-gray-900">{caseData.victimLocation || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            {/* Analysis Statistics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Statistics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500">Compliance Score</span>
                    <span className="text-sm font-medium text-gray-900">{analysis.complianceScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        analysis.complianceScore > 75 ? 'bg-green-600' : 
                        analysis.complianceScore > 50 ? 'bg-yellow-500' : 'bg-red-600'
                      }`} 
                      style={{ width: `${analysis.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{analysis.applicableSections.length}</div>
                    <div className="text-xs font-medium text-blue-600">Applicable Sections</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700">{analysis.complianceAlerts.length}</div>
                    <div className="text-xs font-medium text-yellow-600">Compliance Alerts</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {analysis.investigationSteps.filter(step => step.status === 'completed').length}
                    </div>
                    <div className="text-xs font-medium text-green-600">Completed Steps</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {analysis.investigationSteps.filter(step => step.status === 'pending').length}
                    </div>
                    <div className="text-xs font-medium text-red-600">Pending Steps</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Case Files
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Final Report
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Share with Team
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask Follow-up Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistant;