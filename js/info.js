// Aktualisiert die Sidebar mit Festival-Informationen
function updateSidebar(festival, allFestivals) {
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
        li.classList.add('clickable-band');
        
        // Event-Listener für Klick auf eine Band
        li.addEventListener('click', () => {
            const relevantFestivals = allFestivals.filter(f => f.bands.includes(band));
            showPopup(band, relevantFestivals, li);
        });

        bandsList.appendChild(li);
    });

    initializeCalendar(date);

    document.getElementById('festival-sidebar').style.display = 'block';
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
                    dayElement.classList.add('selected-day');  // CSS-Klasse hinzufügen
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

    console.log('Popup wird angezeigt für Band:', bandName); // Debugging-Ausgabe

    // Setze die Daten des Popups
    popupBandName.textContent = `Festivals für: ${bandName}`;
    popupFestivals.innerHTML = '';

    festivals.forEach(festival => {
        const li = document.createElement('li');
        li.textContent = `${festival.name} (${festival.date})`;
        popupFestivals.appendChild(li);
    });

    // Positioniere das Popup links vom angeklickten Künstler
    const rect = targetElement.getBoundingClientRect();
    popup.style.left = `${rect.left - popup.offsetWidth - 10}px`; // 10px Abstand nach links
    popup.style.top = `${rect.top}px`;

    popup.classList.remove('hidden');
    popup.style.display = 'block'; // Stelle sicher, dass das Popup angezeigt wird
}


export { updateSidebar, showPopup };
