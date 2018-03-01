"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var PropTypes = require("prop-types");
var _ = require("lodash");
var Select = (function (_super) {
    __extends(Select, _super);
    function Select(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            value: (props.value != null ? props.value : '')
        };
        return _this;
    }
    Select.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps)))
            this.setState({
                value: (nextProps.value != null ? nextProps.value : '')
            });
    };
    Select.prototype.onChange = function (event) {
        this.setState({ value: event.target.value });
        if (this.props.onChange != undefined)
            this.props.onChange(event.target.value);
    };
    Select.prototype.clear = function () {
        this.setState({ value: '' });
        if (this.props.onChange != undefined)
            this.props.onChange(null);
    };
    Select.prototype.render = function () {
        return (React.createElement("div", { className: 'form-group' + (this.props.clearable ? ' clearable-input' : ''), style: { width: '100%' } },
            this.props.formLabel != undefined ? (React.createElement("label", null, this.props.formLabel)) : (null),
            React.createElement("input", { className: this.props.class, type: this.props.type, onChange: this.onChange.bind(this), value: this.state.value }),
            this.props.clearable ? (React.createElement("span", { "data-clear-input": true, onClick: this.clear.bind(this) }, "\u00D7")) : (null)));
    };
    Select.propTypes = {
        class: PropTypes.string,
        formLabel: PropTypes.string,
        type: PropTypes.string,
        value: PropTypes.any,
        onChange: PropTypes.func,
        clearable: PropTypes.bool
    };
    Select.defaultProps = {
        class: 'form-control',
        formLabel: null,
        type: 'text',
        value: null,
        onChange: null,
        clearable: false
    };
    return Select;
}(React.Component));
exports.default = Select;
//# sourceMappingURL=Input.js.map