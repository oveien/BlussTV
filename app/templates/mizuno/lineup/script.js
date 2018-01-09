var data = JSON.stringify({
    data: {
        name: 'TIF Viking',
        logo: '/graphics/logo/viking.svg',
        jersey: {
            player: 'red',
            libero: 'black',
        },
        players: [
            {
                name: 'Vegar Løkken',
                number: 5,
            },
            {
                name: 'Henrik Skogen',
                number: 3,
            },
            {
                name: 'Øystein Veien',
                number: 1,
            },
            {
                name: 'Espen Mokkelbost',
                number: 2,
            },
            {
                name: 'Rune Hamnes',
                number: 4,
            },
            {
                name: 'Morten Lillehagen',
                number: 10,
            },
            {
                name: 'Simen Henriksveen',
                number: 7,
            },
        ],
    },
});

function lastName(fullName) {
    const names = fullName.split(' ');
    return names[names.length - 1];
}

function renderPlayer(player, index) {
    document.getElementById('player-' + (index + 1)).innerHTML = `
    <div class="player">
      <div class="player-number">${player.number}</div>
      <div class="player-name">${lastName(player.name)}</div>
    </div>
  `;
}

function play(str) {
    var data = JSON.parse(str).data;

    if (!data) {
        return;
    }

    document.getElementById('teamName').innerHTML = data.name;
    document.getElementById('teamLogo').src = data.logo;

    data.players.forEach(renderPlayer);

    $('.court-background').velocity({ marginTop: 200 }, { duration: 300 });
}

function remove() {
    $('.court-background').velocity({ marginTop: 1100 }, { duration: 300 });
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(data);
    }, 2);
}
