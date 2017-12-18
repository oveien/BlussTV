function shortName(fullName) {
  const names = fullName.split(' ');
  return names[names.length - 1];
}

function play(str) {
  var data = JSON.parse(str).data;
  console.log('sub data', data);
  document.getElementById('out-number').innerHTML = data.playerOut.number;
  document.getElementById('out-name').innerHTML = shortName(
    data.playerOut.name,
  );
  document.getElementById('in-number').innerHTML = data.playerIn.number;
  document.getElementById('in-name').innerHTML = shortName(data.playerIn.name);
  document.getElementById('logo').src = data.team.logo;

  // handle animation
  $('.top-description').velocity({ opacity: 1 }, { duration: 200 });
  $('.sub-content').velocity({ height: 114 }, { duration: 200 });
  $('.logo-container').velocity({ height: 114 }, { duration: 200 });
  $('.fade-in').velocity({ opacity: 1 }, { duration: 300, delay: 300 });
  $('.bottom-border').velocity({ opacity: 1 }, { duration: 300, delay: 300 });
}

function remove(str) {
  $('.top-description').velocity({ opacity: 0 }, { duration: 200, delay: 100 });
  $('.sub-content').velocity({ height: 0 }, { duration: 200, delay: 100 });
  $('.logo-container').velocity({ height: 0 }, { duration: 200, delay: 100 });
  $('.fade-in').velocity({ opacity: 0 }, { duration: 100 });
  $('.bottom-border').velocity({ opacity: 0 }, { duration: 100 });
}

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
