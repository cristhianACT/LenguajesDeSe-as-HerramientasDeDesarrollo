document.addEventListener('DOMContentLoaded', () => {
    const el = id => document.getElementById(id);
    const [targetEl, fbEl, btnNew, hitsEl, errsEl, progBar, progTxt, histList, stMost, stTot, stPrac, btnPrac, btnChal, panPrac, panChal, btnStart, seqEl, timeEl, scoreEl, gestDisp] =
        ['target-letter', 'practice-feedback', 'btn-new-letter', 'count-hits', 'count-errors', 'progress-bar', 'progress-text', 'history-list', 'stat-most-detected', 'stat-total-detected', 'stat-total-practices', 'btn-mode-practice', 'btn-mode-challenge', 'panel-practice', 'panel-challenge', 'btn-start-challenge', 'challenge-sequence', 'challenge-time', 'challenge-score', 'gesture-display'].map(el);

    let letters = [], target = '', hits = 0, errs = 0, hist = [], totDet = 0, totPrac = 0, detFreq = {};
    let isChal = false, chalSeq = [], chalIdx = 0, chalStart = 0, chalTimer, chalActive = false, processing = false;

    const genLtr = () => {
        if (!letters.length) return;
        targetEl.innerText = target = letters[Math.floor(Math.random() * letters.length)];
        fbEl.className = 'h-8 font-bold text-lg mb-2'; fbEl.innerText = '';
    };

    fetch('js/abecedario.json').then(r => r.json()).then(d => { letters = d.letras_disponibles; genLtr(); }).catch(() => { letters = "ABCDEFILUVWY".split(''); genLtr(); });

    btnNew.onclick = genLtr;

    const updProg = () => {
        const tot = hits + errs, p = tot ? Math.round((hits / tot) * 100) : 0;
        hitsEl.innerText = hits; errsEl.innerText = errs;
        progBar.style.width = progTxt.innerText = `${p}%`;
    };

    const addHist = l => {
        hist = [l, ...hist].slice(0, 10);
        histList.innerHTML = hist.map((x, i) => `<li class="flex justify-between items-center px-3 py-2 rounded-lg border ${i ? 'bg-gray-50 border-gray-100' : 'bg-indigo-50 border-indigo-200'}"><span class="font-bold text-gray-700">Letra</span><span class="font-black ${i ? 'text-gray-900' : 'text-indigo-600'}">${x}</span></li>`).join('');
    };

    const updStats = l => {
        stTot.innerText = ++totDet; detFreq[l] = (detFreq[l] || 0) + 1;
        stMost.innerText = Object.keys(detFreq).reduce((a, b) => detFreq[a] > detFreq[b] ? a : b);
    };

    const setupChal = () => {
        chalSeq = Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]);
        seqEl.innerHTML = chalSeq.map(l => `<span class="text-indigo-200">${l}</span>`).join('<span class="text-indigo-300 text-lg opacity-50 mx-1">→</span>');
        timeEl.innerText = '0.0s'; scoreEl.innerText = '0';
    };

    const renderChal = () => {
        seqEl.innerHTML = chalSeq.map((l, i) => `<span class="${i < chalIdx ? 'text-green-300 line-through opacity-50' : i == chalIdx ? 'text-white border-b-4 border-yellow-400 pb-1' : 'text-indigo-200'}">${l}</span>`).join('<span class="text-indigo-300 text-lg opacity-50 mx-1">→</span>');
    };

    btnStart.onclick = () => {
        setupChal(); chalIdx = 0; chalActive = true;
        btnStart.innerText = 'Reto en Curso...'; btnStart.disabled = true;
        chalStart = Date.now(); clearInterval(chalTimer);
        chalTimer = setInterval(() => timeEl.innerText = ((Date.now() - chalStart) / 1000).toFixed(1) + 's', 100);
        stPrac.innerText = ++totPrac;
    };

    const endChal = () => {
        chalActive = false; clearInterval(chalTimer);
        btnStart.innerText = 'Jugar de Nuevo'; btnStart.disabled = false;
        scoreEl.innerText = Math.max(100, Math.floor(1000 - ((Date.now() - chalStart) / 1000) * 10));
    };

    const setMode = chal => {
        isChal = chal; chalActive = false; clearInterval(chalTimer);
        btnPrac.className = `flex-1 py-2 px-4 rounded-lg font-bold shadow transition-colors ${chal ? 'bg-white text-indigo-600 border border-indigo-600' : 'bg-indigo-600 text-white'}`;
        btnChal.className = `flex-1 py-2 px-4 rounded-lg font-bold shadow transition-colors ${chal ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600'}`;
        panPrac.classList.toggle('hidden', chal); panChal.classList.toggle('hidden', !chal);
        if (!chal) genLtr(); else { setupChal(); btnStart.innerText = 'Iniciar Reto'; btnStart.disabled = false; }
    };

    btnPrac.onclick = () => setMode(false);
    btnChal.onclick = () => setMode(true);

    new MutationObserver(() => {
        const txt = gestDisp.innerText.trim();
        if (['...', 'Detectando...', 'Ninguno', 'Detectando letra...'].includes(txt) || processing) return;

        processing = true; addHist(txt); updStats(txt);

        if (!isChal && target) {
            if (txt === target) {
                hits++; fbEl.innerText = '¡Correcto!'; fbEl.className = 'h-8 font-bold text-lg mb-2 text-green-500';
                targetEl.classList.remove('text-indigo-600'); targetEl.classList.add('text-green-500');
                stPrac.innerText = ++totPrac;
                setTimeout(() => { targetEl.classList.remove('text-green-500'); targetEl.classList.add('text-indigo-600'); genLtr(); }, 1500);
            } else {
                errs++; fbEl.innerText = 'Incorrecto'; fbEl.className = 'h-8 font-bold text-lg mb-2 text-red-500';
            }
            updProg();
        } else if (chalActive && txt === chalSeq[chalIdx]) {
            if (++chalIdx >= 5) endChal(); else renderChal();
        }

        setTimeout(() => { processing = false; if (!isChal && fbEl.innerText.includes('Incorrecto')) fbEl.innerText = ''; }, 1500);
    }).observe(gestDisp, { childList: true, characterData: true, subtree: true });
});
