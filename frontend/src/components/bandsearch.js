// bandsearch.js

// Funktion zum Abrufen und Filtern der Bands aus der JSON
async function fetchAndFilterBands() {
    try {
        const response = await fetch('festivals2025.json');
        const data = await response.json();

        // Alle Bands in ein Set hinzufügen, um Duplikate zu vermeiden
        const bandsSet = new Set();
        data.forEach(festival => {
            festival.bands.forEach(band => {
                bandsSet.add(band);
            });
        });

        // Rückgabe der einzigartigen Bands als Array
        return Array.from(bandsSet);
    } catch (error) {
        console.error('Fehler beim Abrufen der Bands:', error);
    }
}

// Beispiel für das Hinzufügen von Bands zur Liste
function displayBands(bands) {
    const bandList = document.getElementById('band-list');

    if (!bandList) {
        console.error("Das Element mit der ID 'band-list' konnte nicht gefunden werden.");
        return; // Beende die Funktion, wenn das Element nicht gefunden wurde
    }

    bandList.innerHTML = ''; // Vorherige Einträge leeren

    bands.forEach(band => {
        const li = document.createElement('li');
        li.textContent = band;
        li.addEventListener('click', () => {
            // Aktion bei Klick auf die Band
            console.log(`Band selected: ${band}`);
            // Hier kannst du die Aktion definieren, die passieren soll
        });
        bandList.appendChild(li);
    });

    bandList.classList.toggle('hidden', bands.length === 0); // Verstecke die Liste, wenn keine Bands vorhanden sind
}

// Event-Listener für das Suchfeld
document.getElementById("search-input").addEventListener("focus", async () => {
    const bands = await fetchAndFilterBands();
    displayBands(bands);
});

// Event-Listener für das Schließen der Liste beim Klicken außerhalb
document.addEventListener('click', (event) => {
    const searchInput = document.getElementById('search-input');
    const bandList = document.getElementById('band-list');

    if (!searchInput.contains(event.target) && !bandList.contains(event.target)) {
        bandList.classList.add('hidden'); // Verstecke die Liste
    }
});

// Optional: Event-Listener für das Klicken des Suchfelds, um die Liste anzuzeigen
document.getElementById("search-input").addEventListener("click", (event) => {
    event.stopPropagation(); // Verhindere das Schließen der Liste beim Klicken auf das Suchfeld
});
