
#### Mighty Morphing
# Power Templates

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
