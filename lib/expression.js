
/* jshint withstmt: true, evil: true */

module.exports = function evaluate(body, bindId, name, ctx) {
  with (ctx) {
    try {
      return eval(body);
    }
    catch (e) {
      Ti.API.error(
        "Got an error while parsing the object for " + bindId + "." + name);
      return undefined;
    }
  }
};
