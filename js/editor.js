const vueApp = new Vue({
  el: '#root',
  data: { 
    id: uuidv4(),
    geolocation: {
      lat: 0,
      lon: 0
    },
    location: "--.--",
    datetime: "--.--",
    weather: "wi-cloudy",
    weatherCode: "731",
    queryObject: {},
    content: [],
    quill: null,
    apikey: 'ec3f58b9a7e093e62faa053dedbb16bc',
    uploading: "needuploading.svg",
    isPublic: false,
    text: "",
    images: []
  },
  methods : {
    getQueryObject() {
      var search = location.search.substring(1);
      let object = {}
      if(search && search.length !== 0)
        object = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })
      this.queryObject = object
    },
    initData() {
      if(this.queryObject.id && this.queryObject.id.length !== 0) {
        this.id = this.queryObject.id
        getStoriesById(this.id).then(res => {
          let data = res.exists ? res.data() : {}
          this.geolocation.lat = data.geolocation.lat
          this.geolocation.lon = data.geolocation.lon
          this.location = data.location
          this.datetime = data.datetime
          this.weather = data.weather
          this.content = JSON.parse(JSON.stringify(data.content))
          if(this.quill) this.setQuillContent()
          this.uploading = data.uploading
          this.isPublic = data.isPublic
          this.text = data.text
          this.weatherCode = data.weatherCode
        })
      }
    },
    getLocationAndDatetime() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          this.geolocation.lat = pos.coords.latitude 
          this.geolocation.lon = pos.coords.longitude
          this.fetchWeather()
        });
      }
      this.datetime = moment().format('HH:mm DD/MMMM/YYYY');
    },
    fetchWeather() {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${this.geolocation.lat}&lon=${this.geolocation.lon}&appid=${this.apikey}`)
      .then(res => res.json())
      .then(res => {
        var prefix = 'wi-';
        var code = res.weather[0].id;
        var icon = icons[code].icon;
        if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
          icon = 'day-' + icon;
        }
        this.weatherCode = code;
        this.weather = prefix + icon;
        this.location = res.name;
      })
    },
    initQuillEditor() {
      this.quill = new Quill('#editor', {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            ['image', 'blockquote'],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }]
          ]
        },
        placeholder: 'Write something ...',
        theme: 'bubble'
      });
    },
    setQuillContent() {
      this.quill.setContents(JSON.parse(JSON.stringify(this.content)))
    },
    listenTextChange() {
      let data = this.quill.getContents()
      this.content = data.ops
      this.quill.on('text-change', (eventName) => {
        this.uploading = "needuploading.svg"
        let data = this.quill.getContents()
        this.text = this.quill.getText()
        this.content = data.ops
      });
    },
    uploadAllImage(){
      this.uploading = "uploading.gif"
      let dataImageUpload = this.content.map(ele => {
        if(ele.insert.image && ele.insert.image.includes("data:")) {
          return uploadImage(ele.insert.image).then(res => {
            return {insert : {image: res}, attributes: ele.attributes}
          })
        } else {
          return ele
        }
      })
      return Promise.all(dataImageUpload).then(res => {
        this.content = res
        this.setQuillContent()
        let images = []
        for(let i = 0; i < this.content.length; i ++) {
          if(this.content[i].insert.image) images.push(this.content[i].insert.image)
        }
        this.images = images
      })
    },
    uploadStory(message) {
      if(this.content.length > 1 || (this.content.length == 1 && this.content[0].insert.trim() !== "")) {
        this.uploadAllImage().then(res => {
          let story = this.prepareData() 
          uploadOneStory(story, JSON.parse(JSON.stringify(this.images))).then(res => {
            if(res) {
              this.uploading = "uploadingdone.svg"
              toastedBottomCenter.show(message ? message : "upload successfully!")
            }
            else {
              this.uploading = 'needuploading.svg'
              toastedBottomCenter.show("something wrong happen!")
            }
          })
        })
      } else {
        toastedBottomCenter.show("Content is empty!")
      }
    },
    prepareData() {
      let object = {}
      object['id'] = this.id
      object['geolocation'] = {lat: this.geolocation.lat, lon: this.geolocation.lon}
      object['location'] = this.location
      object['datetime'] = this.datetime
      object['weather'] = this.weather
      object['content'] = JSON.parse(JSON.stringify(this.content))
      object['uploading'] = "uploadingdone.svg"
      object['isPublic'] = this.isPublic
      object['text'] = this.text
      object['weatherCode'] = this.weatherCode
      return object
    },
    disableContextMenu() {
      window.oncontextmenu = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      };
    },
    publicStory() {
      this.isPublic = !this.isPublic
      this.uploadStory((this.isPublic ? "Public" : "Unpublic") + "story successfully!")
    }
  },
  mounted() {
    checkUserSignIn().then(res => {
      if (!res) {
          window.location = "login.html";
      }
    })
    this.getQueryObject()
    this.initData()
    if(!this.queryObject.id || this.queryObject.id.length == 0) this.getLocationAndDatetime()
    this.initQuillEditor()
    this.setQuillContent()
    this.listenTextChange()
    this.disableContextMenu()
  }
})