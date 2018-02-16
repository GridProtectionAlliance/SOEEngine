"use strict";
//******************************************************************************************************
//  PrimeAccordionWrapper.tsx - Gbtc
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
//  Wrapper class for Prime React Accordion licensed under The MIT License
//
//      https://www.primefaces.org/primereact/#/accordion
//
//  License
//  The MIT License (MIT)
//
//  Copyright (c) 2017 PrimeTek
//
//  ----------------------------------------------------------------------------------------------------
//  02/08/2018 - Billy Ernest
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
var Accordion_1 = require("primereact/components/accordion/Accordion");
var PropTypes = require("prop-types");
var PrimeAccordioWrapper = /** @class */ (function (_super) {
    __extends(PrimeAccordioWrapper, _super);
    function PrimeAccordioWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrimeAccordioWrapper.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: "content-section" },
                React.createElement("div", { className: "feature-intro" },
                    React.createElement("h1", null, "Accordion"),
                    React.createElement("p", null, "Accordion groups a collection of contents in tabs."))),
            React.createElement("div", { className: "content-section implementation" },
                React.createElement("h3", null, "Default"),
                React.createElement(Accordion_1.Accordion, null,
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather I" }, "The story begins as Don Vito Corleone, the head of a New York Mafia family, oversees his daughters wedding. His beloved son Michael has just come home from the war, but does not intend to become part of his fathers business. Through Michaels life the nature of the family business becomes clear. The business of the family is just like the head of the family, kind and benevolent to those who give respect, but given to ruthless violence whenever anything stands against the good of the family."),
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather II" }, "Francis Ford Coppolas legendary continuation and sequel to his landmark 1972 film, The_Godfather parallels the young Vito Corleone's rise with his son Michael's spiritual fall, deepening The_Godfathers depiction of the dark side of the American dream. In the early 1900s, the child Vito flees his Sicilian village for America after the local Mafia kills his family. Vito struggles to make a living, legally or illegally, for his wife and growing brood in Little Italy, killing the local Black Hand Fanucci after he demands his customary cut of the tyro's business. With Fanucci gone, Vito's communal stature grows."),
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather III" }, "After a break of more than 15 years, director Francis Ford Coppola and writer Mario Puzo returned to the well for this third and final story of the fictional Corleone crime family. Two decades have passed, and crime kingpin Michael Corleone, now divorced from his wife Kay has nearly succeeded in keeping his promise that his family would one day be completely legitimate.")),
                React.createElement("h3", null, "Multiple"),
                React.createElement(Accordion_1.Accordion, { multiple: true },
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather I" }, "The story begins as Don Vito Corleone, the head of a New York Mafia family, oversees his daughters wedding. His beloved son Michael has just come home from the war, but does not intend to become part of his fathers business. Through Michaels life the nature of the family business becomes clear. The business of the family is just like the head of the family, kind and benevolent to those who give respect, but given to ruthless violence whenever anything stands against the good of the family."),
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather II" }, "Francis Ford Coppolas legendary continuation and sequel to his landmark 1972 film, The_Godfather parallels the young Vito Corleone's rise with his son Michael's spiritual fall, deepening The_Godfathers depiction of the dark side of the American dream. In the early 1900s, the child Vito flees his Sicilian village for America after the local Mafia kills his family. Vito struggles to make a living, legally or illegally, for his wife and growing brood in Little Italy, killing the local Black Hand Fanucci after he demands his customary cut of the tyro's business. With Fanucci gone, Vito's communal stature grows."),
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather III" }, "After a break of more than 15 years, director Francis Ford Coppola and writer Mario Puzo returned to the well for this third and final story of the fictional Corleone crime family. Two decades have passed, and crime kingpin Michael Corleone, now divorced from his wife Kay has nearly succeeded in keeping his promise that his family would one day be completely legitimate."),
                    React.createElement(Accordion_1.AccordionTab, { header: "Godfather IV", disabled: true })))));
    };
    PrimeAccordioWrapper.propTypes = {
        accordionTab: PropTypes.objectOf({
            header: PropTypes.string,
            disabled: PropTypes.bool,
        })
    };
    PrimeAccordioWrapper.defaultProps = {};
    return PrimeAccordioWrapper;
}(React.Component));
exports.default = PrimeAccordioWrapper;
//# sourceMappingURL=PrimeAccordionWrapper.js.map