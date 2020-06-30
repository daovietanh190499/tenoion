const vueApp = new Vue({
    el: '#root',
    data: function () {
        return {
            email: "",
            password: "",
            emailError: false,
            passwordError: false,
            showArlert: "alert-validate",
            passwordBlur: "",
            emailBlur: ""
        }
    },
    methods: {
        loginGoogle() {
            toastedTopCenter.show("Pending login ...")
            onGoogleButtonPress().then(res => {
                if(res) window.location = 'index.html'
                else window.location = "login.html"
                toastedTopCenter.clear()
            })
        },
        loginFacebook() {
            toastedTopCenter.show("Pending login ...")
            onFacebookButtonPress().then(res => {
                if(res) window.location = 'index.html'
                else window.location = "login.html"
                toastedTopCenter.clear()
            })
        },
        loginDefault() {
            let check = true;
            if(this.password.trim() == '') {
                check = false
                this.passwordError = true
            }
            if(this.email.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                check = false
                this.emailError = true
            }
            if(!check) return check

            toastedTopCenter.show("Pending login ...")
            console.log(this.email, this.password)
            onLoginButtonPress({email: this.email, password: this.password}).then(res => {
                if(res) window.location = 'index.html'
                else window.location = "login.html"
                toastedTopCenter.clear()
            })
        },
        focusEmail() {this.emailError = false},
        focusPassword() {this.passwordError = false},
        blurEmail() {this.emailBlur = this.email.trim() != ""},
        blurPassword() {this.passwordBlur = this.password.trim() != ""}
    },
    mounted () {
        checkUserSignIn().then(res => {
            if(res) {
                window.location = "index.html";
            }
        })
    }
})