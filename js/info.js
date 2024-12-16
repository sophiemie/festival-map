// Aktualisiert die Sidebar mit Festival-Informationen
function updateSidebar(festival) {
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
        bandsList.appendChild(li);
    });

    initializeCalendar(date);

    document.getElementById('festival-sidebar').style.display = 'block';
}


function initializeCalendar(date) {
    const [startDate, endDate] = date.split(' to ');
    const calendarContainer = document.getElementById('festival-calendar');
    calendarContainer.innerHTML = '';

    flatpickr(calendarContainer, {
        inline: true,
        mode: 'range',
        defaultDate: [startDate, endDate],
        clickOpens: false,
    });
}

export{ updateSidebar };