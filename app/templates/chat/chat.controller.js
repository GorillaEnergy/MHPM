;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'authService', 'dateConverter',
        'consultantService', 'statisticService', 'userService', '$mdDialog', '$rootScope', 'toastr',
        'kidService', 'RTCService', 'firebaseDataSvc', 'utilsSvc', 'modalSvc'];

    function ChatController($localStorage, $state, $timeout, consultants, kids, authService, dateConverter,
                            consultantService, statisticService, userService, $mdDialog, $rootScope, toastr,
                            kidService, RTCService, firebaseDataSvc, utilsSvc, modalSvc) {
        let vm = this;
        console.log('ChatController start');

        if ($state.params.to_call) {
            $rootScope.$broadcast('dialing')
        }

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
        vm.addEmergencyComment = addEmergencyComment;

        vm.leaveThisChat = leaveThisChat;
        vm.selectUserInMulti = selectUserInMulti;
        vm.hangup = hangup;

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

        let access = false;
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

        function playById(id){
            if($('#'+ id + "mhuser video") && $('#'+ id + "mhuser video")[0] && $('#'+ id + "mhuser video")[0].play){
                $('#'+ id + "mhuser video")[0].play();
            }
        }

        /////////////////////////// last chat loader //////////////////////////
        loadLastChat();

        function loadLastChat() {
            let last_chat_id = $localStorage.last_chat;

            if (last_chat_id) {
                checkUser(last_chat_id)
            }

            function checkUser(last_chat_id) {
                let status = false;
                let kid_index;
                for (let i = 0; i < kids.length; i++) {
                    if (kids[i].id === last_chat_id) {
                        kid_index = i;
                        status = true;
                        break
                    }
                }

                if (status) {
                    console.log('last chat is = ', last_chat_id);
                    vm.kid = kids[kid_index];
                    kid_id = kids[kid_index].id;
                }
            }
        }

        ///////////////////////// RTCservice watcher //////////////////////////
        vm.idVid = {
            2: {local: 'vid-thumb', remote: 'vid-box'},
            3: {local: 'tmp3-vid-thumb', remote: 'tmp3-vid-box'},
            4: {remote: 'tmp4-vid-box'}
        };

        $rootScope.$on('emergency-log', function (event, id) {
            // console.log('kid id = ', id);
            addEmergencyComment(kidsObj[id])
        });

        $rootScope.$on('chat-type', function (event, data) {
            console.log('EVENT!', data);
            //viewCurrent can be 1, 2, 3, 4
            //viewCurrent 1 can be upgraded to 2 lvl
            //viewCurrent 2 can be upgraded to 3, 4 lvl
            //viewCurrent 3 can be upgraded to 4 lvl & downgraded to 2 lvl
            //viewCurrent 4 can be downgraded to 2 lvl

            formUserList();
            if (data.type === 1) {
                viewCurrent = data.type;
                console.log('view type = ', viewCurrent);

            } else if (data.type === 2) {

                if (data.type > viewCurrent) {
                    upgradeTo2(data);
                } else if (data.type < viewCurrent && viewCurrent === 3) {
                    downgradeTo2From3(data);
                } else if (data.type < viewCurrent && viewCurrent === 4) {
                    downgradeTo2From4(data);
                } else {
                    console.log('Something went wrong');
                }

            } else if (data.type === 3) {

                if (data.type > viewCurrent) {
                    upgradeTo3(data);
                } else if (data.type < viewCurrent) {
                    downgradeTo3(data);
                } else {
                    console.log('---> changed chat here <--');
                }

            } else if (data.type === 4) {

                if (data.type > viewCurrent) {
                    upgradeTo4(data);
                } else {
                    console.log('Something went wrong');
                }
            }

            function formUserList() {
                vm.userList = [];
                for (let i = 0; i < data.users.length; i++) {
                    let opponent_id = Number(data.users[i].user.substr(0, data.users[i].user.length - 6));
                    vm.userList.push(kidsObj[opponent_id]);
                }
            }
        });


        function upgradeTo2(data) {
            viewCurrent = data.type;
            console.log('upgradeTo2');

            document.getElementById("chatBody").style.display = "none";
            document.getElementById("userPanel").style.display = "none";
            document.getElementById("oneVSoneVSchat").style.display = "none";
            document.getElementById("multi").style.display = "none";
            //disabled chat view
            document.getElementById("oneVSone").style.display = "flex";

            selectUser(null, null, data.kid_id)
        }

        function downgradeTo2From3(data) {
            viewCurrent = data.type;
            console.log('downgradeTo2From3');
            let opponent_id = Number(data.users[0].user.substr(0, data.users[0].user.length - 6));
            document.getElementById("oneVSone").style.display = "flex";

            transferVideoElem(opponent_id);
            transferVideoElem(user.id);
            dataDependencies();

            document.getElementById("chatBody").style.display = "none";
            document.getElementById("userPanel").style.display = "none";
            document.getElementById("oneVSoneVSchat").style.display = "none";
            document.getElementById("multi").style.display = "none";

            function transferVideoElem(id) {

                let item$ = $('#'+id+'mhuser');
                let cln$ = item$.clone(true);

                if (id !== user.id) {
                    item$.appendTo("#tmp2-vid-box");
                   document.getElementById(id + "mhuser").childNodes[0].onclick = function () {
                        $rootScope.$broadcast('emergency-log', id);
                    };

                    vm.idVid[3].remote = 'tmp3-vid-box';
                    vm.idVid[2].remote = 'vid-box';
                } else {
                    item$.appendTo("#tmp2-vid-thumb");
                    vm.idVid[3].local = 'tmp3-vid-thumb';
                    vm.idVid[2].local = 'vid-thumb';
                }
                playById(id);
            }

            function dataDependencies() {
                destroyScrollEvent();
                offFBWatchers();
                vm.kid = angular.copy(vm.kidShort);
                vm.messagesShort = angular.copy(vm.messages);
                vm.logsShort = angular.copy(vm.logs);
            }
        }

        function downgradeTo2From4(data) {
            console.log('downgradeTo2From4');

            $timeout(function () {
                viewCurrent = data.type;
                let opponent_id = Number(data.users[0].user.substr(0, data.users[0].user.length - 6));
                selectUser(null, null, opponent_id);

                document.getElementById("oneVSone").style.display = "flex";

                console.log(opponent_id, user.id);
                transferVideoElem(opponent_id);
                transferVideoElem(user.id);
                dataDependencies();

                document.getElementById("chatBody").style.display = "none";
                document.getElementById("userPanel").style.display = "none";
                document.getElementById("oneVSoneVSchat").style.display = "none";
                document.getElementById("multi").style.display = "none";

                function transferVideoElem(id) {
                    let item$ = $('#'+id+'mhuser');
                    let cln$ = item$.clone(true);

                    if (id !== user.id) {
                        item$.appendTo("#tmp2-vid-box");
                        document.getElementById(id + "mhuser").childNodes[0].onclick = function () {
                            $rootScope.$broadcast('emergency-log', id);
                        };
                    } else {
                        item$.appendTo("#tmp2-vid-thumb");
                        vm.idVid[4].remote = 'tmp4-vid-box';
                        vm.idVid[2].remote = 'vid-box';
                        vm.idVid[2].local = 'vid-thumb';
                    }
                    playById(id);
                }

                function dataDependencies() {
                    destroyScrollEvent();
                    offFBWatchers();
                    vm.kid = angular.copy(vm.kidShort);
                    vm.messagesShort = angular.copy(vm.messages);
                    vm.logsShort = angular.copy(vm.logs);
                }
            })
        }

        function upgradeTo3(data) {
            $timeout(function () {
                console.log('upgradeTo3');
                viewCurrent = data.type;
                let opponent_id = Number(data.users[0].user.substr(0, data.users[0].user.length - 6));

                document.getElementById("oneVSoneVSchat").style.display = "flex";
                chat_body = document.getElementById("chat2");
                console.dir(chat_body);

                transferVideoElem(opponent_id);
                transferVideoElem(user.id);

                document.getElementById("chatBody").style.display = "none";
                document.getElementById("userPanel").style.display = "none";
                document.getElementById("oneVSone").style.display = "none";
                document.getElementById("multi").style.display = "none";

                function transferVideoElem(id) {
                    let item$ = $('#'+id+'mhuser');
                    let cln$ = item$.clone(true);

                    if (id !== user.id) {
                        item$.appendTo("#tmp3-vid-box");
                        document.getElementById(id + "mhuser").childNodes[0].onclick = function () {
                            $rootScope.$broadcast('emergency-log', id);
                        };
                        vm.idVid[2].remote = 'tmp2-vid-box';
                        vm.idVid[3].remote = 'vid-box';
                    } else {
                        item$.appendTo("#tmp3-vid-thumb");
                        vm.idVid[2].local = 'tmp2-vid-thumb';
                        vm.idVid[3].local = 'vid-thumb';
                    }
                }
                playById(id);
                videoPlusChatDependencies(data.kid_id)
            })
        }

        function downgradeTo3(data) {
            console.log('Unused function!');
        }

        function upgradeTo4(data) {
            console.log('upgradeTo4');
            let prevView = angular.copy(viewCurrent);
            viewCurrent = data.type;
            let opponent_id;
            vm.userList = [];
            document.getElementById("multi").style.display = "flex";

            transferCycle();

            function transferCycle() {
                $timeout(function () {
                    for (let i = 0; i < data.users.length; i++) {
                        opponent_id = Number(data.users[i].user.substr(0, data.users[i].user.length - 6));
                        // vm.userList.push(kidsObj[opponent_id]);
                        transferVideoElem(opponent_id);
                    }
                    transferVideoElem(user.id);
                });
            }

            function transferVideoElem(id) {
               let item$ = $('#'+id+'mhuser');
                let cln$ = item$.clone(true);

                console.log('user.id ', user.id);
                if (id !== user.id) {
                    console.log('not self');
                    item$.appendTo("#tmp4-vid-box");
                    document.getElementById(id + "mhuser").childNodes[0].onclick = function () {
                        $rootScope.$broadcast('emergency-log', id);
                    };

                } else {
                    console.log('self');
                    item$.appendTo("#tmp4-vid-box");
                    idChanger();
                }
                playById(id);
            }

            function idChanger() {
                console.log('idChanger');
                if (prevView === 2) {
                    vm.idVid[2].remote = 'tmp2-vid-box';
                    vm.idVid[4].remote = 'vid-box';
                    vm.idVid[2].local = 'tmp2-vid-thumb';

                } else if (prevView === 3) {
                    vm.idVid[3].remote = 'tmp3-vid-box';
                    vm.idVid[4].remote = 'vid-box';
                    vm.idVid[3].local = 'tmp3-vid-thumb';
                }
                dispalyChanger();
            }

            function dispalyChanger() {
                console.log('dispalyChanger');
                document.getElementById("chatBody").style.display = "none";
                document.getElementById("userPanel").style.display = "none";
                document.getElementById("oneVSone").style.display = "none";
                document.getElementById("oneVSoneVSchat").style.display = "none";
            }
        }

        function leaveThisChat() {
            console.log('leaveThisChat');
            let data = {
                type: 2,
                kid_id: null,
                join: false,
                users: $localStorage.userActivityArr
            };
            $rootScope.$broadcast('chat-type', data)
        }

        ///////////////////////////////////////////////////////////////////////////////////////
        let sendUsers = angular.copy($localStorage.sendUsers) || {date: null, ids: []};

        initializeFB(true, true);

        function initializeFB(chats, logs) {
            if (chats) {
                offFBWatchers();
                psychologistAccess();
                checkMissedNumber();
                // checkUnreadAmount();
                downloadMessages();
                addMessagesEvent();
                removeMessagesEvent();
                changeMessagesEvent();
            }
            if (logs) {
                downloadLogs();
            }
        }

        ////////////////// access ///////////////////////
        function psychologistAccess() {
            firebaseDataSvc.psychologAccess(kid_id, psy_id, (snapshot) => {
                $timeout(function () {
                    access =  snapshot === false ? false : true;
                });
            });
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
                firebaseDataSvc.watchOnline(user.id, (snapshot) => {
                    $timeout(function () {
                        if (snapshot) {
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
        function selectUser(kid, index, id) {
            //change active kid, load chats & parents info

            if (!id) {
                vm.kid = kids[index];
                id = kid.id;
            } else {
                vm.kid = kidsObj[id]
                // for (let i = 0; i<kids.length; i++) {
                //     if (id === kids[i].id) {
                //         vm.kid = kids[i];
                //         break;
                //     }
                // }
            }
            $localStorage.last_chat = id;
            vm.messages = [];
            vm.logs = [];

            console.log(vm.kid);
            console.log(vm.messages);
            console.log(vm.logs);

            getParents(id);
            kid_id = id;
            post_is_last = false;
            scrollEventEnabled = false;
            destroyScrollEvent();
            initializeFB(true, true)
        }

        function selectUserInMulti(kid) {
            kid_id = kid.id;
            vm.kid = kidsObj[kid_id];
            downloadLogs();
        }

        function videoPlusChatDependencies(id) {
            vm.kidShort = angular.copy(vm.kid);
            vm.messagesShort = angular.copy(vm.messages);
            vm.logsShort = angular.copy(vm.logs);

            chat_body = document.getElementById("chat2");
            selectUser(null, null, id);
        }

        function getParents(kid_id) {
            userService.getParents({kid_id: kid_id}).then(function (res) {
                vm.parents = res.status === 'success' ? res.data : [];
            });
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
            return !!vm.messages[index].create_by_user_id === kid_id;
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
            data.create_by_user_role = 3;
            data.read = false;

            if (!access) {
                toastr.error('User blocked you')
            } else if (vm.message_input) {
                firebaseDataSvc.setTotalUnreadKid(kid_id, psy_id, total_unread_kid + 1);
                firebaseDataSvc.setMessages(kid_id, psy_id, data);
                vm.message_input = '';
                addStatisticChat(data)
            }
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
                    if (res.status === 'success') {
                        sendUsers.date = date;
                        sendUsers.ids.push(kid_id);
                        $localStorage.sendUsers = sendUsers;
                    }
                })
            }
        }

        function scrollToBottom(newMsg) {
            if (newMsg) {
                // тут добавить какоето условие для более корректной работы функции(возможно скролл и ненужно опускать)

                $timeout(function () {
                    chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                }, 500);

            } else {
                // chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                $timeout(function () {
                    chat_body.scrollTop = angular.copy(chat_body.scrollHeight);
                }, 500);
            }
        }

        function convertToArray(data, type, logs) {
            let res = utilsSvc.objToArr(data);
            let arrOfKeys = Object.keys(data);

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
                    // var total = total_unread - local_unread > -1 ? total_unread - local_unread : 0;
                    var total = total_unread - local_unread;
                    firebaseDataSvc.setTotalUnreadPsy(kid_id, psy_id, total);
                    local_unread = 0;
                    unreadMsgsKeysArr = [];
                }, 200);
            }
        }

        function markAsRead(keys) {
            angular.forEach(keys, function (key) {
                firebaseDataSvc.setMarkAsRead(kid_id, psy_id, key);
            })
        }

        function offFBWatchers() {
            console.log('offFBWatchers');
            firebaseDataSvc.removeWatch(kid_id, psy_id);
        }

        function downloadMessages() {
            post_is_last = false;
            firebaseDataSvc.getMessages(kid_id, psy_id, number_of_posts, (snapshot) => {
                $timeout(function () {
                    snapshot ? vm.messages = convertToArray(snapshot, 'primary_loading') : vm.messages = [];
                    scrollToBottom();
                })
            });
        }

        function downloadMoreMessages() {
            vm.loadMessages = true;
            let last = vm.messages[0].date;
            firebaseDataSvc.getMoreMessages(kid_id, psy_id, last, download_more + 1, (snapshot) => {
                anchorScroll(snapshot);
                vm.loadMessages = false;
            })
        }

        function addMessagesEvent() {
            console.log('addMessagesEvent');
            firebaseDataSvc.onMessagesEvent(kid_id, psy_id, (snapshot) => {
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
            firebaseDataSvc.onRemoveMessagesEvent(kid_id, psy_id, (snapshot) => {
                $timeout(function () {
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === snapshot.date) {
                            vm.messages.splice(i, 1);
                            break;
                        }
                    }
                })
            })
        }

        function changeMessagesEvent() {
            console.log('changeMessagesEvent');
            firebaseDataSvc.onChangeMessagesEvent(kid_id, psy_id, (snapshot) => {
                $timeout(function () {
                    console.log('message changed ', snapshot);
                    for (let i = 0; i < vm.messages.length; i++) {
                        if (vm.messages[i].date === snapshot.date) {
                            vm.messages[i] = snapshot;
                            break;
                        }
                    }
                })
            })
        }

        function checkMissedNumber() {
            console.log('checkMissedNumber');
            firebaseDataSvc.onCheckMissedNumberPsy(kid_id, psy_id, (snapshot) => {
                $timeout(function () {
                    total_unread = snapshot ? Number(snapshot) : 0;
                })
            });
            firebaseDataSvc.onCheckMissedNumberChild(kid_id, psy_id, (snapshot) => {
                $timeout(function () {
                    total_unread_kid = snapshot ? Number(snapshot) : 0;
                    console.log('total_unread_kid = ', total_unread_kid);
                })
            })
        }

        function downloadLogs() {
            firebaseDataSvc.onLogs(kid_id, number_of_logs, (snapshot) => {
                $timeout(function () {
                    vm.logs = snapshot ? convertToArray(snapshot, null, true) : [];
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
                    chat_body.scrollTop = angular.copy(chatHeightNew - chatHeightOld);
                })
            })
        }

        /////////////////////////// Consultants /////////////////////////

        let consultantsObj = consultantService.convert(consultants);

        function consName(consultant) {
            return (consultantsObj[consultant.consultant_id]) ? consultantsObj[consultant.consultant_id].name : "No Name"
        }

        /////////////////////////// kid and parents /////////////////////////
        let kidsObj = kidService.convert(kids);

        function kidName(id) {
            return (consultantsObj[id]) ? consultantsObj[id].name : "No Name";
        }

        /////////////////////////// add log /////////////////////////
        function addComment(kid) {
            console.log('add comment');
            let data;
            if (kid) {
                data = {
                    kid: kid,
                    logs: null,
                    consultants: consultantsObj
                };
                firebaseDataSvc.onComment(kid.id, number_of_logs, (snapshot) => {
                    $timeout(function () {
                        data.logs = snapshot ? convertToArray(snapshot, null, true) : [];
                        showDialog(data);
                    })
                });

            } else {
                data = {
                    kid: vm.kid,
                    logs: vm.logs,
                    consultants: consultantsObj
                };
                showDialog(data);
            }

            function showDialog(data) {
                modalSvc.sendLog(data).then(function (res) {
                        console.log('close dialog');
                        console.log('res', res);
                    }
                );
            }

        }

        function addEmergencyComment(kid) {
            let data = {
                kid: kid
            };

            modalSvc.sendEmergency(data).then(function (res) {
                console.log('close dialog');
            });
        }

        /////////////////////////// leave video chat /////////////////////////

        function hangup() {
            RTCService.closeStream();
        }
    }
})();