## April 2nd

[@AlexisDeschamps], [@yalooong], [@jasonLaster], [@darkwing], [@calebstdenis], [@mmcote], [@apetov], [@loganfsmyth], [@lukaszsobek], [@bomsy], [@ryanjduffy]

### UI

* [Stop highlighting the line being left when stepping][5650] [@AlexisDeschamps]
* [Sources - Fixes full width for highlighted items with no root][5794] [@darkwing]

### Quick Open

* [QuickOpen - Filter file search if a project directory root is set][5784] [@darkwing]
* [Fix alignment of line numbers in quick open][5799] [@darkwing]
* [Fixed empty item in the search show, issue #5785][5802] [@apetov]
* [Prevent anonymous functions from displaying in symbol search][5803] [@darkwing]

| Quick Open |
| ---------- |
| ![5799-1]  |

### Flow

* [Add flow coverage to parser/types.js][5772] [@yalooong]
* [Refactor pause commands][5804] [@jasonLaster]
* [Tighten flow][5838] [@jasonLaster]
* [Add stricter types for Breakpoint and AST actions][5843] [@ryanjduffy]

### Frameworks

* [Preview - React Component pane][5801] [@mmcote]
* [Map frame display names][5790] [@calebstdenis]

| React Component Pane |
| -------------------- |
| ![5801-0]            |

| Babel Call Stack Mapping |
| ------------------------ |
| ![5790-0]                |

### Stepping

* [Add additional pause point locations][5777] [@jasonLaster]

### Features

* [added literals for computed member expressions][5818] [@bomsy]
* [Get breakpoint text][5823] [@darkwing]

### Code Health

* [Refactor findClosestScope -> findClosestFunction ][5789] [@calebstdenis]
* [Prevent HighlightLine / shouldComponentUpdate warning][5805] [@darkwing]
* [Make getMappedExpression a real action and fix double-binding action creators][5809] [@loganfsmyth]
* [Expose 'getMappedExpression' from debugger panel and tweak mapping][5822] [@loganfsmyth]
* [bump source map worker to 0.15][5825] [@jasonLaster]
* [Turn off auto-pretty-print by default for dev mode][5846] [@darkwing]

### Testing

* [Tweak mochitests for pause points][5808] [@jasonLaster]
* [Fix tabs.spec.js test errors][5841] [@jasonLaster]

### Performance

* [Removes getIn][5810] [@lukaszsobek]
* [Combines toJS calls in select.js][5819] [@lukaszsobek]

### Bug

* [Fix TypeError: lastStatement is undefined][5828] [@darkwing]

### Infrastructure

* [Removes unused react test renderer][5831] [@lukaszsobek]
* [Update eslint-plugin-babel to the latest version 🚀][5837]

### Docs

* [Update 3-27][5798] [@jasonLaster]
* [Document source map semantics][5812] [@jasonLaster]

[5650-0]: https://user-images.githubusercontent.com/12681350/37233676-29427d60-23c2-11e8-90eb-4dc5a2f4902e.gif
[5650-1]: https://user-images.githubusercontent.com/12681350/37233680-2d0a3d3e-23c2-11e8-9c9e-905bfe8dd264.gif
[5772-0]: https://user-images.githubusercontent.com/23003064/37844129-2bb68632-2e9d-11e8-9c59-a40739a11f0f.png
[5790-0]: https://user-images.githubusercontent.com/7321311/37939740-88a177ca-3132-11e8-9681-aa5e9090a84c.png
[5790-1]: https://user-images.githubusercontent.com/7321311/37939776-c6355bd8-3132-11e8-8452-0f0003192f24.png
[5790-2]: https://user-images.githubusercontent.com/7321311/37939703-504ee682-3132-11e8-98b1-6cc693e21905.png
[5794-0]: https://user-images.githubusercontent.com/46655/37974389-731a6db0-31a2-11e8-83cd-a553ce1e67f8.png
[5799-0]: https://user-images.githubusercontent.com/46655/37981379-32782dfe-31b3-11e8-90b7-b93694216e53.png
[5799-1]: https://user-images.githubusercontent.com/46655/37981380-328ff6d2-31b3-11e8-888f-44a650e1d6cc.png
[5801-0]: https://user-images.githubusercontent.com/14250545/37982093-bf72e6c4-31ac-11e8-9977-6f87f013ab8e.png
[5802-0]: https://i.imgur.com/kt57khQ.gif
[5803-0]: https://user-images.githubusercontent.com/46655/37983840-33f3664c-31ba-11e8-928c-ba92b82c61f2.png
[5650]: https://github.com/devtools-html/debugger.html/pull/5650
[5772]: https://github.com/devtools-html/debugger.html/pull/5772
[5777]: https://github.com/devtools-html/debugger.html/pull/5777
[5784]: https://github.com/devtools-html/debugger.html/pull/5784
[5789]: https://github.com/devtools-html/debugger.html/pull/5789
[5790]: https://github.com/devtools-html/debugger.html/pull/5790
[5794]: https://github.com/devtools-html/debugger.html/pull/5794
[5798]: https://github.com/devtools-html/debugger.html/pull/5798
[5799]: https://github.com/devtools-html/debugger.html/pull/5799
[5801]: https://github.com/devtools-html/debugger.html/pull/5801
[5802]: https://github.com/devtools-html/debugger.html/pull/5802
[5803]: https://github.com/devtools-html/debugger.html/pull/5803
[5804]: https://github.com/devtools-html/debugger.html/pull/5804
[5805]: https://github.com/devtools-html/debugger.html/pull/5805
[5808]: https://github.com/devtools-html/debugger.html/pull/5808
[5809]: https://github.com/devtools-html/debugger.html/pull/5809
[5810]: https://github.com/devtools-html/debugger.html/pull/5810
[5812]: https://github.com/devtools-html/debugger.html/pull/5812
[5818]: https://github.com/devtools-html/debugger.html/pull/5818
[5819]: https://github.com/devtools-html/debugger.html/pull/5819
[5822]: https://github.com/devtools-html/debugger.html/pull/5822
[5823]: https://github.com/devtools-html/debugger.html/pull/5823
[5825]: https://github.com/devtools-html/debugger.html/pull/5825
[5826]: https://github.com/devtools-html/debugger.html/pull/5826
[5828]: https://github.com/devtools-html/debugger.html/pull/5828
[5831]: https://github.com/devtools-html/debugger.html/pull/5831
[5837]: https://github.com/devtools-html/debugger.html/pull/5837
[5838]: https://github.com/devtools-html/debugger.html/pull/5838
[5841]: https://github.com/devtools-html/debugger.html/pull/5841
[5843]: https://github.com/devtools-html/debugger.html/pull/5843
[5846]: https://github.com/devtools-html/debugger.html/pull/5846
[@alexisdeschamps]: https://github.com/AlexisDeschamps
[@yalooong]: https://github.com/yalooong
[@jasonlaster]: https://github.com/jasonLaster
[@darkwing]: https://github.com/darkwing
[@calebstdenis]: https://github.com/calebstdenis
[@mmcote]: https://github.com/mmcote
[@apetov]: https://github.com/apetov
[@loganfsmyth]: https://github.com/loganfsmyth
[@lukaszsobek]: https://github.com/lukaszsobek
[@bomsy]: https://github.com/bomsy
[@ryanjduffy]: https://github.com/ryanjduffy
