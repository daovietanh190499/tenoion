const vueApp = new Vue({
    el: '#root',
    data: function () {
        return {
            email: "",
            emailError: false,
            emailBlur: ""
        }
    },
    methods: {
        forgotPasswordDefault() {
            let check = true;
            if(this.email.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                check = false
                this.emailError = true
            }
            if(!check) return check

            toastedTopCenter.show("Pending send email ...")
            onForgotPasswordButtonPress(this.email).then(res => {
                toastedTopCenter.clear()
                toastedBottomCenter.show(res ? 
                    'Email successfully send to your email! Please check your email' : 
                    'Something wrong happen !'
                )
            })
        },
        focusEmail() {this.emailError = false},
        blurEmail() {this.emailBlur = this.email.trim() != ""},
    },
    mounted () {
        checkUserSignIn().then(res => {
            if(res) {
                window.location = "index.html";
            }
        })
    }
})