export default new Proxy({}, {
    get: (_, prop) => prop,
});