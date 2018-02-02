"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Table = function (_React$Component) {
    _inherits(Table, _React$Component);

    function Table(props) {
        _classCallCheck(this, Table);

        return _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).call(this, props));
    }

    _createClass(Table, [{
        key: "render",
        value: function render() {
            var headerComponents = this.generateHeaders(),
                rowComponents = this.generateRows();

            return React.createElement(
                "table",
                { className: "table table-condensed table-hover" },
                React.createElement(
                    "thead",
                    null,
                    headerComponents
                ),
                React.createElement(
                    "tbody",
                    null,
                    rowComponents
                )
            );
        }
    }, {
        key: "generateHeaders",
        value: function generateHeaders() {
            var cols = this.props.cols; // [{key, label}]

            // generate our header (th) cell components
            return React.createElement(
                "tr",
                null,
                cols.map(function (colData) {
                    return React.createElement(
                        "th",
                        { key: colData.key },
                        colData.label
                    );
                })
            );
        }
    }, {
        key: "generateRows",
        value: function generateRows() {
            var ctrl = this;
            var cols = ctrl.props.cols,
                // [{key, label}]
            data = ctrl.props.data;

            return data.map(function (item) {
                // build each cell
                var cells = cols.map(function (colData) {
                    // colData.key might be "firstName"
                    return React.createElement(
                        "td",
                        { key: item[colData.key] + colData.key, onClick: ctrl.handleClick },
                        item[colData.key]
                    );
                });

                return React.createElement(
                    "tr",
                    { key: item.id },
                    cells
                );
            });
        }
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            console.log(event);
        }
    }]);

    return Table;
}(React.Component);

;
