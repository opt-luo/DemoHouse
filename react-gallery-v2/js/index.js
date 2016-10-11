'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App() {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, _React$Component.call(this));

		_this.state = {
			data: [],
			activeID: 0,
			imageView: false
		};
		return _this;
	}

	App.prototype.componentWillMount = function componentWillMount() {
		this._loadData('https://s3-us-west-2.amazonaws.com/s.cdpn.io/735173/rpg-2-data.json');
	};

	App.prototype.componentWillUnmount = function componentWillUnmount() {
		this._loadData.abort();
	};
	// Fetch data, then clone it to state using destructuring
	// XHR Fallback

	App.prototype._loadData = function _loadData(url) {
		var _this2 = this;

		fetch(url, {
			method: 'GET'
		}).then(function (response) {
			return response.json();
		}).then(function (json) {
			return _this2.setState({
				data: [].concat(json.gallery)
			});
		}).catch(function (err) {
			console.log(err.message);
			try {
				(function () {
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url);
					xhr.responseType = 'json';

					xhr.onload = function () {
						var json = xhr.response;
						_this2.setState({
							data: [].concat(json.gallery)
						});
					};

					xhr.onerror = function () {
						throw new Error('XMLHttpRequest Failed...');
					};

					xhr.send();
				})();
			} catch (e) {
				console.log(e.message);
			}
		});
	};

	App.prototype._openImageView = function _openImageView(id) {
		this.setState({
			activeID: id,
			imageView: true
		});
	};

	App.prototype._closeImageView = function _closeImageView() {
		this.setState({
			imageView: false
		});
	};

	App.prototype.render = function render() {
		return React.createElement(
			'div',
			{ className: 'wrapper' },
			this.state.imageView ? React.createElement(ImageView, _extends({}, this.state.data[this.state.activeID], {
				_closeImageView: this._closeImageView.bind(this) })) : React.createElement(Gallery, { data: this.state.data,
				_openImageView: this._openImageView.bind(this) })
		);
	};

	return App;
}(React.Component);

var ImageView = function (_React$Component2) {
	_inherits(ImageView, _React$Component2);

	function ImageView() {
		_classCallCheck(this, ImageView);

		return _possibleConstructorReturn(this, _React$Component2.apply(this, arguments));
	}

	ImageView.prototype.render = function render() {
		return React.createElement(
			'div',
			{ className: 'imageview-wrapper fadeIn' },
			React.createElement(
				'div',
				{ className: 'imageview' },
				React.createElement(Image, { CSSClass: 'imageview-image',
					src: this.props.src,
					alt: this.props.name }),
				React.createElement(
					'div',
					{ className: 'imageview-info' },
					React.createElement(
						'button',
						{ className: 'imageview-close', onClick: this.props._closeImageView },
						'x'
					),
					React.createElement(
						'h2',
						null,
						this.props.name
					),
					React.createElement(
						'p',
						null,
						this.props.desc
					),
					React.createElement(
						'h3',
						null,
						'Tags'
					),
					React.createElement(
						'ul',
						null,
						this.props.tags.map(function (tag) {
							return React.createElement(
								'li',
								null,
								tag
							);
						})
					)
				)
			)
		);
	};

	return ImageView;
}(React.Component);

var Gallery = function (_React$Component3) {
	_inherits(Gallery, _React$Component3);

	function Gallery() {
		_classCallCheck(this, Gallery);

		return _possibleConstructorReturn(this, _React$Component3.apply(this, arguments));
	}

	Gallery.prototype.render = function render() {
		var _this5 = this;

		return React.createElement(
			'div',
			{ className: 'gallery fadeIn' },
			this.props.data.map(function (data) {
				return React.createElement(Tile, { key: data.id,
					id: data.id,
					src: data.src,
					name: data.name,
					desc: data.desc,
					_openImageView: _this5.props._openImageView });
			})
		);
	};

	return Gallery;
}(React.Component);

var Tile = function (_React$Component4) {
	_inherits(Tile, _React$Component4);

	function Tile() {
		_classCallCheck(this, Tile);

		return _possibleConstructorReturn(this, _React$Component4.apply(this, arguments));
	}

	Tile.prototype._handleClick = function _handleClick() {
		this.props._openImageView(this.props.id);
	};

	Tile.prototype.render = function render() {
		return React.createElement(
			'div',
			{ className: 'gallery-tile', onClick: this._handleClick.bind(this) },
			React.createElement(
				'div',
				{ className: 'picture-info' },
				React.createElement(
					'h2',
					null,
					this.props.name
				)
			),
			React.createElement(Image, {
				CSSClass: 'tile-image',
				src: this.props.src,
				alt: this.props.name })
		);
	};

	return Tile;
}(React.Component);

var Image = function Image(props) {
	return React.createElement('img', {
		className: props.CSSClass,
		src: props.src,
		alt: props.name });
};

// Render app
ReactDOM.render(React.createElement(App, null), document.getElementById('app'));