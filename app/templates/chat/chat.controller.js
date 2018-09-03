;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'authService', 'dateConverter',
                              'consultantService','statisticService',  'userService', '$mdDialog', '$rootScope'];

    function ChatController($localStorage, $state, $timeout, consultants, kids, authService, dateConverter,
                            consultantService, statisticService, userService, $mdDialog, $rootScope) {
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
        vm.users = kids;                //kid_list
        vm.kid = kids[0];               //active_kid
        vm.parents = [];                //active_parents for logs
        vm.userOnlineStatusArr = [];
        vm.messages = [];               //messages in current chat
        let msgKeys = [];               //keys of unread messages
        vm.logs = [];                   //active logs
        watchOnline(vm.users);
        getParents(vm.kid.id);

        let viewCurrent = 1;                //VIEW type -> 1,2,3,4( default chat, 1vs1, 1vs1vsChat, multi )
        let user = authService.getUser();   //psy info obj
        let kid_id = kids[0].id;            //active kid id
        let psy_id = user.id;               //psy id
        let number_of_posts = 10;           //number of messages on controller startup
        let number_of_logs = 10;            //number of logs on controller startup
        let download_more = 10;             //number of download more messages (event)

        let total_unread_kid = 0;           //number of unread messages on current kid
        let total_unread = 0;               //number of unread messages on psy (YOU)
        let local_unread = 0;               //tmp unread
        let unreadMsgsKeysArr = [];         //tmp keys unread messages arr

        let chat_body = document.getElementById("chat");
        let post_is_last = false;           //destroy scroll event(download more off)
        let scrollEventEnabled;             //add scroll event(download more on)

        let chatHeightOld = null;           //chat height before download new messages
        let chatHeightNew = null;           //chat height after download new messages

        ///////////////////////////////////////////////////////////////////////////

        $rootScope.$on('chat-type', function (event, data) {
            console.log('EVENT!');
            console.log(data);
            // viewCurrent = data.type;
            // console.log('view type = ', viewCurrent);
            //
            // let itmB = document.getElementById("vid-box").lastChild;
            // let clnB = itmB.cloneNode(true);
            // document.getElementById("rootBlock2").appendChild(clnB);
            //
            // let itmT = document.getElementById("vid-thumb").lastChild;
            // let clnT = itmT.cloneNode(true);
            // document.getElementById("rootBlock2").appendChild(clnT);
            //
            // $timeout(function () {
            //     console.log('remove');
            //     let itm = document.getElementById("rootBlock");
            //     let root = document.getElementById("chatBody");
            //     root.removeChild(itm);
            // }, 2000);
            // $timeout(function () {
            //     console.log('paste');
            //     let parentElement = document.getElementById("rootBlock2");
            //     let itm = document.getElementById("redB");
            //     let cln = itm.cloneNode(true);
            //
            //     // root.appendChild(cln).index(1);
            //
            //     parentElement.insertBefore(itm, parentElement.children[1]);
            // }, 4000);

            viewCurrent = data.type;

            if (data.type === 1) {
                console.log('view type = ', viewCurrent);

            } else if (data.type === 2) {
                console.log('view type = ', viewCurrent);
                document.getElementById("chatBody").style.display = "none";
                document.getElementById("userPanel").style.display = "none";
                //disabled chat view
                document.getElementById("oneVSone").style.display = "flex";

                //добавить функциюю изменения деталей о ребёнке и логи
                $timeout(function () {

                    // transfer();
                    // cloneRemove();

                    function transfer() {
                        //transfer
                        let parentElement = document.getElementById("vid-thumb");
                        let videoElement = document.getElementById("11mhuser");
                        console.log(parentElement);
                        console.log(videoElement);
                        parentElement.insertBefore(videoElement, parentElement.children[0]);
                    }
                    function cloneRemove() {
                        //clone + remove
                        let parentElement = document.getElementById("vid-thumb");
                        let itm = document.getElementById("11mhuser");
                        let cln = itm.cloneNode(true);
                        parentElement.appendChild(cln);
                        document.getElementById("vid-box").removeChild(itm);
                    }


                    // console.dir($('video').data-number)
                    // console.dir($("[data-number='11mhuser']"));
                    // console.dir($("[data-number='8mhuser']"));
                }, 5000)
            } else if (data.type === 3) {
                console.log('view type = ', viewCurrent);

            } else if (data.type === 4) {
                console.log('view type = ', viewCurrent);

            }
        });

        $timeout(function () {
            // console.log('7 lost');
            // $rootScope.$broadcast('chat-type', { type: 2, kid_id: 11 })
        }, 7000);
        ///////////////////////////////////////////////////////////////////////////////////////
        let sendUsers = angular.copy($localStorage.sendUsers) || {date: null, ids: []};

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
                addStatisticChat(data)
        }

        function addStatisticChat() {
            let s = false;
            let date = new Date().getDate();
            if (sendUsers.ids.length && sendUsers.date === date) {
                for (let i = 0; i < sendUsers.ids.length; i++) {
                    if (sendUsers.ids[i] === kid_id) {
                        s = false;
                        return false;
                    } else {
                        s = true;
                    }
                }
                if (s) {
                    pushUser();
                }
            } else {
                pushUser();
            }


            function pushUser() {
                let data = {
                    type: 'chat',
                    add_info: {
                        interlocutor_id: kid_id,
                        time: "00:00"
                    }
                };
                statisticService.addStatistic(data).then(function (res) {
                    if(res.status==='success'){
                        sendUsers.date = date;
                        sendUsers.ids.push(kid_id);
                        $localStorage.sendUsers = sendUsers;
                    }
                })
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
            angular.forEach(arrOfKeys, function (key) {
                res.push(data[key]);
            });

            if (!logs) {
                msgKeys = msgKeys.concat(arrOfKeys);

                if (res.length < number_of_posts) {
                    post_is_last = true
                }
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
                fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages/' + key + '/read').set(true);
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
            angular.element(chat_body).bind('scroll', function () {
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

                if (data) {
                    vm.messages = convertToArray(data, 'secondary_loading')
                }

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
                function () {
                }
            );
        }
    }
})();