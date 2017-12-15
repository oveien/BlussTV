var data = JSON.stringify({
    data: {
        homeTeam: {
            name: 'BK Tromsø',
            logo: '/graphics/logo/bktromso.svg',
            sets: 2,
            points: 24,
        },
        awayTeam: {
            name: 'Tif Viking',
            logo: '/graphics/logo/viking.svg',
            sets: 1,
            points: 23,
        },
    },
});

function play(str) {
    update(str);
    $('.dialog').fadeIn();
}

var oldObject = null;
function update(str) {
    var obj = JSON.parse(str);

    var data = obj.data;

    // Same data, return:
    if (JSON.stringify(data) === JSON.stringify(oldObject)) {
        return;
    }

    oldObject = data;

    if (!data) {
        return;
    }

    console.log(data.homeTeam);

    var htInfo = $('<div>')
        .html(data.homeTeam.name)
        .html();
    var atInfo = $('<div>')
        .html(data.awayTeam.name)
        .html();

    $('#homeTeamName').html('');
    $('#awayTeamName').html('');

    document.getElementById('homeTeamLogo').src = data.homeTeam.logo;
    document.getElementById('awayTeamLogo').src = data.awayTeam.logo;

    $('#homeTeamName').append(data.homeTeam.name);
    $('#awayTeamName').append(data.awayTeam.name);

    $('#homeTeamSets').html(data.homeTeam.sets);
    $('#awayTeamSets').html(data.awayTeam.sets);

    $('#homeTeamPoints').html(data.homeTeam.points);
    $('#awayTeamPoints').html(data.awayTeam.points);

    // We might want to show previous sets:
    if (
        (data.homeTeam.sets > 0 || data.awayTeam.sets > 0) &&
        (data.homeTeam.points + data.awayTeam.points) % 10 == 0
    ) {
        $('.sb-previous-set').remove();
        for (var i = 0; i < data.homeTeam.sets + data.awayTeam.sets; i++) {
            var elm = $('<div>')
                .html(data.homeTeam.pointsSets[i])
                .addClass('sb-previous-set');
            elm.insertBefore($('#homeTeamPoints'));

            elm = $('<div>')
                .html(data.awayTeam.pointsSets[i])
                .addClass('sb-previous-set');
            elm.insertBefore($('#awayTeamPoints'));
        }

        $('.sb-previous-set').css(
            'borderRight',
            '1px solid rgba(150, 150, 150, 0.7)',
        );
        $('.sb-previous-set').animate({
            width: '40px',
            maxWidth: '40px',
            paddingLeft: '5px',
            paddingRight: '5px',
        });

        setTimeout(function() {
            $('.sb-previous-set').animate(
                { width: '0', maxWidth: '0', padding: 0 },
                function() {
                    $(this).css('borderRight', 'none');
                },
            );
        }, 10000);
    }

    // Blæh, team names:
    var tl1 = $('#homeTeamName').width();
    var tl2 = $('#awayTeamName').width();

    if (tl1 < tl2) {
        $('#homeTeamName').css('width', tl2);
    } else {
        $('#awayTeamName').css('width', tl1);
    }
}

function remove() {
    // Animate away to the bottom:
    $('.dialog').fadeOut();
}

/*

setTimeout(function () {
    update(data);
}, 2);
*/
play(data);
