/* AstraMedical Reels — motor de escenas por tiempo.
   Cada .scene lleva data-dur en ms. Reproduce en orden, con
   crossfade, barra de progreso y bandera de fin para el grabador. */
(function () {
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const durs = scenes.map((s) => parseInt(s.dataset.dur || '3500', 10));
  const total = durs.reduce((a, b) => a + b, 0);
  const bar = document.querySelector('.progress > i');

  window.__REEL_TOTAL = total;      // ms — lo lee el grabador
  window.__REEL_DONE = false;

  function play() {
    scenes.forEach((s) => s.classList.remove('active'));
    window.__REEL_DONE = false;
    const start = performance.now();

    // Programa la activación de cada escena
    let t = 0;
    scenes.forEach((scene, i) => {
      const at = t;
      setTimeout(() => {
        if (i > 0) scenes[i - 1].classList.remove('active');
        scene.classList.add('active');
        const stage = document.querySelector('.stage');
        if (stage) stage.classList.toggle('is-hero', scene.classList.contains('hero'));
      }, at);
      t += durs[i];
    });
    setTimeout(() => { window.__REEL_DONE = true; }, total);

    // Barra de progreso continua
    function tick(now) {
      const p = Math.min(1, (now - start) / total);
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.__reelPlay = play;

  // En modo grabación (?record) el grabador controla el arranque para
  // sincronizar con exactitud. Fuera de él, autoarranque tras cargar fuentes.
  const isRecord = /(?:\?|&)record\b/.test(location.search);
  if (!isRecord) {
    const boot = () => setTimeout(play, 250);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot);
    } else {
      window.addEventListener('load', boot);
    }
  }
})();
