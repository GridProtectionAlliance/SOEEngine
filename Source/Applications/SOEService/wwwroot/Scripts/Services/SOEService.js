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
    ;
    SOEService.prototype.getIncidentGroups = function (filters) {
        return axios_1.default
            .post('/api/Main/GetIncidentGroups/model', {
            IncidentID: filters.IncidentID
        })
            .then(function (res) {
            return res.data;
        });
    };
    SOEService.prototype.getIncidentData = function (filters) {
        return axios_1.default
            .post('/api/Main/GetIncidentData/' + filters.meterId + '-' + filters.type, {
            circuitId: filters.circuitId,
            startDate: filters.startDate,
            endDate: filters.endDate,
            meterId: filters.meterId,
            type: filters.type,
            pixels: filters.pixels
        })
            .then(function (res) {
            return res.data;
        });
    };
    SOEService.prototype.getEventID = function (incidentId) {
        return axios_1.default
            .get('/api/Main/GetEventID/event/' + incidentId)
            .then(function (res) {
            return res.data;
        });
    };
    return SOEService;
}());
exports.default = SOEService;
//# sourceMappingURL=SOEService.js.map