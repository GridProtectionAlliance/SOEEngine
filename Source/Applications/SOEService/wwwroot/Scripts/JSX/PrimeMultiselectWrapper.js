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
require("font-awesome/css/font-awesome.css");
require("primereact/resources/primereact.css");
require("primereact/resources/themes/omega/theme.css");
require("primereact/components/multiselect/MultiSelect.css");
var Multiselect_1 = require("primereact/components/multiselect/Multiselect");
var PropTypes = require("prop-types");
var PrimeMultiSelectWrapper = (function (_super) {
    __extends(PrimeMultiSelectWrapper, _super);
    function PrimeMultiSelectWrapper(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            value: props.value
        };
        return _this;
    }
    PrimeMultiSelectWrapper.prototype.onChange = function (e) {
        this.setState({ value: e.value });
        if (this.props.onChange != undefined)
            this.props.onChange(this.state.value);
    };
    PrimeMultiSelectWrapper.prototype.render = function () {
        return (React.createElement("div", { className: "form-group" },
            this.props.formLabel != undefined ? (React.createElement("label", null, this.props.formLabel)) : (null),
            React.createElement(Multiselect_1.MultiSelect, { id: this.props.id, value: this.state.value, options: this.props.options, style: this.props.style, className: this.props.className, scrollHeight: this.props.scrollHeight, defaultLabel: this.props.defaultLabel, filter: true, key: this.props.key, itemTemplate: this.props.itemTemplate, appendTo: this.props.appendTo, onChange: this.onChange.bind(this) })));
    };
    PrimeMultiSelectWrapper.propTypes = {
        id: PropTypes.string,
        value: PropTypes.array,
        options: PropTypes.array,
        style: PropTypes.object,
        className: PropTypes.string,
        scrollHeight: PropTypes.string,
        defaultLabel: PropTypes.string,
        filter: PropTypes.bool,
        key: PropTypes.string,
        itemTemplate: PropTypes.func,
        appendTo: PropTypes.object,
        onChange: PropTypes.func,
        formLabel: PropTypes.string,
    };
    PrimeMultiSelectWrapper.defaultProps = {
        id: undefined,
        value: undefined,
        options: undefined,
        style: undefined,
        className: undefined,
        scrollHeight: '200px',
        defaultLabel: 'Choose',
        filter: true,
        key: undefined,
        itemTemplate: undefined,
        appendTo: undefined,
        onChange: undefined,
        formLabel: undefined
    };
    return PrimeMultiSelectWrapper;
}(React.Component));
exports.default = PrimeMultiSelectWrapper;
//# sourceMappingURL=PrimeMultiselectWrapper.js.map