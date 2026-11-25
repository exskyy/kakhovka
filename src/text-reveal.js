if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('reveal-enter');
      observer.unobserve(entry.target);
    }
  });

  for (const element of document.querySelectorAll('[data-reveal]')) {
    element.classList.add('reveal-pending');
    observer.observe(element);
  }
}
