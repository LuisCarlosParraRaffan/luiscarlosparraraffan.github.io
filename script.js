// Animación de aparición al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicar animación a las secciones
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });

    // Asegurarse de que los botones sociales sean visibles
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.style.opacity = '1';
    });

    // Optimización de carga de imágenes
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
});

// Efecto parallax suave para la imagen de perfil
window.addEventListener('scroll', () => {
    const profileImage = document.querySelector('.profile-image-container');
    if (profileImage) {
        const scrolled = window.pageYOffset;
        const scale = 1 + (scrolled * 0.0005);
        profileImage.style.transform = `scale(${Math.min(scale, 1.1)})`;
    }
}); 