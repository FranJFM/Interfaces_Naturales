const btnVoz = document.getElementById("btnVoz");
const estado = document.getElementById("estado");
const mensaje = document.getElementById("mensaje");
const listaUl = document.getElementById("lista");
const inputProducto = document.getElementById("inputProducto");
const btnAnadir = document.getElementById("btnAnadir");
const btnQuitar = document.getElementById("btnQuitar");
const btnVaciar = document.getElementById("btnVaciar");


// Se carga lo que hubiera guardado en la lista ,si no hay nada empieza vacia
let lista = JSON.parse(localStorage.getItem("listaCompra")) || [];

function guardarLista() {
  localStorage.setItem("listaCompra", JSON.stringify(lista));
}

// Dibuja la lista en pantalla.
function mostrarLista() {
  listaUl.innerHTML = "";
  if (lista.length === 0) {
    listaUl.innerHTML = "<li>La lista está vacía.</li>";
    return;
  }
  for (let i = 0; i < lista.length; i++) {
    const li = document.createElement("li");
    li.textContent = lista[i];
    listaUl.appendChild(li);
  }
}


function responder(texto) {
  mensaje.textContent = texto;

  if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  }
}

// Acciones sobre la lista
function anadirProducto(producto) {
  if (!producto) {
    responder("No he entendido qué producto quieres añadir.");
    return;
  }
  if (lista.includes(producto)) {
    responder(producto + " ya está en la lista.");
    return;
  }
  lista.push(producto);
  guardarLista();
  mostrarLista();
  responder("He añadido " + producto + ".");
}

function quitarProducto(producto) {
  if (!producto) {
    responder("No he entendido qué producto quieres quitar.");
    return;
  }
  const posicion = lista.indexOf(producto);
  // Caso limite cuando el producto no esta en la lista
  if (posicion === -1) {
    responder(producto + " no está en la lista.");
    return;
  }
  lista.splice(posicion, 1);
  guardarLista();
  mostrarLista();
  responder("He quitado " + producto + ".");
}

function vaciarLista() {
  lista = [];
  guardarLista();
  mostrarLista();
  responder("He vaciado la lista.");
}

// Interpreta la frase dicha
function interpretarFrase(frase) {
  if (frase.startsWith("añade ")) {
    anadirProducto(frase.replace("añade ", "").trim());
  } else if (frase.startsWith("quita ")) {
    quitarProducto(frase.replace("quita ", "").trim());
  } else if (frase.includes("vacía") || frase.includes("vaciar")) {
    vaciarLista();
  } else {
    // Caso limite cuando no corresponde a ninguna
    responder("No he entendido la frase: " + frase);
  }
}

// Alternativa sin voz
btnAnadir.addEventListener("click", () => {
  anadirProducto(inputProducto.value.trim().toLowerCase());
  inputProducto.value = "";
});

btnQuitar.addEventListener("click", () => {
  quitarProducto(inputProducto.value.trim().toLowerCase());
  inputProducto.value = "";
});

btnVaciar.addEventListener("click", () => {
  vaciarLista();
});

// reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// se dibuja la lista nada mas cargar la pagina 
mostrarLista();

if (!SpeechRecognition) {
  // Caso líimite cuando el navegador no es compatible
  estado.textContent = "Estado: Sin soporte";
  mensaje.textContent = "Tu navegador no soporta el reconocimiento de voz. Usa el campo de texto y los botones.";
  btnVoz.disabled = true;
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = false;      
  recognition.interimResults = false;  
  recognition.maxAlternatives = 1;

  // Mensajes de error
  const errores = {
    "not-allowed": "Has denegado el permiso del micrófono. Usa el campo de texto y los botones.",
    "no-speech": "No he oído nada. Pulsa el micrófono e inténtalo de nuevo.",
    "audio-capture": "No se pudo capturar el audio. Comprueba tu micrófono.",
    "network": "Hay un problema de red con el servicio de reconocimiento."
  };

  // start() se llama despues del clic para pedir permiso
  btnVoz.addEventListener("click", () => {
    recognition.start();
  });

  recognition.onstart = () => {
    estado.textContent = "Estado: Escuchando...";
    btnVoz.disabled = true; 
  };

  recognition.onend = () => {
    estado.textContent = "Estado: Inactivo";
    btnVoz.disabled = false;
  };

  recognition.onresult = (event) => {
    const frase = event.results[0][0].transcript.trim().toLowerCase();
    interpretarFrase(frase);
  };

  recognition.onerror = (event) => {
    console.error("Error en el reconocimiento de voz:", event.error);
    mensaje.textContent = errores[event.error] || ("Error: " + event.error);
  };
}