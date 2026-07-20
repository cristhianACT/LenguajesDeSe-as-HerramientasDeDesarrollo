function loadSidebar(activePage) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const userRole = localStorage.getItem('user_role');
    const userEmail = localStorage.getItem('user_email');
    if (!userRole || !userEmail) {
        window.location.href = 'login.html';
        return;
    }

    const pages = [
        { href: 'index.html', label: 'Inicio', id: 'inicio' },
        { href: 'abecedario.html', label: 'Abecedario', id: 'abecedario' },
        { href: 'numeros.html', label: 'Números', id: 'numeros' },
        { href: 'frases.html', label: 'Frases', id: 'frases' },
        { href: 'incidencias.html', label: 'Incidencias', id: 'incidencias' },
    ];

    if (userRole === 'admin') {
        pages.push({ href: 'admin_incidencias.html', label: 'Panel Admin', id: 'admin_incidencias' });
    }

    const links = pages.map(p => {
        const isActive = p.id === activePage;
        const cls = isActive
            ? 'block px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm'
            : 'block px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition';
        return `<li><a href="${p.href}" class="${cls}">${p.label}</a></li>`;
    }).join('');

    sidebar.innerHTML = `
        <div class="p-6 border-b border-gray-200">
            <h1 class="text-2xl font-black text-indigo-700 tracking-tight">SignApp</h1>
            <p class="text-xs text-gray-500 mt-1 truncate" title="${userEmail}">${userEmail}</p>
        </div>
        <nav class="flex-1 p-4 overflow-y-auto">
            <ul class="space-y-1">${links}</ul>
        </nav>
        <div class="p-4 border-t border-gray-200">
            <button onclick="logout()" class="w-full block px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm transition text-left">
                Cerrar Sesión
            </button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    window.location.href = 'login.html';
}