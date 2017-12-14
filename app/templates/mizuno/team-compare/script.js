function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('home-team-name').innerHTML = data.homeTeam.name;
    document.getElementById('home-team-logo').src = data.homeTeam.logo;
    document.getElementById('guest-team-name').innerHTML = data.awayTeam.name;
    document.getElementById('guest-team-logo').src = data.awayTeam.logo;

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

    const rows = statTypes.map(function(statType) {
        return `<div class="dialog-row-container">
          <div class="generic-row team-number">${
              data.homeTeam[statType.key]
          }</div>
          <div class="generic-row secondary-row stat-description">${
              statType.name
          }</div>
          <div class="generic-row team-number">${
              data.awayTeam[statType.key]
          }</div>
      </div>`;
    });

    const totalRow = `
      <div class="dialog-row-container total-row">
          <div class="generic-row team-number">${data.homeTeam.total}</div>
          <div class="generic-row secondary-row stat-description stat-purple">Totalt</div>
          <div class="generic-row team-number">${data.awayTeam.total}</div>
      </div>
    `;

    $('#stats-table').html('');
    const html = rows.join('') + totalRow;
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
