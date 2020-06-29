const vueApp = new Vue({
    el: '#root',
    data: function () {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            emailError: false,
            passwordError: false,
            confirmPasswordError: false
        }
    },
    methods: {
        loginGoogle() {
            toastedTopCenter.show("Pending login ...")
            onGoogleButtonPress().then(res => {
                if(res) window.location = 'index.html'
                else window.location = "register.html"
                toastedTopCenter.clear()
            })
        },
        loginFacebook() {
            toastedTopCenter.show("Pending login ...")
            onFacebookButtonPress().then(res => {
                if(res) window.location = 'index.html'
                else window.location = "register.html"
                toastedTopCenter.clear()
            })
        },
        registerDefault() {
            let check = true;
            if(this.password.trim() == '') {
                check = false
                this.passwordError = true
            }
            if(this.confirmPassword.trim() == '' || this.confirmPassword.trim() !== this.password.trim()) {
                check = false
                this.confirmPasswordError = true
            }
            if(this.email.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                check = false
                this.emailError = true
            }
            if(!check) return check

            toastedTopCenter.show("Pending login ...")
            console.log(this.email, this.password)
            onSignUpButtonPress({email: this.email, password: this.password}).then(res => {
                if(res) window.location = 'index.html'
                else window.location = "register.html"
                toastedTopCenter.clear()
            })
        },
        focusEmail() {this.emailError = false},
        focusPassword() {this.passwordError = false},
        focusConfirmPassword() {this.confirmPasswordError = false}
    },
    mounted () {
        checkUserSignIn().then(res => {
            if(res) {
                window.location = "index.html";
            }
        })
    }
})