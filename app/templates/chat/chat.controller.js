;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout'];

    function ChatController($localStorage, $state, $timeout) {
       let vm = this;
       console.log('ChatController start');

       let fb = firebase.database();
       let kid_id = 7;
       let psy_id = 1;
       let number_of_posts = 5;

       // loadMessages();
       function loadMessages() {
           fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(number_of_posts).once('value', (snapshot) => {
               $timeout(function () {
                   console.log(snapshot.val());
               })
           });
       }

    }
})();