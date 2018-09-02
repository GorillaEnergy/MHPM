;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'authService', 'dateConverter',
                              'consultantService', 'userService', '$mdDialog', '$rootScope'];

    function ChatController($localStorage, $state, $timeout, consultants, kids, authService, dateConverter,
                            consultantService, userService, $mdDialog, $rootScope) {
        let vm = this;
        console.log('ChatController start');

        vm.userOnlineStatus = userOnlineStatus;
        vm.dateHeader = dateHeader;
        vm.timeHeader = timeHeader;
        vm.dateConvert = dateConverter.dateConverter;
        vm.timeConvert = dateConverter.timeConverter;
        vm.ownMessage = ownMessage;
        vm.contactName = contactName;

        vm.selectUser = selectUser;
        vm.sendMessage = sendMessage;

        vm.consName = consName;
        vm.addComment = addComment;

        let fb = firebase.database();

        // vm.users = usersFilter(kids, consultants);
        vm.users = kids;
        vm.kid = kids[0];
        vm.parents = [];
        vm.userOnlineStatusArr = [];
        vm.messages = [];
        let msgKeys = [];
        vm.logs = [];
        watchOnline(vm.users);
        getParents(vm.kid.id);

        let user = authService.getUser();
        // let kid_id = 8;
        let kid_id = kids[0].id;
        let psy_id = user.id;
        let number_of_posts = 10;
        let number_of_logs = 10;
        let download_more = 10;

        let total_unread_kid = 0;
        let total_unread = 0;
        let local_unread = 0;
        let unreadMsgsKeysArr = [];

        let chat_body = document.getElementById("chat");
        let post_is_last = false;
        let scrollEventEnabled;

        let chatHeightOld = null;
        let chatHeightNew = null;
        ///////////////////////////////////////////////////////////////////////////

        $rootScope.$on('chat-type', function (event, data) {
            vm.viewType = data.type;
            console.log('view type = ', vm.viewType);
        });

        ///////////////////////////////////////////////////////////////////////////////////////
        initializeFB();
        function initializeFB() {
            // psychologistAccess();
            checkUnreadAmount();
            offFBWatchers();
            downloadMessages();
            addMessagesEvent();
            removeMessagesEvent();
            changeMessagesEvent();

            downloadLogs();
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

        ///////////////// change kid //////////////////
        function selectUser(kid, index) {
            // console.log(kid.id);
            vm.kid = kids[index];
            vm.messages = [];
            vm.logs = [];
            getParents(kid.id);
            kid_id = kid.id;
            post_is_last = false;
            scrollEventEnabled = false;
            destroyScrollEvent();
            initializeFB()
        }
        function getParents(kid_id) {
            userService.getParents({kid_id: kid_id}).then(function (res) {
                if (res.status === 'success') {
                    vm.parents = res.data;
                } else {
                    vm.parents = []
                }
            })
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
        function contactName(index) {
            if (vm.messages[index].create_by_user_id === kid_id) {
                return vm.kid.name;
            } else {
                return user.name
            }
        }

        ///////////////// messages fb ///////////////////
        function sendMessage() {
            let data = {};
            data.text = vm.message_input;
            data.date = new Date() * 1;
            data.create_by_user_id = psy_id;
            data.create_by_user_role = 1;
            data.read = false;

            if (vm.message_input) {
                fb.ref('/chats/' + kid_id + '/' + psy_id + '/total_unread_kid').set(total_unread_kid + 1);
                fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').push(data);
                vm.message_input = '';
            }
        }

        function scrollToBottom(newMsg) {
            $timeout(function () {
                if (newMsg) {
                    // тут добавить какоето условие для более корректной работы функции(возможно скролл и ненужно опускать)

                    $timeout(function () {
                        chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                    }, 500);

                    // chat_body.scrollTo(0, chat_body.scrollHeight);
                    // chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                } else {
                    // chat_body.scrollTo(0, chat_body.scrollHeight);
                    chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                }
            });
        }

        function convertToArray(data, type, logs) {
            let res = [];
            let arrOfKeys = Object.keys(data);
            angular.forEach(arrOfKeys ,function (key) {
                res.push(data[key]);
            });

            if (!logs) {
                msgKeys = msgKeys.concat(arrOfKeys);

                if (res.length < number_of_posts) { post_is_last = true }
                console.log('post_is_last', post_is_last);

                if (post_is_last) {
                    destroyScrollEvent()
                } else if (!scrollEventEnabled) {
                    addScrollEvent()
                }

                unreadCalc(res, msgKeys);

                if (type === 'primary_loading') {
                    return res;
                } else {
                    res.splice(res.length - 1, 1);
                    res = res.concat(vm.messages);
                    return res;
                }
            }

            return res.reverse();
        }

        function checkUnreadAmount() {
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/total_unread_psy').on('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? total_unread = snapshot.val() : total_unread = 0;
                    console.log(total_unread);
                })
            });
        }

        function unreadCalc(arr, keysArr, soloKey, obj) {
            if (!soloKey) {
                angular.forEach(arr, function (msg, index) {
                    if (msg.create_by_user_id === kid_id && !msg.read) {
                        local_unread++;
                        unreadMsgsKeysArr.push(keysArr[index])
                    }
                });
            } else {
                if (obj.create_by_user_id === kid_id && !obj.read) {
                    local_unread++;
                }
            }

            if (total_unread) {
                !soloKey ? markAsRead(unreadMsgsKeysArr) : markAsRead([soloKey]);

                $timeout(function () {
                    fb.ref('/chats/' + kid_id + '/' + psy_id + '/total_unread_psy').set(total_unread - local_unread);

                    local_unread = 0;
                    unreadMsgsKeysArr = [];
                }, 200);
            }
        }
        
        function markAsRead(keys) {
            angular.forEach(keys, function (key) {
                fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages/'+ key + '/read').set(true);
            })
        }

        function offFBWatchers() {
            console.log('offFBWatchers');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').off();
            fb.ref('/logs/' + kid_id).off();
        }
        function downloadMessages() {
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(number_of_posts).once('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? vm.messages = convertToArray(snapshot.val(), 'primary_loading') : vm.messages = [];
                    scrollToBottom();
                    // console.log(angular.copy(vm.messages));
                })
            });
        }
        function downloadMoreMessages() {
            vm.loadMessages = true;
            let last = vm.messages[0].date;
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').orderByChild("date").endAt(last).limitToLast(download_more + 1).once('value', (snapshot) => {
                anchorScroll(snapshot.val());
                vm.loadMessages = false;
            })
        }
        function addMessagesEvent() {
            console.log('addMessagesEvent');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(1).on('child_added', (snapshot) => {
                $timeout(function () {
                    let push_status = true;
                    let added_message = snapshot.val();
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === added_message.date) {
                            push_status = false;
                            break;
                        }
                    }
                    if (push_status) {
                        unreadCalc(null, null, snapshot.key, snapshot.val());
                        vm.messages.push(snapshot.val());
                        scrollToBottom(true)
                    }
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
                            console.log(angular.copy(vm.messages));
                            console.log('removed this ', vm.messages[i]);
                            vm.messages.splice(i, 1);
                            console.log(angular.copy(vm.messages));
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
                    console.log('message changed ', snapshot.val());
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === changed_message.date) {
                            vm.messages[i] = changed_message;
                            break;
                        }
                    }
                })
            })
        }
        function checkMissedNumber() {
            console.log('checkMissedNumber');
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/total_unread_psy').on('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? total_unread = Number(snapshot.val()) : total_unread = 0;
                })
            });
            fb.ref('/chats/' + kid_id + '/' + psy_id + '/total_unread_kid').on('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? total_unread_kid = Number(snapshot.val()) : total_unread_kid = 0;
                })
            })
        }

        function downloadLogs() {
            fb.ref('/logs/' + kid_id).limitToLast(number_of_logs).on('value', (snapshot) => {
                $timeout(function () {
                    snapshot.val() ? vm.logs = convertToArray(snapshot.val(), null, true) : vm.logs = [];
                    // console.log(angular.copy(vm.logs));
                })
            });
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

        /////////////////////////// Consultants /////////////////////////

        let consultantsObj = consultantService.convert(consultants);
        // console.log(consultantsObj);

        function consName(consultant) {
            if (consultantsObj[consultant.consultant_id]) {
                return consultantsObj[consultant.consultant_id].name
            } else {
                return "No Name"
            }
        }

        /////////////////////////// kid and parents /////////////////////////

        console.log(kids);


        /////////////////////////// add log /////////////////////////
        function addComment() {
            console.log('add comment');
            let data = {
                kid: vm.kid,
                logs: vm.logs,
                consultants: consultantsObj
            };

            $mdDialog.show({
                controller: 'SendLogController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/send-log/send-log.html',
                clickOutsideToClose: true,
            }).then(function (res) {
                console.log('close dialog');
                console.log('res', res);
            },
                function () {}
            );
        }
    }
})();