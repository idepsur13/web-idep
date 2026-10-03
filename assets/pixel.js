/* =====================================================================
   IDEP · Píxel de Meta (Facebook) · ID 1376010187844881
   Se carga de forma asíncrona: si Facebook no responde, la página igual se ve.
   No se dispara en localhost ni en el dominio de pruebas .pages.dev.
   ===================================================================== */
(function(){
  'use strict';
  try{
    var h = window.location.hostname;
    var enPruebas =
      h === '' || h === 'localhost' || h === '127.0.0.1' || h === '::1' ||
      /(^|\.)pages\.dev$/.test(h) ||   // dominio temporal de Cloudflare Pages
      /\.local$/.test(h);              // red local
    if(enPruebas){ return; }

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '1376010187844881');
    fbq('track', 'PageView');
  }catch(e){
    /* Si algo falla, se ignora: la página nunca debe romperse por el píxel. */
    if(window.console && console.warn){ console.warn('Píxel de Meta no cargado', e); }
  }
})();
