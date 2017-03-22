import { dropdownArrow } from './icons';
import throttle from './throttle';
import { noselect, prepareTemplate, applyStyle } from './styles';

const template = prepareTemplate(`
      <style>
        :host {
          font-family: var(--select-field-font-family, 'Roboto', sans-serif);
          font-size: var(--select-field-font-size, 14px);
          position: relative;
          display: inline-block;
          margin-right: 8px;
          margin-left: 8px;
        }
        
        #box-holder{
          cursor: pointer;
          border-bottom: solid 1px var(--select-field-border-bottom-color, #dddddd);
          height: 43px;
        }
        .noselect{ 
          ${noselect}
        }

        #box{
          cursor: pointer;
          display: inline-block;
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
          padding-top: 16px;
          padding-bottom: 16px;
          transition: opacity 150ms linear;
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
          position: relative;
          top: 5px;
          right: 0px;
          ${noselect}
        }

        .dropdown{
          fill: var(--select-field-selection-border, #dddddd);
        }

        #label{
          position: absolute;
          line-height: 22px;
          transform: translateX(2px) translateY(-4px) scale(0.75);
          z-index: 1;
          transform-origin: left top 0px;
          pointer-events: none;
          color: rgba(0, 0, 0, 0.298039);
          user-select: none;
        }
        #text{
          padding: 0;
          margin: 0;
          padding-top: 6px;
        }
      </style> 
      <div id="box-holder">
        <label id="label"></label>
        <div id="text">
        <label id="box" class="noselect"></label>
        <span class="icon"> ${dropdownArrow('dropdown')} </span>
        </div>
      </div>
      <div id="selection" hide hidden>
        <slot></slot>
      </div>
`, 'select-field');

export default class SelectField extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);

    this.$box = this.shadowRoot.querySelector('#box');
    this.$boxHolder = this.shadowRoot.querySelector('#box-holder');
    this.$selection = this.shadowRoot.querySelector('#selection');
    this.$label = this.shadowRoot.querySelector('#label');
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

    document.removeEventListener('mouseup', this._mouseUpFn);
  }

  _showSelection() {
    if (this.$selection.hasAttribute('hide')) {
      this.$selection.removeAttribute('hidden');
      setTimeout(() => {
        this.$selection.removeAttribute('hide');
      }, 1);
      setTimeout(() => {
        if (!this._mouseUpFn) {
          //FF: need to bind the event listener
          this._mouseUpFn = this._onDocumentMouseUp.bind(this);
        }

        document.removeEventListener('mouseup', this._mouseUpFn);
        document.addEventListener('mouseup', this._mouseUpFn);
      }, 200);
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

    this.$label.textContent = this.getAttribute('placeholder');
    initSelection();

    slot.addEventListener('slotchange', () => {
      console.log('slotchange...')
      initSelection()
    });

    this.$boxHolder.addEventListener('click', e => {
      this._showSelection();
    });

    let onClick = (e) => {
      console.log('select-option-click:', e.target);
      e.preventDefault();
      e.stopImmediatePropagation();
      this.$box.textContent = e.detail.label;
      this._hideSelection();
      console.log('select-option-click:', e.target);
      this._select(e.target);
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
          value: e.target.getAttribute('value'),
          label: e.target.textContent
        }
      }))
    };

    let onClickBound = onClick.bind(this);
    this.shadowRoot.addEventListener('select-option-click', onClickBound);

    //polyfill - nned to listen directly to the element also
    this.addEventListener('select-option-click', onClickBound);

    //Make sure that the select field has a min-width of the label field
    let label = this.shadowRoot.querySelector('#label');
    label.clientWidth;
    this.$boxHolder.style.minWidth = `${label.clientWidth}px`;
  }
}
