import React, { useState, useEffect } from 'react'
import { FaSearch, FaBook, FaChevronDown, FaChevronUp, FaDownload, FaShare, FaBookmark } from 'react-icons/fa'

const LegalReferences = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pdfReferences, setPdfReferences] = useState({})
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setpdfError] = useState(null)
  const [selectedPdfTab, setSelectedPdfTab] = useState(null)
  const [pdfSearchQuery, setPdfSearchQuery] = useState('')
  const [pdfSearchResults, setPdfSearchResults] = useState([])
  const [expandedPdfResults, setExpandedPdfResults] = useState({})

  // PDF Document Tabs
  const pdfTabs = [
    { id: 'bns', name: 'BNS', fullName: 'Bharatiya Nyaya Sanhita' },
    { id: 'sop', name: 'SOP', fullName: 'Standard Operating Procedures' },
    { id: 'delhiPolice', name: 'Delhi Police', fullName: 'Delhi Police Guidelines' },
    { id: 'datasets', name: 'Case Precedents', fullName: 'Case Precedents & Judgments' },
  ]

  // Fetch PDF references when component mounts
  useEffect(() => {
    fetchPdfReferences()
  }, [])

  // Fetch PDF references
  const fetchPdfReferences = async () => {
    try {
      setPdfLoading(true)
      const response = await fetch('http://localhost:3001/api/legal-references')
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch legal references')
      }
      
      setPdfReferences(data.summary || {})
      
      // Select the first available reference
      if (data.availableReferences && data.availableReferences.length > 0) {
        setSelectedPdfTab(data.availableReferences[0])
        await fetchPdfReferenceByType(data.availableReferences[0])
      }
      
    } catch (err) {
      console.error('Error fetching PDF references:', err)
      setpdfError(err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  // Fetch a specific PDF reference by type
  const fetchPdfReferenceByType = async (type) => {
    if (!type) return
    
    try {
      setPdfLoading(true)
      const response = await fetch(`http://localhost:3001/api/legal-references?type=${type}`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch legal reference')
      }
      
      // Update the references state with the full content for this type
      setPdfReferences(prev => ({
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          fullContent: data.content
        }
      }))
      
    } catch (err) {
      console.error(`Error fetching ${type} reference:`, err)
      setpdfError(err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  // Search within the current PDF reference type
  const searchPdfContent = async () => {
    if (!pdfSearchQuery.trim() || !selectedPdfTab) {
      setPdfSearchResults([])
      return
    }
    
    try {
      setPdfLoading(true)
      // Add contextSize parameter for more content around matches
      const contextSize = 40; // Adjust as needed for more or less context
      const response = await fetch(`http://localhost:3001/api/legal-references?type=${selectedPdfTab}&query=${encodeURIComponent(pdfSearchQuery)}&contextSize=${contextSize}`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search in legal reference')
      }
      
      setPdfSearchResults(data.results || [])
      
      // If we received search keywords that were used for matching, store them for highlighting
      const searchKeywords = data.searchKeywords || [pdfSearchQuery.toLowerCase()];
      
      // Initialize expanded state and highlight matches in results
      const initialExpandedState = {};
      
      // If there are fewer than 3 results, automatically expand them
      if (data.results && data.results.length <= 3) {
        data.results.forEach((_, index) => {
          initialExpandedState[index] = true;
        });
      }
      
      setExpandedPdfResults(initialExpandedState)
      
    } catch (err) {
      console.error('Error searching references:', err)
      setpdfError(err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  // Toggle expanded state of a PDF search result
  const togglePdfResultExpansion = (index) => {
    setExpandedPdfResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  // Change PDF tab
  const changePdfTab = (tabId) => {
    setSelectedPdfTab(tabId)
    setPdfSearchResults([])
    setPdfSearchQuery('')
    fetchPdfReferenceByType(tabId)
  }
  
  // Render PDF Viewer component
  const renderPdfViewer = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaBook className="mr-2 text-blue-700" />
          Legal Reference Documents
        </h2>
        
        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-300 overflow-x-auto">
          {pdfTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => changePdfTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedPdfTab === tab.id
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              disabled={!pdfReferences[tab.id]}
            >
              {tab.name}
              {!pdfReferences[tab.id] && <span className="ml-1 text-xs text-red-500">(N/A)</span>}
            </button>
          ))}
        </div>
        
        {/* Active Tab Title */}
        {selectedPdfTab && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              {pdfTabs.find(tab => tab.id === selectedPdfTab)?.fullName || 'Document'}
            </h3>
            <p className="text-sm text-gray-500">
              {pdfReferences[selectedPdfTab]?.size 
                ? `Document size: ${Math.round(pdfReferences[selectedPdfTab].size / 1024)} KB` 
                : 'Document not available'}
            </p>
          </div>
        )}
        
        {/* Search Bar */}
        {selectedPdfTab && (
          <div className="flex mb-4">
            <input
              type="text"
              value={pdfSearchQuery}
              onChange={(e) => setPdfSearchQuery(e.target.value)}
              placeholder={`Search within ${pdfTabs.find(tab => tab.id === selectedPdfTab)?.name} document...`}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && searchPdfContent()}
            />
            <button
              onClick={searchPdfContent}
              className="bg-blue-700 text-white px-4 py-2 rounded-r-md hover:bg-blue-800 flex items-center"
            >
              <FaSearch />
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {pdfError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {pdfError}
          </div>
        )}
        
        {/* Loading Indicator */}
        {pdfLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        )}
        
              {/* Search Results */}
              {!pdfLoading && pdfSearchResults.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    {pdfSearchResults.length} {pdfSearchResults.length === 1 ? 'result' : 'results'} for "{pdfSearchQuery}"
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-96">
                    {pdfSearchResults.map((result, i) => {
                      // Extract a preview that includes the search term for better context
                      const searchTermLower = pdfSearchQuery.toLowerCase();
                      let previewText = result;
                      
                      // Find the position of the search term
                      const searchTermIndex = result.toLowerCase().indexOf(searchTermLower);
                      
                      // If found, create a preview centered around it
                      if (searchTermIndex !== -1) {
                        const startIndex = Math.max(0, searchTermIndex - 40);
                        const endIndex = Math.min(result.length, searchTermIndex + pdfSearchQuery.length + 40);
                        previewText = (startIndex > 0 ? '...' : '') + 
                                      result.substring(startIndex, endIndex) + 
                                      (endIndex < result.length ? '...' : '');
                      } else if (result.length > 100) {
                        previewText = result.substring(0, 100) + '...';
                      }
                      
                      return (
                        <div key={i} className="border border-gray-200 rounded-md p-3 bg-white hover:shadow-md transition-shadow">
                          <div className="flex justify-between">
                            <button
                              onClick={() => togglePdfResultExpansion(i)}
                              className="flex items-center text-gray-800 font-medium hover:text-blue-700 w-full text-left"
                            >
                              <span className="mr-2 text-blue-600">
                                {expandedPdfResults[i] ? <FaChevronUp /> : <FaChevronDown />}
                              </span>
                              <span>
                                {/* Highlight the search term in the preview */}
                                {previewText.split(new RegExp(`(${pdfSearchQuery})`, 'gi')).map((part, j) => 
                                  part.toLowerCase() === pdfSearchQuery.toLowerCase() 
                                    ? <mark key={j} className="bg-yellow-200 font-medium">{part}</mark>
                                    : part
                                )}
                              </span>
                            </button>
                          </div>
                          
                          {expandedPdfResults[i] && (
                            <div className="mt-3 text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap border-l-4 border-blue-500">
                              {/* Highlight all matches of the search term */}
                              {result.split(new RegExp(`(${pdfSearchQuery})`, 'gi')).map((part, j) => 
                                part.toLowerCase() === pdfSearchQuery.toLowerCase() 
                                  ? <mark key={j} className="bg-yellow-200 font-medium">{part}</mark>
                                  : part
                              )}
                              
                              {/* Actions for this result */}
                              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                                <button 
                                  className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(result);
                                  }}
                                >
                                  <FaShare className="mr-1" /> Copy text
                                </button>
                                <button 
                                  className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100"
                                >
                                  <FaBookmark className="mr-1" /> Save reference
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}        {/* No Results Message */}
        {!pdfLoading && pdfSearchQuery && pdfSearchResults.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No results found for "{pdfSearchQuery}"
          </div>
        )}
        
        {/* Document Preview */}
        {!pdfLoading && !pdfSearchQuery && selectedPdfTab && pdfReferences[selectedPdfTab]?.fullContent && (
          <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md border border-gray-200">
            <pre className="whitespace-pre-wrap text-gray-800 font-sans text-sm">
              {pdfReferences[selectedPdfTab].fullContent}
            </pre>
          </div>
        )}

        {/* No Document Selected */}
        {!selectedPdfTab && !pdfLoading && (
          <div className="py-10 text-center text-gray-500">
            Select a document tab above to view legal references
          </div>
        )}
      </div>
    )
  }
  
  // Existing mock data for legal references
  const legalReferencesData = [
    {
      id: 1,
      title: "Protection of Children from Sexual Offences Act (POCSO), 2012",
      category: "acts",
      type: "Central Act",
      year: "2012",
      description: "Comprehensive law to protect children from sexual abuse and exploitation. Defines various forms of sexual abuse and prescribes stringent punishments.",
      sections: [
        { section: "Section 3", title: "Penetrative Sexual Assault", punishment: "7 years to life imprisonment" },
        { section: "Section 4", title: "Punishment for Penetrative Sexual Assault", punishment: "Not less than 7 years, may extend to life" },
        { section: "Section 5", title: "Aggravated Penetrative Sexual Assault", punishment: "10 years to life imprisonment" },
        { section: "Section 7", title: "Sexual Assault", punishment: "3 to 5 years imprisonment" }
      ],
      keyPoints: [
        "Child-friendly procedures for recording statements",
        "Special courts for trial of offences",
        "Mandatory reporting of cases",
        "Protection of identity of child victim"
      ],
      relatedCases: ["State v. XYZ (2020)", "ABC v. State (2019)"],
      lastUpdated: "2023-08-15"
    },
    {
      id: 2,
      title: "Indian Penal Code (IPC), 1860 - Sexual Offences",
      category: "acts",
      type: "Criminal Law",
      year: "1860",
      description: "Relevant sections of IPC dealing with sexual offences against women and children.",
      sections: [
        { section: "Section 354", title: "Assault or Criminal Force to Woman with Intent to Outrage her Modesty", punishment: "1 to 5 years imprisonment" },
        { section: "Section 354A", title: "Sexual Harassment", punishment: "Up to 3 years imprisonment" },
        { section: "Section 354B", title: "Assault or Use of Criminal Force to Woman with Intent to Disrobe", punishment: "3 to 7 years imprisonment" },
        { section: "Section 376", title: "Rape", punishment: "7 years to life imprisonment" }
      ],
      keyPoints: [
        "Gender-specific protections for women",
        "Graduated punishments based on severity",
        "Special provisions for aggravated forms",
        "Protection of modesty and dignity"
      ],
      relatedCases: ["Vishaka v. State of Rajasthan", "State v. Mukesh (Nirbhaya Case)"],
      lastUpdated: "2023-07-20"
    },
    {
      id: 3,
      title: "Information Technology Act, 2000 - Cyber Crimes",
      category: "acts",
      type: "Technology Law",
      year: "2000",
      description: "Provisions dealing with cyber crimes, electronic evidence, and digital offences.",
      sections: [
        { section: "Section 66E", title: "Punishment for Violation of Privacy", punishment: "Up to 3 years imprisonment" },
        { section: "Section 67", title: "Punishment for Publishing Obscene Material", punishment: "Up to 3 years imprisonment" },
        { section: "Section 67A", title: "Punishment for Publishing Sexually Explicit Material", punishment: "Up to 5 years imprisonment" },
        { section: "Section 67B", title: "Punishment for Publishing Child Pornography", punishment: "Up to 5 years imprisonment" }
      ],
      keyPoints: [
        "Digital evidence admissibility",
        "Cyber crime investigation procedures",
        "Protection against online harassment",
        "Special provisions for child protection online"
      ],
      relatedCases: ["State v. Cyber Criminal (2021)", "Tech Company v. State (2020)"],
      lastUpdated: "2023-09-10"
    },
    {
      id: 4,
      title: "Domestic Violence Act, 2005",
      category: "acts",
      type: "Social Legislation",
      year: "2005",
      description: "Protection of Women from Domestic Violence Act providing civil remedies for domestic violence victims.",
      sections: [
        { section: "Section 3", title: "Definition of Domestic Violence", punishment: "Civil remedies available" },
        { section: "Section 18", title: "Protection Orders", punishment: "Restraining orders against respondent" },
        { section: "Section 19", title: "Residence Orders", punishment: "Right to residence protection" },
        { section: "Section 20", title: "Monetary Relief", punishment: "Compensation and maintenance" }
      ],
      keyPoints: [
        "Civil law protection mechanism",
        "Protection officers for assistance",
        "Shelter homes and support services",
        "Quick relief through magistrate courts"
      ],
      relatedCases: ["Indra Sarma v. V.K.V. Sarma", "Hiral P. Harsora v. Kusum Narottamdas"],
      lastUpdated: "2023-06-30"
    },
    {
      id: 5,
      title: "Supreme Court Guidelines on Sexual Harassment (Vishaka Guidelines)",
      category: "guidelines",
      type: "Judicial Guidelines",
      year: "1997",
      description: "Landmark Supreme Court guidelines for prevention and redressal of sexual harassment at workplace.",
      sections: [
        { section: "Guideline 1", title: "Prohibition of Sexual Harassment", punishment: "Preventive measures required" },
        { section: "Guideline 2", title: "Definition and Coverage", punishment: "Comprehensive scope definition" },
        { section: "Guideline 3", title: "Preventive Steps", punishment: "Employer responsibilities" },
        { section: "Guideline 4", title: "Complaint Mechanism", punishment: "Internal committee formation" }
      ],
      keyPoints: [
        "Workplace sexual harassment prevention",
        "Employer liability and responsibility",
        "Complaint redressal mechanism",
        "Awareness and training requirements"
      ],
      relatedCases: ["Vishaka v. State of Rajasthan", "Apparel Export Promotion Council v. A.K. Chopra"],
      lastUpdated: "2023-05-15"
    },
    {
      id: 6,
      title: "Standard Operating Procedure (SOP) for Sexual Offense Investigation",
      category: "procedures",
      type: "Police Guidelines",
      year: "2024",
      description: "Comprehensive SOP for investigating sexual offenses covering both IPC and POCSO cases, including mandatory procedures, age determination, and specialized court requirements.",
      sections: [
        { section: "Category 1", title: "Adult Sexual Offenses (IPC Section 376 & BNS)", punishment: "7 years to life imprisonment with investigation under IPC/BNS" },
        { section: "Category 2", title: "Child Sexual Offenses (POCSO Act)", punishment: "More stringent punishment - 10 years to life imprisonment" },
        { section: "Age Determination", title: "Mandatory Age Verification Process", punishment: "Legal requirement for case classification" },
        { section: "Court Procedures", title: "Specialized Court Requirements", punishment: "Mandatory involvement of welfare committees and NGOs" }
      ],
      keyPoints: [
        "Two main categories: IPC 376 (adults) vs POCSO (minors)",
        "Age determination is crucial for proper case classification",
        "Child Welfare Committee involvement mandatory for POCSO cases",
        "NGO participation required throughout the process",
        "Juvenile Justice Board handles accused minors",
        "Special courts required for POCSO cases",
        "Birth certificate, high school certificate, or ossification test for age proof",
        "Defense challenges on age must be countered with proper documentation"
      ],
      relatedCases: ["Supreme Court Age Determination Guidelines", "POCSO vs IPC Classification Cases"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 7,
      title: "Age Determination Guidelines for Sexual Offense Cases",
      category: "procedures",
      type: "Supreme Court Guidelines",
      year: "2023",
      description: "Supreme Court mandated procedures for determining victim age in sexual offense cases to ensure proper legal classification between IPC and POCSO.",
      sections: [
        { section: "Method 1", title: "Birth Certificate", punishment: "Primary document - most reliable proof" },
        { section: "Method 2", title: "High School Certificate", punishment: "Secondary educational document for age verification" },
        { section: "Method 3", title: "Ossification Test", punishment: "Medical examination to determine age when documents unavailable" },
        { section: "Legal Standard", title: "Supreme Court Approved Methods", punishment: "Only these three methods legally acceptable" }
      ],
      keyPoints: [
        "Three Supreme Court approved methods for age determination",
        "Birth certificate is the primary and most reliable document",
        "High school certificate serves as secondary proof",
        "Ossification test is medical method when documents unavailable",
        "Defense cannot challenge age if proper documentation provided",
        "Age determination decides IPC vs POCSO case classification",
        "Investigating officer must include one of these three proofs",
        "Court will reject defense arguments if proper age proof provided"
      ],
      relatedCases: ["Supreme Court Age Determination Ruling", "Various High Court Age Verification Cases"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 8,
      title: "POCSO vs IPC Classification and Procedural Differences",
      category: "procedures",
      type: "Investigation Guidelines",
      year: "2024",
      description: "Detailed comparison and procedural requirements for handling sexual offense cases under POCSO Act versus IPC, including mandatory institutional involvement.",
      sections: [
        { section: "POCSO Cases", title: "Minor Victim Procedures", punishment: "Child Welfare Committee + NGO + Special Court + Juvenile Justice Board" },
        { section: "IPC Cases", title: "Adult Victim Procedures", punishment: "Regular court proceedings without specialized committees" },
        { section: "Institutional Support", title: "Mandatory Agency Involvement", punishment: "Different agencies for different case types" },
        { section: "Court Systems", title: "Specialized vs Regular Courts", punishment: "POCSO requires special courts with child-friendly procedures" }
      ],
      keyPoints: [
        "POCSO cases require Child Welfare Committee involvement",
        "NGO participation mandatory in POCSO proceedings",
        "Special courts designated for POCSO cases only",
        "Juvenile Justice Board handles accused minors",
        "Adult cases follow regular IPC court procedures",
        "More stringent punishment provisions under POCSO",
        "Child-friendly procedures mandatory in POCSO cases",
        "Same definition of sexual offense but different procedural requirements"
      ],
      relatedCases: ["POCSO Special Court Establishment Cases", "Child Welfare Committee Intervention Cases"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 9,
      title: "Criminal Procedure Code (CrPC), 1973 - Investigation Procedures",
      category: "procedures",
      type: "Procedural Law",
      year: "1973",
      description: "Key procedural provisions for investigation and trial of criminal cases.",
      sections: [
        { section: "Section 154", title: "Information in Cognizable Cases (FIR)", punishment: "Mandatory registration procedures" },
        { section: "Section 161", title: "Examination of Witnesses by Police", punishment: "Investigation protocols" },
        { section: "Section 164", title: "Recording of Confessions and Statements", punishment: "Judicial recording procedures" },
        { section: "Section 173", title: "Report of Police Officer on Completion of Investigation", punishment: "Charge sheet filing requirements" }
      ],
      keyPoints: [
        "FIR registration procedures",
        "Witness examination protocols",
        "Evidence collection standards",
        "Time limits for investigation"
      ],
      relatedCases: ["Lalita Kumari v. Government of U.P.", "State of Haryana v. Bhajan Lal"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 10,
      title: "State-wise Investigation Terminology and Process Variations",
      category: "procedures", 
      type: "Multi-State Guidelines",
      year: "2024",
      description: "Understanding state-specific terminologies and procedural variations in sexual offense investigation while maintaining uniform legal standards across India.",
      sections: [
        { section: "Delhi Police", title: "Metropolitan Investigation Procedures", punishment: "Urban-specific protocols and terminology" },
        { section: "Telangana Police", title: "State Police Investigation Methods", punishment: "Regional procedural adaptations" },
        { section: "Uniform Standards", title: "Common Legal Framework", punishment: "Same laws (IPC/POCSO) across all states" },
        { section: "Local Adaptations", title: "State-specific Implementations", punishment: "Different terminology, same legal principles" }
      ],
      keyPoints: [
        "Same laws (IPC/POCSO) apply uniformly across India",
        "State police forces use different terminology",
        "Investigation processes may vary by state",
        "Legal requirements remain consistent nationally",
        "SOP provides 90% standard practice guidelines",
        "Remaining 10% allows for state-specific adaptations",
        "Training programs help standardize procedures",
        "Regular interaction with investigating officers for guidance"
      ],
      relatedCases: ["Multi-State Investigation Coordination Cases", "Uniform Application of POCSO Across States"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 11,
      title: "Evidence Collection and Documentation Standards",
      category: "procedures",
      type: "Investigation Protocol",
      year: "2024", 
      description: "Mandatory evidence collection procedures and documentation standards for sexual offense cases to ensure conviction and prevent case dismissal.",
      sections: [
        { section: "Primary Evidence", title: "Medical Examination and Forensic Evidence", punishment: "Mandatory within 24 hours of complaint" },
        { section: "Documentary Evidence", title: "Age Proof and Identity Documentation", punishment: "Birth certificate/school certificate/medical test" },
        { section: "Witness Statements", title: "Victim and Witness Recording Procedures", punishment: "Special procedures for child victims" },
        { section: "Digital Evidence", title: "Electronic and Communication Evidence", punishment: "Proper collection and chain of custody" }
      ],
      keyPoints: [
        "Evidence collection must follow strict timelines",
        "Medical examination within 24 hours is crucial",
        "Proper chain of custody must be maintained",
        "Age determination evidence is mandatory",
        "Special recording procedures for child victims",
        "Digital evidence requires technical expertise",
        "Documentation must be court-admissible",
        "Regular supervision ensures quality investigation"
      ],
      relatedCases: ["Evidence Collection Standard Cases", "Chain of Custody Precedents"],
      lastUpdated: "2024-09-20"
    },
    {
      id: 12,
      title: "Standard Operating Procedure for Sexual Offense Investigation",
      category: "procedures",
      type: "Complete Investigation Guide",
      year: "2024",
      description: "Comprehensive step-by-step procedures for investigating sexual offense cases, covering all aspects from FIR recording to trial completion.",
      sections: [
        { section: "FIR Recording", title: "How to record FIR, language requirements, copies distribution", punishment: "Mandatory compliance within specified time limits" },
        { section: "Victim Treatment", title: "Courteous handling, dignity protection, family notification", punishment: "Disciplinary action for non-compliance" },
        { section: "Special Victims", title: "Disabled, linguistic minorities, minors - special procedures", punishment: "Enhanced protection protocols mandatory" },
        { section: "Investigation Process", title: "Team formation, evidence collection, legal compliance", punishment: "Time-bound investigation completion required" },
        { section: "Trial Support", title: "Charge sheet submission, witness protection, trial monitoring", punishment: "Continuous supervision until case completion" }
      ],
      keyPoints: [
        "FIR recording in simple language with interpreter support",
        "Immediate copies to victim and Magistrate (Section 176 BNSS)",
        "Special procedures for disabled and minor victims",
        "Female officer preference for investigation team",
        "Videography mandatory for statements (Sections 180 & 183 BNSS)",
        "Medical examination within time limits with female doctor",
        "Chain of custody for all evidence collection",
        "60-day charge sheet submission limit",
        "Witness protection and victim rehabilitation support",
        "Media handling with strict identity protection"
      ],
      detailedProcedures: [
        {
          step: "FIR Recording",
          details: [
            "Record FIR in simple, clear language avoiding legal jargon",
            "Use victim's own words and phrases where possible",
            "Arrange interpreter for different linguistic backgrounds",
            "Provide immediate copy to victim after registration",
            "Send copy to concerned Magistrate within 24 hours (Section 176 BNSS)",
            "Ensure all essential elements of the offense are captured",
            "Document time of complaint and registration accurately"
          ]
        },
        {
          step: "Treatment of Victim", 
          details: [
            "Handle victim with courtesy, sensitivity and respect",
            "Protect victim's dignity throughout the process",
            "Inform family members with victim's consent",
            "Maintain strict confidentiality of victim identity",
            "Provide regular updates on investigation progress",
            "Arrange psychological counseling if needed",
            "Ensure victim feels safe and supported"
          ]
        },
        {
          step: "Disabled Victims",
          details: [
            "Arrange qualified interpreters for deaf/mute victims",
            "Engage special educators for intellectually disabled victims", 
            "Use video recording for statement documentation",
            "Ensure accessible environment for examinations",
            "Allow additional time for communication",
            "Involve disability rights organizations when needed",
            "Verify understanding before proceeding with any step"
          ]
        },
        {
          step: "Linguistic Diversity",
          details: [
            "Identify victim's preferred language immediately",
            "Arrange certified interpreter from language department",
            "Record statement in victim's native language first",
            "Provide translated copies of all legal documents",
            "Ensure interpreter understands legal terminology",
            "Verify accuracy of interpretation with victim",
            "Document interpreter details and language used"
          ]
        },
        {
          step: "Minor Victims",
          details: [
            "Obtain consent from guardian or NGO before procedures",
            "Ensure Investigating Officer wears plain clothes",
            "Never allow confrontation between child and accused",
            "Arrange shelter home if child is homeless/abandoned",
            "Involve Child Welfare Committee immediately",
            "Allow support person during statement recording",
            "Use age-appropriate language and questions"
          ]
        },
        {
          step: "BNSS Section 176 Compliance",
          details: [
            "Send FIR copy to Judicial Magistrate within 24 hours",
            "Maintain acknowledgment receipt from Magistrate office",
            "Follow up if acknowledgment not received timely",
            "Document compliance in case diary",
            "Inform supervising officer of compliance",
            "Ensure proper formatting of FIR copy"
          ]
        },
        {
          step: "Investigation Team",
          details: [
            "Assign female officer as primary investigator (preferred)",
            "Include senior officer for supervision and guidance",
            "Form multidisciplinary team for complex cases",
            "Designate victim liaison officer for communication",
            "Ensure team understands case sensitivity requirements",
            "Conduct regular team briefings and coordination",
            "Maintain clear role distribution among members"
          ]
        },
        {
          step: "Statement Recording",
          details: [
            "Record under Sections 180 & 183 BNSS provisions",
            "Use videography for recording (mandatory for POCSO)",
            "Ensure Magistrate involvement when legally required",
            "Record statement in victim's own words",
            "Allow victim to read and verify recorded statement",
            "Avoid leading or suggestive questions",
            "Maintain privacy and confidentiality during recording"
          ]
        },
        {
          step: "Witness Statements",
          details: [
            "Identify and record all relevant witnesses promptly",
            "Prioritize immediate witnesses and complainants",
            "Use videography if witness safety is a concern",
            "Implement witness protection measures as needed",
            "Cross-verify statements for consistency",
            "Maintain secure records of witness contact details",
            "Arrange security for witnesses if threatened"
          ]
        },
        {
          step: "Court Appearance Bond",
          details: [
            "Execute bond under relevant legal provisions",
            "Explain legal obligations clearly to complainants",
            "Obtain proper sureties where required by law",
            "Maintain comprehensive records of executed bonds",
            "Monitor and follow up on bond compliance",
            "Report any bond violations to court immediately"
          ]
        },
        {
          step: "Medical Examination",
          details: [
            "Conduct examination within 24 hours of complaint",
            "Obtain proper consent from victim or guardian",
            "Ensure female doctor for female victims",
            "Maintain strict chain of custody for samples",
            "Document all medical findings thoroughly",
            "Preserve victim's comfort and dignity",
            "Handle medical reports with confidentiality"
          ]
        },
        {
          step: "Age Proof Determination",
          details: [
            "Collect school certificate as primary age proof",
            "Obtain birth certificate from municipal records",
            "Arrange ossification test if documents unavailable",
            "Verify authenticity of all age-related documents",
            "Maintain original documents in secure custody",
            "Prepare detailed age determination report",
            "Follow Supreme Court guidelines strictly"
          ]
        },
        {
          step: "Evidence Collection",
          details: [
            "Conduct thorough crime scene inspection immediately",
            "Photograph scene from multiple angles systematically",
            "Collect and preserve all physical evidence",
            "Maintain proper chain of custody documentation",
            "Label and seal evidence packages correctly",
            "Document entire evidence collection process",
            "Store evidence in appropriate environmental conditions"
          ]
        },
        {
          step: "Electronic Evidence",
          details: [
            "Collect CCTV footage from all relevant locations",
            "Obtain call detail records and communication data",
            "Preserve mobile phone and computer data properly",
            "Distinguish between primary and secondary evidence",
            "Follow established cyber forensics protocols",
            "Maintain digital chain of custody records",
            "Ensure admissibility of electronic evidence in court"
          ]
        },
        {
          step: "Scientific Examination",
          details: [
            "Send samples for DNA analysis to certified labs",
            "Arrange chemical examination of collected evidence",
            "Maintain strict chain of custody for all samples",
            "Follow laboratory protocols and procedures",
            "Obtain certified scientific reports",
            "Preserve samples for potential future reference",
            "Document all scientific examination procedures"
          ]
        },
        {
          step: "Suspect Arrest",
          details: [
            "Effect immediate arrest if suspect is identified",
            "Obtain arrest warrants if suspect is absconding",
            "Issue look-out notices for inter-state cases",
            "Follow proper arrest procedures and protocols",
            "Inform suspect of legal rights clearly",
            "Document arrest circumstances thoroughly",
            "Ensure safety and security during arrest"
          ]
        },
        {
          step: "Post-Arrest Procedures",
          details: [
            "Conduct medical examination of arrested accused",
            "Collect clothing and personal items as evidence",
            "Arrange test identification parade if required",
            "Record any voluntary statement by accused",
            "Inform family members of the arrested person",
            "Produce accused before Magistrate within 24 hours",
            "Document all post-arrest procedures meticulously"
          ]
        },
        {
          step: "Bail Applications",
          details: [
            "Prepare strong prosecution response to bail applications",
            "Highlight severity of case and strength of evidence",
            "Notify victim about any bail application filed",
            "Suggest appropriate conditions if bail is granted",
            "Monitor compliance with bail conditions regularly",
            "Report any bail condition violations immediately",
            "Keep victim informed about bail status updates"
          ]
        },
        {
          step: "Witness Protection",
          details: [
            "Assess threat level to victim and witnesses",
            "Implement appropriate security measures",
            "Coordinate with witness protection schemes",
            "Monitor safety of protected persons regularly",
            "Respond to security concerns immediately",
            "Document all protection measures taken",
            "Review and update security arrangements as needed"
          ]
        },
        {
          step: "Charge Sheet Submission",
          details: [
            "Complete investigation within 60-day legal limit",
            "Include all material evidence and witness statements",
            "Ensure proper supervision by senior officers",
            "Verify all legal requirements are fulfilled",
            "Submit charge sheet to competent court",
            "Serve copy to accused as per legal requirements",
            "Maintain organized case file for trial"
          ]
        },
        {
          step: "Trial Phase Duties",
          details: [
            "Monitor trial proceedings regularly and actively",
            "Submit periodic progress reports to superiors",
            "Ensure timely attendance of witnesses via summons",
            "Coordinate effectively with prosecution team",
            "Address court queries and requests promptly",
            "Maintain updated case file throughout trial",
            "Provide necessary support to prosecution case"
          ]
        },
        {
          step: "Victim Rehabilitation",
          details: [
            "Arrange physical rehabilitation if medically needed",
            "Provide mental health support and counseling",
            "Facilitate social reintegration into community",
            "Process victim compensation claims expeditiously",
            "Coordinate with NGOs and support organizations",
            "Monitor victim's well-being throughout process",
            "Provide long-term assistance and follow-up"
          ]
        },
        {
          step: "Media Handling",
          details: [
            "Strictly protect victim's identity from media",
            "Designate only authorized officers for media interaction",
            "Prevent unauthorized information leaks to press",
            "Monitor media coverage for any violations",
            "Take immediate action against identity disclosure",
            "Coordinate with department's media cell",
            "Ensure compliance with legal media restrictions"
          ]
        }
      ],
      relatedCases: ["Supreme Court SOP Guidelines", "POCSO Implementation Cases", "BNSS Compliance Precedents"],
      lastUpdated: "2024-09-20"
    }
  ]

  const categories = [
    { id: 'all', name: 'All References', count: legalReferencesData.length },
    { id: 'acts', name: 'Acts & Laws', count: legalReferencesData.filter(ref => ref.category === 'acts').length },
    { id: 'guidelines', name: 'Guidelines', count: legalReferencesData.filter(ref => ref.category === 'guidelines').length },
    { id: 'procedures', name: 'Investigation SOPs', count: legalReferencesData.filter(ref => ref.category === 'procedures').length }
  ]

  const filteredReferences = legalReferencesData.filter(ref => {
    const matchesCategory = selectedCategory === 'all' || ref.category === selectedCategory
    const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.sections.some(section => 
                           section.title.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    return matchesCategory && matchesSearch
  })

  const [selectedReference, setSelectedReference] = useState(null)

  if (selectedReference) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-4 lg:mb-6">
            <button
              onClick={() => setSelectedReference(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm lg:text-base">Back to Legal References</span>
            </button>
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-2">{selectedReference.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{selectedReference.type}</span>
                    <span>Year: {selectedReference.year}</span>
                    <span>Last Updated: {selectedReference.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm lg:text-lg text-gray-700 leading-relaxed">{selectedReference.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Sections */}
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                  {selectedReference.id === 12 ? 'Key Investigation Areas' : 'Key Sections'}
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  {selectedReference.sections.map((section, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 lg:p-4 shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-2 space-y-1 lg:space-y-0">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{section.section}</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full self-start">
                          Active
                        </span>
                      </div>
                      <h4 className="text-gray-800 font-medium mb-2 text-sm lg:text-base">{section.title}</h4>
                      <p className="text-xs lg:text-sm text-gray-600">
                        <strong>{selectedReference.id === 12 ? 'Compliance:' : 'Punishment:'}</strong> {section.punishment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Procedures for SOP */}
              {selectedReference.id === 12 && selectedReference.detailedProcedures && (
                <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Detailed Procedures</h2>
                  <div className="space-y-4 lg:space-y-6">
                    {selectedReference.detailedProcedures.map((procedure, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3 lg:pl-4">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs lg:text-sm font-medium lg:mr-3 self-start">
                            {index + 1}
                          </span>
                          <span className="text-sm lg:text-base">{procedure.step}</span>
                        </h3>
                        <div className="space-y-2">
                          {procedure.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start space-x-2 lg:space-x-3">
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5 lg:mt-2"></span>
                              <span className="text-xs lg:text-sm text-gray-700">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Cases */}
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Related Landmark Cases</h2>
                <div className="space-y-3">
                  {selectedReference.relatedCases.map((caseTitle, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs lg:text-sm text-gray-700 font-medium">{caseTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              {/* Key Points */}
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Key Points</h3>
                <div className="space-y-3">
                  {selectedReference.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs lg:text-sm text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
                    Download PDF
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base">
                    Add to Case Reference
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm lg:text-base">
                    Create Case Template
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 text-sm lg:text-base">
                    Share Reference
                  </button>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Legal References</h1>
          <p className="text-sm lg:text-base text-gray-600">Comprehensive legal database for criminal law, procedures, and guidelines</p>
        </div>
        
        {/* PDF Viewer Section */}
        {renderPdfViewer()}
        
        {/* Reference Database Section Header */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Legal Reference Database</h2>
          <p className="text-sm text-gray-600">Browse indexed legal sections, guidelines, and procedures</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors flex-1 lg:flex-none ${
                    selectedCategory === category.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="block lg:inline">{category.name}</span>
                  <span className="block lg:inline lg:ml-1">({category.count})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search legal references..."
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

        {/* Legal References Grid */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {filteredReferences.map((reference) => (
            <div
              key={reference.id}
              onClick={() => setSelectedReference(reference)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-4 lg:p-6"
            >
              {/* Reference Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base lg:text-lg font-bold text-blue-600 hover:text-blue-800 mb-2">
                    {reference.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {reference.type}
                    </span>
                    <span>Year: {reference.year}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm lg:text-base text-gray-700 mb-4 line-clamp-3">{reference.description}</p>

              {/* Key Sections Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Sections:</h4>
                <div className="flex flex-wrap gap-2">
                  {reference.sections.slice(0, 3).map((section, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {section.section}
                    </span>
                  ))}
                  {reference.sections.length > 3 && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      +{reference.sections.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between text-xs lg:text-sm text-gray-500 space-y-2 lg:space-y-0">
                <span>Last updated: {reference.lastUpdated}</span>
                <div className="flex items-center space-x-1">
                  <span>{reference.sections.length} sections</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReferences.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No references found</h3>
            <p className="text-gray-500">No legal references match your current filter and search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LegalReferences