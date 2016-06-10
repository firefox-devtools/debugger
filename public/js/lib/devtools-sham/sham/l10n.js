/**
 * Import a .properties file via properties-loader (just specify .properties) and pass
 * that object into this constructor to get methods matching nsIStringBundle:
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIStringBundle
 */

function L10N (props) {
  this.props = props;
}

L10N.prototype.GetStringFromName = function (name) {
  return this.props[name];
};

L10N.prototype.formatStringFromName = function (name, values) {
  var result = this.GetStringFromName(name);

  for (var i = 0; i < values.length; i++) {
    result = result.replace(/%S/, values[i]);
  }

  return result;
};

module.exports = L10N;
