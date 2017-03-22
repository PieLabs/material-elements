export let noselect = `
    -webkit-touch-callout: none; 
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none; 
    user-select: none; 
`;

export function prepareTemplate(templateHTML, elementName) {
	const template = document.createElement('template');
	template.innerHTML = templateHTML;
	ShadyCSS.prepareTemplate(template, elementName);
	return template;
}

export function applyStyle(el, template, isShadow) {
	isShadow = isShadow !== false;

	ShadyCSS.styleElement(el);
	let templateCopy = document.importNode(template.content, true);
	if (isShadow) {
		let shadowRoot = el.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(templateCopy);
		return shadowRoot;
	} else {
		el.appendChild(templateCopy);
	}
}