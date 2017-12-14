function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('name').innerHTML = data.name;
    document.getElementById('role').innerHTML = data.role;

    const duration = 300;

    $('.generic-row').velocity(
        { height: 55, width: 720 },
        { duration: duration },
    );
    $('.interviewee-container').velocity(
        { opacity: 1, height: 110 },
        { duration: duration },
    );
    $('.text').velocity({ opacity: 1 }, { delay: 250 });
}

function remove(str) {
    $('.generic-row').velocity({ height: 0 });
    $('.interviewee-container').velocity({ opacity: 0, height: 0 });
    $('.text').velocity({ opacity: 0 });
}

if (getUrlParameter('debug')) {
    setTimeout(function() {
        play(
            JSON.stringify({
                data: {
                    name: 'Øystein Veien',
                    role: 'Trener Blussuvoll',
                },
            }),
        );
    }, 50);
    setTimeout(remove, 2000);
}
