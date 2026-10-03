/* =====================================================================
   IDEP · Comportamiento compartido.
   Menú desplegable (mockup-menu.html), cabecera al desplazar,
   año del pie, aparición de secciones, parallax y formulario.
   ===================================================================== */
(function(){
  'use strict';

  function seguro(fn, nombre){
    try{ fn(); }catch(e){
      if(window.console && console.warn){ console.warn('Fallo en ' + nombre, e); }
    }
  }

  /* ---------- Menú desplegable ---------- */
  seguro(function(){
    var btn    = document.getElementById('btnMenu');
    var panel  = document.getElementById('panel');
    var velo   = document.getElementById('velo');
    var cerrar = document.getElementById('btnCerrar');
    if(!btn || !panel || !velo || !cerrar){ return; }

    var ultimoFoco = null;

    function abrir(){
      ultimoFoco = document.activeElement;
      panel.classList.add('on');
      velo.classList.add('on');
      btn.classList.add('abierto');
      btn.setAttribute('aria-expanded','true');
      btn.setAttribute('aria-label','Cerrar menú');
      document.body.style.overflow = 'hidden';
      cerrar.focus();
    }
    function cerrarMenu(){
      panel.classList.remove('on');
      velo.classList.remove('on');
      btn.classList.remove('abierto');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-label','Abrir menú');
      document.body.style.overflow = '';
      if(ultimoFoco && ultimoFoco.focus){ ultimoFoco.focus(); }
    }
    function abierto(){ return panel.classList.contains('on'); }

    btn.addEventListener('click', function(){ abierto() ? cerrarMenu() : abrir(); });
    cerrar.addEventListener('click', cerrarMenu);
    velo.addEventListener('click', cerrarMenu);           /* tocar fuera */

    document.addEventListener('keydown', function(e){      /* Escape */
      if((e.key === 'Escape' || e.key === 'Esc') && abierto()){ cerrarMenu(); }
    });

    panel.addEventListener('click', function(e){           /* elegir sección */
      var a = e.target.closest ? e.target.closest('a') : null;
      if(a){ cerrarMenu(); }
    });

    /* El foco no se escapa del panel mientras está abierto */
    panel.addEventListener('keydown', function(e){
      if(e.key !== 'Tab' || !abierto()){ return; }
      var foco = panel.querySelectorAll('a[href], button:not([disabled])');
      if(!foco.length){ return; }
      var primero = foco[0], ultimo = foco[foco.length - 1];
      if(e.shiftKey && document.activeElement === primero){ e.preventDefault(); ultimo.focus(); }
      else if(!e.shiftKey && document.activeElement === ultimo){ e.preventDefault(); primero.focus(); }
    });
  }, 'menu');

  /* ---------- Cabecera al desplazar ----------
     El umbral es el alto real de la barra de apoyo, medido en cada
     comprobación: la barra ocupa una línea o dos según el ancho (60px u
     103px), así que un número fijo dejaría la cabecera cambiando de color
     antes o después de que la barra termine de salir de la pantalla. */
  seguro(function(){
    var cab = document.getElementById('cabecera');
    if(!cab){ return; }
    var barra = document.querySelector('.barra-apoyo');
    var marcar = function(){
      var umbral = barra ? barra.offsetHeight : 44;
      if(window.scrollY >= umbral){ cab.classList.add('fija'); }
      else { cab.classList.remove('fija'); }
    };
    marcar();
    window.addEventListener('scroll', marcar, {passive:true});
    window.addEventListener('resize', marcar, {passive:true});
  }, 'cabecera');

  /* ---------- Submenú desplegable de escritorio ----------
     Al salir el cursor de un título o de su panel, espera 250ms antes
     de cerrar: así no se cierra si el cursor cruza el espacio entre el
     título y el panel de camino a él. */
  seguro(function(){
    var items = document.querySelectorAll('.nav-item');
    if(!items.length){ return; }
    items.forEach(function(item){
      var temporizador = null;
      var abrir = function(){
        if(temporizador){ clearTimeout(temporizador); temporizador = null; }
        item.classList.add('abierto-panel');
      };
      var cerrarConDemora = function(){
        if(temporizador){ clearTimeout(temporizador); }
        temporizador = setTimeout(function(){ item.classList.remove('abierto-panel'); }, 250);
      };
      item.addEventListener('mouseenter', abrir);
      item.addEventListener('mouseleave', cerrarConDemora);
      item.addEventListener('focusin', abrir);
      item.addEventListener('focusout', function(e){
        if(!item.contains(e.relatedTarget)){ cerrarConDemora(); }
      });
    });
  }, 'navDesk');

  /* ---------- Año del pie ---------- */
  seguro(function(){
    var el = document.getElementById('anio');
    if(el){ el.textContent = new Date().getFullYear(); }
  }, 'anio');

  /* ---------- Aparición al desplazar, con red de seguridad ---------- */
  seguro(function(){
    var items = document.querySelectorAll('.rv');
    if(!items.length){ return; }
    var mostrarTodo = function(){
      for(var i=0;i<items.length;i++){ items[i].classList.add('on'); }
    };
    if(!('IntersectionObserver' in window)){ mostrarTodo(); return; }
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('on'); obs.unobserve(en.target); }
      });
    }, {threshold:0.05, rootMargin:'0px 0px -40px 0px'});
    for(var i=0;i<items.length;i++){ obs.observe(items[i]); }
    setTimeout(mostrarTodo, 6000);
  }, 'reveal');

  /* ---------- Paquetes de aporte: aparición escalonada ----------
     Cada tarjeta aparece (fade + zoom desde scale .95) 100ms después de la
     anterior, mediante IntersectionObserver. El retraso se aplica con
     setTimeout (no con transition-delay) para que el hover posterior no
     herede la demora. Respeta prefers-reduced-motion. */
  seguro(function(){
    var items = document.querySelectorAll('.paquete');
    if(!items.length){ return; }
    var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mostrarTodo = function(){
      for(var i=0;i<items.length;i++){ items[i].classList.add('paquete-in'); }
    };
    if(reducido || !('IntersectionObserver' in window)){ mostrarTodo(); return; }
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){
        if(en.isIntersecting){
          var idx = Array.prototype.indexOf.call(items, en.target);
          setTimeout(function(t){ return function(){ t.classList.add('paquete-in'); }; }(en.target), Math.max(0, idx) * 100);
          obs.unobserve(en.target);
        }
      });
    }, {threshold:0.15});
    for(var i=0;i<items.length;i++){ obs.observe(items[i]); }
    setTimeout(mostrarTodo, 6000);
  }, 'paquetesFade');

  /* ---------- Valores institucionales: aparición escalonada ----------
     Las tres tarjetas de símbolos aparecen (fade + zoom desde scale .9)
     80ms después de la anterior. Mismo patrón que los paquetes: retraso
     con setTimeout para no ensuciar el hover, red de seguridad a los 6s y
     respeto a prefers-reduced-motion. */
  seguro(function(){
    var items = document.querySelectorAll('.valor');
    if(!items.length){ return; }
    var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mostrarTodo = function(){
      for(var i=0;i<items.length;i++){ items[i].classList.add('valor-in'); }
    };
    if(reducido || !('IntersectionObserver' in window)){ mostrarTodo(); return; }
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){
        if(en.isIntersecting){
          var idx = Array.prototype.indexOf.call(items, en.target);
          setTimeout(function(t){ return function(){ t.classList.add('valor-in'); }; }(en.target), Math.max(0, idx) * 80);
          obs.unobserve(en.target);
        }
      });
    }, {threshold:0.15});
    for(var i=0;i<items.length;i++){ obs.observe(items[i]); }
    setTimeout(mostrarTodo, 6000);
  }, 'valoresFade');

  /* ---------- Parallax suave de la portada ----------
     Solo escritorio (min-width:1024px); en celular queda desactivado
     y sin transform alguno. */
  seguro(function(){
    var img = document.getElementById('portadaFondo');
    if(!img){ return; }
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){ return; }
    if(!(window.matchMedia && window.matchMedia)){ return; }
    var escritorio = window.matchMedia('(min-width:1024px)');
    var pendiente = false;
    var mover = function(){
      if(!escritorio.matches){ pendiente = false; return; }
      var y = window.scrollY;
      if(y < 900){ img.style.transform = 'translateY(' + (y * 0.16) + 'px) scale(1.06)'; }
      pendiente = false;
    };
    window.addEventListener('scroll', function(){
      if(!escritorio.matches){ return; }
      if(!pendiente){ pendiente = true; window.requestAnimationFrame(mover); }
    }, {passive:true});
    var alCambiarAncho = function(){
      if(!escritorio.matches){ img.style.transform = ''; }
      else { mover(); }
    };
    if(escritorio.addEventListener){ escritorio.addEventListener('change', alCambiarAncho); }
    else if(escritorio.addListener){ escritorio.addListener(alCambiarAncho); }
    alCambiarAncho();
  }, 'parallax');

  /* ---------- Formulario de contacto ----------
     Por ahora abre el programa de correo del visitante.
     Cuando se confirme un servicio de formularios, se reemplaza aquí. */
  seguro(function(){
    var form  = document.getElementById('formContacto');
    var aviso = document.getElementById('avisoForm');
    if(!form){ return; }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var n = document.getElementById('nombre').value.trim();
      var c = document.getElementById('correo').value.trim();
      var m = document.getElementById('mensaje').value.trim();
      if(!n || !c || !m){
        if(aviso){ aviso.textContent = 'Por favor complete nombre, correo y mensaje.'; }
        return;
      }
      var cuerpo = 'Nombre: ' + n + '\nCorreo: ' + c + '\n\n' + m;
      window.location.href = 'mailto:info@idepsur.org?subject=' +
        encodeURIComponent('Contacto desde idepsur.org') +
        '&body=' + encodeURIComponent(cuerpo);
      if(aviso){ aviso.textContent = 'Se abrirá su programa de correo para enviar el mensaje.'; }
    });
  }, 'formulario');
})();
