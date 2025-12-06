export default function() {

  const forms = document.querySelectorAll('form');

  if (forms.length === 0) {
    return;
  }

const handleSubmit = (event) => {
  event.preventDefault();

  const myForm = event.target;
  const formData = new FormData(myForm);
  
  //console.log(formData);
  //console.log(new URLSearchParams(formData).toString());


  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString(),
  })
    
    .then(response => {

      if (response.ok) {
        myForm.classList.add('d-none');
        document.querySelector('.message-success').classList.remove('d-none');
        document.querySelector('.message-error').classList.add('d-none');
        
      }else{
        document.querySelector('.message-success').classList.add('d-none');
        document.querySelector('.message-error').classList.remove('d-none');
        throw Error(response.statusText);
        }
    })
    .catch((error) => alert(error));
};



if (forms.length > 0) {
  forms.forEach(form => {
    form.addEventListener('submit', handleSubmit);
  });
}
}