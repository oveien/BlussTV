function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('homeTeamLogo').src = data.homeTeam.logo;
    document.getElementById('homeTeamName').innerHTML = data.homeTeam.name;

    document.getElementById('awayTeamLogo').src = data.awayTeam.logo;
    document.getElementById('awayTeamName').innerHTML = data.awayTeam.name;

    $('.tp-container').velocity({ height: 100, opacity: 1 });
    $('.fade-in').velocity({ opacity: 1 }, { delay: 300 });
}

function remove(str) {
    $('.fade-in').velocity({ opacity: 0 });
    $('.tp-container').velocity({ height: 0, opacity: 0 }, { delay: 300 });
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    homeTeam: {
                        logo: '/graphics/logo/bktromso.svg',
                        name: 'BK Tromsø',
                    },
                    awayTeam: {
                        logo: '/graphics/logo/viking.svg',
                        name: 'TIF Viking',
                    },
                },
            })
        );
    }, 10);
}
