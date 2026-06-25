document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('incidencias-tbody');
    const btnRefresh = document.getElementById('btn-refresh');

    const fetchIncidencias = async () => {
        try {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-400 italic">Cargando...</td></tr>';
            const res = await fetch('http://127.0.0.1:5000/api/incidencias');
            if (!res.ok) throw new Error();

            const incidencias = await res.json();

            if (incidencias.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-400">No hay incidencias registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = incidencias.map(inc => `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-4 text-gray-600 font-medium">#${inc.id}</td>
                    <td class="p-4 text-gray-500">${inc.fecha}</td>
                    <td class="p-4 font-semibold text-gray-700">${inc.tipo}</td>
                    <td class="p-4 text-gray-600 max-w-xs truncate" title="${inc.descripcion}">${inc.descripcion}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 text-xs font-bold rounded-full ${inc.estado === 'Solucionado' ? 'bg-green-100 text-green-700' :
                    inc.estado === 'En revisión' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                }">
                            ${inc.estado}
                        </span>
                    </td>
                    <td class="p-4">
                        <select onchange="updateEstado(${inc.id}, this.value)" class="text-sm border border-gray-300 rounded-lg p-1.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                            <option value="Pendiente" ${inc.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="En revisión" ${inc.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                            <option value="Solucionado" ${inc.estado === 'Solucionado' ? 'selected' : ''}>Solucionado</option>
                        </select>
                    </td>
                </tr>
            `).reverse().join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500 font-medium">Error al cargar incidencias</td></tr>';
        }
    };

    window.updateEstado = async (id, nuevoEstado) => {
        try {
            await fetch(`http://127.0.0.1:5000/api/incidencias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            fetchIncidencias();
        } catch (e) {
            alert('Error al actualizar el estado');
        }
    };

    btnRefresh.addEventListener('click', fetchIncidencias);

    // Initial fetch
    fetchIncidencias();
});
