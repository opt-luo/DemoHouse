/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'pgicons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'cbp-pgicon-loop-alt4' : '&#xe001;',
			'cbp-pgicon-cart' : '&#xe000;',
			'cbp-pgicon-heart' : '&#xe002;',
			'cbp-pgicon-heart-2' : '&#xe003;',
			'cbp-pgicon-angle-left' : '&#xf104;',
			'cbp-pgicon-angle-right' : '&#xf105;',
			'cbp-pgicon-rotate' : '&#xe004;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/cbp-pgicon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};