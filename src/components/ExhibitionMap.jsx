import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Search, Filter as FilterIcon, Navigation, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const stores = [{ 
    id: 1, 
    name: 'Art Gallery A', 
    lat: 7.8731, 
    lng: 80.7718,
    category: 'art',
    description: 'Modern art exhibition',
    openingHours: '9:00 - 18:00'
}];

const ExhibitionMap = () => {
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [routingControl, setRoutingControl] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [markers, setMarkers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [manualStores, setManualStores] = useState([]);
    const [newStoreName, setNewStoreName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('art');

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const mapInstance = L.map('map').setView([7.8731, 80.7718], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
        
        setMap(mapInstance);

        return () => mapInstance.remove();
    }, []);

    useEffect(() => {
        if (!map || !editMode) return;

        const handleMapClick = (e) => {
            const newStore = {
                id: Date.now(),
                name: newStoreName || `Store ${manualStores.length + 1}`,
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                category: selectedCategory,
                description: 'Custom store location',
                openingHours: '9:00 - 18:00'
            };
            setManualStores(prev => [...prev, newStore]);
            setNewStoreName('');
        };

        map.on('click', handleMapClick);
        return () => map.off('click', handleMapClick);
    }, [map, editMode, newStoreName, selectedCategory]);

    useEffect(() => {
        if (!map) return;
        markers.forEach(marker => marker.remove());
        const newMarkers = [];

        [...stores, ...manualStores]
            .filter(store => filter === 'all' || store.category === filter)
            .filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .forEach(store => {
                const marker = L.marker([store.lat, store.lng])
                    .bindPopup(`
                        <div class="store-popup">
                            <h3 class="font-semibold">${store.name}</h3>
                            <p>${store.description}</p>
                            <p>Hours: ${store.openingHours}</p>
                            <button onclick="window.selectStore(${store.id})">
                                Navigate Here
                            </button>
                        </div>
                    `)
                    .addTo(map);
                newMarkers.push(marker);
            });
        
        setMarkers(newMarkers);
        window.selectStore = (storeId) => {
            const store = [...stores, ...manualStores].find(s => s.id === storeId);
            setSelectedStore(store);
        };
    }, [map, filter, searchTerm, manualStores]);

    useEffect(() => {
        if (!map || !userMarker || !selectedStore) return;
        
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(userMarker.getLatLng()),
                L.latLng(selectedStore.lat, selectedStore.lng)
            ],
            routeWhileDragging: true,
            lineOptions: {
                styles: [{ color: '#4f46e5', weight: 4 }]
            }
        }).addTo(map);

        setRoutingControl(control);
    }, [map, userMarker, selectedStore]);

    useEffect(() => {
        if (!map) return;
     
        let initialView = true;
     
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setErrorMessage('');
                    const { latitude, longitude } = position.coords;
                    
                    if (userMarker) {
                        userMarker.setLatLng([latitude, longitude]);
                    } else {
                        const userIcon = L.divIcon({
                            className: 'user-location',
                            iconSize: [12, 12]
                        });
                        
                        const newMarker = L.marker([latitude, longitude], {
                            icon: userIcon
                        }).addTo(map);
                        setUserMarker(newMarker);
                        
                        if (initialView) {
                            map.setView([latitude, longitude], 15);
                            initialView = false;
                        }
                    }
                },
                (error) => {
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            setErrorMessage("Please enable location permissions");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setErrorMessage("Location unavailable. Please check device settings");
                            break;
                        case error.TIMEOUT:
                            setErrorMessage("Location request timed out");
                            break;
                        default:
                            setErrorMessage("An unknown error occurred");
                    }
                },
                { 
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
     
            return () => navigator.geolocation.clearWatch(watchId);
        }
     }, [map, userMarker]);

    return (
        <div className="relative">
            {errorMessage && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 bg-opacity-90 text-white p-3 text-center z-20 rounded-t-lg backdrop-blur-sm">
                    <p className="flex items-center justify-center gap-2">
                        <Navigation className="h-5 w-5" />
                        {errorMessage}
                    </p>
                </div>
            )}
            
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-4">
                <div className="bg-white rounded-lg shadow-lg p-4 flex-1 md:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search stores..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-2">
                        <FilterIcon className="text-gray-400" />
                        <select 
                            className="pl-2 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="art">Art Gallery</option>
                            <option value="food">Food Court</option>
                            <option value="fashion">Fashion Boutique</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            editMode ? 'bg-red-500' : 'bg-green-500'
                        } text-white transition-colors`}
                    >
                        <Plus className={`h-5 w-5 transform ${editMode ? 'rotate-45' : ''}`} />
                        {editMode ? 'Stop Marking' : 'Mark Locations'}
                    </button>
                </div>
            </div>
            
            {editMode && (
                <div className="absolute top-20 left-4 right-4 z-10">
                    <div className="bg-white rounded-lg shadow-lg p-4 flex gap-4">
                        <input
                            type="text"
                            placeholder="Store name"
                            className="flex-1 p-2 border rounded"
                            value={newStoreName}
                            onChange={(e) => setNewStoreName(e.target.value)}
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="art">Art Gallery</option>
                            <option value="food">Food Court</option>
                            <option value="fashion">Fashion Boutique</option>
                        </select>
                    </div>
                </div>
            )}
            
            <div className="rounded-lg overflow-hidden shadow-lg">
                <div id="map" className="h-[600px] w-full" />
            </div>
            
            {selectedStore && (
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 md:max-w-md">
                    <h3 className="text-lg font-semibold text-gray-800">{selectedStore.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedStore.description}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Opening Hours: {selectedStore.openingHours}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExhibitionMap;