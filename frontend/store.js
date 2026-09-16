    /**
     * store.js — capa de datos del Celica Log.
     *
     * Mantiene varios coches a la vez y selecciona uno activo al arrancar.
     */
    
    const STORAGE_KEY = 'celica-log:v1';
    
    function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    
    function seedData() {
    const car = {
        id: uid(),
        make: 'Toyota',
        model: 'Celica',
        alias: 'Celica',
        year: 1994,
        km: 0,
        photo: '',
    };
    return {
        cars: [car],
        activeCarId: car.id,
        entries: []
    };
    }
    
    function migrateLegacy(data) {
    if (!data || typeof data !== 'object') return seedData();
    if (Array.isArray(data.cars)) {
        const cars = data.cars.map((car, idx) => ({
        id: car.id || `${idx}-${uid()}`,
        make: car.make || 'Marca',
        model: car.model || 'Modelo',
        alias: car.alias || `${car.make || 'Vehículo'} ${car.model || ''}`.trim(),
        year: Number(car.year) || new Date().getFullYear(),
        km: Number(car.km) || 0,
        photo: car.photo || '',
        }));
        if (!cars.length) {
        const seed = seedData();
        return { ...seed, entries: Array.isArray(data.entries) ? data.entries : [] };
        }
        return {
        cars,
        activeCarId: data.activeCarId || cars[0].id,
        entries: Array.isArray(data.entries) ? data.entries.map((e) => ({
            ...e,
            carId: e.carId || cars[0].id,
        })) : []
        };
    }

    const legacyCar = data.car || {
        make: 'Toyota',
        model: 'Celica',
        alias: 'Celica',
        year: 1994,
        km: 0
    };
    const migratedCar = {
        id: uid(),
        make: legacyCar.make || 'Marca',
        model: legacyCar.model || 'Modelo',
        alias: legacyCar.alias || `${legacyCar.make || 'Vehículo'} ${legacyCar.model || ''}`.trim(),
        year: Number(legacyCar.year) || new Date().getFullYear(),
        km: Number(legacyCar.km) || 0,
        photo: legacyCar.photo || '',
    };
    return {
        cars: [migratedCar],
        activeCarId: migratedCar.id,
        entries: Array.isArray(data.entries) ? data.entries.map((e) => ({
        ...e,
        carId: migratedCar.id,
        })) : []
    };
    }
    
    function readRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const seed = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    try {
        const parsed = JSON.parse(raw);
        const normalized = migrateLegacy(parsed);
        if (JSON.stringify(normalized) !== raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
        return normalized;
    } catch {
        const seed = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    }
    
    function writeRaw(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    const Store = {
    async getCars() {
        return readRaw().cars;
    },

    async getCar(id = null) {
        const data = readRaw();
        const targetId = id || data.activeCarId || data.cars[0]?.id || null;
        return data.cars.find((car) => car.id === targetId) || null;
    },

    async getActiveCar() {
        return this.getCar();
    },

    async setActiveCar(id) {
        const data = readRaw();
        if (!data.cars.some((car) => car.id === id)) return null;
        data.activeCarId = id;
        writeRaw(data);
        return data.cars.find((car) => car.id === id) || null;
    },

    async addCar(car) {
        const data = readRaw();
        const newCar = {
        id: car.id || uid(),
        alias: car.alias || `${car.make || 'Vehículo'} ${car.model || ''}`.trim() || 'Coche',
        make: car.make || 'Marca',
        model: car.model || 'Modelo',
        year: Number(car.year) || new Date().getFullYear(),
        km: Number(car.km) || 0,
        photo: car.photo || '',
        };
        data.cars.push(newCar);
        data.activeCarId = newCar.id;
        writeRaw(data);
        return newCar;
    },

    async updateCar(patch, id = null) {
        const data = readRaw();
        const carId = id || data.activeCarId || data.cars[0]?.id;
        const idx = data.cars.findIndex((car) => car.id === carId);
        if (idx === -1) return null;
        data.cars[idx] = { ...data.cars[idx], ...patch };
        writeRaw(data);
        return data.cars[idx];
    },

    async listEntries(tipo, carId = null) {
        const data = readRaw();
        const targetId = carId || data.activeCarId || data.cars[0]?.id;
        return data.entries.filter((e) => e.carId === targetId && e.tipo === tipo);
    },

    async getEntry(id) {
        const data = readRaw();
        const activeId = data.activeCarId || data.cars[0]?.id;
        return data.entries.find((e) => e.id === id && e.carId === activeId) || null;
    },

    async saveEntry(entry) {
        const data = readRaw();
        const activeId = data.activeCarId || data.cars[0]?.id;
        if (!activeId) return entry;
        const normalized = {
        ...entry,
        carId: entry.carId || activeId,
        };

        if (normalized.id) {
        const idx = data.entries.findIndex((e) => e.id === normalized.id);
        if (idx >= 0) {
            data.entries[idx] = normalized;
        } else {
            normalized.id = uid();
            data.entries.push(normalized);
        }
        } else {
        normalized.id = uid();
        data.entries.push(normalized);
        }

        const currentCar = data.cars.find((car) => car.id === normalized.carId);
        if (currentCar && typeof normalized.km === 'number' && normalized.km > (currentCar.km || 0)) {
        currentCar.km = normalized.km;
        }
        writeRaw(data);
        return normalized;
    },

    async deleteEntry(id) {
        const data = readRaw();
        data.entries = data.entries.filter((e) => e.id !== id);
        writeRaw(data);
    }
};

window.Store = Store;