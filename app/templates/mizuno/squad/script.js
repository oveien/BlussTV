var data = JSON.stringify({
    data: {
        name: 'NTNUI',
        logo: '/graphics/NTNUI/logo.jpg',
        players: [
            {
                number: 1,
                name: 'Rune Hamnes',
                height: 191,
                reach: '340',
                position: 'Midt',
                id: 127,
            },
            {
                number: 2,
                name: 'Morten Lillehagen',
                height: 203,
                position: 'Kant',
                reach: '340',
                id: 54,
            },
            {
                number: 3,
                name: 'Simen Henriksveen',
                height: 187,
                position: 'libero',
                reach: '340',
                id: 135,
            },
            {
                number: 4,
                name: 'Espen Mokkelbost',
                height: 180,
                position: 'Opplegger',
                reach: '340',
                id: 241,
            },
            {
                number: 1,
                name: 'Vegar Løkken',
                height: 191,
                reach: '340',
                position: 'Midt',
                id: 127,
            },
            {
                number: 2,
                name: 'Cato S',
                height: 203,
                position: 'Kant',
                reach: '340',
                id: 54,
            },
            {
                number: 3,
                name: 'Jon Vegar Berntsen',
                height: 187,
                position: 'Libero',
                reach: '340',
                id: 135,
            },
            {
                number: 4,
                name: 'Jånn',
                height: 180,
                position: 'Kant',
                reach: '340',
                id: 241,
            },
            {
                number: 1,
                name: 'Vegar Løkken',
                height: 191,
                reach: '340',
                position: 'Midt',
                id: 127,
            },
            {
                number: 1,
                name: 'Vegar Løkken',
                height: 191,
                reach: '340',
                position: 'Midt',
                id: 127,
            },
            {
                number: 1,
                name: 'Vegar Løkken',
                height: 191,
                reach: '340',
                position: 'Midt',
                id: 127,
            },
            {
                number: 2,
                name: 'Cato S',
                height: 203,
                position: 'Kant',
                reach: '340',
                id: 54,
            },
            {
                number: 3,
                name: 'Jon Vegar Berntsen',
                height: 187,
                position: 'Libero',
                reach: '340',
                id: 135,
            },
            {
                number: 4,
                name: 'Jånn',
                height: 180,
                position: 'Kant',
                reach: '340',
                id: 241,
            },
        ],
    },
});

function shortenName(fullName) {
    const names = fullName.split(' ');
    if (names.length < 3) {
        return fullName;
    }

    const fixedNames = names.map((name, i) => {
        if (i === 0 || i === names.length - 1) {
            return name;
        }
        return name[0] + '.';
    });

    return fixedNames.join(' ');
}

function isLibero(player) {
    return player.position && player.position.toLowerCase() === 'libero';
}

function sortByNumber(a, b) {
    if (isLibero(a)) {
        return 1;
    }

    if (isLibero(b)) {
        return -1;
    }
    return parseInt(a.number) - parseInt(b.number);
}

function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('squadName').innerHTML = data.name;
    document.getElementById('squadLogo').src = data.logo;

    var players = data.players.sort(sortByNumber);

    const playersHtml = players.map(
        (player) => `
      <div class="squad-player">
        <div class="squad-player-number fade-in">${player.number}</div>
        <div class="squad-player-name fade-in">${shortenName(player.name)}</div>
        <div class="squad-player-position ${
            isLibero(player) ? 'libero' : ''
        }"><div class="fade-in">${player.position}</div></div>
      </div>
    `
    );

    document.getElementById('squadContent').innerHTML = playersHtml.join('');

    $('.squad-header-container').velocity(
        { width: '100%', opacity: 1 },
        { duration: 300 }
    );
    $('.squad-player').velocity(
        { height: 48, opacity: 1 },
        { duration: 300, delay: 200 }
    );

    $('.fade-in').velocity({ opacity: 1 }, { delay: 500, duration: 300 });
}

function remove(callback) {
    $('.fade-in').velocity({ opacity: 0 }, { duration: 200 });

    $('.squad-header-container').velocity(
        { width: 0, opacity: 0 },
        { duration: 200 }
    );
    $('.squad-player').velocity(
        { height: 0, opacity: 0 },
        { duration: 200, delay: 200 }
    );
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(data);
    }, 2);

    setTimeout(remove, 5000);
}
