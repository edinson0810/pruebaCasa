document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoveryForm');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/recuperar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        mensaje.textContent = 'Instrucciones enviadas a tu correo.';
        mensaje.style.color = 'green';
      } else {
        mensaje.textContent = data.msg || 'Error al recuperar contraseña.';
        mensaje.style.color = 'red';
      }
    } catch (error) {
      mensaje.textContent = 'Error en la solicitud.';
      mensaje.style.color = 'red';
    }
  });
});
