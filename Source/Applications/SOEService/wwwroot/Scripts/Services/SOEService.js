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
            date: moment(filters.date, 'YYYYMMDDHH').format('YYYY-MM-DDTHH:mm:ssZ'),
            timeContext: filters.timeContext,
            numBuckets: filters.numBuckets,
            limits: filters.limits,
            levels: filters.levels,
            circuitName: (filters.levels == 'Device' ? filters.filter : null),
            systemName: (filters.levels == 'Circuit' ? filters.filter : null)
        })
            .then(function (res) {
            return res.data;
        });
    };
    return SOEService;
}());
exports.default = SOEService;
//# sourceMappingURL=SOEService.js.map