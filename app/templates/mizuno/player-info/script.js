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

function play(str) {
    var data = JSON.parse(str).data;

    console.log(data);

    document.getElementById('name').innerHTML = shortenName(data.name);
    document.getElementById('role').innerHTML = data.team.name;
    document.getElementById('teamLogo').src = data.team.logo;

    document.getElementById('playerNumber').innerHTML = data.number;

    // TODO: This will have to wait until we have statistics.
    /*if (data.team.logo) {
    $('.interviewee-logo').css('background-src', 'url(' + data.team.logo + ')');
  }

  if (parseInt(data.birthyear)) {
    $('#interviewee-age').html('Fødselsår: ' + parseInt(data.birthyear));
  }
  if (data.height) {
    $('#interviewee-height').html('Høyde: ' + data.height);
  }
  if (data.reach) {
    $('#interviewee-reach').html('Rekkevidde: ' + data.reach);
  }

  if (typeof data.blocks != 'undefined') {
    $('#interviewee-stats-blocks').html('Blokk: ' + data.blocks);
  }

  if (typeof data.attack != 'undefined') {
    $('#interviewee-stats-attack').html('Angrep: ' + data.attack);
  }

  if (typeof data.ace != 'undefined') {
    $('#interviewee-stats-ace').html('Serve-ess: ' + data.ace);
  }

  if (typeof data.ace != 'undefined') {
    $('#interviewee-stats-total').html(
      'Totalt: ' +
        (parseInt(data.ace) + parseInt(data.attack) + parseInt(data.blocks)),
    );
  }*/

    $('.interviewee-container').velocity(
        { height: 110, opacity: 1 },
        { duration: 300 }
    );
    $('.interviewee-logo-container').velocity(
        { height: 110 },
        { duration: 300 }
    );

    $('.fade-in').velocity({ opacity: 1 }, { duration: 300, delay: 300 });
}

function remove(callback) {
    $('.fade-in').velocity({ opacity: 0 }, { duration: 300 });
    $('.interviewee-container').velocity(
        { height: 0, opacity: 0 },
        { duration: 300, delay: 200 }
    );
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    name: 'Øystein Veien',
                    team: {
                        name: 'Blussuvoll',
                        logo: '/graphics/logo/blussuvoll.svg',
                    },
                    number: 14,
                    blocks: 0,
                    attack: 0,
                    ace: 0,
                    total: 0,
                    birthyear: 1983,
                    image: '../beach-team/player1.png',
                },
            })
        );
    }, 50);
}
