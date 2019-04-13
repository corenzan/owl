import Route from "route-parser";
export default (route, path) => new Route(route).match(path);
