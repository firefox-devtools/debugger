/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import classnames from "classnames";

import { connect } from "../../utils/connect";
import actions from "../../actions";
import { getActiveEventListeners } from "../../selectors";

import AccessibleImage from "../shared/AccessibleImage";

import "./EventListeners.css";

const CATEGORIES = {
  Mouse: ["click", "mouseover", "dblclick"],
  Keyboard: ["keyup", "keydown"]
};

type Props = {
  addEventListeners: typeof actions.addEventListeners,
  removeEventListeners: typeof actions.removeEventListeners,
  activeEventListeners: string[]
};

type State = {
  expandedCategories: string[]
};

function getKey(category: string, eventType: string) {
  return `${category}:${eventType}`;
}

class EventListeners extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      expandedCategories: []
    };
  }

  onCategoryToggle(category, event) {
    event.preventDefault();

    const { expandedCategories } = this.state;

    if (expandedCategories.includes(category)) {
      this.setState({
        expandedCategories: expandedCategories.filter(
          eventCategory => eventCategory !== category
        )
      });
    } else {
      this.setState({
        expandedCategories: [...expandedCategories, category]
      });
    }
  }

  onCategoryClick(category, isChecked) {
    const { addEventListeners, removeEventListeners } = this.props;
    const events = CATEGORIES[category].map(eventType =>
      getKey(category, eventType)
    );

    if (isChecked) {
      addEventListeners(events);
    } else {
      removeEventListeners(events);
    }
  }

  onEventTypeClick(eventType, isChecked) {
    const { addEventListeners, removeEventListeners } = this.props;
    if (isChecked) {
      addEventListeners([eventType]);
    } else {
      removeEventListeners([eventType]);
    }
  }

  render() {
    const { activeEventListeners } = this.props;
    const { expandedCategories } = this.state;

    return (
      <ul className="event-listeners-list">
        {Object.keys(CATEGORIES).map(category => {
          const expanded = expandedCategories.includes(category);
          return (
            <li className="event-listener-group" key={category}>
              <label>
                <input
                  type="checkbox"
                  value={category}
                  onChange={e =>
                    this.onCategoryClick(category, e.target.checked)
                  }
                  checked={CATEGORIES[category].every(eventType =>
                    activeEventListeners.includes(getKey(category, eventType))
                  )}
                />
                <span className="event-listener-category">{category}</span>
                <AccessibleImage
                  className={classnames("arrow", { expanded })}
                  onClick={e => this.onCategoryToggle(category, e)}
                />
              </label>
              {expanded && (
                <ul>
                  {CATEGORIES[category].map(eventType => {
                    const key = getKey(category, eventType);
                    return (
                      <li className="event-listener-event" key={key}>
                        <label>
                          <input
                            type="checkbox"
                            value={key}
                            onChange={e =>
                              this.onEventTypeClick(key, e.target.checked)
                            }
                            checked={activeEventListeners.includes(key)}
                          />
                          {eventType}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    );
  }
}

const mapStateToProps = state => ({
  activeEventListeners: getActiveEventListeners(state)
});

export default connect(
  mapStateToProps,
  {
    addEventListeners: actions.addEventListeners,
    removeEventListeners: actions.removeEventListeners
  }
)(EventListeners);
