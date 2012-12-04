/*
test:
body\r\n\tcolor lighten(#fff, 20%)\r\n\tfont-size 50px\r\n\th1\r\n\t\ta\r\n\t\t\tcolor black\r\n\t\t\tposition relative\r\n\t\tdiv\r\n\t\t\tbackground blue\r\n\th2\r\n\t\ttext-shadow(1)\r\n\t\tbox-shadow 1px

*/

function styluscomb(style, opt) {

	/** this function will make an object from the style string
	 *
	 * @param string
	 * @return style - JSON obj
	 */

	function objectize(style) {
		return style.match(/^.*((\r\n|\n|\r)|$)/gm);
	}

	/** this function will sort
	 *
	 * @param style - JSON obj
	 * @return string
	 */

	function comb(style) {

		//fetch lines and delete empty ones
		var obj = style.filter(function(line) {
			return '' != line.replace(/\s+/g, '')
		});

		// create objects
		// '	color red' -> {indent: 1 , content: 'color red', type: 'unknow'}
		obj = obj.map(function(line) {
			var indentationLevel = (' ' + line.substr(0, line.search(/[^\s]/))).match(/\s/g).length - 1;
			var newLine = line.substr(line.search(/[^\s]/));

			return {
				indent: indentationLevel,
				content: newLine,
				type: 'unknown'
			}
		});

		// setting the type value
		obj.forEach(function(element, index, array) {
			if (rulesetIndex(element) != -1) element.type = 'rule';
			else element.type = 'unknown';

			if (array[index + 1] != undefined) {
				if (array[index + 1].indent > element.indent) element.type = 'parent';
			}

			
		});

		//creating parent-child tree
		obj.reverse().forEach(function(element, index, array) {
			if ( !! element) {
				if (element.indent > 0) {
					var parent = getParent(element, index, array);
					if (!(parent.children instanceof Array)) {
						parent.children = [];
					}
					parent.children.push(element);
					element.needDelete = true;
				}
			}
		});

		// getParent function for the forEach above

		function getParent(element, index, array) {
			var i = index;
			while (!(array[i].type == 'parent' && array[i].indent < element.indent) || i >= array.length) {
				++i;
			};
			return array[i];
		};

		//make null from the not needed elements
		obj.forEach(function(element, index, array) {
			if (element.needDelete) {
				delete array[index];
			};
		});

		//delete the nulls...
		obj = obj.filter(function(e) {
			return !!e;
		});

		//re-reverse the object, to get the original sequence

		function subreverse(obj) {
			obj.forEach(function(element, index, array) {
				if (element.children instanceof Array) {
					subreverse(element.children)
				}
			})
			obj = obj.reverse();
		}
		subreverse(obj);

		// sort finally :)

		function sorty(what) {
			if (what.length != 1) {
				what.sort(function(a, b) {
					return __sort(a, b);
				});
			} else {
				__sort(what[0], {
					type: 'rule'
				});
			}
		}

		function __sort(a, b) {
			//recursive call for children
			if (a.type == 'parent' && a.children) {
				sorty(a.children);
			}
			//delete the not used needDelete value
			if ( !! b.needDelete) {
				delete b.needDelete;
			}

			if (a.type == 'rule') {
				if (b.type == 'rule') {
					return rulesetIndex(a) > rulesetIndex(b) ? 1 : -1
				} else {
					return -1;
				};
			} else {
				if (a.type == 'unknown' && b.type == 'rule') {
					return 1;
				}
			}
			return -1;
		}

		sorty(obj);
		// obj.sort(function(a, b) { // ha return kisebb mint 0, akkor 'a' a kisebb
		// 	if (a.indent == b.indent) {
		// 		if (a.type == 'rule') {
		// 			if (b.type == 'rule') {
		// 				return rulesetIndex(a) < rulesetIndex(a) ? -1 : 1
		// 			}
		// 		} else if (a.type == 'unknown' && b.type == 'rule') return 1
		// 	}
		// 	return -1;
		// });
		return obj;
	}

	function stringify(obj) {
		return obj.map(function(element) {
			var i = element.indent,
				res = '',
				more = '';
			while (0 < i--) {
				res += '\t';
			};

			if (element.children instanceof Array) {
				more = stringify(element.children);
			}
			if (!(/\n/.test(element.content))) {
				element.content += '\n';
			}

			return res.slice(0, '\t'.length * element.indent) + element.content + more;
		}).join('');
	}

	function rulesetIndex(s) {
		if (!s.content) return ruleset.length;
		return ruleset.indexOf(s.content.substr(0, s.content.search(/[\s]/)));
	}


	var options, sort_order = [],
		ruleset = [],
		lineBreaks = /\r\n/.test(style) ? '\r\n' : '\n',

		//set the options from arguments
		options = arguments.length > 1 ? opt : {};
	if (typeof options.indent === 'undefined') {
		options.indent = '	';
	}

	//default sorting order
	sort_order = [
		["position", "z-index", "top", "right", "bottom", "left"],
		["display", "visibility", "float", "clear", "overflow", "overflow-x", "overflow-y", "-ms-overflow-x", "-ms-overflow-y", "clip", "zoom", "flex-direction", "flex-order", "flex-pack", "flex-align"],
		["-webkit-box-sizing", "-moz-box-sizing", "box-sizing", "width", "min-width", "max-width", "height", "min-height", "max-height", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left"],
		["table-layout", "empty-cells", "caption-side", "border-spacing", "border-collapse", "list-style", "list-style-position", "list-style-type", "list-style-image"],
		["content", "quotes", "counter-reset", "counter-increment", "resize", "cursor", "nav-index", "nav-up", "nav-right", "nav-down", "nav-left", "-webkit-transition", "-moz-transition", "-ms-transition", "-o-transition", "transition", "-webkit-transition-delay", "-moz-transition-delay", "-ms-transition-delay", "-o-transition-delay", "transition-delay", "-webkit-transition-timing-function", "-moz-transition-timing-function", "-ms-transition-timing-function", "-o-transition-timing-function", "transition-timing-function", "-webkit-transition-duration", "-moz-transition-duration", "-ms-transition-duration", "-o-transition-duration", "transition-duration", "-webkit-transition-property", "-moz-transition-property", "-ms-transition-property", "-o-transition-property", "transition-property", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform", "-webkit-transform-origin", "-moz-transform-origin", "-ms-transform-origin", "-o-transform-origin", "transform-origin", "-webkit-animation", "-moz-animation", "-ms-animation", "-o-animation", "animation", "-webkit-animation-name", "-moz-animation-name", "-ms-animation-name", "-o-animation-name", "animation-name", "-webkit-animation-duration", "-moz-animation-duration", "-ms-animation-duration", "-o-animation-duration", "animation-duration", "-webkit-animation-play-state", "-moz-animation-play-state", "-ms-animation-play-state", "-o-animation-play-state", "animation-play-state", "-webkit-animation-timing-function", "-moz-animation-timing-function", "-ms-animation-timing-function", "-o-animation-timing-function", "animation-timing-function", "-webkit-animation-delay", "-moz-animation-delay", "-ms-animation-delay", "-o-animation-delay", "animation-delay", "-webkit-animation-iteration-count", "-moz-animation-iteration-count", "-ms-animation-iteration-count", "-o-animation-iteration-count", "animation-iteration-count", "-webkit-animation-iteration-count", "-moz-animation-iteration-count", "-ms-animation-iteration-count", "-o-animation-iteration-count", "animation-iteration-count", "-webkit-animation-direction", "-moz-animation-direction", "-ms-animation-direction", "-o-animation-direction", "animation-direction", "text-align", "text-align-last", "-ms-text-align-last", "text-align-last", "vertical-align", "white-space", "text-decoration", "text-emphasis", "text-emphasis-color", "text-emphasis-style", "text-emphasis-position", "text-indent", "-ms-text-justify", "text-justify", "text-transform", "letter-spacing", "word-spacing", "-ms-writing-mode", "text-outline", "text-transform", "text-wrap", "text-overflow", "-ms-text-overflow", "text-overflow-ellipsis", "text-overflow-mode", "-ms-word-wrap", "word-wrap", "word-break", "-ms-word-break", "-moz-tab-size", "-o-tab-size", "tab-size", "-webkit-hyphens", "-moz-hyphens", "hyphens"],
		["opacity", "filter:progid:DXImageTransform.Microsoft.Alpha(Opacity", "-ms-filter:'progid:DXImageTransform.Microsoft.Alpha", "-ms-interpolation-mode", "color", "border", "border-collapse", "border-width", "border-style", "border-color", "border-top", "border-top-width", "border-top-style", "border-top-color", "border-right", "border-right-width", "border-right-style", "border-right-color", "border-bottom", "border-bottom-width", "border-bottom-style", "border-bottom-color", "border-left", "border-left-width", "border-left-style", "border-left-color", "-webkit-border-radius", "-moz-border-radius", "border-radius", "-webkit-border-top-right-radius", "-moz-border-top-right-radius", "border-top-right-radius", "-webkit-border-bottom-right-radius", "-moz-border-bottom-right-radius", "border-bottom-right-radius", "-webkit-border-bottom-left-radius", "-moz-border-bottom-left-radius", "border-bottom-left-radius", "-webkit-border-top-left-radius", "-moz-border-top-left-radius", "border-top-left-radius", "-webkit-border-image", "-moz-border-image", "-o-border-image", "border-image", "-webkit-border-image-source", "-moz-border-image-source", "-o-border-image-source", "border-image-source", "-webkit-border-image-slice", "-moz-border-image-slice", "-o-border-image-slice", "border-image-slice", "-webkit-border-image-width", "-moz-border-image-width", "-o-border-image-width", "border-image-width", "-webkit-border-image-outset", "-moz-border-image-outset", "-o-border-image-outset", "border-image-outset", "-webkit-border-image-repeat", "-moz-border-image-repeat", "-o-border-image-repeat", "border-image-repeat", "outline", "outline-width", "outline-style", "outline-color", "outline-offset", "background", "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-position-x", "-ms-background-position-x", "background-position-y", "-ms-background-position-y", "background-clip", "background-origin", "background-size", "box-decoration-break", "-webkit-box-shadow", "-moz-box-shadow", "box-shadow", "-webkit-box-shadow", "-moz-box-shadow", "box-shadow", "-webkit-box-shadow", "-moz-box-shadow", "box-shadow", "-webkit-box-shadow", "-moz-box-shadow", "box-shadow", "filter:progid:DXImageTransform.Microsoft.gradient", "-ms-filter:'progid:DXImageTransform.Microsoft.gradient", "text-shadow"],
		["font", "font-family", "font-size", "font-weight", "font-style", "font-variant", "font-size-adjust", "font-stretch", "font-effect", "font-emphasize", "font-emphasize-position", "font-emphasize-style", "font-smooth", "line-height"]
	];

	//save all of the possible CSS rules in a single array
	for (var i in sort_order) {
		for (var j in sort_order[i]) {
			ruleset.push(sort_order[i][j]);
		}
	}

	if (!style) {
		style = '';
	}
	if (style.lastIndexOf('\n') + 1 != style.length) {
		style += lineBreaks;
	}

	var ret = stringify(comb(objectize(style)));

	return ret.substr(0, ret.length - 1);
}

if (typeof exports !== "undefined") exports.styluscomb = styluscomb;