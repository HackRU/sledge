"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SledgeProvider = void 0;
class SledgeProvider {
    constructor(socket) {
        this.socket = socket;
    }
    getList(resource, params) {
        return this.socket.sendRequest({
            requestName: "REQUEST_GET_OBJECTS",
            table: resource
        }).then((res) => {
            let data = res.rows;
            if (params.pagination) {
                data = res.rows.slice((params.pagination.page - 1) * params.pagination.perPage, params.pagination.page * params.pagination.perPage);
            }
            return Promise.resolve({
                data,
                total: res.rows.length
            });
        });
    }
    getOne(resource, params) {
        throw new Error("NYI");
    }
    getMany(resource, params) {
        throw new Error("NYI");
    }
    getManyReference(resource, params) {
        throw new Error("NYI");
    }
    update(resource, params) {
        throw new Error("NYI");
    }
    updateMany(resource, params) {
        throw new Error("nyi");
    }
    create(resource, params) {
        throw new Error("NYI");
    }
    delete(resource, params) {
        throw new Error("Operation Not Supported");
    }
    deleteMany(resource, params) {
        throw new Error("Operation Not Supported");
    }
}
exports.SledgeProvider = SledgeProvider;
//# sourceMappingURL=SledgeProvider.js.map