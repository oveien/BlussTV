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
}

function remove(callback) {}

if (getUrlParameter('debug')) {
  setTimeout(function() {
    play(data);
  }, 2);
}
