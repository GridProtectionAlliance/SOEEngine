"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var moment = require("moment");
var SOEService = (function () {
    function SOEService() {
    }
    SOEService.prototype.getView = function (filters) {
        return axios_1.default
            .post('/api/Main/GetView/model', {
            date: moment(filters.date).format('YYYY-MM-DDTHH:mm:ssZ'),
            timeContext: filters.timeContext,
            numBuckets: filters.numBuckets,
            limits: filters.limits,
            levels: filters.levels,
            circuitName: filters.circuitName,
            systemName: filters.systemName
        })
            .then(function (res) {
            return res.data;
        });
    };
    return SOEService;
}());
exports.default = SOEService;
//# sourceMappingURL=SOEService.js.map