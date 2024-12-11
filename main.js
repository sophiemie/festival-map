
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
            const [startDate, endDate] = date.split(" to ").map(d => {
                const dateParts = d.split("-");
                // Entferne Zeitprobleme, indem wir das Datum mit expliziter Stunde und Minute erstellen
                const fixedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0); // Mit mittagszeit
                return fixedDate.toISOString().split("T")[0]; // ISO-Datum zurückgeben
            });
            const customIcon = L.icon({
                iconUrl: logo,
                iconSize: [70, 70],
                iconAnchor: [35, 70],
                popupAnchor: [0, -50]
            });

            const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
                .addTo(map);

            marker.on('click', () => {
                document.getElementById('festival-name').textContent = name;
                document.getElementById('festival-location').textContent = `Location: ${location.name}`;
                document.getElementById('festival-date').textContent = `Date: ${date}`;
                document.getElementById('festival-logo').src = logo;

                const bandsList = document.getElementById('festival-bands');
                bandsList.innerHTML = '';
                bands.forEach(band => {
                    const li = document.createElement('li');
                    li.textContent = band;
                    bandsList.appendChild(li);
                });

                const calendarContainer = document.getElementById('festival-calendar');
                calendarContainer.innerHTML = '';

                flatpickr(calendarContainer, {
                    inline: true,
                    mode: "range",  // Bereichsmodus für Start- und Enddatum
                    defaultDate: [startDate, endDate],  // Setze den Bereich auf die Festival-Daten
                    locale: {
                        rangeSeparator: " to "  // Trennzeichen für Start- und Enddatum
                    },
                    clickOpens: false,  // Verhindert das Öffnen des Kalenders beim Klicken
                    onReady: function() {
                        const calendarDays = document.querySelectorAll('.flatpickr-day');
                        calendarDays.forEach(day => {
                            day.style.pointerEvents = 'none';  // Macht die Tage nicht klickbar
                        });
                    },
                
                    onValueUpdate: function(selectedDates) {
                        // Entferne alle vorherigen Markierungen
                        const calendarDays = document.querySelectorAll('.flatpickr-day');
                        calendarDays.forEach(day => {
                            day.classList.remove('selected-day');
                        });
                
                        // Markiere alle ausgewählten Tage
                        selectedDates.forEach(selectedDay => {
                            const selectedDayStr = selectedDay.toISOString().split('T')[0]; // Formatiertes Datum
                            const dayElement = document.querySelector(`[data-date="${selectedDayStr}"]`);
                            if (dayElement) {
                                dayElement.classList.add('selected-day');  // CSS-Klasse hinzufügen
                            }
                        });
                    }
                });
                
                document.getElementById('festival-sidebar').style.display = 'block';
            });
        });
    })
    .catch(error => console.error('Error loading the JSON file:', error));
