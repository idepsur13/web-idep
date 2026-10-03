/* =====================================================================
   IDEP · Formulario de contacto
   ===================================================================== */

/* #####################################################################
   ##                                                                 ##
   ##   PEGUE AQUÍ SU CLAVE DE WEB3FORMS                              ##
   ##                                                                 ##
   ##   1. Entre a  https://web3forms.com                             ##
   ##   2. Escriba  info@idepsur.org  y pida la clave (Access Key).   ##
   ##   3. Le llega un correo con una clave larga, algo como:         ##
   ##      a1b2c3d4-5678-90ab-cdef-1234567890ab                       ##
   ##   4. Cópiela y péguela AQUÍ ABAJO, entre las comillas,          ##
   ##      reemplazando el texto PEGUE-AQUI-SU-CLAVE.                 ##
   ##                                                                 ##
   ##   Mientras no esté puesta, el formulario avisa al visitante     ##
   ##   que escriba directamente a info@idepsur.org.                  ##
   ##                                                                 ##
   ##################################################################### */

var CLAVE_WEB3FORMS = 'PEGUE-AQUI-SU-CLAVE';

/* ===================================================================== */

(function(){
  'use strict';

  var form = document.getElementById('formContacto');
  if(!form){ return; }

  var aviso  = document.getElementById('avisoForm');
  var boton  = document.getElementById('btnEnviar');
  var trampa = document.getElementById('sitioweb');

  function decir(texto, tipo){
    if(!aviso){ return; }
    aviso.textContent = texto;
    aviso.className = 'aviso-form' + (tipo ? ' ' + tipo : '');
  }

  function valor(id){
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function correoValido(c){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var nombre  = valor('nombre');
    var correo  = valor('correo');
    var mensaje = valor('mensaje');
    var acepto  = document.getElementById('acepto');

    /* --- Validación --- */
    if(!nombre){            decir('Por favor escriba su nombre.', 'error'); return; }
    if(!correo){            decir('Por favor escriba su correo electrónico.', 'error'); return; }
    if(!correoValido(correo)){ decir('Ese correo no parece válido. Revíselo, por favor.', 'error'); return; }
    if(!mensaje){           decir('Por favor escriba su mensaje.', 'error'); return; }
    if(mensaje.length < 10){ decir('El mensaje es muy corto. Cuéntenos un poco más.', 'error'); return; }
    if(acepto && !acepto.checked){
      decir('Para enviarnos el mensaje debe aceptar la política de privacidad.', 'error'); return;
    }

    /* --- Campo trampa: si viene relleno, es un robot. Se descarta en silencio. --- */
    if(trampa && trampa.value !== ''){
      decir('Mensaje enviado. Gracias por escribirnos.', 'ok');
      form.reset();
      return;
    }

    /* --- Clave sin configurar --- */
    if(!CLAVE_WEB3FORMS || CLAVE_WEB3FORMS === 'PEGUE-AQUI-SU-CLAVE'){
      decir('El envío automático todavía no está activado. Por favor escríbanos directamente a info@idepsur.org.', 'error');
      if(window.console && console.warn){
        console.warn('Falta la clave de Web3Forms en assets/formulario.js');
      }
      return;
    }

    /* --- Envío --- */
    var textoBoton = boton ? boton.textContent : '';
    if(boton){ boton.disabled = true; boton.textContent = 'Enviando…'; }
    decir('Enviando su mensaje…', '');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: CLAVE_WEB3FORMS,
        subject: 'Nuevo mensaje desde idepsur.org',
        from_name: 'Sitio web del IDEP',
        'Nombre': nombre,
        'Correo electrónico': correo,
        'Mensaje': mensaje,
        replyto: correo
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(datos){
      if(datos && datos.success){
        decir('Mensaje enviado. Gracias por escribirnos: le responderemos al correo que nos dejó.', 'ok');
        form.reset();
      }else{
        decir('No pudimos enviar el mensaje. Inténtelo de nuevo o escríbanos a info@idepsur.org.', 'error');
      }
    })
    .catch(function(){
      decir('No pudimos enviar el mensaje. Revise su conexión, o escríbanos a info@idepsur.org.', 'error');
    })
    .then(function(){
      if(boton){ boton.disabled = false; boton.textContent = textoBoton; }
    });
  });
})();
