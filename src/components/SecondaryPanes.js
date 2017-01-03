const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { isEnabled } = require("devtools-config");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");

const { getPause, getBreakpoints,
        getBreakpointsDisabled, getBreakpointsLoading
      } = require("../selectors");

const actions = require("../actions");
const WhyPaused = React.createFactory(require("./WhyPaused"));
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Expressions = React.createFactory(require("./Expressions"));

const SplitBox = createFactory(require("devtools-modules").SplitBox);
const Scopes = isEnabled("chromeScopes")
  ? React.createFactory(require("./ChromeScopes"))
  : React.createFactory(require("./Scopes"));

const Frames = React.createFactory(require("./Frames"));
const EventListeners = React.createFactory(require("./EventListeners"));
const Accordion = React.createFactory(require("./Accordion"));
const CommandBar = React.createFactory(require("./CommandBar"));
require("./SecondaryPanes.css");

function debugBtn(onClick, type, className, tooltip) {
  className = `${type} ${className}`;
  return dom.button(
    { onClick, className, key: type, title: tooltip },
    Svg(type, { title: tooltip, "aria-label": tooltip })
  );
}

const SecondaryPanes = React.createClass({
  propTypes: {
    evaluateExpressions: PropTypes.func,
    pauseData: ImPropTypes.map,
    horizontal: PropTypes.bool,
    breakpoints: ImPropTypes.map,
    breakpointsDisabled: PropTypes.bool,
    breakpointsLoading: PropTypes.bool,
    toggleAllBreakpoints: PropTypes.func
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "SecondaryPanes",

  getInitialState() {
    return {
      expressionInputVisibility: true
    };
  },

  renderBreakpointsSwitch() {
    const { toggleAllBreakpoints, breakpoints,
            breakpointsDisabled, breakpointsLoading } = this.props;
    const boxClassName = "breakpoints-toggle";

    if (breakpoints.size == 0 || breakpointsLoading) {
      return dom.input({
        type: "checkbox",
        className: boxClassName,
        disabled: true,
        title: L10N.getStr("breakpoints.disable")
      });
    }

    return dom.input({
      type: "checkbox",
      className: boxClassName,
      onClick: () => toggleAllBreakpoints(!breakpointsDisabled),
      defaultChecked: true,
      ref: (input) => {
        if (input != null) {
          const isIndeterminate = !breakpointsDisabled &&
            breakpoints.some(x => x.disabled);
          input.indeterminate = isIndeterminate;
          // checked=true would override the indeterminate value
          input.checked = !breakpointsDisabled && !isIndeterminate;
        }
      },
      title: breakpointsDisabled ? L10N.getStr("breakpoints.enable") :
        L10N.getStr("breakpoints.disable")
    });
  },

  watchExpressionHeaderButtons() {
    const { expressionInputVisibility } = this.state;
    return [
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.setState({
            expressionInputVisibility: !expressionInputVisibility
          });
        },
        "plus",
        "add-button",
        L10N.getStr("watchExpressions.addButton")
      ),
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.props.evaluateExpressions();
        },
        "refresh",
        "refresh",
        L10N.getStr("watchExpressions.refreshButton")
      )
    ];
  },

  getItems() {
    const { expressionInputVisibility } = this.state;
    const isPaused = () => !!this.props.pauseData;

    const scopesContent = this.props.horizontal ? {
      header: L10N.getStr("scopes.header"),
      component: Scopes,
      shouldOpen: isPaused
    } : null;

    const items = [
      { header: L10N.getStr("breakpoints.header"),
        buttons: this.renderBreakpointsSwitch(),
        component: Breakpoints,
        opened: true },
      { header: L10N.getStr("callStack.header"),
        component: Frames,
        shouldOpen: isPaused },
      scopesContent
    ];

    if (isEnabled("eventListeners")) {
      items.push({
        header: L10N.getStr("eventListenersHeader"),
        component: EventListeners
      });
    }

    if (isEnabled("watchExpressions")) {
      items.unshift({ header: L10N.getStr("watchExpressions.header"),
        buttons: this.watchExpressionHeaderButtons(),
        component: Expressions,
        componentProps: { expressionInputVisibility },
        opened: true
      });
    }

    return items.filter(item => item);
  },

  renderHorizontalLayout() {
    return Accordion({
      items: this.getItems()
    });
  },

  renderVerticalLayout() {
    return SplitBox({
      style: { width: "100vw" },
      initialSize: "300px",
      minSize: 10,
      maxSize: "50%",
      splitterSize: 1,
      startPanel: Accordion({ items: this.getItems() }),
      endPanel: Scopes()
    });
  },

  render() {
    return dom.div(
      { className: "secondary-panes",
        style: { overflowX: "hidden" }},
      CommandBar(),
      WhyPaused(),
      this.props.horizontal ?
        this.renderHorizontalLayout() : this.renderVerticalLayout()
    );
  }
});

module.exports = connect(
  state => ({
    pauseData: getPause(state),
    breakpoints: getBreakpoints(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SecondaryPanes);
