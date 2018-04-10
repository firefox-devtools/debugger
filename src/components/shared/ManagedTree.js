/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import "./ManagedTree.css";

const { Tree } = require("devtools-components");

export type Item = {
  contents: any,
  name: string,
  path: string
};

type Props = {
  autoExpandAll: boolean,
  autoExpandDepth: number,
  autoExpandOnHighlight?: boolean,
  getChildren: Object => Object[],
  getPath: (Object, index?: number) => string,
  getParent: Item => any,
  getRoots: () => any,
  highlightItems?: Array<Item>,
  itemHeight: number,
  listItems?: Array<Item>,
  onFocus?: (item: any) => void,
  onExpand?: (item: any, expanded: Set<Item>) => void,
  onCollapse?: (item: any, expanded: Set<Item>) => void,
  renderItem: any,
  disabledFocus?: boolean,
  focused?: any,
  expanded?: any
};

type State = {
  expanded: any,
  focusedItem: ?Item
};

class ManagedTree extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: props.expanded || new Set(),
      focusedItem: null
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { listItems, highlightItems, focused } = this.props;
    if (
      nextProps.listItems &&
      nextProps.listItems != listItems &&
      nextProps.listItems.length
    ) {
      this.expandListItems(nextProps.listItems);
    }

    if (
      nextProps.highlightItems &&
      nextProps.highlightItems != highlightItems &&
      nextProps.highlightItems.length
    ) {
      this.highlightItem(nextProps.highlightItems);
    }

    if (nextProps.focused && nextProps.focused !== focused) {
      this.focusItem(nextProps.focused);
    }
  }

  setExpanded = (
    item: Item,
    isExpanded: boolean,
    shouldIncludeChildren: boolean
  ) => {
    const expandItem = i => {
      const path = this.props.getPath(i);
      if (isExpanded) {
        expanded.add(path);
      } else {
        expanded.delete(path);
      }
    };
    const { expanded } = this.state;
    expandItem(item);

    if (shouldIncludeChildren) {
      let parents = [item];
      while (parents.length) {
        const children = [];
        for (const parent of parents) {
          if (parent.contents && parent.contents.length) {
            for (const child of parent.contents) {
              expandItem(child);
              children.push(child);
            }
          }
        }
        parents = children;
      }
    }
    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item, expanded);
    } else if (!isExpanded && this.props.onCollapse) {
      this.props.onCollapse(item, expanded);
    }
  };

  expandListItems(listItems: Array<Item>) {
    const { expanded } = this.state;
    listItems.forEach(item => expanded.add(this.props.getPath(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded });
  }

  highlightItem(highlightItems: Array<Item>) {
    const { expanded } = this.state;
    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getPath(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      // Look at folders starting from the top-level and expand all the items
      // which lie in the path of the item to be highlighted
      highlightItems.reverse();
      let index = highlightItems.findIndex(
        item => !expanded.has(this.props.getPath(item))
      );

      if (this.props.autoExpandOnHighlight) {
        while (index < highlightItems.length - 1) {
          this.setExpanded(highlightItems[index], true, false);
          index++;
        }
      }

      this.focusItem(highlightItems[index]);
    }
  }

  focusItem = (item: Item) => {
    const isPopupShown = document.querySelector("#contextmenu-mask.show");
    if (isPopupShown != null && typeof item == "undefined") {
      return;
    }
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  };

  render() {
    const { expanded, focusedItem } = this.state;
    return (
      <div className="managed-tree">
        <Tree
          {...this.props}
          isExpanded={item => expanded.has(this.props.getPath(item))}
          focused={focusedItem}
          getKey={this.props.getPath}
          onExpand={item => this.setExpanded(item, true, false)}
          onCollapse={item => this.setExpanded(item, false, false)}
          onFocus={this.focusItem}
          renderItem={(...args) =>
            this.props.renderItem(...args, {
              setExpanded: this.setExpanded
            })
          }
        />
      </div>
    );
  }
}

export default ManagedTree;
