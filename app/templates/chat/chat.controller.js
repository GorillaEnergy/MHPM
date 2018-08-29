;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout', 'kids', 'authService', 'dateConverter'];

    function ChatController($localStorage, $state, $timeout, kids, authService, dateConverter) {
        let vm = this;
        console.log('ChatController start');

        vm.userOnlineStatus = userOnlineStatus;
        vm.dateHeader = dateHeader;
        vm.timeHeader = timeHeader;
        vm.dateConvert = dateConverter.dateConverter;
        vm.timeConvert = dateConverter.timeConverter;
        vm.ownMessage = ownMessage;

        vm.selectUser = selectUser;
        vm.sendMessage = sendMessage;


        let fb = firebase.database();

        // vm.users = usersFilter(kids, consultants);
        vm.users = kids;
        vm.userOnlineStatusArr = [];
        watchOnline(vm.users);

        let user = authService.getUser();
        // let kid_id;
        // let psy_id = user.id;
        let kid_id = 8;
        let psy_id = 1;
        let number_of_posts = 10;
        let download_more = 10;

        let chat_body = document.getElementById("chat");
        let visible_parts_of_logs_block = chat_body.clientHeight;
        let visible_parts_of_logs_block_with_KB = null;
        let scrollPosionBeforeChange = null;
        let post_is_last = false;
        let scrollEventEnabled;

        let chatHeightOld = null;
        let chatHeightNew = null;

        initializeFB();
        function initializeFB() {
            // psychologistAccess();
            downloadMessages();
            // addMessagesEvent();
            // removeMessagesEvent();
            // changeMessagesEvent();
        }


        ///////////////// user bar //////////////////////
        function usersFilter(kids, consultants) {
            consultants = consultants.filter(function (consultant) {
                if (consultant.id !== user.id) {
                    return consultant
                }
            });
            return kids.concat(consultants)
        }
        
        function watchOnline(users) {
            angular.forEach(users, function (user, key) {
                fb.ref('/WebRTC/users/' + user.id + '/online').on('value', (snapshot) => {
                    $timeout(function () {
                        if (snapshot.val()) {
                            vm.userOnlineStatusArr[key] = true;
                        } else {
                            vm.userOnlineStatusArr[key] = false;
                        }
                    })
                });
            });
        }
        function userOnlineStatus(index) {
            if (vm.userOnlineStatusArr[index]) {
                return 'online-status'
            }
        }

        ///////////////// message view //////////////////
        function selectUser(opponent) {
            console.log(opponent.id);
        }

        ///////////////// message view //////////////////

        function dateHeader(index) {
            if (index) {
                let timestampPre = vm.messages[index - 1].date;
                let timestampCurrent = vm.messages[index].date;
                let datePre = new Date(timestampPre).getDate() + ' ' + new Date(timestampPre).getMonth() + ' ' + new Date(timestampPre).getFullYear();
                let dateCurrent = new Date(timestampCurrent).getDate() + ' ' + new Date(timestampCurrent).getMonth() + ' ' + new Date(timestampCurrent).getFullYear();

                if (datePre !== dateCurrent) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
        function timeHeader(index) {
            if (index) {
                let userPre = vm.messages[index - 1].create_by_user_id;
                let userCurrent = vm.messages[index].create_by_user_id;

                let timestampPre = vm.messages[index - 1].date;
                let timestampCurrent = vm.messages[index].date;

                let timePre = new Date(timestampPre).getHours() + ':' + new Date(timestampPre).getMinutes();
                let timeCurrent = new Date(timestampCurrent).getHours() + ':' + new Date(timestampCurrent).getMinutes();

                if (timePre !== timeCurrent || userPre !== userCurrent) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
        function ownMessage(index) {
            if (vm.messages[index].create_by_user_id === kid_id) {
                return true
            } else {
                return false
            }
        }

        /////////////////////////////////////////////////
        function sendMessage() {
            let data = {};
            data.text = vm.message_input;
            data.date = new Date() * 1;
            data.create_by_user_id = kid_id;
            data.create_by_user_role = 1;
            data.read = false;

            if (vm.message_input) {
                fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').push(data);
                vm.message_input = '';
            }
        }

        function scrollToBottom(newMsg) {
            $timeout(function () {
                if (newMsg) {
                    // тут добавить какоето условие для более корректной работы функции(возможно скролл и ненужно опускать)
                    // chat_body.scrollTo(0, chat_body.scrollHeight);
                    chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                } else {
                    // chat_body.scrollTo(0, chat_body.scrollHeight);
                    chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                }
            });
        }

        function convertToArray(data, type) {
            let res = [];
            let arrOfKeys = Object.keys(data);
            angular.forEach(arrOfKeys ,function (key) {
                res.push(data[key]);
            });

            if (res.length < number_of_posts) { post_is_last = true }
            console.log('post_is_last', post_is_last);

            if (post_is_last) {
                destroyScrollEvent()
            } else if (!scrollEventEnabled) {
                addScrollEvent()
            }

            if (type === 'primary_loading') {
                return res;
            } else {
                res.splice(res.length - 1, 1);
                res = res.concat(vm.messages);
                return res;
            }
        }

        function downloadMessages() {
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(number_of_posts).once('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? vm.messages = convertToArray(snapshot.val(), 'primary_loading') : vm.messages = [];
                    scrollToBottom()
                })
            });
        }
        function downloadMoreMessages() {
            vm.loadMessages = true;
            let last = vm.messages[0].date;
            console.log('last = ', last);
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').orderByChild("date").endAt(last).limitToLast(download_more + 1).once('value', (snapshot) => {
                anchorScroll(snapshot.val());
                vm.loadMessages = false;
            })
        }
        function addMessagesEvent() {
            // let access = false;
            console.log('addMessagesEvent');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(1).on('child_added', (snapshot) => {
                $timeout(function () {
                    // if (access || !vm.messages.length) {
                    //   console.log(snapshot.val());
                    vm.messages.push(snapshot.val());
                    scrollToBottom(true)
                    // } else {
                    //   access = true;
                    // }
                })
            })
        }
        function removeMessagesEvent() {
            console.log('removeMessagesEvent');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').on('child_removed', (snapshot) => {
                $timeout(function () {
                    let changed_message = snapshot.val();
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === changed_message.date) {
                            vm.messages.splice(i, 1);
                            break;
                        }
                    }
                })
            })
        }
        function changeMessagesEvent() {
            console.log('changeMessagesEvent');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').on('child_changed', (snapshot) => {
                $timeout(function () {
                    let changed_message = snapshot.val();
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === changed_message.date) {
                            vm.messages[i] = changed_message;
                            break;
                        }
                    }
                })
            })
        }

        function addScrollEvent() {
            scrollEventEnabled = true;
            console.log('addScrollEvent');
            angular.element(chat_body).bind('scroll', function(){
                if (chat_body.scrollTop === 0) {
                    console.log('scroll position top');
                    downloadMoreMessages();
                }
            });
        }
        function destroyScrollEvent() {
            console.log('destroyScrollEvent');
            angular.element(chat_body).unbind('scroll');
        }
        function anchorScroll(data) {
            console.log('anchorScroll');
            $timeout(function () {

                if (chatHeightNew) {
                    chatHeightOld = angular.copy(chatHeightNew);
                } else {
                    chatHeightOld = angular.copy(angular.element("#chat")[0].scrollHeight);
                }
                // console.log('chatHeightOld = ', chatHeightOld);

                if (data) { vm.messages = convertToArray(data, 'secondary_loading') }

                $timeout(function () {

                    chatHeightNew = angular.copy(angular.element("#chat")[0].scrollHeight);
                    // console.log('chatHeightNew = ', chatHeightNew);

                    chat_body.scrollTop = angular.copy(chatHeightNew - chatHeightOld);
                    // console.log('chat_body.scrollTop = ', chat_body.scrollTop);
                })

            })
        }
    }
})();