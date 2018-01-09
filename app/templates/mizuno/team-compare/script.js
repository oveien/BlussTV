const duration = 200;

function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('home-team-name').innerHTML = data.homeTeam.name;
    document.getElementById('home-team-logo').src = data.homeTeam.logo;
    document.getElementById('guest-team-name').innerHTML = data.awayTeam.name;
    document.getElementById('guest-team-logo').src = data.awayTeam.logo;

    var headLine = 'Totalstatistikk';
    if (data.type == 'set') {
        headLine = 'Statistikk ' + data.set + '. sett';
    }
    document.getElementById('dialog-heading').innerHTML = headLine;

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
          <div class="generic-row team-number"><div class="text">${
              data.homeTeam[statType.key]
          }</div></div>
          <div class="generic-row secondary-row stat-description">
            <div class="text">${statType.name}</div></div>
          <div class="generic-row team-number"><div class="text">${
              data.awayTeam[statType.key]
          }</div></div>
      </div>`;
    });

    const totalRow = `
      <div class="dialog-row-container total-row">
          <div class="generic-row team-number"><div class="text">${
              data.homeTeam.total
          }</div></div>
          <div class="generic-row secondary-row stat-description stat-purple">
            <div class="text">Totalt</div>
          </div>
          <div class="generic-row team-number">
            <div class="text">${data.awayTeam.total}</div>
          </div>
      </div>
    `;

    $('#stats-table').html('');
    const html = rows.join('') + totalRow;
    $('.dialog-body .wrapper').append(html);
    //defaultTeamCompareAnimate();

    $('.dialog-heading-container').velocity(
        { width: 780, opacity: 1 },
        { duration: duration, delay: 0 }
    );

    $('.dialog-row-container').velocity(
        { height: 55, opacity: 1 },
        { duration: duration, delay: 200 }
    );
    $('.text').velocity({ opacity: 1 }, { delay: 400, duration: duration });
}

function remove(str) {
    console.log('calling remove');
    $('.dialog-heading-container').velocity(
        { width: 0, opacity: 0 },
        { duration: duration, delay: 0 }
    );

    $('.dialog-row-container').velocity(
        { height: 0, opacity: 0 },
        { duration: duration }
    );
    $('.text').velocity({ opacity: 0 }, { duration: duration });
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    type: 'set',
                    set: '2',
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
            })
        );
    }, 500);
    setTimeout(remove, 5000);
}
