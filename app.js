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

// Generar una secuencia aleatoria de notas
function generarSecuenciaAleatoria(longitud = 4) {
    const secuencia = [];
    for (let i = 0; i < longitud; i++) {
        const notaAleatoria = notasMusicales[Math.floor(Math.random() * notasMusicales.length)];
        secuencia.push(notaAleatoria);
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
function mostrarPermutaciones(permutaciones) {
    permutacionesDiv.innerHTML = '';
    
    permutaciones.forEach((permutacion, index) => {
        const contenedorPermutacion = document.createElement('div');
        contenedorPermutacion.className = 'permutacion-container';
        
        const tituloPermutacion = document.createElement('h4');
        tituloPermutacion.textContent = `Variación ${index + 1} de ${permutaciones.length}`;
        
        const notasPermutacion = document.createElement('div');
        notasPermutacion.className = 'permutacion';
        
        permutacion.forEach(nota => {
            const elementoNota = document.createElement('span');
            elementoNota.className = 'nota';
            elementoNota.textContent = nota;
            elementoNota.style.margin = '0 5px';
            elementoNota.addEventListener('click', () => tocarNota(nota));
            notasPermutacion.appendChild(elementoNota);
        });
        
        const botonReproducir = document.createElement('button');
        botonReproducir.textContent = 'Reproducir';
        botonReproducir.style.marginLeft = '10px';
        botonReproducir.addEventListener('click', () => reproducirSecuencia(permutacion));
        
        contenedorPermutacion.appendChild(tituloPermutacion);
        contenedorPermutacion.appendChild(notasPermutacion);
        contenedorPermutacion.appendChild(botonReproducir);
        
        permutacionesDiv.appendChild(contenedorPermutacion);
    });
}

// Generar ejemplo musical basado en el tipo (permutación o combinación)
function generarEjemplo(tipo) {
    // Para simplificar, usaremos una secuencia de 3 notas
    secuenciaActual = generarSecuenciaAleatoria(3);
    mostrarNotas(secuenciaActual, notasOriginalesDiv);
    
    if (tipo === 'permutacion') {
        permutacionesActuales = generarPermutaciones(secuenciaActual);
        mostrarPermutaciones(permutacionesActuales);
    } else if (tipo === 'combinacion') {
        // Para combinaciones, tomamos 2 notas de las 3
        permutacionesActuales = [
            [secuenciaActual[0], secuenciaActual[1]],
            [secuenciaActual[0], secuenciaActual[2]],
            [secuenciaActual[1], secuenciaActual[2]]
        ];
        mostrarPermutaciones(permutacionesActuales);
    }
}

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

// Manejar clic en el botón de generar notas
generarNotasBtn.addEventListener('click', () => {
    if (!audioContextInitialized) {
        alert('Por favor, inicia el audio primero');
        return;
    }
    
    secuenciaActual = generarSecuenciaAleatoria(4);
    mostrarNotas(secuenciaActual, notasOriginalesDiv);
    
    // Generar y mostrar permutaciones
    permutacionesActuales = generarPermutaciones(secuenciaActual);
    mostrarPermutaciones(permutacionesActuales.slice(0, 10));
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
