// Inicialización de variables globales
let synth;
let audioContextInitialized = false;
const now = Tone.now();

// Elementos del DOM
const iniciarAudioBtn = document.getElementById('iniciarAudio');
const audioStatus = document.getElementById('audioStatus');
const generarNotasBtn = document.getElementById('generarNotas');
const reproducirOriginalBtn = document.getElementById('reproducirOriginal');
const notasOriginalesDiv = document.getElementById('notasOriginales');
const permutacionesDiv = document.getElementById('permutaciones');
const generarPoesiaBtn = document.getElementById('generarPoesia');
const poesiaDiv = document.getElementById('poesia');

// Inicializar el contexto de audio
document.addEventListener('DOMContentLoaded', () => {
    // Configurar el botón de inicio de audio
    iniciarAudioBtn.addEventListener('click', inicializarAudio);
    
    // Deshabilitar controles hasta que el audio esté inicializado
    deshabilitarControles();
    
    // Generar una secuencia inicial (pero no mostrar hasta que el audio esté listo)
    secuenciaActual = generarSecuenciaAleatoria(4);
    mostrarNotas(secuenciaActual, notasOriginalesDiv);
    
    // Generar permutaciones iniciales (pero no mostrar hasta que el audio esté listo)
    permutacionesActuales = generarPermutaciones(secuenciaActual);
});

function inicializarAudio() {
    // Crear el contexto de audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    
    // Inicializar Tone.js con el contexto de audio
    Tone.setContext(context);
    
    // Crear el sintetizador
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Actualizar el estado
    audioContextInitialized = true;
    
    // Actualizar la interfaz
    iniciarAudioBtn.disabled = true;
    iniciarAudioBtn.textContent = 'Audio Inicializado';
    audioStatus.textContent = 'Audio listo';
    audioStatus.classList.add('activo');
    
    // Habilitar controles
    habilitarControles();
    
    // Mostrar permutaciones ahora que el audio está listo
    mostrarPermutaciones(permutacionesActuales.slice(0, 10));
}

function habilitarControles() {
    // Habilitar botones de ejemplo
    const botonesEjemplo = document.querySelectorAll('.concepto button');
    botonesEjemplo.forEach(boton => {
        boton.disabled = false;
        boton.classList.remove('disabled');
    });
    
    // Habilitar controles principales
    generarNotasBtn.disabled = false;
    generarNotasBtn.classList.remove('disabled');
    reproducirOriginalBtn.disabled = false;
    reproducirOriginalBtn.classList.remove('disabled');
}

function deshabilitarControles() {
    // Deshabilitar botones de ejemplo
    const botonesEjemplo = document.querySelectorAll('.concepto button');
    botonesEjemplo.forEach(boton => {
        boton.disabled = true;
        boton.classList.add('disabled');
    });
    
    // Deshabilitar controles principales
    if (generarNotasBtn && reproducirOriginalBtn) {
        generarNotasBtn.disabled = true;
        generarNotasBtn.classList.add('disabled');
        reproducirOriginalBtn.disabled = true;
        reproducirOriginalBtn.classList.add('disabled');
    }
}

// Notas musicales disponibles
const notasMusicales = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
let secuenciaActual = [];
let permutacionesActuales = [];

// Generar una secuencia aleatoria de notas sin repetición
function generarSecuenciaAleatoria(longitud = 4) {
    // Asegurarse de que la longitud no sea mayor que la cantidad de notas disponibles
    const longitudValida = Math.min(longitud, notasMusicales.length);
    
    // Crear una copia del array de notas para no modificar el original
    const notasDisponibles = [...notasMusicales];
    const secuencia = [];
    
    // Seleccionar notas aleatorias sin repetición
    for (let i = 0; i < longitudValida; i++) {
        const indiceAleatorio = Math.floor(Math.random() * notasDisponibles.length);
        const notaSeleccionada = notasDisponibles.splice(indiceAleatorio, 1)[0];
        secuencia.push(notaSeleccionada);
    }
    
    return secuencia;
}

// Mostrar notas en el DOM
function mostrarNotas(notas, contenedor) {
    contenedor.innerHTML = '';
    notas.forEach((nota, index) => {
        const elementoNota = document.createElement('div');
        elementoNota.className = 'nota';
        elementoNota.textContent = nota;
        elementoNota.addEventListener('click', () => tocarNota(nota));
        contenedor.appendChild(elementoNota);
    });
}

// Reproducir una secuencia de notas
async function reproducirSecuencia(notas) {
    try {
        // Asegurarse de que el contexto de audio esté corriendo
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        // Detener cualquier sonido actual
        synth.releaseAll();
        
        // Crear un nuevo transporte para la secuencia
        Tone.Transport.cancel();
        
        // Programar cada nota con un pequeño retraso
        const tiempoInicio = Tone.now();
        const duracionNota = 0.4; // duración de cada nota en segundos
        const espacioEntreNotas = 0.5; // espacio entre notas en segundos
        
        notas.forEach((nota, i) => {
            const tiempoNota = tiempoInicio + (i * espacioEntreNotas);
            synth.triggerAttackRelease(nota, duracionNota, tiempoNota);
        });
        
        // Iniciar el transporte si no está corriendo
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
        
        return true;
    } catch (error) {
        console.error('Error al reproducir secuencia:', error);
        alert('Error al reproducir la secuencia. Asegúrate de que el audio esté inicializado.');
        return false;
    }
}

// Reproducir una sola nota
function tocarNota(nota) {
    synth.triggerAttackRelease(nota, '8n');
}

// Generar todas las permutaciones posibles (usando el algoritmo de Heap)
function generarPermutaciones(arr) {
    const resultado = [];
    
    function permutar(arreglo, indice) {
        if (indice === arreglo.length - 1) {
            resultado.push([...arreglo]);
            return;
        }
        
        for (let i = indice; i < arreglo.length; i++) {
            // Intercambiar elementos
            [arreglo[indice], arreglo[i]] = [arreglo[i], arreglo[indice]];
            
            // Llamada recursiva
            permutar(arreglo, indice + 1);
            
            // Revertir el intercambio
            [arreglo[indice], arreglo[i]] = [arreglo[i], arreglo[indice]];
        }
    }
    
    permutar([...arr], 0);
    return resultado;
}

// Mostrar permutaciones en el DOM
function mostrarPermutaciones(permutaciones, contenedorId = 'permutaciones') {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    
    if (permutaciones.length === 0) {
        contenedor.textContent = 'No hay permutaciones para mostrar';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    
    permutaciones.forEach((permutacion, index) => {
        const li = document.createElement('li');
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px solid #eee';
        
        // Mostrar número de permutación
        const numSpan = document.createElement('span');
        numSpan.textContent = `${index + 1}. `;
        numSpan.style.color = '#666';
        numSpan.style.marginRight = '5px';
        numSpan.style.minWidth = '30px';
        numSpan.style.display = 'inline-block';
        
        // Mostrar las notas de la permutación
        const notasSpan = document.createElement('span');
        notasSpan.textContent = permutacion.join(', ');
        notasSpan.style.marginRight = '10px';
        
        // Botón para reproducir la permutación
        const botonReproducir = document.createElement('button');
        botonReproducir.textContent = '▶️';
        botonReproducir.className = 'boton-reproducir';
        botonReproducir.onclick = () => reproducirSecuencia(permutacion);
        
        // Botón para tocar notas individuales
        const botonNotas = document.createElement('button');
        botonNotas.textContent = '🎹';
        botonNotas.className = 'boton-notas';
        botonNotas.title = 'Tocar notas individuales';
        botonNotas.style.marginLeft = '5px';
        botonNotas.onclick = () => {
            const notasContainer = document.createElement('div');
            notasContainer.style.display = 'inline-block';
            notasContainer.style.marginLeft = '10px';
            
            permutacion.forEach(nota => {
                const botonNota = document.createElement('button');
                botonNota.textContent = nota;
                botonNota.className = 'boton-nota';
                botonNota.onclick = (e) => {
                    e.stopPropagation();
                    tocarNota(nota);
                };
                notasContainer.appendChild(botonNota);
            });
            
            // Reemplazar el botón de notas con los botones individuales
            li.replaceChild(notasContainer, botonNotas);
        };
        
        li.appendChild(numSpan);
        li.appendChild(notasSpan);
        li.appendChild(botonReproducir);
        li.appendChild(botonNotas);
        ul.appendChild(li);
    });
    
    contenedor.appendChild(ul);
}

// Generar combinaciones de k elementos de un array
function generarCombinaciones(elementos, k) {
    const resultado = [];
    
    function combinar(inicio, actual) {
        if (actual.length === k) {
            resultado.push([...actual]);
            return;
        }
        
        for (let i = inicio; i < elementos.length; i++) {
            actual.push(elementos[i]);
            combinar(i + 1, actual);
            actual.pop();
        }
    }
    
    combinar(0, []);
    return resultado;
}

// Mostrar combinaciones en la interfaz
function mostrarCombinaciones(combinaciones, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    
    if (combinaciones.length === 0) {
        contenedor.textContent = 'No hay combinaciones posibles';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    
    combinaciones.forEach(combinacion => {
        const li = document.createElement('li');
        li.style.padding = '5px 0';
        li.style.borderBottom = '1px solid #eee';
        
        const notasSpan = document.createElement('span');
        notasSpan.textContent = combinacion.join(', ');
        notasSpan.style.marginRight = '10px';
        
        const botonReproducir = document.createElement('button');
        botonReproducir.textContent = '▶️';
        botonReproducir.className = 'boton-reproducir';
        botonReproducir.onclick = () => reproducirSecuencia(combinacion);
        
        li.appendChild(notasSpan);
        li.appendChild(botonReproducir);
        ul.appendChild(li);
    });
    
    contenedor.appendChild(ul);
}

// Generar ejemplo musical basado en el tipo (permutación o combinación)
function generarEjemplo(tipo) {
    if (!audioContextInitialized) {
        alert('Por favor, inicia el audio primero');
        return;
    }
    
    const notasEjemplo = generarSecuenciaAleatoria(5); // Usamos 5 notas para los ejemplos
    
    if (tipo === 'permutacion') {
        // Mostrar las notas del ejemplo de permutación
        const notasContainer = document.getElementById('notasPermutacion');
        mostrarNotas(notasEjemplo, notasContainer);
        
        // Generar y mostrar todas las permutaciones
        const permutaciones = generarPermutaciones(notasEjemplo);
        mostrarPermutaciones(permutaciones, 'permutacionesEjemplo');
        
        // Actualizar el título con el conteo
        document.querySelector('#ejemploPermutacion h5').textContent = 
            `Ejemplo Musical (${permutaciones.length} permutaciones de ${notasEjemplo.length} notas):`;
        
    } else if (tipo === 'combinacion') {
        // Mostrar las notas del ejemplo de combinación
        const notasContainer = document.getElementById('notasCombinacion');
        mostrarNotas(notasEjemplo, notasContainer);
        
        // Obtener el tamaño de combinación seleccionado
        const k = parseInt(document.getElementById('tamanoCombinacion').value) || 3;
        
        // Generar y mostrar las combinaciones
        const combinaciones = generarCombinaciones(notasEjemplo, k);
        mostrarCombinaciones(combinaciones, 'combinacionesEjemplo');
        
        // Actualizar el título con el conteo
        document.querySelector('#ejemploCombinacion h5').textContent = 
            `Ejemplo Musical (${combinaciones.length} combinaciones de ${k} notas de ${notasEjemplo.length}):`;
    }
}

// ===========================================
// GENERADOR DE POESÍA FONÉTICA
// ===========================================

// Banco de palabras para el generador de poesía
const palabrasFoneticas = [
    // Palabras con sonidos suaves
    'luna', 'suave', 'viento', 'bruma', 'sueño', 'pluma', 'niebla', 'beso', 'risa', 'lluvia',
    'luz', 'mar', 'flor', 'paz', 'voz', 'piel', 'dulce', 'abrazo', 'silencio', 'vuelo',
    
    // Palabras con sonidos fuertes
    'trueno', 'fuego', 'grito', 'roca', 'tormenta', 'metal', 'golpe', 'furia', 'rojo', 'fuerte',
    'hierro', 'piedra', 'garganta', 'choque', 'temblor', 'estruendo', 'fractura', 'golpear', 'romper',
    
    // Palabras con sonidos líquidos
    'lágrima', 'río', 'llorar', 'brillar', 'espejo', 'reflejo', 'llama', 'lleno', 'brillo',
    'lentitud', 'luminoso', 'llovizna', 'brisa', 'lucir', 'llave',
    
    // Palabras con sonidos nasales
    'canción', 'manzana', 'monte', 'mano', 'menta', 'moneda', 'monje', 'manta', 'mente', 'mono',
    'nido', 'nube', 'nieve', 'noche', 'nuez', 'nacer', 'nave'
];

// Banco de fonemas en español
const fonemasEspanol = [
    // Vocales
    'a', 'e', 'i', 'o', 'u',
    
    // Consonantes oclusivas
    'p', 'b', 't', 'd', 'k', 'g',
    
    // Consonantes fricativas
    'f', 's', 'x', 'y', 'j', 'g',
    
    // Consonantes africadas
    'ch', 'll', 'ñ',
    
    // Consonantes nasales
    'm', 'n', 'ñ',
    
    // Consonantes líquidas
    'l', 'r', 'rr',
    
    // Grupos consonánticos
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr',
    
    // Diptongos
    'ai', 'ei', 'oi', 'ui', 'au', 'eu', 'ou', 'ia', 'ie', 'io', 'iu', 'ua', 'ue', 'uo',
    
    // Triptongos
    'iai', 'iei', 'uai', 'uei', 'uay', 'uey', 'iau', 'ieu'
];

// Obtener el tipo de elemento seleccionado (palabras o fonemas)
function obtenerTipoElemento() {
    return document.querySelector('input[name="tipoElemento"]:checked').value;
}

// Obtener el banco de elementos según el tipo seleccionado
function obtenerBancoElementos() {
    return obtenerTipoElemento() === 'palabras' ? palabrasFoneticas : fonemasEspanol;
}

// Obtener la etiqueta para mostrar según el tipo de elemento
function obtenerEtiquetaElemento() {
    return obtenerTipoElemento() === 'palabras' ? 'Palabra' : 'Fonema';
}

// Estructuras de versos
const estructurasSilabicas = [
    "x x x x x",
    "x x x x",
    "x x x",
    "x x",
    "x",
    "x x x x x x",
    "x x x x x x x"
];

// Función para generar un conjunto aleatorio de elementos (palabras o fonemas)
function generarConjuntoElementos(cantidad) {
    const conjunto = [];
    const elementosDisponibles = [...obtenerBancoElementos()];
    
    for (let i = 0; i < cantidad && elementosDisponibles.length > 0; i++) {
        const indice = Math.floor(Math.random() * elementosDisponibles.length);
        conjunto.push(elementosDisponibles.splice(indice, 1)[0]);
    }
    
    return conjunto;
}

// Función para generar permutaciones para la poesía
function generarPermutacionesPoesia(arr) {
    if (arr.length <= 1) return [arr];
    if (arr.length === 2) return [[arr[0], arr[1]], [arr[1], arr[0]]];
    
    return arr.reduce((acc, item, i) => {
        const permutacionesRestantes = generarPermutacionesPoesia([...arr.slice(0, i), ...arr.slice(i + 1)]);
        return acc.concat(permutacionesRestantes.map(perm => [item, ...perm]));
    }, []);
}

// Función para generar un poema fonético
function generarPoemaFonetico() {
    const numElementos = parseInt(document.getElementById('numElementos').value);
    const numConjuntos = parseInt(document.getElementById('numConjuntos').value);
    const tipoElemento = obtenerTipoElemento();
    const etiquetaElemento = obtenerEtiquetaElemento();
    
    if (numElementos < 2 || numElementos > 6) {
        alert(`El número de ${tipoElemento === 'palabras' ? 'palabras' : 'fonemas'} por conjunto debe estar entre 2 y 6`);
        return;
    }
    
    if (numConjuntos < 1 || numConjuntos > 5) {
        alert('El número de conjuntos debe estar entre 1 y 5');
        return;
    }
    
    const contenedorElementos = document.getElementById('palabrasSeleccionadas');
    const contenedorPoema = document.getElementById('poemaGenerado');
    
    contenedorElementos.innerHTML = `<h4>${etiquetaElemento}s seleccionados:</h4><div class="lista-palabras" id="listaElementos"></div>`;
    contenedorPoema.innerHTML = '';
    
    const listaElementos = document.getElementById('listaElementos');
    
    // Generar conjuntos de elementos (palabras o fonemas)
    for (let i = 0; i < numConjuntos; i++) {
        const elementos = generarConjuntoElementos(numElementos);
        
        // Mostrar elementos seleccionados
        elementos.forEach((elemento, index) => {
            const span = document.createElement('span');
            span.className = 'palabra';
            span.textContent = elemento;
            
            // Para fonemas, hacer que se vean más pequeños
            if (tipoElemento === 'fonemas') {
                span.classList.add('fonema');
            }
            
            listaElementos.appendChild(span);
            
            // Agregar espacio entre elementos
            if (index < elementos.length - 1) {
                listaElementos.appendChild(document.createTextNode(' '));
            }
        });
        
        // Agregar separador entre conjuntos
        if (i < numConjuntos - 1) {
            listaElementos.appendChild(document.createElement('br'));
            listaElementos.appendChild(document.createElement('br'));
        }
        
        // Generar permutaciones para el poema
        const permutaciones = generarPermutacionesPoesia(elementos);
        
        // Seleccionar algunas permutaciones para el poema
        const numVersos = Math.min(3, permutaciones.length);
        const versosSeleccionados = [];
        
        while (versosSeleccionados.length < numVersos && permutaciones.length > 0) {
            const indice = Math.floor(Math.random() * permutaciones.length);
            const verso = permutaciones.splice(indice, 1)[0].join(' ');
            if (!versosSeleccionados.includes(verso)) {
                versosSeleccionados.push(verso);
            }
        }
        
        // Mostrar los versos en el poema
        versosSeleccionados.forEach((verso, index) => {
            const divVerso = document.createElement('div');
            divVerso.className = 'verso';
            
            // Aplicar estructura silábica aleatoria (solo para palabras)
            if (tipoElemento === 'palabras') {
                const estructura = estructurasSilabicas[Math.floor(Math.random() * estructurasSilabicas.length)];
                const elementosVerso = verso.split(' ');
                let versoEstructurado = '';
                let elementoIndex = 0;
                
                for (let i = 0; i < estructura.length && elementoIndex < elementosVerso.length; i++) {
                    if (estructura[i] === 'x') {
                        versoEstructurado += elementosVerso[elementoIndex] + ' ';
                        elementoIndex++;
                    } else {
                        versoEstructurado += estructura[i];
                    }
                }
                divVerso.textContent = versoEstructurado.trim();
            } else {
                // Para fonemas, mostrarlos sin estructura silábica
                divVerso.textContent = verso;
                divVerso.classList.add('verso-fonemas');
            }
            
            contenedorPoema.appendChild(divVerso);
        });
        
        // Agregar espacio entre estrofas
        if (i < numConjuntos - 1) {
            contenedorPoema.appendChild(document.createElement('br'));
        }
    }
}

// Inicializar el generador de poesía cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const generarPoemaBtn = document.getElementById('generarPoema');
    if (generarPoemaBtn) {
        generarPoemaBtn.addEventListener('click', generarPoemaFonetico);
        
        // Generar un poema inicial
        setTimeout(generarPoemaFonetico, 500);
    }
});

// Manejar cambios en el tamaño de combinación
document.getElementById('tamanoCombinacion')?.addEventListener('change', (e) => {
    if (document.getElementById('ejemploCombinacion').style.display !== 'none') {
        generarEjemplo('combinacion');
    }
});

// Manejar clic en el botón de generar notas
generarNotasBtn.addEventListener('click', () => {
    secuenciaActual = generarSecuenciaAleatoria(4);
    mostrarNotas(secuenciaActual, notasOriginalesDiv);
    
    // Generar y mostrar permutaciones
    permutacionesActuales = generarPermutaciones(secuenciaActual);
    mostrarPermutaciones(permutacionesActuales.slice(0, 10)); // Mostrar solo las primeras 10 para no saturar
});

// Reproducir secuencia original
reproducirOriginalBtn.addEventListener('click', () => {
    if (secuenciaActual.length > 0) {
        reproducirSecuencia(secuenciaActual);
    }
});

// Obtener el input de cantidad de notas
const cantidadNotasInput = document.getElementById('cantidadNotas');

// Validar el input de cantidad de notas
cantidadNotasInput.addEventListener('change', (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 2) {
        value = 2;
    } else if (value > 8) {
        value = 8;
    }
    e.target.value = value;
});

// Manejar clic en el botón de generar notas
generarNotasBtn.addEventListener('click', () => {
    if (!audioContextInitialized) {
        alert('Por favor, inicia el audio primero');
        return;
    }
    
    const cantidadNotas = parseInt(cantidadNotasInput.value) || 4;
    secuenciaActual = generarSecuenciaAleatoria(cantidadNotas);
    mostrarNotas(secuenciaActual, notasOriginalesDiv);
    
    // Generar y mostrar permutaciones (limitamos a 10 para no sobrecargar la interfaz)
    permutacionesActuales = generarPermutaciones(secuenciaActual);
    mostrarPermutaciones(permutacionesActuales.slice(0, 10));
    
    // Actualizar el título de la sección de variaciones
    const totalVariaciones = permutacionesActuales.length;
    document.querySelector('.permutaciones-container h3').textContent = 
        `Variaciones (mostrando 10 de ${totalVariaciones} posibles)`;
});

// Reproducir secuencia original
reproducirOriginalBtn.addEventListener('click', async () => {
    if (!audioContextInitialized) {
        alert('Por favor, inicia el audio primero');
        return;
    }
    
    if (secuenciaActual.length > 0) {
        // Deshabilitar el botón temporalmente para evitar múltiples clics
        const boton = event.target;
        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = 'Reproduciendo...';
        
        try {
            await reproducirSecuencia(secuenciaActual);
        } catch (error) {
            console.error('Error al reproducir:', error);
        } finally {
            // Restaurar el botón después de un pequeño retraso
            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.disabled = false;
            }, 500);
        }
    }
});

// Hacer la función accesible globalmente para los botones en el HTML
window.generarEjemplo = generarEjemplo;
