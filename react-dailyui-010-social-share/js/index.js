'use strict';

// Data Object
var data = {
	title: 'ReactJS Daily UI Collection',
	author: 'Jack-Edward Oliver',
	image: 'http://static1.squarespace.com/static/55acc005e4b098e615cd80e2/5777cee5b8a79b6f0197ecba/5794e1a320099e05310a2d50/1469374903360/IMG_3270.jpg?format=750w',
	url: 'http://codepen.io/collection/DoLZRm/',
	share: [{
		type: 'facebook',
		count: 24,
		url: 'https://www.facebook.com/sharer/sharer.php?s=100&p[url]=http://codepen.io/collection/DoLZRm/'
	}, {
		type: 'twitter',
		count: 11,
		url: 'https://twitter.com/intent/tweet?hashtags=react,ui,dev&text=ReactJS%20Daily%20UI%20on%20Codepen&tw_p=tweetbutton&url=http://codepen.io/collection/DoLZRm/&via=mrjackolai'
	}]
};

// Components
var App = React.createClass({
	displayName: 'App',

	getDefaultProps: function getDefaultProps() {
		return data;
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'App' },
			React.createElement(Image, { title: this.props.title, author: this.props.author, image: this.props.image }),
			React.createElement(Buttons, { data: this.props })
		);
	}
});

var Image = React.createClass({
	displayName: 'Image',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'Image', style: { backgroundImage: 'url(' + this.props.image + ')' } },
			React.createElement(
				'div',
				{ className: 'content' },
				React.createElement(
					'h1',
					null,
					this.props.title
				),
				React.createElement(
					'h2',
					null,
					'by ',
					this.props.author
				)
			)
		);
	}
});

var Buttons = React.createClass({
	displayName: 'Buttons',

	render: function render() {
		var buttons = this.props.data.share.map(function (button, i) {
			return React.createElement(Button, { type: button.type, shares: button.count, url: button.url });
		});

		return React.createElement(
			'div',
			{ className: 'Buttons' },
			buttons
		);
	}
});

var Button = React.createClass({
	displayName: 'Button',

	render: function render() {
		var className = 'fa fa-fw fa-' + this.props.type;
		return React.createElement(
			'a',
			{ href: this.props.url, target: '_blank', className: 'Button', 'data-type': this.props.type, 'data-shares': this.props.shares },
			React.createElement('i', { className: className }),
			React.createElement(
				'span',
				{ className: 'text' },
				this.props.type
			)
		);
	}
});

// Render'n yo.
ReactDOM.render(React.createElement(App, null), document.getElementById('app'));