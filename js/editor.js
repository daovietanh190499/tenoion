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
window.oncontextmenu = function (event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};