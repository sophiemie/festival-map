import { createMap, addMarkers } from './js/map.js';
import { closePopup } from './js/info.js';

const map = createMap();


fetch('festivals2025.json')
    .then(response => response.json())
    .then(data => {
        addMarkers(map, data);
    })
    .catch(error => console.error('Error loading the JSON file:', error));

    // Listener, welche Band-Pop Up wieder schliesst wenn woanders gedrückt wird
    document.addEventListener('click', (event) => {
        const popup = document.getElementById('band-popup');
        const bandsList = document.getElementById('festival-bands');
    
        // Schließe das Popup nur, wenn der Klick außerhalb des Popups und der Bandliste war
        if (popup && !popup.contains(event.target) && !bandsList.contains(event.target)) {
            closePopup();
        }
    });
    
    