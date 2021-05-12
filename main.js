const jsonServer = require("json-server");
const queryString = require("query-string");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
    res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
    if (req.method === "POST") {
        req.body.createdAt = Date.now();
        req.body.updatedAt = Date.now();
    }
    // Continue to JSON Server router
    next();
});

router.render = (req, res) => {
    const headers = res.getHeaders();
    const totalCount = headers["x-total-count"];
    const query = req._parsedUrl.query;

    if (req.method === "GET" && totalCount) {
        const result = {
            data: res.locals.data,
            pagination: {
                _limit: Number.parseInt(queryString.parse(query)._limit) || 1,
                _page: Number.parseInt(queryString.parse(query)._page) || 1,
                _totalRows: totalCount,
            },
        };
        res.jsonp(result);
        return;
    }

    res.jsonp({
        body: res.locals.data,
    });
};

// Use default router
server.use("/api", router);
server.listen(3000, () => {
    console.log("JSON Server is running");
});
