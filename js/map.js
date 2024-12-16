function createMap()
{
    const map = L.map('map', {
        center: [51.1657, 10.4515],
        zoom: 6, // Standard-Zoomlevel
        minZoom: 6, // Minimales Zoomlevel (nicht weiter raus zoomen)
        maxZoom: 12, // Maximales Zoomlevel (weiter rein zoomen möglich)
    }).setView([51.1657, 10.4515], 6); // Karte zentrieren
    
    // Definiere die Grenzen für Deutschland
    const bounds = [[47.2701, 5.8663], [55.0581, 15.0419]];
    
    // Beschränke die Karte auf die Deutschland-Grenzen
    map.setMaxBounds(bounds);
    
    // Füge OpenStreetMap-Tiles hinzu
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    // Karte zentrieren und in den Grenzen halten
    map.fitBounds(bounds);

    return map;
}


function addMarkers(map, festivals)
{
    festivals.forEach(festival => {
        const { name, location, date, logo } = festival;

        const customIcon = L.icon({
            iconUrl: logo,
            iconSize: [70, 70],
            iconAnchor: [35, 70],
            popupAnchor: [0, -50],
        });

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
            updateSidebar(festival);
        });
    });
}


// Aktualisiert die Sidebar mit Festival-Informationen
function updateSidebar(festival) {
    const { name, location, date, logo, bands, 'ticket-url': ticketUrl } = festival;

    document.getElementById('festival-name').textContent = name;
    document.getElementById('festival-location').textContent = location.name;
    document.getElementById('festival-logo').src = logo;

    const ticketButton = document.getElementById('festival-tickets');
    ticketButton.href = ticketUrl;

    const bandsList = document.getElementById('festival-bands');
    bandsList.innerHTML = '';
    bands.forEach(band => {
        const li = document.createElement('li');
        li.textContent = band;
        bandsList.appendChild(li);
    });

    initializeCalendar(date);

    document.getElementById('festival-sidebar').style.display = 'block';
}


function initializeCalendar(date) {
    const [startDate, endDate] = date.split(' to ');
    const calendarContainer = document.getElementById('festival-calendar');
    calendarContainer.innerHTML = '';

    flatpickr(calendarContainer, {
        inline: true,
        mode: 'range',
        defaultDate: [startDate, endDate],
        clickOpens: false,
    });
}

export{ createMap, addMarkers };


