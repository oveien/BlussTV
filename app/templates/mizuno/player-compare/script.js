function shortenName(fullName) {
    const names = fullName.split(' ');
    if (names.length < 3) {
        return fullName;
    }

    const fixedNames = names.map(function(name, i) {
        if (i === 0 || i === names.length - 1) {
            return name;
        }
        return name[0] + '.';
    });

    return fixedNames.join(' ');
}

function shortenNameExtra(name) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return name;
    }

    return `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
}

function createStatRow(player) {
    return `
    <div class="stat-row">
      <div class="stat-row-container-left">
        <div class="stat-row-number fade-in">${player.number}</div>
        <div class="stat-row-name fade-in">${shortenName(player.name)}</div>
      </div>
      <div class="stat-row-container-right">
        <div class="stat-row-stat fade-in">${player.blocks}</div>
        <div class="stat-row-stat fade-in">${player.attack}</div>
        <div class="stat-row-stat fade-in">${player.ace}</div>
        <div class="stat-row-stat text-bold fade-in">${player.total}</div>
      </div>
    </div>
    `;
}

function play(str) {
    var data = JSON.parse(str).data;

    console.log(data);

    const homeTeamStats = data.stats
        .filter(function(stat) {
            return (
                Object.keys(stat).includes('homeTeam') &&
                stat.homeTeam.name !== ''
            );
        })
        .slice(0, 7)
        .map(function(stat) {
            return stat.homeTeam;
        });

    const guestTeamStats = data.stats
        .filter(function(stat) {
            return (
                Object.keys(stat).includes('awayTeam') &&
                stat.awayTeam.name !== ''
            );
        })
        .slice(0, 7)
        .map(function(stat) {
            return stat.awayTeam;
        });

    console.log('homeTeamStats:', homeTeamStats);

    console.log('guestTeamStats:', guestTeamStats);

    var headLine = 'Totalstatistikk';
    if (data.type == 'set') {
        headLine = 'Statistikk ' + data.set + '. sett';
    }

    document.getElementById('homeTeamSetName').innerHTML = headLine;
    document.getElementById('homeTeamLogo').src = data.homeTeam.logo;
    document.getElementById('homeTeamName').innerHTML = data.homeTeam.name;
    document.getElementById('homeTeamRows').innerHTML = homeTeamStats
        .map(createStatRow)
        .join('');

    document.getElementById('guestTeamSetName').innerHTML = headLine;
    document.getElementById('guestTeamLogo').src = data.awayTeam.logo;
    document.getElementById('guestTeamName').innerHTML = data.awayTeam.name;
    document.getElementById('guestTeamRows').innerHTML = guestTeamStats
        .map(createStatRow)
        .join('');

    $('.team-header-container').velocity(
        { opacity: 1, width: '100%' },
        { duration: 300 }
    );
    $('.stat-row').velocity(
        { opacity: 1, height: 48 },
        { duration: 300, delay: 0 }
    );
    $('.team-sub-header').velocity(
        { opacity: 1, height: 32 },
        { duration: 300, delay: 0 }
    );

    $('.fade-in').velocity({ opacity: 1 }, { duration: 300, delay: 300 });
}

function remove(str) {
    $('.fade-in').velocity({ opacity: 0 }, { duration: 300, delay: 0 });

    $('.team-header-container').velocity(
        { opacity: 0, width: 0 },
        { duration: 300, delay: 300 }
    );
    $('.stat-row').velocity(
        { opacity: 0, height: 0 },
        { duration: 300, delay: 300 }
    );
    $('.team-sub-header').velocity(
        { opacity: 0, height: 0 },
        { duration: 300, delay: 300 }
    );
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
