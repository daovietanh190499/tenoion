const vueApp = new Vue({
    el: '#root',
    data: { 
        user: {
            photoURL: "",
            displayName: "--.--",
            email: "--.--"
        },
        geolocation: {
            lat: 0,
            lon: 0
        },
        images: [],
        showAdd: "block",
        mySwiper: null,
        page: 0,
        stories: [],
        newsfeed: [],
        locationName: "Hanoi, Vietnam",
        apikey: '46a239ec8255b0'
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
                this.images = ((res && res.data()) ? res.data().images : [])
            })
        },
        getUserStories() {
            getStories().then(res => {
                let stories = []
                res.forEach(story => {
                    stories.push(story.data())
                })
                this.stories = stories
            })
        },
        getNewsFeed() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    this.geolocation.lat = pos.coords.latitude 
                    this.geolocation.lon = pos.coords.longitude
                    this.getLocation()
                    getNewsfeed(this.geolocation)
                    .then(res => {
                        let stories = []
                        res.forEach(story => {
                            stories.push(story.data())
                        })
                        this.newsfeed = stories
                        console.log(this.newsfeed)
                    })
                });
            }
        },
        initSwiper() {
            this.mySwiper = new Swiper('.swiper-container', {
                direction: 'horizontal',
                loop: false,
                on: {
                    slideChange:() => {
                        if(this.mySwiper.realIndex === 3) {
                            this.showAdd = false
                        }
                        else this.showAdd = true
                        this.page = this.mySwiper.realIndex
                    }
                },
            })
        },
        changeSlide(page) {
            this.mySwiper.slideTo(parseInt(page))
        },
        goToEditor(id, isNewsfeed) {
            window.location = "editor.html?id=" + id + (isNewsfeed ? "&newfeed=true" : "")
        },
        getLocation() {
            fetch(`https://us1.locationiq.com/v1/reverse.php?key=${this.apikey}&lat=${this.geolocation.lat}&lon=${this.geolocation.lon}&format=json`)
            .then(res => res.json())
            .then(res => {
                this.locationName = res.address.state + ", " + res.address.country
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
        this.initSwiper()
        this.getAllUserImages()
        this.getUserStories()
        this.getNewsFeed()
    }
})