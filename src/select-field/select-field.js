import { dropdownArrow } from './icons';
import throttle from './throttle';
import { noselect } from './styles';

export default class SelectField extends HTMLElement {

  constructor() {
    super();
    let sr = this.attachShadow({ mode: 'open' });
    sr.innerHTML = `
      <style>
        :host {
          font-family: var(--select-field-font-family, 'Roboto', sans-serif);
          font-size: var(--select-field-font-size, 14px);
          position: relative;
          display: inline-block;
        }
        
        #box-holder{
          cursor: pointer;
          border-bottom: solid 1px var(--select-field-border-bottom-color, #dddddd);
        }
        .noselect{ 
          ${noselect}
        }

        #box{
          cursor: pointer;
          display: inline-block;
          background-color: white;
          position: relative;
          padding: 4px;
          margin-right: 18px;
        }

        #selection {
          background-color: white;
          position: absolute;
          z-index: 1001;
          top: 0px;
          opacity: 1;
          transition: opacity 150ms linear;
          border: solid 1px var(--select-field-selection-border-color, #cccccc);
          box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
        }
        
        #selection[hidden] {
          visibility: hidden;
          display: none;
        }

        #selection[hide] {
          opacity: 0;
        }

        .icon{
          position: absolute;
          top: 0px;
          right: 0px;
        }

        .dropdown{
          fill: var(--select-field-selection-border, #dddddd);
        }

      </style> 
      <div id="box-holder">
        <label id="box" class="noselect"></label>
        <span class="icon"> ${dropdownArrow('dropdown')} </span>
      </div>
      <div id="selection" hide hidden>
        <slot></slot>
      </div>
    `;

    this.$box = this.shadowRoot.querySelector('#box');
    this.$boxHolder = this.shadowRoot.querySelector('#box-holder');
    this.$selection = this.shadowRoot.querySelector('#selection');
  }

  static get observedAttributes() {
    return ['placeholder'];
  }

  attributeChangedCallback(name, oldValue, newValue) {

    let map = {
      placeholder: this._placeholderChanged
    }

    let fn = map[name];

    if (fn) {
      fn.apply(this, [oldValue, newValue]);
    }
  }

  _placeholderChanged(oldValue, newValue) {
    this.$box.textContent = newValue;
  }

  _onDocumentMouseUp(e) {

    let firstPathNode = e.path ? e.path[0] : null;
    if (this.contains(e.target) || this.contains(firstPathNode) || this.shadowRoot.contains(firstPathNode)) {
      return;
    }

    this._hideSelection();
  }

  _hideSelection() {
    this.$selection.setAttribute('hide', '');
    setTimeout(() => {
      this.$selection.setAttribute('hidden', '')
    }, 200);

    document.removeEventListener('mouseup', this._onDocumentMouseUp);
  }

  _showSelection() {
    if (this.$selection.hasAttribute('hide')) {
      this.$selection.removeAttribute('hidden');
      setTimeout(() => {
        this.$selection.removeAttribute('hide');
      }, 1);
      document.addEventListener('mouseup', this._onDocumentMouseUp.bind(this));
    }
  }

  _initSelection() {
    let options = this.querySelectorAll('select-option[selected]');
    this._select(options.length >= 1 ? options[0] : null);
  }

  _select(node) {
    this.querySelectorAll('select-option').forEach(n => {
      if (n !== node) {
        n.removeAttribute('selected');
      }
    });

    if (node) {
      node.setAttribute('selected', '');
      this.$box.textContent = node.textContent;
    }
    this._currentSelection = node;
  }

  connectedCallback() {

    const slot = this.shadowRoot.querySelector('slot');

    let initSelection = throttle(this._initSelection.bind(this), 50, this);

    initSelection();

    slot.addEventListener('slotchange', () => {
      console.log('slotchange...')
      initSelection()
    });

    this.$boxHolder.addEventListener('click', e => {
      this._showSelection();
    });

    this.shadowRoot.addEventListener('select-option-click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.$box.textContent = e.detail.label;
      this._hideSelection();
      this._select(e.target);
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
          value: e.target.getAttribute('value'),
          label: e.target.textContent
        }
      }))
    });
  }
}
