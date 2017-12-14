function play(str) {
    var data = JSON.parse(str).data;
    document.getElementById('out-number').innerHTML = data.playerOut.number;
    document.getElementById('out-name').innerHTML = data.playerOut.name;
    document.getElementById('in-number').innerHTML = data.playerIn.number;
    document.getElementById('in-name').innerHTML = data.playerIn.name;
    document.getElementById('logo').src = data.team.logo;
}

function remove(str) {}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    playerIn: {
                        name: 'Øystein Veien',
                        number: 14,
                    },
                    playerOut: {
                        name: 'Sindre Svendby',
                        number: 8,
                    },
                    team: {
                        name: 'TIF Viking',
                        logo: '/graphics/logo/viking.svg',
                    },
                },
            }),
        );
    }, 50);
}
