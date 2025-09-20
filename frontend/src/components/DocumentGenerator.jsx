import { useState } from 'react';

const DocumentGenerator = ({ documentData, onDownload, onEdit }) => {
  const [activeTab, setActiveTab] = useState('fir'); // 'fir' or 'chargesheet'
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [documentFormat, setDocumentFormat] = useState('preview'); // 'preview' or 'print'
  
  // Check if we have document data to display
  const hasFIR = documentData?.fir?.content;
  const hasChargesheet = documentData?.chargesheet?.content;
  
  // Handle starting edit mode for a document
  const handleStartEdit = (type) => {
    setEditMode(true);
    setEditedContent(type === 'fir' ? documentData.fir.content : documentData.chargesheet.content);
  };
  
  // Handle saving edits
  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(activeTab, editedContent);
    }
    setEditMode(false);
  };
  
  // Handle document download
  const handleDownload = (type) => {
    if (onDownload) {
      onDownload(type);
    }
  };
  
  // If no document data available
  if (!hasFIR && !hasChargesheet) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Document Drafts Available</h3>
        <p className="text-gray-600 max-w-md">
          No document drafts have been generated for this case yet. Complete the case details section and request document generation to create FIR and Charge Sheet drafts.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Document Selection Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {hasFIR && (
            <button
              onClick={() => setActiveTab('fir')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fir'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                First Information Report (FIR)
              </div>
            </button>
          )}
          
          {hasChargesheet && (
            <button
              onClick={() => setActiveTab('chargesheet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chargesheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                Charge Sheet
              </div>
            </button>
          )}
        </nav>
      </div>
      
      {/* Document Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-700 font-medium">
            {activeTab === 'fir' ? 'First Information Report (FIR)' : 'Charge Sheet'}
          </h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
            AI Generated
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex items-center p-1 bg-gray-200 rounded-md">
            <button
              onClick={() => setDocumentFormat('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                documentFormat === 'preview'
                  ? 'bg-white text-gray-800 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setDocumentFormat('print')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                documentFormat === 'print'
                  ? 'bg-white text-gray-800 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Print Layout
            </button>
          </div>
          
          {/* Actions */}
          {editMode ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditMode(false)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleStartEdit(activeTab)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                onClick={() => handleDownload(activeTab)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Document Content */}
      <div className={`bg-white border rounded-lg overflow-hidden ${documentFormat === 'print' ? 'p-8 max-w-4xl mx-auto shadow-sm' : 'p-4'}`}>
        {editMode ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
          />
        ) : (
          <div className={documentFormat === 'print' ? 'document-print-format' : 'document-preview-format'}>
            {/* Document Header */}
            {documentFormat === 'print' && (
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase mb-2">
                  {activeTab === 'fir' ? 'FIRST INFORMATION REPORT' : 'CHARGE SHEET'}
                </h1>
                <p className="text-gray-600">
                  (Under Section {activeTab === 'fir' ? '154 Cr.P.C.' : '173 Cr.P.C.'})
                </p>
              </div>
            )}
            
            {/* Document Content */}
            <div 
              className={`prose max-w-none ${documentFormat === 'print' ? 'text-sm leading-relaxed' : ''}`}
              dangerouslySetInnerHTML={{ 
                __html: activeTab === 'fir' 
                  ? documentData.fir.content 
                  : documentData.chargesheet.content 
              }}
            />
            
            {/* Document Footer - Signature */}
            {documentFormat === 'print' && (
              <div className="mt-12 pt-8">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold mb-0">Date: {new Date().toLocaleDateString()}</p>
                    <p className="font-bold">Place: _____________________</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-12 pb-8">&nbsp;</div>
                    <p className="font-bold mb-0">Signature of Officer</p>
                    <p className="font-bold">(Name, Rank & Designation)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Document Metadata */}
      {!editMode && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Document Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Case Reference</div>
              <div className="font-medium">{activeTab === 'fir' ? documentData.fir.caseRef : documentData.chargesheet.caseRef}</div>
            </div>
            
            <div>
              <div className="text-gray-500">Generated On</div>
              <div className="font-medium">
                {activeTab === 'fir' 
                  ? new Date(documentData.fir.generatedAt).toLocaleString() 
                  : new Date(documentData.chargesheet.generatedAt).toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-gray-500">Applicable Sections</div>
              <div className="font-medium">
                {activeTab === 'fir'
                  ? documentData.fir.sections.join(', ')
                  : documentData.chargesheet.sections.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Usage Guidance */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important Note</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This document is AI-generated and requires careful review before finalization. Always verify factual information,
                ensure correct legal sections are applied, and modify any content as needed to accurately reflect the case details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;