var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


function defaultTeamCompareAnimate (callback) {
    $('.dialog').css('width', window.headingWidth);

    $('.wrapper').css('width', rowWidth);
    $('.dialog-row-container').css({
        'transform': 'translateX(' + rowWidth/2 + 'px)',
        width: 0
    });

    $('.dialog-row').css({
        'transform': 'translateX(-' + rowWidth/2 + 'px)',
    });


    $('.dialog-heading-container').css({
        'transform': 'translateX(' + window.headingWidth/2 + 'px)',
        width: 0
    });

    $('.dialog-heading').css({
        'transform': 'translateX(-' + window.headingWidth/2 + 'px)',
    });

    anime({
        targets: '.dialog-heading-container',
        translateX: 0,
        width: window.headingWidth,
        easing: 'easeInOutCubic'
    });

    anime({
        targets: '.dialog-heading',
        translateX: 0,
        easing: 'easeInOutCubic'
    });

    anime({
        targets: '.dialog-row-container',
        translateX: 0,
        width: rowWidth,
        easing: 'easeInOutCubic',
        delay: function(el, i, l) {
            return 200 + (i * 100);
        },
    });

    anime({
        targets: '.dialog-row',
        translateX: 0,
        easing: 'easeInOutCubic',
        delay: function(el, i, l) {
            return 200 + (i * 100);
        },
    });

}

function defaultTeamCompareAnimateClose (callback) {
    anime({
        targets: '.dialog-heading-container',
        translateX: window.headingWidth/2,
        width: 0,
        easing: 'easeInOutCubic'
    });

    anime({
        targets: '.dialog-heading',
        translateX: -(window.headingWidth/2),
        easing: 'easeInOutCubic'
    });


    anime({
        targets: '.dialog-row-container',
        translateX: rowWidth/2,
        width: 0,
        easing: 'easeInOutCubic',
        delay: function(el, i, l) {
            return 200 + (i * 100);
        },
    });

    anime({
        targets: '.dialog-row',
        translateX: -(rowWidth/2),
        easing: 'easeInOutCubic',
        delay: function(el, i, l) {
            return 200 + (i * 100);
        },
    });
}