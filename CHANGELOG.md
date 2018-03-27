# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="6.7.1"></a>
## [6.7.1](https://github.com/dsherret/code-block-writer/compare/v6.7.0...v6.7.1) (2018-03-27)


### Bug Fixes

* Writing within quote should escape string chars. ([bd9ddaa](https://github.com/dsherret/code-block-writer/commit/bd9ddaa))



<a name="6.7.0"></a>
# [6.7.0](https://github.com/dsherret/code-block-writer/compare/v6.6.0...v6.7.0) (2018-03-25)


### Features

* Add .space() method. ([d3a7134](https://github.com/dsherret/code-block-writer/commit/d3a7134))



<a name="6.6.0"></a>
# [6.6.0](https://github.com/dsherret/code-block-writer/compare/v6.5.3...v6.6.0) (2018-02-28)


### Features

* Add .getIndentationLevel() ([949acb0](https://github.com/dsherret/code-block-writer/commit/949acb0))



<a name="6.5.3"></a>
## [6.5.3](https://github.com/dsherret/code-block-writer/compare/v6.5.2...v6.5.3) (2018-02-28)


### Bug Fixes

* Fix incorrect double newline after indentBlock ([8ff5766](https://github.com/dsherret/code-block-writer/commit/8ff5766))



<a name="6.5.2"></a>
## [6.5.2](https://github.com/dsherret/code-block-writer/compare/v6.5.1...v6.5.2) (2018-02-27)


### Bug Fixes

* isLastNewLine() should return true when it's \n and newline kind is \r\n. ([347f783](https://github.com/dsherret/code-block-writer/commit/347f783))



<a name="6.5.1"></a>
## [6.5.1](https://github.com/dsherret/code-block-writer/compare/v6.5.0...v6.5.1) (2018-02-27)


### Bug Fixes

* Should do a conditional newline when starting an indent block. ([109c71f](https://github.com/dsherret/code-block-writer/commit/109c71f))



<a name="6.5.0"></a>
# [6.5.0](https://github.com/dsherret/code-block-writer/compare/v6.4.1...v6.5.0) (2018-02-27)


### Features

* Add indentBlock to indent a block of code. ([e69205c](https://github.com/dsherret/code-block-writer/commit/e69205c))



<a name="6.4.1"></a>
## [6.4.1](https://github.com/dsherret/code-block-writer/compare/v6.4.0...v6.4.1) (2018-02-27)


### Bug Fixes

* Passing an empty string at the start of a line should write the current indentation. ([f3b3ed8](https://github.com/dsherret/code-block-writer/commit/f3b3ed8))



<a name="6.4.0"></a>
# [6.4.0](https://github.com/dsherret/code-block-writer/compare/v6.3.1...v6.4.0) (2018-02-27)


### Features

* isLastNewLine, isLastSpace, getLastChar ([d4d850e](https://github.com/dsherret/code-block-writer/commit/d4d850e))



<a name="6.3.1"></a>
## [6.3.1](https://github.com/dsherret/code-block-writer/compare/v6.3.0...v6.3.1) (2018-02-27)


### Bug Fixes

* Include js docs. ([c01c697](https://github.com/dsherret/code-block-writer/commit/c01c697))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/dsherret/code-block-writer/compare/v6.2.0...v6.3.0) (2018-02-27)


### Features

* Add queueIndentationLevel(...). ([6719913](https://github.com/dsherret/code-block-writer/commit/6719913))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/dsherret/code-block-writer/compare/v6.1.1...v6.2.0) (2017-12-05)


### Features

* [#14](https://github.com/dsherret/code-block-writer/issues/14) - Add .quote() and .quote(text: string) ([efe2280](https://github.com/dsherret/code-block-writer/commit/efe2280))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/dsherret/code-block-writer/compare/v6.1.0...v6.1.1) (2017-12-02)


### Bug Fixes

* Fixed out of date definition file. ([f9d6a07](https://github.com/dsherret/code-block-writer/commit/f9d6a07))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/dsherret/code-block-writer/compare/v6.0.0...v6.1.0) (2017-12-02)


### Features

* Ability to provide undefined for conditions and blocks. ([9c48b3a](https://github.com/dsherret/code-block-writer/commit/9c48b3a))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/dsherret/code-block-writer/compare/v5.0.1...v6.0.0) (2017-12-02)


### Bug Fixes

* Add documentation comments. ([d3b5031](https://github.com/dsherret/code-block-writer/commit/d3b5031))
* Should be allowed to have two newlines at the end of a file. ([3855742](https://github.com/dsherret/code-block-writer/commit/3855742))


### Features

* [#13](https://github.com/dsherret/code-block-writer/issues/13) - Set indentation level. ([10484c7](https://github.com/dsherret/code-block-writer/commit/10484c7))
* isInComment and isInString ([8fa02a2](https://github.com/dsherret/code-block-writer/commit/8fa02a2))


### BREAKING CHANGES

* #12 - Library is now JS/TS specific and will not indent text on newlines while in a string.



<a name="5.0.1"></a>
## [5.0.1](https://github.com/dsherret/code-block-writer/compare/5.0.0...5.0.1) (2017-12-02)
