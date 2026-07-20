document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnSubmit = document.getElementById('btn-submit');
    const btnToggle = document.getElementById('btn-toggle');
    const toggleText = document.getElementById('toggle-text');
    const formSubtitle = document.getElementById('form-subtitle');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    let isLogin = true;

    if (localStorage.getItem('user_role')) {
        const role = localStorage.getItem('user_role');
        if (role === 'admin') window.location.href = 'admin_incidencias.html';
        else window.location.href = 'index.html';
    }

    btnToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        errorMessage.classList.add('hidden');
        successMessage.classList.add('hidden');
        emailInput.value = '';
        passwordInput.value = '';

        if (isLogin) {
            btnSubmit.innerText = 'Iniciar Sesión';
            btnToggle.innerText = 'Regístrate aquí';
            toggleText.innerText = '¿No tienes cuenta?';
            formSubtitle.innerText = 'Ingresa a tu cuenta para continuar';
            document.title = 'SignApp - Iniciar Sesión';
        } else {
            btnSubmit.innerText = 'Crear Cuenta';
            btnToggle.innerText = 'Inicia sesión';
            toggleText.innerText = '¿Ya tienes cuenta?';
            formSubtitle.innerText = 'Crea una cuenta nueva para continuar';
            document.title = 'SignApp - Registro';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const correo = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!correo || !password) return;

        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-70');
        errorMessage.classList.add('hidden');
        successMessage.classList.add('hidden');

        const endpoint = isLogin ? '/api/login' : '/api/register';
        const url = `http://127.0.0.1:5000${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                if (isLogin) {
                    localStorage.setItem('user_email', data.correo);
                    localStorage.setItem('user_role', data.rol);

                    if (data.rol === 'admin') {
                        window.location.href = 'admin_incidencias.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    successMessage.innerText = 'Cuenta creada exitosamente. Iniciando sesión...';
                    successMessage.classList.remove('hidden');

                    setTimeout(() => {
                        btnToggle.click();
                        emailInput.value = correo;
                        passwordInput.value = password;
                        form.dispatchEvent(new Event('submit'));
                    }, 1500);
                }
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            errorMessage.innerText = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.classList.remove('opacity-70');
        }
    });
});
