import { haversineDistance } from './marker.js';


async function fetchFestivals() {
    try {
        const response = await fetch('/festivals2025.json');
        if (!response.ok) throw new Error(`Fehler beim Laden der Festivals: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchSelectedBands() {
    try {
        const response = await fetch('/selectedBands.json');
        if (!response.ok) throw new Error(`Fehler beim Laden der Bands: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return {};
    }
}

export function displayRankingButton() {
    if (document.getElementById('ranking-button')) return;

    const rankingButton = document.createElement('button');
    rankingButton.id = 'ranking-button';
    rankingButton.classList.add('ranking-button');
    rankingButton.textContent = 'Start Ranking';

    rankingButton.addEventListener('click', async () => {
        console.log('Ranking gestartet mit den ausgewählten Bands!');
        await showRankingSidebar();
    });

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.appendChild(rankingButton);
    } else {
        document.body.appendChild(rankingButton);
    }
}

async function showRankingSidebar() {
    let existingSidebar = document.getElementById('ranking-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'ranking-sidebar';
    sidebar.classList.add('ranking-sidebar');

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.classList.add('close-sidebar');
    closeButton.addEventListener('click', () => {
        sidebar.classList.remove('show');
        arrow.classList.remove('rotate');
    });

    const title = document.createElement('h2');
    title.textContent = 'Festival Ranking';

    const festivals = await fetchFestivals();
    const selectedBands = await fetchSelectedBands();
    const rankingList = calculateFestivalRanking(festivals, selectedBands);

    const rankingContainer = document.createElement('ul');
    rankingContainer.classList.add('ranking-list');

    rankingList.forEach(({ festival, percentage, likedArtistsCount, mightLikeArtistsCount, distance, isOutsideRadius }, index) => {
        const item = document.createElement('li');

        // Abstand korrekt anzeigen
        let distanceText = distance && distance !== 'N/A' ? `<br><span>📍 Distance: <strong>${distance}</strong></span>` : '';

        // Festival außerhalb des Radius wird grau dargestellt
        if (isOutsideRadius) {
            item.classList.add('festival-outside-radius');
        }

        item.innerHTML = `
            <strong>${index + 1}. ${festival}</strong> - ${percentage.toFixed(1)}%<br>
            <span>🎵 Number of artists you like: <strong>${likedArtistsCount}</strong></span><br>
            <span>⭐ Number of artists you might like: <strong>${mightLikeArtistsCount}</strong></span>
            ${distanceText}
            <hr>
        `;

        rankingContainer.appendChild(item);
    });

    sidebar.appendChild(closeButton);
    sidebar.appendChild(title);
    sidebar.appendChild(rankingContainer);
    document.body.appendChild(sidebar);

    // Arrow for toggling sidebar
    const arrow = document.createElement('div');
    arrow.id = 'sidebar-arrow';
    arrow.classList.add('sidebar-arrow');
    arrow.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        arrow.classList.toggle('rotate');
    });

    document.body.appendChild(arrow);
}


function calculateFestivalRanking(festivals, selectedBands) {
    const userBands = new Set(Object.keys(selectedBands));
    const similarBands = new Set(Object.values(selectedBands).flat());
    const allUserBands = new Set([...userBands, ...similarBands]);

    // Sicherstellen, dass userMarker existiert, bevor auf getLatLng() zugegriffen wird
    const userPosition = (window.userMarker && typeof window.userMarker.getLatLng === "function")
        ? window.userMarker.getLatLng()
        : null;

    // Hole den Wert aus dem Range-Input (Radius)
    const rangeInput = document.getElementById('range-input');
    const radius = rangeInput ? parseInt(rangeInput.value) : 0; // Den Radius aus dem Input lesen

    return festivals.map(festival => {
        const festivalBands = new Set(festival.bands);
        const likedArtists = [...userBands].filter(band => festivalBands.has(band));
        const mightLikeArtists = [...similarBands].filter(band => festivalBands.has(band));

        const percentage = ((likedArtists.length + mightLikeArtists.length) / festivalBands.size) * 100;

        // Berechne die Distanz nur, wenn der Marker gesetzt ist
        let distanceText = 'N/A';
        let distance = 0;
        let isOutsideRadius = false; // Variable um zu prüfen, ob das Festival außerhalb des Radius liegt

        if (userPosition) {
            distance = haversineDistance({
                latitude: userPosition.lat,
                longitude: userPosition.lng
            }, {
                latitude: festival.location.latitude,
                longitude: festival.location.longitude
            });

            // Falls die Distanz größer als der Radius ist, setzen wir isOutsideRadius auf true
            if (distance <= radius) {
                distanceText = distance.toFixed(1) + ' km';
            } else {
                distanceText = distance.toFixed(1) + ' km'; // Auch außerhalb anzeigen
                isOutsideRadius = true;
            }
        }

        // Berechne ein Ranking für jedes Festival basierend auf den Übereinstimmungen und der Distanz
        let rankingScore = percentage; // Beginne mit der Prozentzahl der Übereinstimmungen

        if (distance <= radius) {
            // Festivals im Radius erhalten eine höhere Gewichtung für die Nähe
            rankingScore += (100 - distance);  // Entfernung zum Ranking hinzufügen (höhere Entfernung = kleinerer Wert)
        } else {
            // Festivals außerhalb des Radius erhalten einen zusätzlichen Abzug (z.B. -50 Punkte)
            rankingScore -= 50;
        }

        return {
            festival: festival.name,
            percentage,
            likedArtistsCount: likedArtists.length,
            mightLikeArtistsCount: mightLikeArtists.length,
            distance: distanceText,
            rankingScore,
            isOutsideRadius // Hinzufügen der Information, ob das Festival außerhalb des Radius liegt
        };
    })
        .sort((a, b) => b.rankingScore - a.rankingScore); // Sortierung nach dem berechneten Ranking-Score
}

