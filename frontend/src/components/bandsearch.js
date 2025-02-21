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
        checkbox.addEventListener('change', updateConfirmButton);

        const bandName = document.createElement('span');
        bandName.textContent = band;

        li.addEventListener('click', (event) => {
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                updateConfirmButton();
            }
        });

        li.appendChild(checkbox);
        li.appendChild(bandName);
        bandList.appendChild(li);
    });

    // Bestätigungs-Button hinzufügen
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-button';
    confirmButton.textContent = 'Bestätigen';
    confirmButton.disabled = true;
    confirmButton.addEventListener('click', () => {
        const selectedBands = Array.from(document.querySelectorAll("#band-list input[type='checkbox']:checked"))
            .map(checkbox => checkbox.nextSibling.textContent);

        console.log("Ausgewählte Bands:", selectedBands);
        alert("Du hast folgende Bands ausgewählt: " + selectedBands.join(", "));

        // Liste ausblenden nach Bestätigung
        bandList.classList.add('hidden');
    });

    bandList.appendChild(confirmButton);
    bandList.classList.remove('hidden'); // Liste sichtbar machen
}

// Funktion zum Aktivieren/Deaktivieren des Buttons
function updateConfirmButton() {
    const checkboxes = document.querySelectorAll("#band-list input[type='checkbox']");
    const confirmButton = document.getElementById('confirm-button');

    const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    if (isChecked) {
        confirmButton.classList.add('active');
        confirmButton.disabled = false;
    } else {
        confirmButton.classList.remove('active');
        confirmButton.disabled = true;
    }
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
        bandList.classList.add('hidden'); // Liste verstecken
    }
});

// Klick ins Suchfeld verhindert Schließen der Liste
document.getElementById("search-input").addEventListener("click", (event) => {
    event.stopPropagation();
});
