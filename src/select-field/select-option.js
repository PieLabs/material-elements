import { noselect, prepareTemplate, applyStyle } from './styles';

const template = prepareTemplate(`
    <style>
      :host{
        display:block;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 0;
        padding-bottom: 0;
        cursor: pointer;
        white-space: nowrap;
        background-color: white;
        transition: background-color 200ms ease-in;
        min-height: 32px;
        line-height: 32px;
        font-size: 15px;
        ${noselect}
      }

      :host(:hover){
        background-color: var(--select-option-hover-bg-color, #eeeeee);
      }

      :host([selected]){
        color: var(--select-option-selected-color, rgb(255, 64, 129));
      }
    </style>
    <slot></slot>

`, 'select-option');

export default class SelectOption extends HTMLElement {
  constructor() {
    super();

    let sr = applyStyle(this, template);

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