
window.onload = function () {
    let botonVolver = document.getElementById("botonVolver");
    let botonTerminar = document.getElementById("botonTerminar");
    botonVolver.addEventListener("click", function () {
        window.close();
    });
    botonTerminar.addEventListener("click", finalizarPedido);
    mostrarResumenEnPopup();
};