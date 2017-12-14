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
    document.getElementById('guest-team-logo').src = data.awayTeam.logo;

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
        html += `
          <div class="dialog-row-container">
              <div class="generic-row team-number">${
                  data.homeTeam[statTypes[i].key]
              }</div>
              <div class="generic-row secondary-row stat-description">${
                  statTypes[i].name
              }</div>
              <div class="generic-row team-number">${
                  data.awayTeam[statTypes[i].key]
              }</div>
          </div>
        `.replace(/  /g, ' ');
        console.log(html);
    }

    html += `
      <div class="dialog-row-container total-row">
          <div class="generic-row team-number">${data.homeTeam.total}</div>
          <div class="generic-row secondary-row stat-description stat-purple">Totalt</div>
          <div class="generic-row team-number">${data.awayTeam.total}</div>
      </div>
    `;
    console.log(html);

    $('.dialog-body .wrapper').append(html);
    //defaultTeamCompareAnimate();
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
                        logo: '/graphics/logo/bktromso.svg',
                        name: 'BK Tromsø',
                        blocks: 3,
                        attack: 4,
                        ace: 1,
                        opponentErrors: 3,
                        total: 10,
                    },
                    awayTeam: {
                        logo: '/graphics/logo/viking.svg',
                        name: 'TIF Viking',
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
