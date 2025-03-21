async function loadSelectedBandsData() {
    try {
        const isDocker = window.location.hostname === 'localhost';
        const url = isDocker
            ? 'http://localhost:4000/app/shared/selectedBands.json'
            : 'selectedBands.json';

        const response = await fetch(url);


        if (!response.ok) {
            throw new Error('Fehler beim Laden der selectedBands.json');
        }
        const data = await response.json();

        // Keys sind die ausgewählten Bands
        const selectedBands = Object.keys(data);

        // Set mit allen ähnlichen Bands und Mapping
        const allSimilarBands = new Set();
        const similarMapping = {};

        Object.entries(data).forEach(([parentBand, similarArray]) => {
            similarArray.forEach(similarBand => {
                allSimilarBands.add(similarBand);
                // Falls Band in mehreren Keys auftaucht wird zuletzt gelesene Key verwendet
                similarMapping[similarBand] = parentBand;
            });
        });

        return { selectedBands, allSimilarBands, similarMapping };
    } catch (error) {
        console.error(error);
        return { selectedBands: [], allSimilarBands: new Set(), similarMapping: {} };
    }
}


// Aktualisiert die Sidebar mit Festival-Informationen
async function updateSidebar(festival, allFestivals) {
    const { name, location, date, logo, bands, 'ticket-url': ticketUrl } = festival;

    document.getElementById('festival-name').textContent = name;
    document.getElementById('festival-location').textContent = location.name;
    document.getElementById('festival-logo').src = logo;

    const ticketButton = document.getElementById('festival-tickets');
    ticketButton.href = ticketUrl;

    const bandsList = document.getElementById('festival-bands');
    bandsList.innerHTML = '';

    // Lade die Daten aus der JSON
    const { selectedBands, allSimilarBands, similarMapping } = await loadSelectedBandsData();

    bands.forEach(band => {
        const li = document.createElement('li');
        li.classList.add('clickable-band');
        li.textContent = band;
        li.style.position = 'relative';
        li.style.padding = '10px 40px 10px 10px'; // rechts Platz für den Stern
        li.style.listStyleType = 'none';

        // Selected Band
        if (selectedBands.includes(band)) {
            const starGold = document.createElement('img');
            starGold.src = '../../images/star_gold.png';
            starGold.alt = 'Goldener Stern';
            starGold.classList.add('star-icon', 'gold-star');
            li.appendChild(starGold);
        }
        // Similar Band
        else if (allSimilarBands.has(band)) {
            const starBlue = document.createElement('img');
            starBlue.src = '../../images/star_blue.png';
            starBlue.alt = 'Blauer Stern';
            starBlue.classList.add('star-icon', 'blue-star');

            // Tooltip-Hover hinzufügen
            starBlue.addEventListener('mouseenter', (e) => {
                const tooltip = document.getElementById('tooltip');
                console.log('Tooltip Element:', tooltip);
                tooltip.textContent = `Similar to ${similarMapping[band]}`;
                tooltip.style.display = 'block';
                const rect = starBlue.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            });

            starBlue.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.display = 'none';
            });

            li.appendChild(starBlue);
        }

        // Klick-Event für das Anzeigen des Popups
        li.addEventListener('click', () => {
            const relevantFestivals = allFestivals.filter(f => f.bands.includes(band));
            showPopup(band, relevantFestivals, li);
        });

        bandsList.appendChild(li);
    });

    // Falls der Marker aktiv ist, berechne die Distanz und füge sie unter dem Ort ein
    const distanceElement = document.getElementById('festival-distance');
    if (window.userMarker) {
        const userLatLng = window.userMarker.getLatLng();
        const festivalLatLng = L.latLng(location.latitude, location.longitude);

        const distance = userLatLng.distanceTo(festivalLatLng) / 1000; // in km
        distanceElement.textContent = `(${distance.toFixed(1)} km)`;
    } else {
        distanceElement.textContent = ''; // Keine Distanz anzeigen, wenn Marker fehlt
    }

    initializeCalendar(date);

    document.getElementById('festival-sidebar').style.display = 'block';
    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('festival-sidebar').style.display = 'none';
    });
}

// Kalender für jedes Festival
function initializeCalendar(date) {
    const [startDate, endDate] = date.split(' to ');
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
                    dayElement.classList.add('selected-day');
                }
            });
        },

        // Verhindert das Wechseln des Monats und Jahres
        showMonths: 1,
        disableMobile: true,
        prevArrow: "←",  // Versteckt die vorherige Monatsschaltfläche
        nextArrow: "→",  // Versteckt die nächste Monatsschaltfläche
        minDate: startDate, // Begrenze das Minimum-Datum
        maxDate: endDate   // Begrenze das Maximum-Datum
    });
}

// Zeigt ein Popup mit anderen Festivals für eine Band
function showPopup(bandName, festivals, targetElement) {
    const popup = document.getElementById('band-popup');
    const popupBandName = document.getElementById('popup-band-name');
    const popupFestivals = document.getElementById('popup-festivals');

    // Setze die Daten des Popups
    popupBandName.textContent = `Festivals with: ${bandName}`;
    popupFestivals.innerHTML = '';

    festivals.forEach(festival => {
        const festivalItem = document.createElement('li');
        festivalItem.classList.add('popup-festival-item');

        // Erstelle das Festival-Logo und beschriftung
        const logo = document.createElement('img');
        logo.src = festival.logo;
        logo.alt = festival.name;
        logo.title = festival.name;
        logo.classList.add('popup-festival-logo');

        const festivalName = document.createElement('span');
        festivalName.textContent = festival.name;

        festivalItem.appendChild(logo);
        popupFestivals.appendChild(festivalItem);
    });

    // Berechnung der Popup-Position
    popup.style.display = 'block';
    popup.classList.remove('hidden');

    // Berechne die Position
    const rect = targetElement.getBoundingClientRect();
    popup.style.left = `${rect.left - popup.offsetWidth - 10}px`; // 10px Abstand nach links
    popup.style.top = `${rect.top}px`;

    // Positionierung relativ zum Marker-Element
    let top = rect.bottom;

    // Überprüfen, ob das Popup außerhalb des Viewports liegt
    const popupHeight = popup.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Nach unten korrigieren, falls außerhalb des unteren Rands
    if (top + popupHeight > viewportHeight) {
        top = rect.top - popupHeight - 1; // Über dem Element anzeigen
    }

    // Nach oben korrigieren, falls außerhalb des oberen Rands
    if (top < 0) {
        top = 10; // 10px Abstand zum oberen Rand
    }
    popup.style.top = `${top}px`;
}

function closePopup() {
    const popup = document.getElementById('band-popup');
    if (popup) {
        //popup.classList.add('hidden'); // Falls du Klassen verwendest
        popup.style.display = 'none'; // Alternativ: Display auf none setzen
    }
}

export { updateSidebar, showPopup, closePopup };