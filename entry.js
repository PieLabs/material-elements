require('./src/select-field');


let onSelectChanged = (e) => {
  console.log('select changed: ', e.target, e.detail.value, e.detail.label);
}

document.addEventListener('DOMContentLoaded', e => {
  document.querySelectorAll('select-field').forEach(n => {
    n.addEventListener('change', onSelectChanged);
  });
});
