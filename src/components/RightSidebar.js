const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { isEnabled } = require("devtools-config");
const Svg = require("./utils/Svg");

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Expressions = React.createFactory(require("./Expressions"));
const Scopes = React.createFactory(require("./Scopes"));
const Frames = React.createFactory(require("./Frames"));
const Accordion = React.createFactory(require("./Accordion").Accordion);
const AccordionPane = React.createFactory(require("./Accordion").AccordionPane);
const CommandBar = React.createFactory(require("./CommandBar"));

require("./RightSidebar.css");

function debugBtn(onClick, type, className, tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const RightSidebar = React.createClass({

  propTypes: {
    evaluateExpressions: PropTypes.func,
  },

  displayName: "RightSidebar",

  getInitialState() {
    return {
      expressionInputVisibility: false
    };
  },

  renderButtons() {
    return dom.div({},
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.props.evaluateExpressions();
        }, "domain",
        "accordion-button", "Refresh"),
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.toggleExpressionInput();
        }, "file",
        "accordion-button", "Add Watch Expression")
    );
  },

  toggleExpressionInput() {
    const { expressionInputVisibility } = this.state;
    this.setState({
      expressionInputVisibility: !expressionInputVisibility
    });
  },

  render() {
    const expressionInputVisibility = this.state.expressionInputVisibility;
    const toggleExpressionInput = this.toggleExpressionInput;

    return (
      dom.div(
        { className: "right-sidebar",
          style: { overflowX: "hidden" }},
        CommandBar(),

        Accordion({},
          isEnabled("watchExpressions") ?
          AccordionPane(
            {
              header: L10N.getStr("watchExpressions.header"),
              buttons: this.renderButtons()
            },
            Expressions({ expressionInputVisibility, toggleExpressionInput })
          ) : null,
          AccordionPane(
            {
              header: L10N.getStr("breakpoints.header"),
              opened: true
            },
            Breakpoints()
          ),
          AccordionPane(
            { header: L10N.getStr("callStack.header") },
            Frames()
          ),
          AccordionPane(
            { header: L10N.getStr("scopes.header") },
            Scopes()
          )
        )
      )
    );
  }
});

module.exports = connect(
  () => ({}),
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
