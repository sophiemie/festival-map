import { createMap, addMarkers } from './js/map.js';

const map = createMap();


fetch('festivals2025.json')
    .then(response => response.json())
    .then(data => {
        addMarkers(map, data);
    })
    .catch(error => console.error('Error loading the JSON file:', error));