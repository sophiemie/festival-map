import { haversineDistance } from './marker.js';
import { updateSidebar } from './info.js'; // Passe den Pfad an, je nach Dateistruktur


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

        const isDocker = window.location.hostname === 'localhost';
        const url = isDocker
            ? 'http://localhost:4000/app/shared/selectedBands.json'
            : 'selectedBands.json';


        const response = await fetch(url);




        if (!response.ok) throw new Error(`Fehler beim Laden der Bands: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return {};
    }
}

export function displayRankingButton() {
        let rankingButton = document.getElementById('ranking-button');
        rankingButton.style.display = 'flex';
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
    let sidebar = document.getElementById('ranking-sidebar');
    let closeButton = document.getElementById('close-slidebar');
    let title = document.getElementById('sidebar-title');
    let rankingListContainer = document.getElementById('ranking-list');

    // Wenn Sidebar schon existiert, Inhalte leeren
    rankingListContainer.innerHTML = '';

    // Button Event-Listener
    closeButton.addEventListener('click', () => {
        sidebar.classList.remove('show');
        arrow.classList.remove('rotate');
    });

    title.textContent = 'Festival Ranking';

    const festivals = await fetchFestivals();
    const selectedBands = await fetchSelectedBands();
    const rankingList = calculateFestivalRanking(festivals, selectedBands);

    // Generiere die Ranking-Liste
    rankingList.forEach(({ festival, percentage, likedArtistsCount, mightLikeArtistsCount, distance, isOutsideRadius }, index) => {
        const item = document.createElement('li');

        // Abstand korrekt anzeigen
        let distanceText = distance && distance !== 'N/A' ? `<br><span><img src="/../../images/pin.png" alt="music" style="width: 16px; height: 16px;"> Distance: <strong>${distance}</strong></span>` : '';

        // Festival außerhalb des Radius wird grau dargestellt
        if (isOutsideRadius) {
            item.classList.add('festival-outside-radius');
        }

        // Festivalname als klickbaren Block
        item.innerHTML = `
        <strong>${index + 1}. ${festival}</strong> - ${percentage.toFixed(1)}%<br>
        <span><img src="/../../images/star_gold.png" alt="music" style="width: 16px; height: 16px;"> Selected Artists: <strong>${likedArtistsCount}</strong></span><br>
        <span><img src="/../../images/star_blue.png" alt="star" style="width: 16px; height: 16px;"> Similar Artists: <strong>${mightLikeArtistsCount}</strong></span>
        ${distanceText}
        <hr>
    `;

        // Event-Listener für den Klick auf das Listenelement
        item.addEventListener('click', async () => {
            // Holen das Festival aus der Festivalliste
            const selectedFestival = festivals.find(f => f.name === festival);
            if (selectedFestival) {
                // Sidebar mit den Festival-Details aktualisieren
                await updateSidebar(selectedFestival, festivals);
            }
        });

        rankingListContainer.appendChild(item);
    });


    // Zeige Sidebar an
    sidebar.classList.add('show');

    // Arrow für das Umschalten der Sidebar
    const arrow = document.getElementById('sidebar-arrow');
    arrow.classList.add('rotate');
    arrow.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        arrow.classList.toggle('rotate');
    });
}




function calculateFestivalRanking(festivals, selectedBands) {
    const userBands = new Set(Object.keys(selectedBands));
    const similarBands = new Set(Object.values(selectedBands).flat());
    const allUserBands = new Set([...userBands, ...similarBands]);

    const userPosition = window.userMarker ? window.userMarker.getLatLng() : null;
    const rangeInput = document.getElementById('range-input');
    const radius = parseFloat(rangeInput.value); // Hole den Wert des Range-Inputs (Radius)

    return festivals.map(festival => {
        const festivalBands = new Set(festival.bands);
        const likedArtists = [...userBands].filter(band => festivalBands.has(band));
        const mightLikeArtists = [...similarBands].filter(band => festivalBands.has(band));

        const percentage = ((likedArtists.length + mightLikeArtists.length) / festivalBands.size) * 100;

        let distanceText = 'N/A';
        let distance = null;
        let isOutsideRadius = false;
        if (userPosition) {
            distance = haversineDistance({
                latitude: userPosition.lat,
                longitude: userPosition.lng
            }, {
                latitude: festival.location.latitude,
                longitude: festival.location.longitude
            });

            // Berechne die Distanz
            distanceText = distance.toFixed(1) + ' km';

            // Überprüfe, ob das Festival außerhalb des Radius liegt
            if (distance > radius) {
                isOutsideRadius = true;
            }
        }

        return {
            festival: festival.name,
            percentage,
            likedArtistsCount: likedArtists.length,
            mightLikeArtistsCount: mightLikeArtists.length,
            distance: distanceText,
            isOutsideRadius
        };
    })
        .sort((a, b) => {
            // Festivals im Radius kommen immer zuerst, auch wenn sie weniger Übereinstimmungen haben
            if (!a.isOutsideRadius && b.isOutsideRadius) {
                return -1; // a (im Radius) kommt vor b (außerhalb des Radius)
            }
            if (a.isOutsideRadius && !b.isOutsideRadius) {
                return 1; // b (im Radius) kommt vor a (außerhalb des Radius)
            }

            // Zuerst nach Übereinstimmungen sortieren (gelikte und ähnliche Bands)
            const bandMatchDifference = (b.likedArtistsCount + b.mightLikeArtistsCount) - (a.likedArtistsCount + a.mightLikeArtistsCount);

            // Wenn die Übereinstimmungen gleich sind, dann nach Distanz sortieren (innerhalb des Radius)
            if (bandMatchDifference === 0) {
                return a.distance - b.distance;
            }

            return bandMatchDifference;
        });
}

