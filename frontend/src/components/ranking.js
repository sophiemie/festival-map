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
    if (existingSidebar) existingSidebar.remove();

    const sidebar = document.createElement('div');
    sidebar.id = 'ranking-sidebar';
    sidebar.classList.add('ranking-sidebar');

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.classList.add('close-sidebar');
    closeButton.addEventListener('click', () => sidebar.remove());

    const title = document.createElement('h2');
    title.textContent = 'Festival Ranking';

    const festivals = await fetchFestivals();
    const selectedBands = await fetchSelectedBands();

    const rankingList = calculateFestivalRanking(festivals, selectedBands);

    const rankingContainer = document.createElement('ul');
    rankingContainer.classList.add('ranking-list');
    rankingList.forEach(({ festival, percentage }) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${festival}</strong> - ${percentage.toFixed(1)}%`;
        rankingContainer.appendChild(item);
    });

    sidebar.appendChild(closeButton);
    sidebar.appendChild(title);
    sidebar.appendChild(rankingContainer);
    document.body.appendChild(sidebar);
}

function calculateFestivalRanking(festivals, selectedBands) {
    const userBands = new Set(Object.keys(selectedBands)); // Hauptbands
    const similarBands = new Set(Object.values(selectedBands).flat()); // Ähnliche Bands
    const allUserBands = new Set([...userBands, ...similarBands]);

    return festivals.map(festival => {
        const festivalBands = new Set(festival.bands);
        const matchingBands = [...allUserBands].filter(band => festivalBands.has(band));
        const percentage = festivalBands.size > 0
            ? (matchingBands.length / festivalBands.size) * 100
            : 0;

        return { festival: festival.name, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
}
