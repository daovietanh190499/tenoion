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
        apikey: '46a239ec8255b0',
        showGreeting: true,
        distance: localStorage.getItem("scanDistance") ? localStorage.getItem("scanDistance") : 10
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
                this.images = ((res && res.data() && res.data().images) ? res.data().images : [])
            })
        },
        getUserStories() {
            toastedTopCenter.show("Please wait, getting data ...")
            getStories().then(res => {
                let stories = []
                res.forEach(story => {
                    stories.push(story.data())
                })
                toastedTopCenter.clear()
                this.stories = [...this.stories, ...stories]
            })
        },
        getNewsFeed() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    this.geolocation.lat = pos.coords.latitude 
                    this.geolocation.lon = pos.coords.longitude
                    this.getLocation()
                    getNewsfeed(this.geolocation, this.distance)
                    .then(res => {
                        let stories = []
                        res.forEach(story => {
                            stories.push(story.data())
                        })
                        this.newsfeed = [...this.newsfeed, ...stories]
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
                        this.showAdd = this.mySwiper.realIndex !== 3
                        this.showGreeting = this.mySwiper.realIndex === 0
                        this.page = this.mySwiper.realIndex
                    }
                },
            })
        },
        changeSlide(page) {
            this.mySwiper.slideTo(parseInt(page))
        },
        goToEditor(id, isNewsfeed) {
            window.location = "editor.html?" + (id ? ("id=" +id) : "") + (isNewsfeed ? "&newsfeed=true" : "")
        },
        getLocation() {
            fetch(`https://us1.locationiq.com/v1/reverse.php?key=${this.apikey}&lat=${this.geolocation.lat}&lon=${this.geolocation.lon}&format=json`)
            .then(res => res.json())
            .then(res => {
                this.locationName = res.address.state?res.address.state:res.address.city + ", " + res.address.country?res.address.country:""
            })
        },
        deleteStory(story) {
            deleteStoryById(story).then(res => {
                if(res) toastedBottomCenter.show("Success delete story")
                else toastedBottomCenter.show("Something wrong happen")
                window.location = "index.html"
            })
        },
        saveDistance() {
            localStorage.setItem("scanDistance", this.distance)
        }
    },
    mounted() {
        (!localStorage.getItem("scanDistance") || localStorage.getItem("scanDistance").length == 0) ? localStorage.setItem("scanDistance", 10) : {}
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