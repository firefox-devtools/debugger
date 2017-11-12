/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import "./ManagedTree.css";

import { Tree } from "devtools-components";

export type Item = {
  contents: any,
  name: string,
  path: string
};

type Props = {
  autoExpandAll: boolean,
  autoExpandDepth: number,
  getChildren: Item => Item[],
  getPath: Item => string,
  getParent: () => any,
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
    super();

    this.state = {
      expanded: props.expanded || new Set(),
      focusedItem: null
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const listItems = nextProps.listItems;
    if (listItems && listItems != this.props.listItems && listItems.length) {
      this.expandListItems(listItems);
    }

    const highlightItems = nextProps.highlightItems;
    if (
      highlightItems &&
      highlightItems != this.props.highlightItems &&
      highlightItems.length
    ) {
      this.highlightItem(highlightItems);
    }

    if (nextProps.focused && nextProps.focused !== this.props.focused) {
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
    const expanded = this.state.expanded;
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
    const expanded = this.state.expanded;
    listItems.forEach(item => expanded.add(this.props.getPath(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded });
  }

  highlightItem(highlightItems: Array<Item>) {
    const expanded = this.state.expanded;

    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getPath(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      // Look at folders starting from the top-level until finds a
      // closed folder and highlights this folder
      const index = highlightItems
        .reverse()
        .findIndex(item => !expanded.has(this.props.getPath(item)));
      this.focusItem(highlightItems[index]);
    }
  }

  focusItem = (item: Item) => {
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  };

  render() {
    const { expanded, focusedItem } = this.state;

    const overrides = {
      isExpanded: item => expanded.has(this.props.getPath(item)),
      focused: focusedItem,
      getKey: this.props.getPath,
      onExpand: item => this.setExpanded(item, true, false),
      onCollapse: item => this.setExpanded(item, false, false),
      onFocus: this.focusItem,
      renderItem: (...args) =>
        this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        })
    };

    const props = { ...this.props, ...overrides };
    return (
      <div className="managed-tree">
        <Tree {...props} />
      </div>
    );
  }
}

export default ManagedTree;
