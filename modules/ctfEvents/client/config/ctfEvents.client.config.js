'use strict';

// Configuring the CtfEvents module
angular.module('ctfEvents').run(['Menus',
  function (Menus) {
    // Add the ctfEvents dropdown item
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Events',
      state: 'ctfEvents.list',
      type: 'dropdown',
      roles: ['admin'],
      position: 3
    });

    // Add the dropdown list item
    //Menus.addSubMenuItem('topbar', 'ctfEvents', {
    //  title: 'List CtfEvents',
    //  state: 'ctfEvents.list'
    //});
  }
]);
