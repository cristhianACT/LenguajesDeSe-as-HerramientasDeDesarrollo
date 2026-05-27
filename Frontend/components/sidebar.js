function loadSidebar(activePage) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const pages = [
        { href: 'index.html', label: 'Traductor en Vivo', id: 'traductor' },
        { href: 'abecedario.html', label: 'Abecedario', id: 'abecedario' },
        { href: 'numeros.html', label: 'Números', id: 'numeros' },
    ];

    const links = pages.map(p => {
        const isActive = p.id === activePage;
        const cls = isActive
            ? 'block px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm'
            : 'block px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition';
        return `<li><a href="${p.href}" class="${cls}">${p.label}</a></li>`;
    }).join('');

    sidebar.innerHTML = `
        <div class="p-6 border-b border-gray-200">
            <h1 class="text-xl font-bold text-gray-800">SignApp</h1>
        </div>
        <nav class="flex-1 p-4">
            <ul class="space-y-1">${links}</ul>
        </nav>
    `;
}
