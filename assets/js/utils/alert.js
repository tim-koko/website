export default function() {

  var announcement = document.getElementById('announcement');
  console.log(announcement);
  if (announcement !== null) {

    var id = 'tk_cookie_notice'; //announcement.dataset.id;

    if (localStorage.getItem(id) === 'closed') {
      announcement.remove();
      return;
    }
    /*
    Object.keys(localStorage).forEach(function(key) {
      if (/^global-alert-/.test(key)) {
        if (key !== id ) {
          localStorage.removeItem(key);
          document.documentElement.removeAttribute('data-global-alert');
        }
      } else {
    });*/

    announcement.addEventListener('closed.bs.alert', () => {
      localStorage.setItem(id, 'closed');
    });

  }
}