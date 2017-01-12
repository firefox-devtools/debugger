const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { isEnabled } = require("devtools-config");
const Svg = require("./shared/Svg");
const ImPropTypes = require("react-immutable-proptypes");

const { getPause, getBreakpoints,
        getBreakpointsDisabled, getBreakpointsLoading
      } = require("../selectors");
const { prefs } = require("../utils/prefs");

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
const Accordion = React.createFactory(require("./shared/Accordion"));
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

  renderBreakpointsToggle() {
    const { toggleAllBreakpoints, breakpoints,
            breakpointsDisabled, breakpointsLoading } = this.props;
    const boxClassName = "breakpoints-toggle";
    const isIndeterminate = !breakpointsDisabled &&
      breakpoints.some(x => x.disabled);

    if (breakpoints.size == 0) {
      return null;
    }

    return dom.input({
      type: "checkbox",
      "aria-label": breakpointsDisabled ? L10N.getStr("breakpoints.enable") :
        L10N.getStr("breakpoints.disable"),
      className: boxClassName,
      disabled: breakpointsLoading,
      onClick: () => toggleAllBreakpoints(!breakpointsDisabled),
      checked: !breakpointsDisabled && !isIndeterminate,
      ref: (input) => {
        if (input) {
          input.indeterminate = isIndeterminate;
        }
      },
      title: breakpointsDisabled ? L10N.getStr("breakpoints.enable") :
        L10N.getStr("breakpoints.disable")
    });
  },

  watchExpressionHeaderButtons() {
    return [
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

  getScopeItem() {
    const isPaused = () => !!this.props.pauseData;

    return {
      header: L10N.getStr("scopes.header"),
      component: Scopes,
      opened: prefs.scopesVisible,
      onToggle: opened => {
        prefs.scopesVisible = opened;
      },
      shouldOpen: isPaused
    };
  },

  getWatchItem() {
    return { header: L10N.getStr("watchExpressions.header"),
      buttons: this.watchExpressionHeaderButtons(),
      component: Expressions,
      opened: true
    };
  },

  getStartItems() {
    const scopesContent = this.props.horizontal ? this.getScopeItem() : null;
    const isPaused = () => !!this.props.pauseData;

    const items = [
      { header: L10N.getStr("breakpoints.header"),
        buttons: this.renderBreakpointsToggle(),
        component: Breakpoints,
        opened: true },
      { header: L10N.getStr("callStack.header"),
        component: Frames,
        opened: prefs.callStackVisible,
        onToggle: opened => {
          prefs.callStackVisible = opened;
        },
        shouldOpen: isPaused },
      scopesContent
    ];

    if (isEnabled("eventListeners")) {
      items.push({
        header: L10N.getStr("eventListenersHeader"),
        component: EventListeners
      });
    }

    if (isEnabled("watchExpressions") && this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items.filter(item => item);
  },

  renderHorizontalLayout() {
    return Accordion({
      items: this.getItems()
    });
  },

  getEndItems() {
    const items = [];

    if (!this.props.horizontal) {
      items.unshift(this.getScopeItem());
    }

    if (isEnabled("watchExpressions") && !this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items;
  },

  getItems() {
    return [...this.getStartItems(), ...this.getEndItems()];
  },

  renderVerticalLayout() {
    return SplitBox({
      style: { width: "100vw" },
      initialSize: "300px",
      minSize: 10,
      maxSize: "50%",
      splitterSize: 1,
      startPanel: Accordion({ items: this.getStartItems() }),
      endPanel: Accordion({ items: this.getEndItems() })
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
