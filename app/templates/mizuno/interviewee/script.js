function play(str) {
    var data = JSON.parse(str).data;

    document.getElementById('name').innerHTML = data.name1;
    document.getElementById('role').innerHTML = data.role1;

    console.log(data);

    if (data.logo1) {
        document.getElementById('teamLogo').src = data.logo1;
    }
    else {
        $('.interviewee-logo-container').hide();
    }

    var rowWidth = 720;
    if (typeof (data.name2) != 'undefined') {
        rowWidth = 650;
        document.getElementById('name2').innerHTML = data.name2;
        document.getElementById('role2').innerHTML = data.role2;
        if (data.logo2) {
            document.getElementById('teamLogo2').src = data.logo2;
        }
        else {
            $('.interviewee-logo-container2').hide();
        }
    }
    else {
        $('.interviewee-container2').hide();
    }

    const duration = 300;

    $('.generic-row').velocity(
        { height: 55, width: rowWidth },
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
