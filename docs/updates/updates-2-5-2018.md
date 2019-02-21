## February 5th

[@pradeepgangwar], [@lukaszsobek], [@loganfsmyth], [@ochameau], [@martinfojtik], [@ericawright], [@jasonLaster], [@juliandescottes], [@MikeRatcliffe], [@nharrisanalyst], [@kootoopas], [@Fischer-L], [@yzen], [@stratigos], [@darkwing], [@atwalg2], [@iansu], [@nyrosmith], [@ksashikumar], [@sravan-s], [@gregtatum]

### UI

The UI got a ton of love this past week.

* [Hide [ShortcutsModal] on [QuickopenModal] open][5275] [@kootoopas]
* [Add go to line shortcut in shortcuts modal][4932] [@pradeepgangwar]
* [Unclickable search result in project search ][5305] [@sravan-s]
* [[ToggleButton] Fix for left side collapse pane icon was blurry][5309] [@martinfojtik]

**Outline View** is now showing all of the classes in a module!

* [Replace function SVG with unicode character in Outline pane][5293] [@iansu]
* [Group class functions within Outline Panel][5290] [@darkwing]

**Quick Open** input bar and scrolling

* [[QuickOpenModal] Fix initial scroll][5311] [@kootoopas]
* [Selects input text value on re-opening modal][5286] [@lukaszsobek]

**Source Tree** We upgraded the source tree to the new version and fixed some of the initial bugs with toggling and indentation.

* [Fixes folder toggle in source tree][5308] [@lukaszsobek]
* [Fix paddings in sources tree and outline list][5240] [@martinfojtik]
* [Fix indentation of non-expandable tree nodes][5269] [@MikeRatcliffe]

**Color Theme** We improved the contrast ratios and consistency of the color themes. Thanks Erica!

* [Increase contrast in welcomebox and search placeholder][5249] [@ericawright]
* [color fixes][5314] [@ericawright]
* [change icon colors and search modifiers to theme-comment][5318] [@ericawright]

| Source Tree |
| ----------- |
| ![5269-0]   |

### Show Original Scopes

Logan landed the initial version of original scopes in the debugger last week. This allows us the dramatically simplify the scopes and bindings we show when the application uses babel.

* [Set up logic to allow checking for frameworks][5186] [@lukaszsobek]
* [First-pass implementation of mapping original scopes to server scopes][5215] [@loganfsmyth]
* [Render mapped scope list only when viewing original file][5276] [@loganfsmyth]
* [Map original 'this' and 'arguments' to correct bindings where possible][5291] [@loganfsmyth]
* [Add initial mochitest for original scope work and fix disabled tests][5317] [@loganfsmyth]

| Original Scopes |
| --------------- |
| ![5215-0]       |
| ![5215-1]       |
| ![5291-0]       |
| ![5291-1]       |

| Generated Scopes |
| ---------------- |
| ![5276-0]        |

### Infrastructure

* [Fix firefox.mcPath documentation.][5238] [@ochameau]
* [Update eslint-plugin-mozilla to the latest version 🚀][5272]
* [Eslint import][5315] [@gregtatum]

### Testing

New updates to our Tests include adding a takeScreenshot api!

* [Add takeScreenshot API][5251] [@jasonLaster]
* [Fix licenses and description for package.json files used in mochitests][5264] [@juliandescottes]
* [Add tests for utils/path][5289] [@stratigos]

| Take Screenshot |
| --------------- |
| ![5251-0]       |
| ![5251-1]       |

### Docs

* [Fix localization notes references][5263] [@juliandescottes]
* [Update team][5274] [@jasonLaster]
* [[Update Doc] - Remove --debug-brk][5297] [@ksashikumar]
* [improve dbg][5304] [@jasonLaster]
* [Add some more mochitest docs][5319] [@jasonLaster]

### Code Health

* [[Breakpoints] Clean up extracted context menu #5223 completed][5271] [@nharrisanalyst]
* [Enable some features][5273] [@jasonLaster]
* [Synchronize ChromeUtils change from Bug 1431533][5282] [@juliandescottes]

### Feature

We had some interesting work come from our UCOSP students, we improved the fuzzy search with a proper implementation for highlighting the correct matches.

Preview was improved and now allows users to inspect empty values, rather than showing an incorrect output.

Outline continues to be improved and now has default parameters shown along with function argument names in the list view

And last but not least, We began work on RR, and we added a basic UI for rewinding that is activated if the server shows that rewinding is possible.

* [[Preview] Show empty values][5279] [@Fischer-L]
* [[QuickOpen] style matched fuzzy characters (proper)][5292] [@atwalg2]
* [show default value parameters in Outline][5294] [@nyrosmith]
* [Add basic UI for rewinding when server indicates it can rewind][5303] [@jasonLaster]

| Fuzzy Match |
| ----------- |
| ![5292-1]   |
| ![5292-2]   |

### Bugs

We had an issue found by some of our Spanish speaking users that cmdOrControl is localized. This caused problems when using other keyboards.

Another funny bug that came up this week was trying to toggle the conditional panel would open up Firefox bookmarks

* [Update locales to not include cmdOrCtrl][5281] [@jasonLaster]
* [Toggling the conditional bp pane should not open bookmarks][5299] [@jasonLaster]

### accessibility

The title is self explanatory, but we now have accessible autocomplete

* [Making search sources autocomplete functionality accessible.][5285] [@yzen]

[4932-0]: https://user-images.githubusercontent.com/21259802/34070513-c3b9dd3c-e28d-11e7-94b9-9d8c7ccba246.png
[5215-0]: https://user-images.githubusercontent.com/132260/35460493-16552724-0299-11e8-96f2-9f04472556a7.png
[5215-1]: https://user-images.githubusercontent.com/132260/35460611-7cfe14c2-0299-11e8-8ec6-1f62b84c66da.png
[5251-0]: https://user-images.githubusercontent.com/254562/35596533-48115556-05e8-11e8-8752-fc8d1ff86a2b.png
[5251-1]: https://user-images.githubusercontent.com/254562/35596561-64a16648-05e8-11e8-8e11-9a133e8d53e9.png
[5269-0]: https://user-images.githubusercontent.com/116941/35636987-b84532ee-06aa-11e8-8328-819d2656c172.png
[5275-0]: https://user-images.githubusercontent.com/601001/35648099-3e9c3234-06dd-11e8-9914-6d5f44bc5c1f.gif
[5276-0]: https://user-images.githubusercontent.com/132260/35649451-fdb265d0-068d-11e8-857e-9b31c4459765.gif
[5279-0]: https://user-images.githubusercontent.com/5627487/35678901-1990200a-0790-11e8-8b2a-4b9734a84b35.gif
[5286-0]: https://user-images.githubusercontent.com/23530054/35698006-1f098188-078c-11e8-9dad-a67420b007ee.gif
[5290-0]: https://user-images.githubusercontent.com/46655/35714772-491595b8-0794-11e8-8258-1556d781dcdc.png
[5291-0]: https://user-images.githubusercontent.com/132260/35711806-b838c1de-0773-11e8-9c26-aa7252ea8130.png
[5291-1]: https://user-images.githubusercontent.com/132260/35712335-6435d4ca-0776-11e8-9924-50061cf28d55.png
[5292-0]: https://user-images.githubusercontent.com/23143862/35723185-9cf2c1fc-07b6-11e8-85aa-46fc9b2b2e22.png
[5292-1]: https://user-images.githubusercontent.com/23143862/35717263-54b1acac-079b-11e8-91d6-70acdf34b598.png
[5292-2]: https://user-images.githubusercontent.com/23143862/35714962-f74fdcae-078c-11e8-9c37-258c38e90c1c.png
[5292-3]: https://user-images.githubusercontent.com/23143862/35715520-248f70e6-0790-11e8-80f5-faebba6587d7.png
[5293-0]: https://user-images.githubusercontent.com/433725/35716425-24b8177a-0796-11e8-86eb-0d8e35bd39d2.png
[5293-1]: https://user-images.githubusercontent.com/433725/35716426-24d377f4-0796-11e8-93f7-7948953c2155.png
[5294-0]: https://user-images.githubusercontent.com/2511026/35727134-60f60d48-0807-11e8-922a-d5bd990a76cd.PNG
[5305-0]: https://user-images.githubusercontent.com/11382805/35763591-edf45ed4-08f2-11e8-92ee-a10a2f068541.gif
[5308-0]: https://user-images.githubusercontent.com/23530054/35765487-e12b13f6-08c4-11e8-9bc3-3a6c2a69537b.gif
[5309-0]: https://user-images.githubusercontent.com/7465851/35765648-afacaa48-08c8-11e8-8511-f65c23b8465c.JPG
[5309-1]: https://user-images.githubusercontent.com/7465851/35765647-a99925dc-08c8-11e8-91bb-f5e4cd5aa56f.JPG
[5311-0]: https://user-images.githubusercontent.com/601001/35770593-ec534106-0926-11e8-8f4b-2e43da08bf95.gif
[5314-0]: https://user-images.githubusercontent.com/10803178/35814836-13f18954-0a65-11e8-8e59-f100e6891038.png
[5314-1]: https://user-images.githubusercontent.com/10803178/35814839-16554348-0a65-11e8-8135-41923b319def.png
[5314-2]: https://user-images.githubusercontent.com/10803178/35814754-d60fa68e-0a64-11e8-9b12-8a98fd2a6b4a.png
[5314-3]: https://user-images.githubusercontent.com/10803178/35814693-ac158af6-0a64-11e8-972f-a729afde7205.png
[4932]: https://github.com/firefox-devtools/debugger/pull/4932
[5186]: https://github.com/firefox-devtools/debugger/pull/5186
[5215]: https://github.com/firefox-devtools/debugger/pull/5215
[5238]: https://github.com/firefox-devtools/debugger/pull/5238
[5240]: https://github.com/firefox-devtools/debugger/pull/5240
[5249]: https://github.com/firefox-devtools/debugger/pull/5249
[5251]: https://github.com/firefox-devtools/debugger/pull/5251
[5263]: https://github.com/firefox-devtools/debugger/pull/5263
[5264]: https://github.com/firefox-devtools/debugger/pull/5264
[5269]: https://github.com/firefox-devtools/debugger/pull/5269
[5271]: https://github.com/firefox-devtools/debugger/pull/5271
[5272]: https://github.com/firefox-devtools/debugger/pull/5272
[5273]: https://github.com/firefox-devtools/debugger/pull/5273
[5274]: https://github.com/firefox-devtools/debugger/pull/5274
[5275]: https://github.com/firefox-devtools/debugger/pull/5275
[5276]: https://github.com/firefox-devtools/debugger/pull/5276
[5279]: https://github.com/firefox-devtools/debugger/pull/5279
[5281]: https://github.com/firefox-devtools/debugger/pull/5281
[5282]: https://github.com/firefox-devtools/debugger/pull/5282
[5285]: https://github.com/firefox-devtools/debugger/pull/5285
[5286]: https://github.com/firefox-devtools/debugger/pull/5286
[5289]: https://github.com/firefox-devtools/debugger/pull/5289
[5290]: https://github.com/firefox-devtools/debugger/pull/5290
[5291]: https://github.com/firefox-devtools/debugger/pull/5291
[5292]: https://github.com/firefox-devtools/debugger/pull/5292
[5293]: https://github.com/firefox-devtools/debugger/pull/5293
[5294]: https://github.com/firefox-devtools/debugger/pull/5294
[5297]: https://github.com/firefox-devtools/debugger/pull/5297
[5299]: https://github.com/firefox-devtools/debugger/pull/5299
[5303]: https://github.com/firefox-devtools/debugger/pull/5303
[5304]: https://github.com/firefox-devtools/debugger/pull/5304
[5305]: https://github.com/firefox-devtools/debugger/pull/5305
[5308]: https://github.com/firefox-devtools/debugger/pull/5308
[5309]: https://github.com/firefox-devtools/debugger/pull/5309
[5311]: https://github.com/firefox-devtools/debugger/pull/5311
[5314]: https://github.com/firefox-devtools/debugger/pull/5314
[5315]: https://github.com/firefox-devtools/debugger/pull/5315
[5317]: https://github.com/firefox-devtools/debugger/pull/5317
[5318]: https://github.com/firefox-devtools/debugger/pull/5318
[5319]: https://github.com/firefox-devtools/debugger/pull/5319
[@pradeepgangwar]: https://github.com/pradeepgangwar
[@lukaszsobek]: https://github.com/lukaszsobek
[@loganfsmyth]: https://github.com/loganfsmyth
[@ochameau]: https://github.com/ochameau
[@martinfojtik]: https://github.com/martinfojtik
[@ericawright]: https://github.com/ericawright
[@jasonlaster]: https://github.com/jasonLaster
[@juliandescottes]: https://github.com/juliandescottes
[@mikeratcliffe]: https://github.com/MikeRatcliffe
[@nharrisanalyst]: https://github.com/nharrisanalyst
[@kootoopas]: https://github.com/kootoopas
[@fischer-l]: https://github.com/Fischer-L
[@yzen]: https://github.com/yzen
[@stratigos]: https://github.com/stratigos
[@darkwing]: https://github.com/darkwing
[@atwalg2]: https://github.com/atwalg2
[@iansu]: https://github.com/iansu
[@nyrosmith]: https://github.com/nyrosmith
[@ksashikumar]: https://github.com/ksashikumar
[@sravan-s]: https://github.com/sravan-s
[@gregtatum]: https://github.com/gregtatum
