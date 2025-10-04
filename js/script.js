

const organizaciones = [
    { nombre: "Médicos Sin Fronteras", valor: 14 },
    { nombre: "Cruz Roja", valor: 12 },
    { nombre: "UNICEF", valor: 10 },
    { nombre: "Cáritas", valor: 8 },
    { nombre: "Greenpeace", valor: 11 },
    { nombre: "WWF", valor: 13 },
    { nombre: "Manos Unidas", valor: 9 },
    { nombre: "Oxfam", valor: 15 },
    { nombre: "Ayuda en Acción", valor: 7 },
    { nombre: "Fundación CEPAIM", valor: 6 }
];

let aportaciones = [];
let totalDinero = 0;
let totalAportaciones = 0;
let procesoFinalizado = false;

function agregarAportacion(indice) {
    if (procesoFinalizado) reiniciarProceso();
    aportaciones.push(indice);    
    totalDinero += organizaciones[indice].valor;
    totalAportaciones += 1;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('contenedor-organizaciones').addEventListener('click', function(e) {
        if (e.target.classList.contains("imagen-logo") && e.target.dataset.indice !== undefined) {
            agregarAportacion(Number(e.target.dataset.indice));
        }
    });
    document.getElementById('boton-finalizar').addEventListener('click', mostrarResultados);
});

function mostrarResultados() {
    if (aportaciones.length === 0) return;
    procesoFinalizado = true;
    const conteo = Array(organizaciones.length).fill(0);
    aportaciones.forEach(indice => conteo[indice]++);
    const resumen = organizaciones.map((org, indice) => ({
        nombre: org.nombre,
       
        cantidad: conteo[indice]
    }
    )
    ).filter(r => r.cantidad > 0);
    resumen.sort((a, b) => b.nombre.localeCompare(a.nombre));
    let resultado = resumen.map(r =>
        `${r.nombre} ---- ${r.cantidad} aportaciones`
    ).join("<br>");
    resultado += `<br>Donación final: ${totalDinero} €`;
    resultado += `<br>Donación media: ${(totalDinero / totalAportaciones).toFixed(2)} €/aportación`;
    document.getElementById('caja-resultados').innerHTML = resultado;
}

function reiniciarProceso() {
    aportaciones = [];
    totalDinero = 0;
    totalAportaciones = 0;
    procesoFinalizado = false;
    document.getElementById('caja-resultados').innerHTML = "";
}



