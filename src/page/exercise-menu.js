// The exercise dropdown. Built by hand because the pop-up of a native <select>
// cannot be styled to match the glass look.

// exercises: { key: { label } }. Returns { value(), setDisabled(disabled) }.
export function createExerciseMenu(root, exercises, { initial, onChange }) {
  const trigger = root.querySelector('.menu-button');
  const list = root.querySelector('.menu-list');
  let current = initial;

  const close = () => {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  const select = (key) => {
    current = key;
    trigger.textContent = exercises[key].label;
    for (const item of list.querySelectorAll('button')) {
      item.setAttribute('aria-checked', String(item.dataset.key === key));
    }
    close();
  };

  for (const [key, { label }] of Object.entries(exercises)) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.key = key;
    button.textContent = label;
    button.setAttribute('role', 'menuitemradio');
    button.addEventListener('click', () => {
      const changed = key !== current;
      select(key);
      if (changed) onChange(key);
    });
    item.append(button);
    list.append(item);
  }

  trigger.addEventListener('click', () => {
    const opening = list.hidden;
    list.hidden = !opening;
    trigger.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) close();
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      trigger.focus();
    }
  });

  select(initial);
  return {
    value: () => current,
    setDisabled(disabled) {
      trigger.disabled = disabled;
      if (disabled) close();
    },
  };
}
