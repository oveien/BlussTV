function play(str) {
    var data = JSON.parse(str);

    var data = data.data;
    console.log(data);
    console.log(data.stats);
    var ht = $('#homeTeam');
    ht.find('.team-name').html(data.homeTeam.name);
    document.getElementById('home-team-logo').src = data.homeTeam.logo;

    var at = $('#awayTeam');
    at.find('.team-name').html(data.awayTeam.name);
    at.find('.team-logo img').attr('src', data.awayTeam.logo);

    $('#stats-table').html('');

    var statTypes = [
        {
            name: 'Blokk',
            key: 'blocks',
        },
        {
            name: 'Angrep',
            key: 'attack',
        },
        {
            name: 'Serve-ess',
            key: 'ace',
        },
        {
            name: 'Opp. Err',
            key: 'opponentErrors',
        },
    ];

    var html = '';
    for (var i = 0; i < statTypes.length; i++) {
        html += '<div class="dialog-row-container"><div class="dialog-row">';
        html +=
            '<div class="generic-row team-number">' +
            data.homeTeam[statTypes[i].key] +
            '</div>';
        html +=
            '<div class="generic-row secondary-row stat-description">' +
            statTypes[i].name +
            '</div>';
        html +=
            '<div class="generic-row team-number">' +
            data.awayTeam[statTypes[i].key] +
            '</div>';
        html += '</div></div>';
        console.log(html);
    }

    html +=
        '<div class=\'dialog-row-container\'><div class="dialog-row" style="margin-top: 10px;">';
    html +=
        '<div class="dialog-row-number-column">' +
        data.homeTeam.total +
        '</div>';
    html +=
        '<div class="dialog-row-role dialog-row-double-width-role">Totalt</div>';
    html +=
        '<div class="dialog-row-number-column">' +
        data.awayTeam.total +
        '</div>';
    html += '</div></div>';
    console.log(html);

    $('.dialog-body .wrapper').append(html);

    window.rowWidth = $('.dialog-row-container').width();

    window.headingWidth = $('.dialog-heading').width();

    defaultTeamCompareAnimate();
}

function remove(str) {
    defaultTeamCompareAnimateClose();
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    title: 'STATISTIKK 2. SETT',
                    homeTeam: {
                        logo: '/graphics/logo/ntnui.svg',
                        name: 'NTNUI',
                        blocks: 3,
                        attack: 4,
                        ace: 1,
                        opponentErrors: 3,
                        total: 10,
                    },
                    awayTeam: {
                        logo: '/graphics/lgoo/randaberg.svg',
                        name: 'Randaberg',
                        blocks: 4,
                        attack: 4,
                        ace: 1,
                        opponentErrors: 3,
                        total: 10,
                    },
                },
            }),
        );
    }, 10);
}
