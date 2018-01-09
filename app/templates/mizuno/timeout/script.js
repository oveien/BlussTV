var data = JSON.stringify({
    data: {
        homeTeam: { name: 'TIF Viking', logo: '/graphics/logo/viking.svg' },
        awayTeam: { name: 'BK Tromsø', logo: '/graphics/logo/bktromso.svg' },
        gameType: 'beach-volleyball',
        who: 'home',
    },
});

function fillTeam(team) {
    document.getElementById('teamLogo').src = team.logo;
    document.getElementById('teamName').innerHTML = team.name;
}

function play(str) {
    var data = JSON.parse(str).data;

    if (data.who == 'home') {
        fillTeam(data.homeTeam);
    } else if (data.who == 'away') {
        fillTeam(data.awayTeam);
    }

    $('.timeout-container').velocity(
        { height: 55, opacity: 1 },
        { duration: 300 }
    );
    $('.fade-in').velocity({ opacity: 1 }, { duration: 300, delay: 300 });
}

function remove(callback) {
    $('.fade-in').velocity({ opacity: 0 }, { duration: 300 });
    $('.timeout-container').velocity(
        { height: 0, opacity: 0 },
        { duration: 300, delay: 300 }
    );
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(data);
    }, 2);
}
