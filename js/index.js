const vueApp = new Vue({
    el: '#root',
    data: { 
        user: {
            photoURL: "",
            displayName: "--.--",
            email: "--.--"
        },
        images: []
    },
    methods: {
        onLogout() {
            toastedTopCenter.show("Pending logout ...")
            onSignOutButtonPress().then(res => {
                if (res) window.location = "login.html"
                toastedTopCenter.clear()
            })
        },
        getAllUserImages() {
            getUserImages().then(res => {
                this.images = res.data().images
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

        this.getAllUserImages()
    },
    updated() {
        
    }
})