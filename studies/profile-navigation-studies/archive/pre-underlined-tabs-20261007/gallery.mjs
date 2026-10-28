const button=document.querySelector('#theme');
button.addEventListener('click',()=>{
  const dark=document.documentElement.dataset.theme!=='dark';
  document.documentElement.dataset.theme=dark?'dark':'light';
  button.setAttribute('aria-pressed',String(dark));
  button.setAttribute('aria-label',dark?'Activer le thème clair':'Activer le thème sombre');
});
