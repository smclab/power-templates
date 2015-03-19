var window = Ti.UI.createWindow({
  theme: "Theme.AppCompat.Light"
});

var section = Ti.UI.createListSection({});

var list = require('power-templates').createListView({
  templates: {
    "simple": {
      properties: {
        // use functions for property evaluation!
        itemId: '[ id ]',
      },
      childTemplates: [
        {
          type: 'Ti.UI.Label',
          if: "[ true ]",
          properties: {
            text: '[ name ]',
            top: 10,
            backgroundColor: '#109F',
            right: '[ valid ? 40 : 10 ]',
            bottom: 10,
            left: 10
          },
          events: {
            "click": function (event) {
              alert('You clicked item №' + event.itemId);
            }
          }
        },
        {
          type: 'Ti.UI.Label',
          if: "[ valid ]",
          properties: {
            text: '✔︎',
            top: 10,
            right: 10,
            bottom: 10
          }
        }
      ]
    }
  },
  sections: [ section ]
});

var data = [
  {
    id: 1,
    valid: true,
    name: 'Lorem'
  },
  {
    id: 2,
    valid: false,
    name: 'Ipsum'
  },
  {
    id: 3,
    valid: true,
    name: 'Dolor'
  }
];

section.items = data.map(list.powerTemplates.simple.parse);

window.add(list);

window.open();
