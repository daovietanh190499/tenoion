var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
    

    },
};

app.initialize();

function onPageChange(cb) {
    $('input[type=radio][name=tab]').change(function() {
        cb(parseInt(this.value))
    });
}

function onLogout () {
    $("#logout").click(() => {
        toastedTopCenter.show("Pending logout ...")
        onSignOutButtonPress().then(res => {
            if(res) window.location = "login.html"
            toastedTopCenter.clear()
        })
    })
}

function onHomePageClick() {
    
}

function changePage(number) {
    $("#tab-" + number).prop("checked", true);
}

var mySwiper = new Swiper ('.swiper-container', {
    direction: 'horizontal',
    loop: true,
    on: {
        init: function () {
            console.log('swiper initialized');
        },
        slideChange: function () {
            console.log('slide change', this.realIndex);
            changePage(this.realIndex)
        }
    },
})

onPageChange((page) => {
    mySwiper.slideTo(page + 1)
})

onLogout()

checkUserSignIn().then(res => {
    if(!res) {
        window.location = "login.html";
    }
})