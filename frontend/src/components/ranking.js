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

    rankingList.forEach(({
                             festival, percentage, likedArtistsCount, mightLikeArtistsCount
                         }, index) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <strong>${index + 1}. ${festival}</strong> - ${percentage.toFixed(1)}%<br>
            <span>🎵 Number of artists you like: <strong>${likedArtistsCount}</strong></span><br>
            <span>⭐ Number of artists you might like: <strong>${mightLikeArtistsCount}</strong></span>
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
    const userBands = new Set(Object.keys(selectedBands)); // Direkt ausgewählte Bands
    const similarBands = new Set(Object.values(selectedBands).flat()); // Ähnliche Bands
    const allUserBands = new Set([...userBands, ...similarBands]);

    return festivals.map(festival => {
        const festivalBands = new Set(festival.bands);
        const likedArtists = [...userBands].filter(band => festivalBands.has(band)); // Übereinstimmende Hauptbands
        const mightLikeArtists = [...similarBands].filter(band => festivalBands.has(band)); // Übereinstimmende ähnliche Bands

        const percentage = ((likedArtists.length + mightLikeArtists.length) / festivalBands.size) * 100;

        return {
            festival: festival.name,
            percentage,
            likedArtistsCount: likedArtists.length,
            mightLikeArtistsCount: mightLikeArtists.length
        };
    }).sort((a, b) => b.percentage - a.percentage);
}
