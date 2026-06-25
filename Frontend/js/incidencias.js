document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-incidencia');
    const mensaje = document.getElementById('inc-mensaje');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('inc-nombre').value;
            const correo = document.getElementById('inc-correo').value;
            const tipo = document.getElementById('inc-tipo').value;
            const descripcion = document.getElementById('inc-descripcion').value;

            try {
                const res = await fetch('http://127.0.0.1:5000/api/incidencias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, tipo, descripcion })
                });

                if (res.ok) {
                    mensaje.innerText = "¡Incidencia reportada con éxito!";
                    mensaje.className = "p-3 rounded-lg text-sm font-medium text-center bg-green-100 text-green-700 block";
                    form.reset();
                    setTimeout(() => {
                        mensaje.classList.add('hidden');
                        mensaje.classList.remove('block');
                    }, 3000);
                } else {
                    throw new Error("Error en servidor");
                }
            } catch (error) {
                mensaje.innerText = "Hubo un error al enviar la incidencia.";
                mensaje.className = "p-3 rounded-lg text-sm font-medium text-center bg-red-100 text-red-700 block";
            }
        });
    }
});
