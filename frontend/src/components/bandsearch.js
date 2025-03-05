import {displayRankingButton} from "./ranking";

let selectedBands = []; // Zustand zum Speichern der ausgewählten Bands

// Funktion zum Abrufen und Filtern der Bands aus der JSON
async function fetchAndFilterBands() {
    try {
        const response = await fetch('festivals2025.json');
        const data = await response.json();

        const bandsSet = new Set();
        data.forEach(festival => {
            festival.bands.forEach(band => bandsSet.add(band));
        });

        return Array.from(bandsSet);
    } catch (error) {
        console.error('Fehler beim Abrufen der Bands:', error);
    }
}

// Funktion zur Anzeige der Bands mit Checkboxen und Bestätigungs-Button
function displayBands(bands) {
    const bandList = document.getElementById('band-list');
    if (!bandList) return;

    bandList.innerHTML = ''; // Vorherige Einträge leeren

    bands.forEach(band => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedBands.includes(band); // Checkbox-Status setzen
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedBands.push(band); // Band zur Auswahl hinzufügen
            } else {
                selectedBands = selectedBands.filter(b => b !== band); // Band von der Auswahl entfernen
            }
            updateConfirmButton();
        });

        const bandName = document.createElement('span');
        bandName.textContent = band;

        li.addEventListener('click', (event) => {
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked; // Checkbox umschalten
                checkbox.dispatchEvent(new Event('change')); // change-Event auslösen
            }
        });

        li.appendChild(checkbox);
        li.appendChild(bandName);
        bandList.appendChild(li);
    });

    // Bestätigungs-Button hinzufügen (falls nicht schon vorhanden)
    if (!document.getElementById('confirm-button')) {
        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirm-button';
        confirmButton.textContent = 'Confirm';
        confirmButton.disabled = selectedBands.length === 0; // Button-Status beim Hinzufügen


        confirmButton.addEventListener('click', async () => {
            console.log("Ausgewählte Bands:", selectedBands);

            // Ladebalken
            const loadingContainer = document.getElementById('loading-container');
            loadingContainer.style.display = 'block';

            try {
                const response = await fetch("http://localhost:4000/api/artists/similar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bands: selectedBands }),
                });

                const result = await response.json();
                console.log("Ähnliche Künstler:", result);
            } catch (error) {
                console.error("Fehler beim Abrufen ähnlicher Künstler:", error);
            }

            // Ladebalken ausschalten
            loadingContainer.style.display = 'none';

            // Bandliste ausblenden
            bandList.classList.add('hidden');
            bandList.style.display = 'none';
            displayRankingButton();
        });

        bandList.appendChild(confirmButton);
    }

    updateConfirmButton(); // Bestätigungs-Button aktualisieren
    bandList.classList.remove('hidden'); // Liste sichtbar machen
    bandList.style.display = 'block'; // Falls nötig, sicherstellen, dass sie sichtbar ist
}

// Funktion zum Aktivieren/Deaktivieren des Buttons
function updateConfirmButton() {
    const confirmButton = document.getElementById('confirm-button');
    const isActive = selectedBands.length > 0; // Button aktiv, wenn Bands ausgewählt sind
    confirmButton.disabled = !isActive;

    if (isActive) {
        confirmButton.classList.add('active');
    } else {
        confirmButton.classList.remove('active');
    }
}

// Band in Searchbar filtern
function filterBands(bands, searchTerm) {
    return bands.filter(band => band.toLowerCase().includes(searchTerm.toLowerCase()));
}

let allBands = []; // Array zum Speichern aller Bands

document.getElementById("search-input").addEventListener("focus", async () => {
    allBands = await fetchAndFilterBands(); // Alle Bands beim Fokussieren abrufen
    displayBands(allBands); // Alle Bands anzeigen
});

// Eingabeereignis für das Suchfeld hinzufügen
document.getElementById("search-input").addEventListener("input", () => {
    const searchTerm = document.getElementById("search-input").value;
    const filteredBands = filterBands(allBands, searchTerm); // Bands filtern
    displayBands(filteredBands); // Gefilterte Bands anzeigen
});

document.addEventListener('click', (event) => {
    const searchInput = document.getElementById('search-input');
    const bandList = document.getElementById('band-list');

    if (!searchInput.contains(event.target) && !bandList.contains(event.target)) {
        bandList.classList.add('hidden'); // Liste ausblenden
        bandList.style.display = 'none';
    }
});

// Klick ins Suchfeld verhindert Schließen der Liste
document.getElementById("search-input").addEventListener("click", (event) => {
    event.stopPropagation();
});
