// Runs before styles to restore the saved appearance without a light-mode flash.
// Keep this small bootstrap aligned with theme-preferences.mjs.
(()=>{
 let preference='light';
 try{const saved=localStorage.getItem('horizon-archive-pre-list-heading-removal-20261013-theme-v1');if(['light','dark','system'].includes(saved))preference=saved;}catch{}
 const dark=preference==='dark'||preference==='system'&&typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches;
 document.documentElement.dataset.themePreference=preference;
 document.documentElement.dataset.theme=dark?'dark':'light';
})();
