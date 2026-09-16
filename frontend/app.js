const Store = window.Store;

const TIPOS = ['km', 'averias', 'consumos', 'piezas'];

const state = {
    tab: 'inicio',
    editingId: null,
    pendingCarPhoto: '',
    isHomePhotoUpload: false,
};

const el = {
    tabbar: document.getElementById('tabbar'),
    appContent: document.getElementById('appContent'),
    carsScreen: document.getElementById('carsScreen'),
    carsList: document.getElementById('carsList'),
    closeCarsScreen: document.getElementById('closeCarsScreen'),
    newCarFromCarsBtn: document.getElementById('newCarFromCarsBtn'),
    homePanel: document.getElementById('homePanel'),
    homeStats: document.getElementById('homeStats'),
    carViewport: document.getElementById('carViewport'),
    carPhotoPreview: document.getElementById('carPhotoPreview'),
    carPhotoPlaceholder: document.getElementById('carPhotoPlaceholder'),
    carPhotoUploadBtn: document.getElementById('carPhotoUploadBtn'),
    carPhotoInput: document.getElementById('carPhotoInput'),
    carPhotoPreviewDialog: document.getElementById('carPhotoPreviewDialog'),
    toolbar: document.querySelector('.toolbar'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    newEntryBtn: document.getElementById('newEntryBtn'),
    chartPanel: document.getElementById('chartPanel'),
    chartSub: document.getElementById('chartSub'),
    chartCanvas: document.getElementById('consumoChart'),
    entryList: document.getElementById('entryList'),
    emptyState: document.getElementById('emptyState'),
    carAlias: document.getElementById('carAlias'),
    carMeta: document.getElementById('carMeta'),
    odoValue: document.getElementById('odoValue'),
    carSelectorBtn: document.getElementById('carSelectorBtn'),
    carDialog: document.getElementById('carDialog'),
    carSelectForm: document.getElementById('carSelectForm'),
    carSelect: document.getElementById('carSelect'),
    newCarBtn: document.getElementById('newCarBtn'),
    cancelCarDialog: document.getElementById('cancelCarDialog'),
    closeCarDialog: document.getElementById('closeCarDialog'),
    carCreateDialog: document.getElementById('carCreateDialog'),
    carCreateForm: document.getElementById('carCreateForm'),
    carAliasInput: document.getElementById('carAliasInput'),
    carMakeInput: document.getElementById('carMakeInput'),
    carModelInput: document.getElementById('carModelInput'),
    carYearInput: document.getElementById('carYearInput'),
    carKmInput: document.getElementById('carKmInput'),
    carCreatePhotoBtn: document.getElementById('carCreatePhotoBtn'),
    carCreatePhotoPreview: document.getElementById('carCreatePhotoPreview'),
    carCreatePhotoPlaceholder: document.getElementById('carCreatePhotoPlaceholder'),
    carPhotoInputCreate: document.getElementById('carPhotoInputCreate'),
    cancelCarCreateDialog: document.getElementById('cancelCarCreateDialog'),
    closeCarCreateDialog: document.getElementById('closeCarCreateDialog'),

    dialog: document.getElementById('entryDialog'),
    form: document.getElementById('entryForm'),
    dialogTitle: document.getElementById('dialogTitle'),
    fTitulo: document.getElementById('fTitulo'),
    fFecha: document.getElementById('fFecha'),
    fKmWrap: document.getElementById('fKmWrap'),
    fKm: document.getElementById('fKm'),
    fCosteWrap: document.getElementById('fCosteWrap'),
    fCoste: document.getElementById('fCoste'),
    fNotas: document.getElementById('fNotas'),
    customFields: document.getElementById('customFields'),
    addFieldBtn: document.getElementById('addFieldBtn'),
    deleteEntryBtn: document.getElementById('deleteEntryBtn'),
    closeDialog: document.getElementById('closeDialog'),
    cancelDialog: document.getElementById('cancelDialog'),
};

const TIPO_LABEL = { km: 'Km', averias: 'Avería', consumos: 'Consumo', piezas: 'Pieza' };

function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function fmtNum(n) {
    return new Intl.NumberFormat('es-ES').format(n);
}

async function refreshSelectedCarHeader() {
    const car = await Store.getCar();
    if (!car) return;
    el.carAlias.textContent = car.alias || `${car.make} ${car.model}`;
    el.carMeta.textContent = `${car.make} ${car.model} · ${car.year}`;
    el.odoValue.textContent = fmtNum(car.km || 0);
}

async function renderCarSelector() {
    const cars = await Store.getCars();
    if (!cars.length) {
        el.carSelect.innerHTML = '<option value="">Sin coches guardados</option>';
        return;
    }
    el.carSelect.innerHTML = cars
        .map((car) => `<option value="${car.id}">${escapeHtml(car.alias || `${car.make} ${car.model}`)}</option>`)
        .join('');
    const current = await Store.getCar();
    if (current) {
        el.carSelect.value = current.id;
    }
}

async function renderCarsScreen() {
    const cars = await Store.getCars();
    const current = await Store.getCar();

    if (!cars.length) {
        el.carsList.innerHTML = '<div class="garage-empty">Todavía no tienes ningún coche guardado.</div>';
        return;
    }

    el.carsList.innerHTML = cars.map((car) => {
        const isActive = current && current.id === car.id;
        return `
            <button type="button" class="car-card ${isActive ? 'is-active' : ''}" data-car-id="${car.id}">
                <div class="car-card-top">
                    <span class="car-card-alias">${escapeHtml(car.alias || `${car.make} ${car.model}`)}</span>
                    <span class="car-card-badge">${isActive ? 'Activo' : 'Seleccionar'}</span>
                </div>
                <div class="car-card-meta">${escapeHtml(car.make)} ${escapeHtml(car.model)} · ${car.year}</div>
                <div class="car-card-km">${fmtNum(car.km || 0)} km</div>
            </button>
        `;
    }).join('');
}

function openCarsScreen() {
    if (el.appContent) el.appContent.hidden = true;
    if (el.carsScreen) el.carsScreen.hidden = false;
    renderCarsScreen();
}

function closeCarsScreen() {
    if (el.carsScreen) el.carsScreen.hidden = true;
    if (el.appContent) el.appContent.hidden = false;
}

async function openCarSelector() {
    await renderCarsScreen();
    openCarsScreen();
}

function closeCarSelector() {
    if (el.carDialog && el.carDialog.open) {
        el.carDialog.close();
    }
}

function resetCreateCarPhoto() {
    state.pendingCarPhoto = '';
    if (el.carCreatePhotoPreview) {
        el.carCreatePhotoPreview.removeAttribute('src');
        el.carCreatePhotoPreview.hidden = true;
    }
    if (el.carCreatePhotoPlaceholder) {
        el.carCreatePhotoPlaceholder.hidden = false;
    }
}

function openCarCreator() {
    el.carCreateForm.reset();
    resetCreateCarPhoto();
    el.carYearInput.value = String(new Date().getFullYear());
    el.carKmInput.value = '0';
    if (el.carCreateDialog && typeof el.carCreateDialog.showModal === 'function') {
        el.carCreateDialog.showModal();
    }
}

function closeCarCreator() {
    resetCreateCarPhoto();
    if (el.carCreateDialog && el.carCreateDialog.open) {
        el.carCreateDialog.close();
    }
}

async function ensureActiveCar() {
    const cars = await Store.getCars();
    if (!cars.length) {
        openCarCreator();
        return;
    }

    const activeCar = await Store.getCar();
    if (!activeCar) {
        if (cars.length === 1) {
            await Store.setActiveCar(cars[0].id);
            await refreshSelectedCarHeader();
            return;
        }
        openCarsScreen();
        return;
    }

    if (cars.length > 1 && !el.carsScreen.hidden) {
        openCarsScreen();
        return;
    }

    await refreshSelectedCarHeader();
}

/* ---------------- Tabs ---------------- */

el.tabbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-switch');
    if (!btn) return;
    switchTab(btn.dataset.tab);
});

function switchTab(tab) {
    state.tab = tab;
    [...el.tabbar.children].forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tab));

    const isHome = tab === 'inicio';
    el.homePanel.hidden = !isHome;
    el.toolbar.hidden = isHome;
    el.entryList.hidden = isHome;
    el.emptyState.hidden = true;
    el.chartPanel.hidden = isHome || tab !== 'consumos';

    if (isHome) {
        renderHome();
    } else {
        el.searchInput.value = '';
        renderList();
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
    });
}

function renderVehiclePhotoPreview(src = '', fallbackText = 'Sube una foto de tu coche') {
    if (!el.carPhotoPreview || !el.carPhotoPlaceholder) return;
    el.carPhotoPlaceholder.textContent = fallbackText;

    if (!src) {
        el.carPhotoPreview.removeAttribute('src');
        el.carPhotoPreview.hidden = true;
        el.carPhotoPlaceholder.style.opacity = '1';
        return;
    }

    el.carPhotoPreview.src = src;
    el.carPhotoPreview.hidden = false;
    el.carPhotoPlaceholder.style.opacity = '0';
    el.carPhotoPreview.onerror = () => {
        el.carPhotoPreview.hidden = true;
        el.carPhotoPlaceholder.style.opacity = '1';
    };
    el.carPhotoPreview.onload = () => {
        el.carPhotoPreview.hidden = false;
        el.carPhotoPlaceholder.style.opacity = '0';
    };
}

async function updateActiveCarPhotoFromInput(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    const car = await Store.getCar();
    if (!car) return;
    await Store.updateCar({ photo: dataUrl }, car.id);
    await refreshSelectedCarHeader();
    renderHome();
}

/* ---------------- Home ---------------- */

async function renderHome() {
    const car = await Store.getCar();
    if (!car) {
        renderVehiclePhotoPreview('', 'Selecciona o crea un coche');
        el.homeStats.innerHTML = '<div class="home-stat"><div class="home-stat-label">Coche</div><div class="home-stat-value">Selecciona uno</div></div>';
        return;
    }
    await refreshSelectedCarHeader();
    renderVehiclePhotoPreview(car.photo || '', 'Sube una foto de tu coche');

    const [kms, averias, consumos] = await Promise.all([
        Store.listEntries('km'),
        Store.listEntries('averias'),
        Store.listEntries('consumos'),
    ]);
    const gastoTotal = consumos.reduce((s, e) => s + (Number(e.coste) || 0), 0);
    const ultimaAveria = [...averias].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0];

    const stats = [
        { label: 'Kilómetros', value: fmtNum(car.km || 0) + ' km', accent: 'amber' },
        { label: 'Fichas de avería', value: averias.length, accent: 'red' },
        { label: 'Gasto en consumo', value: gastoTotal ? gastoTotal.toFixed(2) + ' €' : '—', accent: 'teal' },
        { label: 'Última avería', value: ultimaAveria ? fmtDate(ultimaAveria.fecha) : '—', accent: '' },
    ];

    el.homeStats.innerHTML = stats
        .map(
        (s) => `
            <div class="home-stat">
            <div class="home-stat-label">${s.label}</div>
            <div class="home-stat-value ${s.accent ? 'accent-' + s.accent : ''}">${s.value}</div>
            </div>
        `,
        )
        .join('');
}

/* ---------------- List / filter / sort ---------------- */

el.searchInput.addEventListener('input', renderList);
el.sortSelect.addEventListener('change', renderList);
el.newEntryBtn.addEventListener('click', () => openDialog(null));

async function renderList() {
    if (state.tab === 'inicio') return;
    let entries = await Store.listEntries(state.tab);

    const q = el.searchInput.value.trim().toLowerCase();
    if (q) {
        entries = entries.filter(
        (e) =>
            (e.titulo || '').toLowerCase().includes(q) ||
            (e.notas || '').toLowerCase().includes(q) ||
            (e.campos || []).some((c) => (c.clave + ' ' + c.valor).toLowerCase().includes(q)),
        );
    }

    const [sortKey, dir] = el.sortSelect.value.split('-');
    entries.sort((a, b) => {
        let av;
        let bv;
        if (sortKey === 'km') {
        av = a.km ?? -Infinity;
        bv = b.km ?? -Infinity;
        } else {
        av = a.fecha || '';
        bv = b.fecha || '';
        }
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    el.emptyState.hidden = entries.length !== 0;
    el.entryList.innerHTML = entries.map(cardHtml).join('');
    [...el.entryList.querySelectorAll('.entry-card')].forEach((card) => {
        card.addEventListener('click', () => openDialog(card.dataset.id));
    });

    if (state.tab === 'consumos') renderChart(entries);
}

function cardHtml(e) {
    const stats = [];
    if (e.km != null) stats.push(`<span class="entry-stat"><b>${fmtNum(e.km)}</b> km</span>`);
    if (e.coste != null) stats.push(`<span class="entry-stat"><b>${Number(e.coste).toFixed(2)}</b> €</span>`);
    (e.campos || []).forEach((c) => {
        if (c.clave) stats.push(`<span class="entry-stat">${c.clave}: <b>${c.valor}</b></span>`);
    });

    return `
        <article class="entry-card tipo-${e.tipo}" data-id="${e.id}">
        <div class="entry-top">
            <span class="entry-titulo">${escapeHtml(e.titulo)}</span>
            <span class="entry-fecha">${fmtDate(e.fecha)}</span>
        </div>
        ${stats.length ? `<div class="entry-sub">${stats.join('')}</div>` : ''}
        ${e.notas ? `<div class="entry-notas">${escapeHtml(e.notas)}</div>` : ''}
        </article>
    `;
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]));
}

/* ---------------- Chart (canvas 2D, sin dependencias) ---------------- */

function renderChart(entries) {
    const withCoste = entries
        .filter((e) => e.coste != null && e.fecha)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const canvas = el.chartCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.parentElement.clientWidth - 32;
    const cssH = 140;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (withCoste.length < 1) {
        el.chartSub.textContent = 'Sin datos de consumo todavía';
        return;
    }

    const total = withCoste.reduce((s, e) => s + Number(e.coste), 0);
    el.chartSub.textContent = `${withCoste.length} fichas · ${total.toFixed(2)} € en total`;

    const values = withCoste.map((e) => Number(e.coste));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const padX = 6;
    const padY = 12;
    const stepX = withCoste.length > 1 ? (cssW - padX * 2) / (withCoste.length - 1) : 0;

    const pointAt = (i) => {
        const x = padX + stepX * i;
        const norm = max === min ? 0.5 : (values[i] - min) / (max - min);
        const y = cssH - padY - norm * (cssH - padY * 2);
        return [x, y];
    };

    ctx.beginPath();
    ctx.moveTo(...pointAt(0));
    values.forEach((_, i) => ctx.lineTo(...pointAt(i)));
    ctx.lineTo(padX + stepX * (values.length - 1), cssH);
    ctx.lineTo(padX, cssH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(94, 158, 150, 0.14)';
    ctx.fill();

    ctx.beginPath();
    values.forEach((_, i) => {
        const [x, y] = pointAt(i);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#5E9E96';
    ctx.lineWidth = 2;
    ctx.stroke();

    values.forEach((_, i) => {
        const [x, y] = pointAt(i);
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#E8A33D';
        ctx.fill();
    });
}

/* ---------------- Car selection ---------------- */

el.carSelectorBtn.addEventListener('click', openCarSelector);
el.closeCarsScreen.addEventListener('click', closeCarsScreen);
el.newCarFromCarsBtn.addEventListener('click', () => {
    closeCarsScreen();
    openCarCreator();
});
el.closeCarDialog.addEventListener('click', closeCarSelector);
el.cancelCarDialog.addEventListener('click', closeCarSelector);
el.newCarBtn.addEventListener('click', () => {
    closeCarSelector();
    openCarCreator();
});
el.closeCarCreateDialog.addEventListener('click', closeCarCreator);
el.cancelCarCreateDialog.addEventListener('click', closeCarCreator);

el.carsList.addEventListener('click', async (e) => {
    const card = e.target.closest('.car-card');
    if (!card) return;
    const carId = card.dataset.carId;
    if (!carId) return;
    await Store.setActiveCar(carId);
    closeCarsScreen();
    await refreshSelectedCarHeader();
    renderHome();
    renderList();
});

el.carSelectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const carId = el.carSelect.value;
    if (!carId) return;
    await Store.setActiveCar(carId);
    closeCarSelector();
    await refreshSelectedCarHeader();
    renderHome();
    renderList();
});

el.carPhotoUploadBtn.addEventListener('click', () => {
    state.isHomePhotoUpload = true;
    el.carPhotoInput.click();
});

el.carCreatePhotoBtn.addEventListener('click', () => {
    el.carPhotoInputCreate.click();
});

el.carPhotoInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';

    if (!file) return;
    const dataUrl = await fileToDataUrl(file);

    if (state.isHomePhotoUpload) {
        state.isHomePhotoUpload = false;
        await updateActiveCarPhotoFromInput(file);
        return;
    }

    state.pendingCarPhoto = dataUrl;
    if (el.carCreatePhotoPreview) {
        el.carCreatePhotoPreview.src = dataUrl;
        el.carCreatePhotoPreview.hidden = false;
        el.carCreatePhotoPreview.onerror = () => {
            el.carCreatePhotoPreview.hidden = true;
            if (el.carCreatePhotoPlaceholder) {
                el.carCreatePhotoPlaceholder.style.opacity = '1';
            }
        };
        el.carCreatePhotoPreview.onload = () => {
            el.carCreatePhotoPreview.hidden = false;
            if (el.carCreatePhotoPlaceholder) {
                el.carCreatePhotoPlaceholder.style.opacity = '0';
            }
        };
    }
    if (el.carCreatePhotoPlaceholder) {
        el.carCreatePhotoPlaceholder.style.opacity = '0';
    }
});

el.carPhotoInputCreate.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';

    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    state.pendingCarPhoto = dataUrl;

    if (el.carCreatePhotoPreview) {
        el.carCreatePhotoPreview.src = dataUrl;
        el.carCreatePhotoPreview.hidden = false;
        el.carCreatePhotoPreview.onerror = () => {
            el.carCreatePhotoPreview.hidden = true;
            if (el.carCreatePhotoPlaceholder) {
                el.carCreatePhotoPlaceholder.style.opacity = '1';
            }
        };
        el.carCreatePhotoPreview.onload = () => {
            el.carCreatePhotoPreview.hidden = false;
            if (el.carCreatePhotoPlaceholder) {
                el.carCreatePhotoPlaceholder.style.opacity = '0';
            }
        };
    }
    if (el.carCreatePhotoPlaceholder) {
        el.carCreatePhotoPlaceholder.style.opacity = '0';
    }
});

el.carCreateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawAlias = el.carAliasInput.value.trim();
    const make = el.carMakeInput.value.trim();
    const model = el.carModelInput.value.trim();
    const yearValue = el.carYearInput.value.trim();
    const kmValue = el.carKmInput.value.trim();
    const year = Number(yearValue);
    const km = Number(kmValue);

    if (!make || !model || !yearValue || !kmValue || !Number.isFinite(year) || !Number.isFinite(km) || km < 0) return;

    const alias = rawAlias || `${make} ${model}`.trim();
    const car = await Store.addCar({ alias, make, model, year, km, photo: state.pendingCarPhoto || '' });
    state.pendingCarPhoto = '';
    closeCarCreator();
    await Store.setActiveCar(car.id);
    await refreshSelectedCarHeader();
    renderHome();
    renderList();
});

/* ---------------- Dialog / form ---------------- */

let customFieldSeq = 0;

function addCustomFieldRow(clave = '', valor = '') {
    const id = 'cf' + customFieldSeq++;
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.dataset.rowId = id;
    row.innerHTML = `
        <input class="cf-key" placeholder="Campo (p. ej. taller)" value="${escapeHtml(clave)}">
        <input class="cf-val" placeholder="Valor" value="${escapeHtml(valor)}">
        <button type="button" class="icon-btn" aria-label="Quitar campo">✕</button>
    `;
    row.querySelector('.icon-btn').addEventListener('click', () => row.remove());
    el.customFields.appendChild(row);
}

el.addFieldBtn.addEventListener('click', () => addCustomFieldRow());

function resetForm() {
    el.form.reset();
    el.customFields.innerHTML = '';
    el.fFecha.value = new Date().toISOString().slice(0, 10);
    el.deleteEntryBtn.hidden = true;

    const showKm = ['km', 'averias', 'consumos'].includes(state.tab);
    const showCoste = ['averias', 'consumos'].includes(state.tab);
    el.fKmWrap.hidden = !showKm;
    el.fCosteWrap.hidden = !showCoste;
}

async function openDialog(id) {
    resetForm();
    state.editingId = id;

    if (id) {
        const entry = await Store.getEntry(id);
        if (!entry) return;
        el.dialogTitle.textContent = 'Editar ficha · ' + TIPO_LABEL[entry.tipo];
        el.fTitulo.value = entry.titulo || '';
        el.fFecha.value = entry.fecha || '';
        el.fKm.value = entry.km ?? '';
        el.fCoste.value = entry.coste ?? '';
        el.fNotas.value = entry.notas || '';
        (entry.campos || []).forEach((c) => addCustomFieldRow(c.clave, c.valor));
        el.deleteEntryBtn.hidden = false;
    } else {
        el.dialogTitle.textContent = 'Nueva ficha · ' + TIPO_LABEL[state.tab];
    }

    el.dialog.showModal();
}

function closeDialog() {
    el.dialog.close();
    state.editingId = null;
}

el.closeDialog.addEventListener('click', closeDialog);
el.cancelDialog.addEventListener('click', closeDialog);

el.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const campos = [...el.customFields.querySelectorAll('.custom-field-row')]
        .map((row) => ({
        clave: row.querySelector('.cf-key').value.trim(),
        valor: row.querySelector('.cf-val').value.trim(),
        }))
        .filter((c) => c.clave || c.valor);

    const entry = {
        id: state.editingId || null,
        tipo: state.tab,
        titulo: el.fTitulo.value.trim(),
        fecha: el.fFecha.value,
        km: el.fKm.value !== '' ? Number(el.fKm.value) : null,
        coste: el.fCoste.value !== '' ? Number(el.fCoste.value) : null,
        notas: el.fNotas.value.trim(),
        campos,
    };

    await Store.saveEntry(entry);
    closeDialog();
    renderHome();
    renderList();
});

el.deleteEntryBtn.addEventListener('click', async () => {
    if (!state.editingId) return;
    await Store.deleteEntry(state.editingId);
    closeDialog();
    renderHome();
    renderList();
});

/* ---------------- Arranque ---------------- */

(async function init() {
    el.fFecha && (el.fFecha.value = new Date().toISOString().slice(0, 10));
    await ensureActiveCar();
    switchTab('inicio');

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            return Promise.all(registrations.map((registration) => registration.unregister()));
        }).catch(() => {}).finally(() => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
})();
