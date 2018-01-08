function createStatRow(player) {
    return `
    <div class="stat-row">
      <div class="stat-row-container-left">
        <div class="stat-row-number">${player.number}</div>
        <div class="stat-row-name">${player.name}</div>
      </div>
      <div class="stat-row-container-right">
        <div class="stat-row-stat">${player.blocks}</div>
        <div class="stat-row-stat">${player.attack}</div>
        <div class="stat-row-stat">${player.ace}</div>
        <div class="stat-row-stat text-bold">${player.total}</div>
      </div>
    </div>
    `;
}

function play(str) {
    var data = JSON.parse(str).data;

    console.log(data);

    const homeTeamStats = data.stats
        .filter(function(stat) {
            return Object.keys(stat).includes('homeTeam');
        })
        .map(function(stat) {
            return stat.homeTeam;
        });

    const guestTeamStats = data.stats
        .filter(function(stat) {
            return Object.keys(stat).includes('awayTeam');
        })
        .map(function(stat) {
            return stat.awayTeam;
        });

    console.log('homeTeamStats:', homeTeamStats);
    console.log('guestTeamStats:', guestTeamStats);

    document.getElementById('homeTeamSetName').innerHTML = 'Set 3 Statistics';
    document.getElementById('homeTeamLogo').src = data.homeTeam.logo;
    document.getElementById('homeTeamName').innerHTML = data.homeTeam.name;
    document.getElementById('homeTeamRows').innerHTML = homeTeamStats
        .map(createStatRow)
        .join('');

    document.getElementById('guestTeamSetName').innerHTML = 'Set 3 Statistics';
    document.getElementById('guestTeamLogo').src = data.awayTeam.logo;
    document.getElementById('guestTeamName').innerHTML = data.awayTeam.name;
    document.getElementById('guestTeamRows').innerHTML = guestTeamStats
        .map(createStatRow)
        .join('');

    // add set Number for both home team and guest team

    // add home team name

    // add home team logo

    // add guest team name

    // add guest team logo

    // add home team players

    // add guest team players
}

function remove(str) {
    defaultTeamCompareAnimateClose();
}

if (getUrlParameter('debug')) {
    const mockData = {
        data: {
            homeTeam: {
                logo: '/graphics/logo/ntnui.svg',
                name: 'NTNUI',
            },
            awayTeam: {
                logo: '/graphics/logo/viking.svg',
                name: 'TIF Viking',
            },
            stats: [
                {
                    homeTeam: {
                        name: 'Jon Arnesen',
                        number: 1,
                        blocks: 1,
                        attack: 8,
                        ace: 0,
                        total: 9,
                    },
                },
                {
                    homeTeam: {
                        name: 'Kim Holmen',
                        number: 10,
                        blocks: 0,
                        attack: 4,
                        ace: 0,
                        total: 4,
                    },
                },
                {
                    homeTeam: {
                        name: 'Ivar Loland Råheim',
                        number: 14,
                        blocks: 2,
                        attack: 0,
                        ace: 0,
                        total: 2,
                    },
                },
                {
                    homeTeam: {
                        name: 'Sjur Føyen',
                        number: 2,
                        blocks: 2,
                        attack: 0,
                        ace: 0,
                        total: 2,
                    },
                },
                {
                    homeTeam: {
                        name: 'Rune Hamnes',
                        number: 6,
                        blocks: 0,
                        attack: 1,
                        ace: 0,
                        total: 1,
                    },
                },

                {
                    awayTeam: {
                        name: 'Vetle Hylland',
                        number: 18,
                        blocks: 2,
                        attack: 4,
                        ace: 2,
                        total: 8,
                    },
                },
                {
                    awayTeam: {
                        name: 'Kristian Mjelde Bjelland',
                        number: 10,
                        blocks: 0,
                        attack: 5,
                        ace: 0,
                        total: 5,
                    },
                },
                {
                    awayTeam: {
                        name: 'Sjur Sekse Kvam',
                        number: 14,
                        blocks: 0,
                        attack: 2,
                        ace: 1,
                        total: 3,
                    },
                },
                {
                    awayTeam: {
                        name: 'Anders Nedland Røneid',
                        number: 6,
                        blocks: 0,
                        attack: 2,
                        ace: 0,
                        total: 2,
                    },
                },
                {
                    awayTeam: {
                        name: 'Yngve Sundfjord',
                        number: 16,
                        blocks: 1,
                        attack: 0,
                        ace: 0,
                        total: 1,
                    },
                },
                {
                    awayTeam: {
                        name: 'Jonas Langlo',
                        number: 7,
                        blocks: 0,
                        attack: 0,
                        ace: 1,
                        total: 1,
                    },
                },
            ],
        },
    };

    setTimeout(function() {
        play(JSON.stringify(mockData));
    }, 10);
}
