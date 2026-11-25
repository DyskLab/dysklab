/* Mulai aplikasi setelah semua berkas dimuat */
"use strict";
load(); initState();
window.RM = { get DB() { return DB; }, quote, carFree, conflict, checkRange, charge, cancelInfo, changeInfo, latePen, route, resetDemo, save, nextFree, revenue, get ORD() { return ORD; }, get Q() { return Q; } };
route();
