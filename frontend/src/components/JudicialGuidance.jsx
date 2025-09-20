import { useState } from 'react';

const JudicialGuidance = ({ judgments }) => {
  const [expandedJudgment, setExpandedJudgment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Filter judgments based on search term and filter type
  const filteredJudgments = judgments.filter(judgment => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      judgment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      judgment.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (judgment.summary && judgment.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === 'all' || judgment.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique types for filter
  const judgmentTypes = ['all', ...new Set(judgments.map(j => j.type))];
  
  const toggleExpand = (id) => {
    setExpandedJudgment(expandedJudgment === id ? null : id);
  };
  
  if (!judgments || judgments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Judicial Precedents Found</h3>
        <p className="text-gray-600 max-w-md">
          No relevant judicial precedents have been identified for this case. This might be because the case is unique or there's insufficient information to match with existing judgments.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search judgments..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter by:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {judgmentTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Judgment Count Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border-l-4 border-blue-500">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900">Judicial Precedents</h2>
        </div>
        
        <p className="text-gray-700 text-sm mb-4">
          {filteredJudgments.length} relevant judicial precedents have been identified for this case. These judgments can provide valuable guidance on legal interpretations and procedural requirements.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Supreme Court */}
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-indigo-700">
              {filteredJudgments.filter(j => j.court === 'Supreme Court').length}
            </div>
            <div className="text-xs font-medium text-indigo-600">Supreme Court</div>
          </div>
          
          {/* High Court */}
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-700">
              {filteredJudgments.filter(j => j.court === 'High Court').length}
            </div>
            <div className="text-xs font-medium text-blue-600">High Court</div>
          </div>
          
          {/* Lower Courts */}
          <div className="bg-sky-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-sky-700">
              {filteredJudgments.filter(j => j.court !== 'Supreme Court' && j.court !== 'High Court').length}
            </div>
            <div className="text-xs font-medium text-sky-600">Other Courts</div>
          </div>
        </div>
      </div>
      
      {/* List of Judgments */}
      <div className="space-y-4">
        {filteredJudgments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No judgments match your search criteria.</p>
          </div>
        ) : (
          filteredJudgments.map((judgment) => (
            <div 
              key={judgment.id}
              className={`bg-white border rounded-lg shadow-sm overflow-hidden
                ${judgment.court === 'Supreme Court' ? 'border-l-4 border-indigo-500' : 
                  judgment.court === 'High Court' ? 'border-l-4 border-blue-500' : 
                  'border-l-4 border-sky-500'}`}
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{judgment.title}</h4>
                      {judgment.relevance === 'high' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Highly Relevant
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {judgment.court}
                      </span>
                      
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {judgment.date}
                      </span>
                      
                      {judgment.type && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {judgment.type.charAt(0).toUpperCase() + judgment.type.slice(1)}
                        </span>
                      )}
                      
                      {judgment.sections && judgment.sections.map((section, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {section}
                        </span>
                      ))}
                    </div>
                    
                    {!expandedJudgment || expandedJudgment !== judgment.id ? (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {judgment.summary || "No summary available."}
                      </p>
                    ) : null}
                  </div>
                  
                  <button 
                    onClick={() => toggleExpand(judgment.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                  >
                    {expandedJudgment === judgment.id ? (
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
                
                {expandedJudgment === judgment.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {/* Full Summary */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Case Summary:</h5>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{judgment.summary || "No detailed summary available."}</p>
                    </div>
                    
                    {/* Key Findings */}
                    {judgment.keyFindings && judgment.keyFindings.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Findings:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {judgment.keyFindings.map((finding, idx) => (
                            <li key={idx} className="text-gray-600 text-sm">{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Relevant Quote */}
                    {judgment.relevantQuote && (
                      <div className="mb-4 pl-4 border-l-2 border-gray-200">
                        <p className="text-gray-600 text-sm italic">"{judgment.relevantQuote}"</p>
                        {judgment.quoteSource && (
                          <p className="text-gray-500 text-xs mt-1">— {judgment.quoteSource}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Application to Current Case */}
                    {judgment.applicationToCase && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-semibold text-blue-800 mb-1">Application to Current Case:</h5>
                        <p className="text-blue-700 text-sm">{judgment.applicationToCase}</p>
                      </div>
                    )}
                    
                    {/* Case Citation */}
                    {judgment.citation && (
                      <div className="text-xs text-gray-500 mt-2">
                        Citation: {judgment.citation}
                      </div>
                    )}
                    
                    {/* View Full Judgment Button */}
                    {judgment.fullJudgmentUrl && (
                      <div className="mt-4">
                        <a 
                          href={judgment.fullJudgmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Full Judgment
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JudicialGuidance;