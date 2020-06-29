const vueApp = new Vue({
  el: '#root',
  data: { 
    queryObject: {}
  },
  methods : {

  },
  mounted() {
    var quill = new Quill('#editor', {
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
    var search = location.search.substring(1);
    let object = {}
    if(search && search.length !== 0)
      object = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })
    this.queryObject = object
    window.oncontextmenu = function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
  }
})