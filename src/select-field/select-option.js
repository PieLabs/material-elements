import { noselect } from './styles';

export default class SelectOption extends HTMLElement {
  constructor() {
    super();

    let sr = this.attachShadow({ mode: 'open' });

    sr.innerHTML = `
    <style>
      :host{
        display:block;
        padding: 6px;
        cursor: pointer;
        white-space: nowrap;
        background-color: white;
        transition: background-color 200ms ease-in;
        transition: color 100ms ease-in;
        ${noselect}
      }

      :host(:hover){
        background-color: var(--select-option-hover-bg-color, #eeeeee);
      }

      :host-context([selected]){
        color: var(--select-option-selected-color, rgb(255, 64, 129));
      }
    </style>
    <slot></slot>
    `;

    this.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('select-option-click', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.getAttribute('value'),
          label: this.textContent
        }
      }));
    })
  }
}