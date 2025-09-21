import { useState, useEffect } from 'react'
import axios from 'axios'

const Cases = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const [casesData, setCasesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Progress</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium">{selectedCase.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${selectedCase.progress}%` }}
                    ></div>
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
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Update Status
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Add Evidence
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Generate Report
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200">
                    Export Case
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