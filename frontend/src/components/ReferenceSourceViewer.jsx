import React, { useState, useEffect } from 'react';
import { FaBook, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';

const ReferenceSourceViewer = ({ caseData, analysisData }) => {
  const [activeSource, setActiveSource] = useState('bns');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sourceTabs = [
    { id: 'bns', name: 'BNS', fullName: 'Bharatiya Nyaya Sanhita' },
    { id: 'sop', name: 'SOP', fullName: 'Investigation SOPs' },
    { id: 'delhiPolice', name: 'Guidelines', fullName: 'Police Guidelines' },
    { id: 'datasets', name: 'Precedents', fullName: 'Case Precedents' },
  ];

  // Dynamically generate suggested search terms based on case details and analysis
  const getSuggestedSearchTerms = () => {
    const terms = new Set();
    
    // Extract key terms from case description
    const description = caseData?.caseDescription || caseData?.basicInfo?.caseDescription || '';
    if (description) {
      // Use NLP-inspired approach to extract key terms
      const words = description.toLowerCase().split(/\s+/);
      const importantWords = words.filter(word => 
        word.length > 3 && 
        !['with', 'that', 'this', 'have', 'from', 'they', 'what', 'when', 'where', 'will', 'been'].includes(word)
      );
      
      // Take up to 3 important words from description
      importantWords.slice(0, 3).forEach(word => terms.add(word));
    }
    
    // Based on case type
    const victimAge = caseData?.victimAge || caseData?.basicInfo?.victimAge;
    if (victimAge && parseInt(victimAge) < 18) {
      terms.add('POCSO');
      terms.add('minor victim');
    } else {
      terms.add('adult victim');
      
      // Add gender-specific terms if available
      const victimGender = caseData?.victimGender || caseData?.basicInfo?.victimGender || '';
      if (victimGender.toLowerCase().includes('female')) {
        terms.add('female victim');
      } else if (victimGender.toLowerCase().includes('male')) {
        terms.add('male victim');
      }
    }
    
    // Based on applicable sections from AI analysis
    if (analysisData?.applicableSections) {
      analysisData.applicableSections.forEach(section => {
        terms.add(`Section ${section.section}`);
        
        // Extract key legal terms from section title
        if (section.title) {
          const titleWords = section.title.split(/\s+/);
          if (titleWords.length > 2) {
            // Create bi-grams from title for more contextual search
            for (let i = 0; i < titleWords.length - 1; i++) {
              const bigram = `${titleWords[i]} ${titleWords[i+1]}`.toLowerCase();
              if (bigram.length > 5) {
                terms.add(bigram);
              }
            }
          }
        }
        
        // Add plain language terms if available
        if (section.plainLanguage) {
          const plainWords = section.plainLanguage.split(/\s+/);
          for (let i = 0; i < plainWords.length - 1; i += 2) {
            if (plainWords[i].length > 3 && plainWords[i+1]?.length > 3) {
              terms.add(`${plainWords[i]} ${plainWords[i+1]}`);
            }
          }
        }
        
        // Add tags as search terms
        if (section.tags && Array.isArray(section.tags)) {
          section.tags.forEach(tag => {
            if (tag && tag.length > 3) {
              terms.add(tag.toLowerCase());
            }
          });
        }
      });
    }
    
    // Extract terms from investigation steps
    if (analysisData?.investigationSteps) {
      analysisData.investigationSteps
        .filter(step => step.status === 'pending') // Focus on pending steps
        .slice(0, 2) // Take only a couple
        .forEach(step => {
          const titleWords = step.title?.split(/\s+/) || [];
          if (titleWords.length > 1) {
            terms.add(titleWords.slice(0, 2).join(' ').toLowerCase());
          }
        });
    }
    
    // Add terms from judicial guidance
    if (analysisData?.judicialGuidance) {
      analysisData.judicialGuidance.slice(0, 2).forEach(guidance => {
        if (guidance.name) {
          const nameWords = guidance.name.split(/\s+/);
          if (nameWords.length > 2) {
            terms.add(nameWords.slice(0, 2).join(' ').toLowerCase());
          }
        }
        
        // Add tags from guidance
        if (guidance.tags && Array.isArray(guidance.tags)) {
          guidance.tags.slice(0, 2).forEach(tag => {
            if (tag && tag.length > 3) {
              terms.add(tag.toLowerCase());
            }
          });
        }
      });
    }
    
    // Return array of unique terms, limiting to at most 12 terms
    return Array.from(terms).slice(0, 12);
  };

  // Search in the selected source
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:3001/api/legal-references?type=${activeSource}&query=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        setError(data.error || 'Failed to search references');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching references:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update search when tab changes
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    }
  }, [activeSource]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaBook className="mr-2 text-blue-700" />
        Reference Sources
      </h2>
      
      {/* Source Tabs */}
      <div className="flex mb-4 border-b border-gray-200 overflow-x-auto">
        {sourceTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSource(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeSource === tab.id
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* Search Bar */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={`Search in ${sourceTabs.find(t => t.id === activeSource)?.fullName}...`}
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-700 text-white px-4 py-2 rounded-r-md hover:bg-blue-800 flex items-center"
        >
          <FaSearch />
        </button>
      </div>
      
      {/* Suggested Search Terms */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Suggested terms for this case:</p>
        <div className="flex flex-wrap gap-2">
          {getSuggestedSearchTerms().map((term, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchTerm(term);
                setTimeout(() => handleSearch(), 100);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {/* Search Results */}
      {!isLoading && searchResults.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchTerm}"
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-96">
            {searchResults.map((result, i) => (
              <div key={i} className="border border-gray-200 rounded-md p-3 bg-blue-50">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {result.length > 300 ? result.substring(0, 300) + '...' : result}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {!isLoading && searchTerm && searchResults.length === 0 && (
        <div className="py-6 text-center text-gray-500">
          No results found for "{searchTerm}" in {sourceTabs.find(t => t.id === activeSource)?.fullName}
        </div>
      )}
      
      {/* Reference Info */}
      {!isLoading && !searchTerm && (
        <div className="py-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-2">How these sources are used:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>The system automatically extracts relevant sections from these documents</li>
            <li>Case-specific information is used to find applicable sections</li>
            <li>Procedural requirements are determined from SOPs based on case type</li>
            <li>Legal questions are cross-referenced against judicial precedents</li>
            <li>Document-driven questions ensure all legal requirements are met</li>
          </ul>
          
          <div className="mt-4 flex justify-end">
            <a 
              href="#/legal-references"
              className="flex items-center text-blue-700 text-sm hover:underline"
            >
              <span className="mr-1">View full reference documents</span>
              <FaExternalLinkAlt size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceSourceViewer;