
// Erstelle eine Karte und setze den View auf Deutschland
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

// Lade die festivals2025.json und füge Marker mit Logos hinzu
fetch('festivals2025.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(festival => {
            const { name, location, date, bands, logo } = festival;

            // Extrahiere Start- und Enddatum aus dem `date`-Feld
            const [startDate, endDate] = date.split(" to ").map(d => d.trim());

            // Erstelle ein benutzerdefiniertes Icon mit dem Logo
            const customIcon = L.icon({
                iconUrl: logo, // Der Pfad zum Logo aus der JSON
                iconSize: [70, 70], // Größe des Icons (anpassbar)
                iconAnchor: [35, 70], // Position des Icons relativ zum Markerpunkt
                popupAnchor: [0, -50] // Position des Popups relativ zum Icon
            });

            // Füge den Marker mit dem benutzerdefinierten Icon hinzu
            const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
                .addTo(map);

            // Beim Klicken auf den Marker wird die Sidebar geöffnet
            marker.on('click', () => {
                // Fülle die Sidebar mit den Festivalinformationen
                document.getElementById('festival-name').textContent = name;
                document.getElementById('festival-location').textContent = `Location: ${location.name}`;
                document.getElementById('festival-date').textContent = `Date: ${date}`;
                
                // Setze das Festival-Logo in die Sidebar
                document.getElementById('festival-logo').src = logo;
                
                // Liste der Bands anzeigen
                const bandsList = document.getElementById('festival-bands');
                bandsList.innerHTML = ''; // Vorherige Bands löschen
                bands.forEach(band => {
                    const li = document.createElement('li');
                    li.textContent = band;
                    bandsList.appendChild(li);
                });

                // Kalender hinzufügen
                // Kalender-Container zurücksetzen
                const calendarContainer = document.getElementById('festival-calendar');
                calendarContainer.innerHTML = ""; // Vorherigen Kalender entfernen

                // Flatpickr direkt in den Container einfügen
                flatpickr(calendarContainer, {
                    defaultDate: date, // Standard-Datum auf Festivaldatum setzen
                    inline: true, // Kalender wird direkt angezeigt
                    dateFormat: "Y-m-d",
                    onChange: (selectedDates, dateStr) => {
                        console.log(`Neues Datum für ${name}: ${dateStr}`);
                    }
                });

                // Sidebar anzeigen
                document.getElementById('festival-sidebar').style.display = 'block';
            });
        });
    })
    .catch(error => console.error('Error loading the JSON file:', error));
