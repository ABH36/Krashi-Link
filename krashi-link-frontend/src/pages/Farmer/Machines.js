import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import MachineCard from '../../components/farmer/MachineCard';
import MachineMap from '../../components/farmer/MachineMap';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import VoiceSearch from '../../components/common/VoiceSearch';

// SVG ICONS (Replaced Heroicons/Lucide with Inline SVGs)
const Icons = {
  Search: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  List: () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Map: () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 7"/></svg>,
  Filter: () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
  Close: () => <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Location: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  ChevronDown: () => <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
};

// --- REUSABLE CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-2.5 flex justify-between items-center text-left"
      >
        <span className="truncate">{selectedLabel}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 transition-colors ${value === option.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Machines = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewMode, setViewMode] = useState('list');
  const [userCoords, setUserCoords] = useState(null);

  const initialFilters = {
    type: '',
    availability: '',
    lat: '',
    lng: '',
    radiusKm: '50'
  };

  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, pages: 0 });

  useEffect(() => {
      if (location.state?.view === 'map') {
          setViewMode('map');
          handleUseCurrentLocation(); 
      }
  }, [location]);

  useEffect(() => {
    fetchMachines();
  }, [filters]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await machineService.getMachines({
        ...filters,
        page: 1, 
        limit: 100
      });

      if (response.success) {
        setMachines(response.data.machines);
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setFilters(prev => ({
            ...prev,
            lat: latitude.toString(),
            lng: longitude.toString()
          }));
        },
        (error) => alert('Location access denied.')
      );
    } else {
      alert('Geolocation not supported.');
    }
  };

  const handleBookMachine = (machine) => navigate(`/farmer/book-machine/${machine._id}`);

  const handleVoiceSearch = (text) => {
    setSearchTerm(text);
    const lowerText = text.toLowerCase();
    if (lowerText.includes('tractor')) handleFilterChange('type', 'tractor');
    else if (lowerText.includes('harvester')) handleFilterChange('type', 'harvester');
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- FILTER OPTIONS ---
  const typeOptions = [
      { value: '', label: 'All Machines' },
      { value: 'tractor', label: '🚜 Tractor' },
      { value: 'harvester', label: '🌾 Harvester' },
      { value: 'sprayer', label: '💦 Sprayer' },
      { value: 'thresher', label: '⚙️ Thresher' },
      { value: 'other', label: '🔧 Other' }
  ];

  const availabilityOptions = [
      { value: '', label: 'All Status' },
      { value: 'true', label: '✅ Available Now' },
      { value: 'false', label: '❌ Booked' }
  ];

  const radiusOptions = [
      { value: '5', label: 'Within 5 km' },
      { value: '10', label: 'Within 10 km' },
      { value: '25', label: 'Within 25 km' },
      { value: '50', label: 'Within 50 km' },
      { value: '100', label: 'Within 100 km' }
  ];

  if (loading && machines.length === 0) return <Loader text="Loading machines..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 pb-24"> {/* Added pb-24 for mobile spacing */}
      
      {/* Header & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Machines</h1>
          <p className="text-gray-600">Book tractors and tools near you</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm self-start md:self-auto">
            <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Icons.List /> List
            </button>
            <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Icons.Map /> Map
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 sticky top-0 z-20 md:static">
         <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-md leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <VoiceSearch onSearch={handleVoiceSearch} />
      </div>

      {/* FILTERS SECTION (Responsive Grid) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-wider">
                <Icons.Filter /> Filter Options
            </h2>
            {(filters.type || filters.availability) && (
                <button 
                    onClick={resetFilters}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center font-medium"
                >
                    <Icons.Close /> Reset Filters
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Machine Type */}
          <CustomSelect 
            value={filters.type} 
            onChange={(val) => handleFilterChange('type', val)} 
            options={typeOptions} 
            placeholder="All Machines"
          />

          {/* Availability */}
          <CustomSelect 
            value={filters.availability} 
            onChange={(val) => handleFilterChange('availability', val)} 
            options={availabilityOptions} 
            placeholder="All Status"
          />

          {/* Radius */}
          <CustomSelect 
            value={filters.radiusKm} 
            onChange={(val) => handleFilterChange('radiusKm', val)} 
            options={radiusOptions} 
            placeholder="Select Radius"
          />

          {/* Location Button */}
          <Button 
              variant="outline" 
              onClick={handleUseCurrentLocation} 
              className="w-full justify-center h-[42px] flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
              <Icons.Location /> Near Me
          </Button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {viewMode === 'map' ? (
          <MachineMap 
             machines={filteredMachines} 
             userLocation={userCoords}
          />
      ) : (
          <>
            {filteredMachines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <div className="text-6xl mb-4 opacity-50">🚜</div>
                  <h3 className="text-lg font-semibold text-gray-900">No machines found</h3>
                  <p className="text-gray-500 mt-1 max-w-xs mx-auto">Try changing your filters or increasing the search radius.</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-4 text-green-600 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMachines.map(machine => (
                    <MachineCard
                        key={machine._id}
                        machine={machine}
                        onBook={handleBookMachine}
                        currentLocation={userCoords}
                    />
                    ))}
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default Machines;