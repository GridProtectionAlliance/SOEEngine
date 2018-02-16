"use strict";
//******************************************************************************************************
//  PrimeMultiselectWrapper.jsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Wrapper class for Prime React Multiselect licensed under The MIT License
//
//      https://www.primefaces.org/primereact/#/multiselect
//
//  License
//  The MIT License (MIT)
//
//  Copyright (c) 2017 PrimeTek
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/07/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
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
var PrimeMultiSelectWrapper = /** @class */ (function (_super) {
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