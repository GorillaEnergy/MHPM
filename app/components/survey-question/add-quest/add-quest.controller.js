;(function () {
    'use strict';
    angular
        .module('app')
        .controller('AddQuestionController', AddQuestionController);

    AddQuestionController.$inject = ['$mdDialog', 'data', 'blockService', 'toastr', 'countries', '$scope', '$timeout'];

    function AddQuestionController($mdDialog, data, blockService, toastr, countries, $scope, $timeout) {
        let vm = this;

        vm.addAnsver = addAnsver;
        vm.deleteAnsver = deleteAnsver;
        vm.changeNextQuest = changeNextQuest;
        vm.save = save;
        vm.cancel = cancel;
        vm.countryInputTitle = countryInputTitle;
        vm.countryFilter = countryFilter;
        vm.countryRepeater = countryRepeater;
        vm.countryOnOpen = countryOnOpen;
        vm.countryOnClose = countryOnClose;
        vm.countrySwitchFunc = countrySwitchFunc;
        vm.charactersLimitRegular = charactersLimitRegular;
        vm.riskRegular = riskRegular;
        vm.countrySwitch = false;
        vm.countries = angular.copy(countries);
        vm.createCommon = data.createCommon;

        let mainKey = data.mainKey;
        let answerKey = data.answerKey;
        let questionKey = data.questionKey;
        let idBlock = data.idBlock;
        let questionsArr = data.items;
        vm.questions = questionsArr;
        let identifierDefault;
        if (mainKey !== undefined) {
            identifierDefault = data.items[mainKey].identifier;
            console.log(identifierDefault);
        }
        // console.log(data.items[mainKey]);
        // vm.oldData =data.items[mainKey];
        let itemsOrig;
        let loopingValid;
        let identifierValid;
        let tmpCountries = [];          //using for check update in "country dependency" field (md-on-open)
        let allSelectedCountries = [];  //store all the answers
        let commonItem = false;
        let createCommon = data.createCommon;
        if(data.commonItem){
            commonItem = {
                common_question_id: data.commonItem.id,
                title: data.commonItem.title,
                type: data.commonItem.type,
                validation_type: data.commonItem.validation_type,
                characters_limit: data.commonItem.characters_limit,
                mandatory: data.commonItem.mandatory,
                information: data.commonItem.information,
                contract_text: data.commonItem.contract_text,
                answers: []
            };
        };

        console.log('questions = ', questionsArr);

        if (typeof questionKey != 'undefined') {
            itemsOrig = data.items[mainKey].answers[answerKey].child_questions;
            vm.data = angular.copy(itemsOrig[questionKey]);
            if (vm.data.answers.length) {
                vm.countrySwitch = true;
                console.log(vm.countrySwitch);
            }
            console.log(vm.data);
        }
        else if (typeof mainKey != 'undefined') {
            itemsOrig = data.items;
            vm.data = angular.copy(itemsOrig[mainKey]);

            if (vm.data.answers.length) {
                vm.countrySwitch = true;
                console.log(vm.countrySwitch);
            }
            console.log(vm.data);
        }
        else if (commonItem){ //for common question
            itemsOrig = data.items;
            vm.data = angular.copy(commonItem);
            console.log(vm.data);
        }
        else {
            itemsOrig = data.items;
            vm.data = {
                answers: []
            };
        }

        collectionOfSelectedCountries();

        function collectionOfSelectedCountries() {
            if (vm.data.type === 4 && vm.data.answers.length) {
                let answers = vm.data.answers;
                answers.forEach(function (answer) {
                    if (answer.answer_text.length) {
                        answer.answer_text.forEach(function (answer_text) {
                            allSelectedCountries.push(answer_text);
                        })
                    }
                });
                console.log('allSelectedCountries = ', allSelectedCountries);
            }
        }

        function addAnsver() {
            if (vm.data.answers.length == 0 ||
                typeof vm.data.answers[vm.data.answers.length - 1].answer_text !== 'undefined'
                && vm.data.answers[vm.data.answers.length - 1].answer_text !== '') {

                let tmpObj = {
                    child_questions: []
                };

                vm.data.answers.push(tmpObj);
            } else if (vm.data.answers.length == 4 && vm.data.answers[vm.data.answers.length - 1].answer_text.length) {
                let tmpObj = {
                    child_questions: []
                };

                vm.data.answers.push(tmpObj);
            }
        }

        function deleteAnsver(answer, indexAns, country) {

            if (typeof answer.id != 'undefined') {
                vm.data.answers[indexAns].delete = true;
                vm.data.answers[indexAns].child_questions = [];
            }
            else {
                vm.data.answers.splice(indexAns, 1);
            }

            if (country) {
                console.log(answer.answer_text);
                console.log(allSelectedCountries);
                allSelectedCountries = allSelectedCountries.filter(function (countryInSelectedList) {
                    let status = true;

                    for (let i = 0; i < answer.answer_text.length; i++) {
                        if (countryInSelectedList == answer.answer_text[i]) {
                            status = false;
                            break;
                        }
                    }
                    if (status) {
                        return countryInSelectedList;
                    }
                });
                console.log('allSelectedCountries = ', allSelectedCountries);
            }

        }


        //       countryFilter --> unused func!
        function countryFilter(country, answers) {
            let quickStatus = false;
            let deepStatus = true;

            if (answers) {

                quickCheck();

                if (quickStatus) {
                    return true;
                } else {
                    deepCheck();

                    if (deepStatus) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                deepCheck();

                if (deepStatus) {
                    return true;
                } else {
                    return false;
                }
            }

            function quickCheck(country) {
                for (let i = 0; i < answers.length; i++) {
                    if (country === answers[i]) {
                        quickStatus = true;
                        break;
                    }
                }
            }

            function deepCheck() {
                let tmpAllSelectedCountries = angular.copy(allSelectedCountries);

                if (tmpAllSelectedCountries) {
                    tmpAllSelectedCountries = tmpAllSelectedCountries.filter(function (countryAllList) {
                        let status = true;

                        if (answers) {
                            answers = answers.filter(function (answer) {
                                if (answer !== countryAllList) {
                                    return answer;
                                } else {
                                    status = false;
                                }
                            });
                        }

                        if (status) {
                            return countryAllList;
                        }
                    });
                }

                for (let i = 0; i < tmpAllSelectedCountries.length; i++) {
                    if (deepStatus) {
                        if (country === tmpAllSelectedCountries[i]) {
                            deepStatus = false;
                            break;
                        }
                    }
                }
            }
        }

        function countrySwitchFunc(switchStatus) {
            if (vm.data.answers.length) {
                vm.data.answers.forEach(function (answer) {
                    if (switchStatus) {
                        delete answer.delete;
                    } else {
                        answer.delete = true;
                    }
                })
            }
        }

        function countryRepeater(currentAnswers) {

            let _countriesList = angular.copy(vm.countries);
            let _allSelectedCountries = angular.copy(allSelectedCountries);
            let _currentAnswers = angular.copy(currentAnswers);

            searchingCountriesToRemove();
            removeOfSuperfluousCountries();
            sorting();

            function searchingCountriesToRemove() {
                if (_allSelectedCountries) {
                    _allSelectedCountries = _allSelectedCountries.filter(function (country) {
                        let status = true;

                        if (_currentAnswers) {
                            _currentAnswers = _currentAnswers.filter(function (answer) {
                                if (country !== answer) {
                                    return answer;
                                } else {
                                    status = false;
                                }
                            })
                        }

                        if (status) {
                            return country;
                        }
                    });
                }
            }

            function removeOfSuperfluousCountries() {
                _countriesList = _countriesList.filter(function (countryInCountriesList) {
                    let check = false;

                    for (let i = 0; i < _allSelectedCountries.length; i++) {
                        if (countryInCountriesList === _allSelectedCountries[i]) {
                            check = true;
                            break;
                        }
                    }

                    if (!check) {
                        return countryInCountriesList
                    }
                });
            }

            function sorting() {
                _countriesList.sort();
            }

            return _countriesList
        }

        function countryInputTitle(data) {
            if (data) {
                let tmpTitle = '';
                if (data.length) {
                    tmpTitle = JSON.stringify(data).split('[').join('').split(']').join('').split('"').join('').split(',').join(', ');
                    return tmpTitle;
                } else {
                    return tmpTitle;
                }
            } else {
                return 'Select country'
            }
        }

        function countryOnOpen(data) {
            if (data) {
                tmpCountries = data;
            } else {
                tmpCountries = [];
            }

            // console.log(allSelectedCountries)
        }

        function countryOnClose(data) {
            let countryOnOpen = tmpCountries;
            let countryOnClose = [];
            if (data) {
                countryOnClose = data;
            }
            console.log(countryOnClose);
            let paste = [];
            let cut = [];

            compare();
            cutFunc();
            pasteFunc();
            console.log(allSelectedCountries);

            // $scope.$evalAsync();
            // debugger;
            // $route.reload();

            function compare() {
                if (countryOnOpen) {
                    countryOnOpen = countryOnOpen.filter(function (countryOnOpenSelected) {
                        let status = true;

                        countryOnClose = countryOnClose.filter(function (countryOnCloseSelected) {
                            if (countryOnOpenSelected !== countryOnCloseSelected) {
                                return countryOnCloseSelected;
                            } else {
                                status = false;
                            }
                        });

                        if (status) {
                            return countryOnOpenSelected;
                        }
                    })
                }
            }

            function cutFunc() {
                cut = countryOnOpen;

                cut.forEach(function (item) {
                    allSelectedCountries = allSelectedCountries.filter(function (country) {
                        if (item !== country) {
                            return country;
                        }
                    })
                })
            }

            function pasteFunc() {
                paste = countryOnClose;

                paste.forEach(function (item) {
                    allSelectedCountries.push(item);
                });
                // allSelectedCountries.sort();
            }
        }

        function save() {
            if(createCommon){
                if(!vm.questForm.$invalid){
                    blockService.createCommon(vm.data).then(function (res) {
                        if (res.success) {
                            console.log(res);
                            $mdDialog.hide(res.data);
                        }
                    })
                }

            }else {

                let succes = true;
                let couterLenght = 0;

            if (vm.data.type == 1 || vm.data.type == 0) {
                vm.data.answers.forEach(function (item) {
                    if (!item.delete) {
                        couterLenght++;
                    }

                    if (typeof item.answer_text == 'undefined' || item.answer_text == '') {
                        succes = false;
                    }
                });
            } else if (vm.data.type == 4) {
                if (vm.data.answers.length) {
                    vm.data.answers.forEach(function (item) {
                        if (typeof item.answer_text == 'undefined' || !item.answer_text.length) {
                            succes = false;
                        }
                    });
                }
            } else {
                succes = true;
            }

            if (vm.data.type !== 2) {
                vm.data.characters_limit = 30;
            }

            if (vm.questForm.$invalid || !succes) {
            }
            else if ((vm.data.type == 1 || vm.data.type == 0) && couterLenght < 2) {
                toastr.error('Answer length min 2');
            }
            else {
                if (typeof questionKey != 'undefined') {

                    if (vm.data.type == 1 || vm.data.type == 0 || vm.data.type == 4) {
                        vm.data.answers.forEach(function (itemAnswer, indexAnswer) {
                            itemAnswer.order_number = indexAnswer;
                            console.log(itemAnswer);
                        });
                    }

                    let dataForSend = angular.copy([vm.data]);
                    loopingTest(vm.data);
                    console.log('?');


                    blockService.addBlockQuestion(idBlock, dataForSend).then(function (res) {
                        if (res.success) {
                            console.log('1');
                            itemsOrig.splice(questionKey, 1, vm.data);
                        }
                    });
                }
                else if (typeof mainKey != 'undefined') {

                    if (vm.data.type == 1 || vm.data.type == 0 || vm.data.type == 4) {
                        vm.data.answers.forEach(function (itemAnswer, indexAnswer) {
                            itemAnswer.order_number = indexAnswer;
                        });
                    }

                    let dataForSend = angular.copy(vm.data);
                    console.log('vm.data = ', vm.data);
                    loopingTest(vm.data);

                    let tmpData = angular.copy(vm.data);
                    tmpData.editType = 'edit';
                    identifierValidFunc(tmpData);

                    if (loopingValid === true && identifierValid === true) {

                        // Fix from correct paste answer in contract
                        if (dataForSend.type === 0 || dataForSend.type === 1) {
                            angular.forEach(dataForSend.answers, function (answer) {
                                answer.answer_text = answer.answer_text.split('<').join('&lt;').split('>').join('&gt;');
                            });
                        }

                        angular.forEach(questionsArr, function (question) {
                            if (question.type !== 1 && question.next_question === identifierDefault) {
                                question.next_question = dataForSend.identifier;
                                vm.dataForSendTwo = question;
                                blockService.addBlockQuestion(idBlock, [vm.dataForSendTwo]);
                            } else {
                                angular.forEach(question.answers, function (answer) {
                                    if (answer.next_question === identifierDefault) {
                                        answer.next_question = dataForSend.identifier;
                                        vm.dataForSendTwo = question;
                                        blockService.addBlockQuestion(idBlock, [vm.dataForSendTwo]);
                                    }
                                })
                            }
                        });

                        blockService.addBlockQuestion(idBlock, [dataForSend]).then(function (res) {
                            if (res.success) {
                                console.log('edit1');
                                let question = angular.copy(res.data.questions[0]);

                                if (question.type === 0 || question.type === 1) {
                                    angular.forEach(question.answers, function (answer) {
                                        answer.answer_text = answer.answer_text.split('&lt;').join('<').split('&gt;').join('>');
                                    });
                                }
                                itemsOrig.splice(mainKey, 1, question);
                            }
                        });
                        $mdDialog.hide();
                    }
                }
                else {
                    vm.data.child_order_number = null;

                    if (itemsOrig.length == 0) {
                        vm.data.order_number = 0;
                    }
                    else {
                        vm.data.order_number = itemsOrig[itemsOrig.length - 1].order_number + 1;
                    }

                    if (vm.data.type == 1 || vm.data.type == 0 || vm.data.type == 4) {
                        vm.data.answers.forEach(function (itemAnswer, indexAnswer) {
                            itemAnswer.order_number = indexAnswer;
                        });
                    }
                    vm.data.mandatory = 1;
                    if (vm.data.next_question === undefined) {
                        vm.data.next_question = null;
                    }
                    let dataForSend = angular.copy([vm.data]);
                    loopingTest(vm.data);

                    let tmpData = vm.data;
                    // tmpData.editType = 'add';
                    console.log('add');
                    identifierValidFunc(tmpData);

                    if (loopingValid === true && identifierValid === true) {

                        // Fix from correct paste answer in contract
                        if (dataForSend[0].type === 0 || dataForSend[0].type === 1) {
                            angular.forEach(dataForSend[0].answers, function (answer) {
                                answer.answer_text = answer.answer_text.split('<').join('&lt;').split('>').join('&gt;');
                            });
                        }

                        // console.log(dataForSend);

                        blockService.addBlockQuestion(idBlock, dataForSend).then(function (res) {
                            if (res.success) {
                                let question = angular.copy(res.data.questions[0]);

                                if (question.type === 0 || question.type === 1) {
                                    angular.forEach(question.answers, function (answer) {
                                        answer.answer_text = answer.answer_text.split('&lt;').join('<').split('&gt;').join('>');
                                    });
                                }
                                itemsOrig.push(question);
                            }
                        });
                        $mdDialog.hide();
                    }
                }
                // $mdDialog.hide();
            }
        }

        }

        function changeNextQuest(quest, answer) {
            let question = vm.data;

            if (quest === undefined) {
                question.next_question = null;
                vm.data = question;

                if (answer !== undefined) {
                    answer.next_question = null;
                    vm.data = question;
                }
                blockService.addBlockQuestion(idBlock, [vm.data]);

            } else if (question.type === 1 || question.type === 4) {
                angular.forEach(question.answers, function (ans) {
                    if (answer.id === ans.id) {
                        vm.answerOldValue = answer.next_question;
                        answer.next_question = quest.identifier;
                        vm.data = question;
                    }
                });

                loopingTest(question);

                if (loopingValid === false) {
                    return vm.data;
                } else {
                    // blockService.addBlockQuestion(idBlock, [vm.data]);
                }

            } else {
                vm.data = question;
                vm.oldValue = vm.data.next_question;
                vm.data.next_question = quest.identifier;

                loopingTest(question);
                if (loopingValid === false) {
                    console.log('false');
                    console.log(vm.data);
                    return vm.data;
                } else {
                    // blockService.addBlockQuestion(idBlock, [vm.data]);
                }
            }
        }

        function loopingTest(Obj) {
            let tmpArr = questionsArr;
            let tmpIdentifier = Obj.identifier;
            let chain = [Obj];
            let tmpValid = true;

            console.log('tmpArr', tmpArr);
            console.log('Obj', Obj);

            for (let i in tmpArr) {
                for (let index in tmpArr) {
                    if (tmpArr[index].type === 1) {
                        for (let radioIndex in tmpArr[index].answers) {
                            // console.log(tmpArr[index].answers[radioIndex].next_question);
                            // console.log(tmpIdentifier);
                            if (tmpArr[index].answers[radioIndex].next_question === tmpIdentifier) {
                                tmpIdentifier = tmpArr[index].identifier;
                                chain.push(tmpArr[index]);
                            }
                        }
                    } else {
                        // console.log(tmpArr[index].next_question);
                        // console.log(tmpIdentifier);
                        if (tmpArr[index].next_question === tmpIdentifier) {
                            tmpIdentifier = tmpArr[index].identifier;
                            chain.push(tmpArr[index]);
                        }
                    }

                }
            }
            console.log('chain', chain);
            console.log('Obj ', Obj);

            if (Obj.type === 1 || Obj.type === 4 && Obj.answers.length) {
                console.log('type === (1 || 4)');
                for (let answerIndex in Obj.answers) {
                    for (let chainIndex in chain) {

                        // console.log(chain[chainIndex].identifier);
                        // console.log(Obj.answers[answerIndex].next_question);
                        // console.log("-------------------------------------------");

                        if (chain[chainIndex].identifier === Obj.answers[answerIndex].next_question) {
                            tmpValid = false;
                            console.log('You create loop! (radio, country) type');
                            toastr.error('Warning! You have created a question loop');
                            Obj.answers[answerIndex].next_question = vm.answerOldValue;
                            break;
                        }
                    }
                    console.log(tmpValid);
                    console.log(loopingValid);
                    loopingValid = tmpValid;
                }
            } else {
                // console.log('It`s no radio!');
                for (let chainIndex in chain) {
                    if (chain[chainIndex].identifier === Obj.next_question) {
                        tmpValid = false;
                        toastr.error('Warning! You have created a question loop');
                        console.log('You create loop! else');
                        Obj.next_question = vm.oldValue;
                        break;
                    }
                }
                loopingValid = tmpValid;
            }
            console.log('loopingValid = ', loopingValid);
        }

        function identifierValidFunc(Obj) {
            let tmpValid = true;

            if (Obj.editType === 'add') {
                for (let index in questionsArr) {
                    if (questionsArr[index].identifier === vm.data.identifier) {
                        tmpValid = false;
                        console.log(questionsArr[index].identifier + ' = ' + vm.data.identifier);
                        toastr.error('Identifier already exist');
                    }
                }
                identifierValid = tmpValid;
            } else {
                for (let index in questionsArr) {
                    if (Obj.identifier !== identifierDefault) {
                        if (questionsArr[index].identifier === vm.data.identifier) {
                            tmpValid = false;
                            console.log(questionsArr[index].identifier + ' = ' + vm.data.identifier);
                            toastr.error('Identifier already exist');
                        }
                    }
                }
            }
            identifierValid = tmpValid;
            console.log('identifierValid = ', identifierValid)
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function charactersLimitRegular(data) {
            let str = angular.copy(data);
            let maximum = 4000;

            if (data) {
                str = str.replace(/\D+/g, "");
                if (str.charAt(0) === '0' && str.length > 1) {
                    str = str.replace(str.charAt(0), '');
                }
            }

            let strLength = Number(str);
            if (strLength > maximum) {
                vm.data.characters_limit = maximum
            } else {
                vm.data.characters_limit = str;
            }
        }

        function riskRegular(data) {
            let str = angular.copy(data);
            if (data) {
                str = str.replace(/\D+/g, "");
                if (str.charAt(0) === '0' && str.length > 1) {
                    str = str.replace(str.charAt(0), '');
                }
            }
            str = Number(str);
            vm.data.risk_value = str;
        }
    }
})();