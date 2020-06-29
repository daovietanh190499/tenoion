const vueApp = new Vue({
    el: '#root',
    data: { 
        user: {
            photoURL: "",
            displayName: "--.--",
            email: "--.--"
        }
    },
    methods: {
        onLogout() {
            toastedTopCenter.show("Pending logout ...")
            onSignOutButtonPress().then(res => {
                if (res) window.location = "login.html"
                toastedTopCenter.clear()
            })
        }
    },
    mounted() {
        checkUserSignIn().then(res => {
            if (!res) {
                window.location = "login.html";
            }
            this.user = getCurrentUserProfile()
        })

        var colc = new Colcade(".grid", {
            columns: '.grid-col',
            items: '.grid-item'
        });

        var mySwiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: false,
            on: {
                slideChange: function () {
                    $("#tab-" + this.realIndex).prop("checked", true);
                }
            },
        })

        $('input[type=radio][name=tab]').change(function () {
            mySwiper.slideTo(parseInt(this.value))
        });
    },
    updated() {
        console.log("update")
    }
})