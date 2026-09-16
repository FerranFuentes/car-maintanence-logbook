const assert = require('node:assert/strict');

const fs = require('node:fs');
const vm = require('node:vm');

const storage = new Map();
const localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
};

const context = {
  window: {},
  localStorage,
  console,
  Date,
  Math,
  JSON,
};
context.window = context;

const source = fs.readFileSync(__dirname + '/store.js', 'utf8');
vm.runInNewContext(source, context);

(async () => {
  const Store = context.window.Store;
  const car = await Store.addCar({
    make: 'Ford',
    model: 'Focus',
    year: 2020,
    km: 12000,
    photo: 'data:image/png;base64,abc123',
  });

  assert.equal(car.photo, 'data:image/png;base64,abc123');

  const active = await Store.getCar();
  assert.equal(active.photo, 'data:image/png;base64,abc123');

  console.log('store-photo test passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
