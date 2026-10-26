// Chrome y Edge exponen la API con el prefijo "webkit"; otros navegadores,
// sin prefijo. Se usa la que exista. Si ninguna existe, el valor es undefined.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;




if (!SpeechRecognition) {
  const statusText = document.getElementById('statusText');

  if (statusText) {
    statusText.textContent =
      "El navegador no admite reconocimiento de voz. Usa los controles alternativos.";          //Muestra aviso en la pagina
  } else {
    alert("Tu navegador no soporta la Web Speech API. Prueba con Chrome o Edge.");
  } 
    }else {
  // Se crea el objeto que se encargará de escuchar y transcribir.
  const recognition = new SpeechRecognition();

  // Idioma esperado del habla: español de España.
  recognition.lang = 'es-ES';
  // true: sigue escuchando tras cada frase, hasta que se llame a stop().
  // false (por defecto) pararía solo después de la primera frase.
  recognition.continuous = true;
  // false: solo se reciben resultados finales, no las transcripciones parciales.
  recognition.interimResults = false;

  // Se guardan referencias a los elementos del HTML con los que se va a trabajar.
  const btnStart = document.getElementById('btnStart');
  const statusText = document.getElementById('statusText');
  const commandText = document.getElementById('commandText');

  // Variable de control para saber si el micrófono está activo ahora mismo.
  let isListening = false;

  // El botón alterna entre iniciar y detener la escucha.
  // start() debe llamarse tras una acción del usuario: así el navegador
  // puede pedir el permiso del micrófono.
  btnStart.addEventListener('click', () => {
    if (!isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  });

  // Se dispara cuando el navegador empieza a escuchar de verdad.
  // Aquí se actualiza la interfaz para reflejar el nuevo estado.
  recognition.onstart = () => {
    isListening = true;
    statusText.textContent = "Estado: Escuchando...";
    btnStart.textContent = "Detener Micrófono";
  };

  // Se dispara siempre que la escucha termina: por stop(), por un error
  // o porque el navegador la cierra. Se restaura la interfaz al estado inicial.
  recognition.onend = () => {
    isListening = false;
    statusText.textContent = "Estado: Inactivo";
    btnStart.textContent = "Activar Micrófono";
  };

  // Se dispara cada vez que el servicio reconoce una frase.
  recognition.onresult = (event) => {
    // Con continuous = true, event.results acumula todas las frases de la sesión.
    // La que acaba de llegar es la última de la lista.
    const lastIndex = event.results.length - 1;

    // [lastIndex] es el resultado y [0] su mejor alternativa (la más probable).
    // trim() quita espacios sobrantes y toLowerCase() pasa a minúsculas
    // para que "Rojo" y "rojo" se traten igual.
    const transcript = event.results[lastIndex][0].transcript.trim().toLowerCase();

    // Se muestra en pantalla lo que se ha entendido.
    commandText.textContent = transcript;

    let respuesta = "";  //variable para almacenar la respuesta



    // Se busca una palabra clave dentro de la frase y se aplica la acción.
    // includes() permite que funcione con frases como "pon el fondo en rojo".
    // Si no coincide ningún comando, no se cambia nada.
    if (transcript.includes('rojo')) {
      document.body.style.backgroundColor = '#f8d7da';
      respuesta = "Has puesto el fondo rojo"
    } else if (transcript.includes('verde')) {
      document.body.style.backgroundColor = '#d4edda';
      respuesta = "Has puesto el fondo verde"
    } else if (transcript.includes('azul')) {
      document.body.style.backgroundColor = '#cce5ff';
      respuesta = "Has puesto el fondo azul"
    } else if (transcript.includes('restablecer') || transcript.includes('blanco')) {
      document.body.style.backgroundColor = '#ffffff';
      respuesta = "Has restablecido el fondo"
    }else if(transcript.includes('más pequeño')){
        document.body.style.fontSize= '2em'
        respuesta = "Has puesto el texto pequeño"
    }else if(transcript.includes('más grande')){
        document.body.style.fontSize= '20em' 
         respuesta = "Has puesto el texto grande"           //Aqui añado los comandos de voz para que hagan sus respectivas funcionalidades
    }else if(transcript.includes('modo oscuro')){
        document.body.style.backgroundColor = '#000000'    //También guardo dentro de respuesta cada caso
         respuesta = "Has puesto el modo oscuro"
    }else if(transcript.includes('modo claro')){
        document.body.style.backgroundColor = '#ffffff'
         respuesta = "Has puesto el modo claro"
    }else{
        respuesta = "No se ha reconocido la respuesta"
    }

    statusText.textContent = respuesta;                 //Imprime la respuesta

    const mensaje = new SpeechSynthesisUtterance(respuesta);
    respuesta.lang = "es-ES";                                       //Lee la respuesta en voz alta
    window.SpeechSynthesis.speak(mensaje);


    
  };

  // Se dispara si algo falla (permiso denegado, sin micrófono, sin red...).
  // event.error contiene el código, por ejemplo "not-allowed" o "no-speech".
  // Después del error, el navegador lanza también "end".
  recognition.onerror = (event) => {
    console.error("Error en el reconocimiento de voz:", event.error);
    statusText.textContent = "Error: " + event.error;
  };
}