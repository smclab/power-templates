
#### Mighty Morphing
# Power Templates

[![Dependencies](https://david-dm.org/smclab/power-templates/status.svg?style=flat-square)](https://david-dm.org/smclab/power-templates#info=dependencies)
[![Dev Dependencies](https://david-dm.org/smclab/power-templates/dev-status.svg?style=flat-square)](https://david-dm.org/smclab/power-templates#info=devDependencies)
[![Available on NPM](https://img.shields.io/npm/v/power-templates.svg?style=flat-square)](https://www.npmjs.org/package/power-templates)
[![Available on gitTio](https://img.shields.io/badge/available_on-gitTio-00B4CC.svg?style=flat-square)](http://gitt.io/component/power-templates)

Tired of ListDataItems’ idiosincratic format? Do you want to write your data binding directly in the templates? **Fear no more!** *Mighty Morphing Power Templates* are here for you!


Installation
------------

With **gitTio** for  **Titanium SDK** you can easily install it with

    $ gittio install power-templates

To download the module for [manual install][mi] (e.g. through *Appcelerator Studio*) then head over the [releases page][rp] to download the latest packaged module.

With **npm** for **Node.js** and **io.js** you can easily install it as a dependency for another package with

    $ npm install --save power-templates

[mi]: http://docs.appcelerator.com/titanium/latest/#!/guide/Using_a_Module
[rp]: https://github.com/smclab/power-templates/releases


Usage
-----

### Alloy

```xml
<ListView id="list" module="power-templates">
  <Templates>
    <!-- use [ expression here ] for property parsing! -->
    <ItemTemplate name="simple" itemId="[ id ]">
      <Label text="[ name ]" />
    </ItemTemplate>
  </Templates>
  <ListSection id="section"/>
</ListView>
```

```js
$.section.items = [
  // automatic model ➜ ListDataItem!
  $.list.powerTemplates.simple.parse({
    id: 12,
    name: 'Example'
  })
];
```

### Classic

```js
var section = Ti.UI.createListSection({});

var list = require('power-templates').createListView({
  templates: {
    "simple": {
      properties: {
        // use functions for property evaluation!
        itemId: function (model) { return model.id },
      },
      childTemplates: [
        {
          type: 'Ti.UI.Label',
          properties: {
            // or the [expr] form!
            text: '[ name ]'
          }
        }
      ]
    }
  },
  sections: [ section ]
});

section.items = [
  // automatic model ➜ ListDataItem!
  list.powerTemplates.simple.parse({
    id: 12,
    name: 'Example'
  })
];
```


TODO
----

**Want to contribute? Yes please!** Here’s our wishlist:

- [ ] implement alternative ListSection APIs
- [ ] implement `itemId`-based ListSection APIs (instead of indexes)
- [ ] implement a ListView-less parsing (a-la React/Angular)


Credits
-------

Humbly made by the spry ladies and gents at SMC.


License
-------

This library, *power-templates*, is free software ("Licensed Software"); you can
redistribute it and/or modify it under the terms of the [GNU Lesser General
Public License](http://www.gnu.org/licenses/lgpl-2.1.html) as published by the
Free Software Foundation; either version 2.1 of the License, or (at your
  option) any later version.

  This library is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; including but not limited to, the implied warranty of MERCHANTABILITY,
  NONINFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
  Public License for more details.

  You should have received a copy of the [GNU Lesser General Public
  License](http://www.gnu.org/licenses/lgpl-2.1.html) along with this library; if
  not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth
  Floor, Boston, MA 02110-1301 USA
