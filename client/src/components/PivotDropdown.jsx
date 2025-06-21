import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPivots, setFilters } from '../redux/slices/pivotSlice';
import { ChevronDown, Search, Filter, X } from 'lucide-react';

export default function PivotDropdown() {
  const dispatch = useDispatch();
  const { list, status, filters } = useSelector(state => state.pivots);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch pivots when filters change
  useEffect(() => {
    dispatch(fetchPivots(filters));
  }, [filters, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update filters when local state changes
  const onFilterChange = (name, value) => {
    dispatch(setFilters({ ...filters, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    onFilterChange('categories', newCategories);
  };

  const handlePriorityToggle = (priority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    setSelectedPriorities(newPriorities);
    onFilterChange('priorities', newPriorities);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange('search', value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedPriorities([]);
    dispatch(setFilters({}));
  };

  const categories = ['Compliance', 'Financial', 'Operational', 'Training', 'Growth'];
  const priorities = ['High', 'Medium', 'Low'];

  const filteredPivots = list.filter(pivot => {
    const matchesSearch = !searchTerm || 
      pivot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pivot.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(pivot.category);
    
    const matchesPriority = selectedPriorities.length === 0 || 
      selectedPriorities.includes(pivot.priority);
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedPriorities.length > 0;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            {filteredPivots.length} Growth Opportunities
            {hasActiveFilters && ' (Filtered)'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          role="listbox"
          aria-label="Growth opportunities filter"
        >
          {/* Search and Filters Header */}
          <div className="p-4 border-b border-gray-100">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label="Search growth opportunities"
              />
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={selectedCategories.includes(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Priority Filters */}
              <div className="flex flex-wrap gap-1">
                {priorities.map(priority => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedPriorities.includes(priority)
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={selectedPriorities.includes(priority)}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto">
            {status === 'loading' && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading opportunities...
              </div>
            )}

            {status === 'failed' && (
              <div className="p-4 text-center text-red-500">
                Failed to load opportunities. Please try again.
              </div>
            )}

            {status === 'succeeded' && filteredPivots.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No opportunities match your filters.
              </div>
            )}

            {status === 'succeeded' && filteredPivots.map((pivot, index) => (
              <div
                key={pivot.id}
                className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors"
                role="option"
                aria-selected="false"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{pivot.title}</h4>
                    {pivot.description && (
                      <p className="text-sm text-gray-600 mb-2">{pivot.description}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {pivot.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        pivot.priority === 'High' ? 'bg-red-100 text-red-800' :
                        pivot.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pivot.priority}
                      </span>
                      {pivot.status && (
                        <span className="text-xs text-gray-500">
                          {pivot.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {pivot.estimatedValue && (
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-green-600">
                        ${pivot.estimatedValue}
                      </div>
                      <div className="text-xs text-gray-500">
                        Est. Value
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {filteredPivots.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                View All {filteredPivots.length} Opportunities
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}