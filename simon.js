(function (){
    'use strict';

    var Game,
        Utils,
        ButtonPanel,
        SettingsPanel,
        firstButton,
        secondButton,
        thirdButton,
        fourthButton,
        buttons,
        startButton,
        strictModeButton,
        scoreBoard,
        gameLoop,
        humanTurnTimeout,
        computerComboPlaceholder = [],
        listeners = [],
        currentPlayLength = 0,
        currentComputerCombo = [],
        currentHumanCombo = [],
        animationTimers = [],
        maxPlayValue = 20,
        strictMode = false,
        gameStarted = false,
        gameActivated = false;

    Game = {
        startGame: function(){
            console.log("Starting Game..");
            gameStarted = true;
            currentPlayLength++;
            Utils.display(scoreBoard, currentPlayLength);
            SettingsPanel.deactivateStartButton();
            Game.play(true);
        },

        resetGame: function(){
            currentPlayLength = 0;
            currentComputerCombo.length = 0;
            Game.startGame();
        },

        init: function(){
            firstButton = Utils.selectElementById('button1');
            secondButton = Utils.selectElementById('button2');
            thirdButton = Utils.selectElementById('button3');
            fourthButton = Utils.selectElementById('button4');
            buttons = [firstButton, secondButton, thirdButton, fourthButton];
            startButton = Utils.selectElementById('start-button');
            strictModeButton = Utils.selectElementById('strict-mode');
            scoreBoard = Utils.selectElementById('score-board');

            SettingsPanel.setupSettings();
            Utils.display(scoreBoard, currentPlayLength);
        },

        continueGame: function(continueWithoutRepeat) {
            if(gameLoop)
                clearTimeout(gameLoop);
            Game.play(continueWithoutRepeat);
        },

        humanTurn: function() {
            ButtonPanel.setupButtons();
        },

        listen: function(val) {
            var checkVal = computerComboPlaceholder.pop();
            console.log("Popped.."+checkVal, "Listening.."+val);
            if (checkVal === val) {
                console.log("Before..win..status");
                if (computerComboPlaceholder.length <= 0) {
                    console.log("Checking.. Win Status..");
                    ButtonPanel.tearDownButtons();
                    Game.checkWin();
                }
            } else {
                Utils.display(scoreBoard, "!!");
                Game.cleanExecutionStack();
                ButtonPanel.tearDownButtons();
                setTimeout(function(){
                    if (strictMode)
                        Game.resetGame();
                    else
                        Game.continueGame(false);
                }, 2000);
            }
        },

        play: function(playWithoutRepeat) {
            ButtonPanel.tearDownButtons();

            if (playWithoutRepeat) {
                console.log("Playing without Repeat..");
                console.log(currentComputerCombo);
                currentComputerCombo.unshift(Utils.randomize());
            }

            Utils.display(scoreBoard, currentPlayLength);

            Utils.animateButtons(Utils.getAssociatedButtons(currentComputerCombo));
            computerComboPlaceholder = Array.prototype.slice.call(currentComputerCombo);

            humanTurnTimeout = setTimeout(function(){
                console.log("Waiting for human turn...");
                Game.humanTurn();
            }, 1500*currentComputerCombo.length+1000);

            gameLoop = setTimeout(function(){
                if (humanTurnTimeout)
                    clearTimeout(humanTurnTimeout);
                Game.continueGame(false);
                console.log("Game repeats because of human inaction.. after 8 seconds.");
            }, 1500*currentComputerCombo.length+10000);
        },

        checkWin: function() {
            if (humanTurnTimeout)
                clearTimeout(humanTurnTimeout);
            if ((currentPlayLength < maxPlayValue)) {
                currentPlayLength++;
                console.log("Game continues after checking win Status but Game has not been won..");
                Game.continueGame(true);
            } else {
              Game.cleanExecutionStack();
                Utils.display(scoreBoard, "##");
                setTimeout(function(){
                    Game.resetGame();
                }, 1500);

            }
        },

        discontinue: function(){
            currentPlayLength = 0;
            currentComputerCombo.length = 0;
            currentHumanCombo.length = 0;
            computerComboPlaceholder.length = 0;
            animationTimers.forEach(function(timer){clearTimeout(timer)});
            gameStarted = false;
            Utils.display(scoreBoard, currentPlayLength);
        },

        toggleStrict: function() {
            if(strictMode) {
                Utils.toggleStrictModeDisplay();
                strictMode = false;
            } else {
                Utils.toggleStrictModeDisplay();
                strictMode = true;
            }
        },

        cleanExecutionStack: function() {
            clearTimeout(humanTurnTimeout);
            clearTimeout(gameLoop);
        }
    };

    ButtonPanel = {
        setupButtons: function() {
            for(var i = 0; i < buttons.length; i++) {
                (function (i) {
                    var listener = function() {
                        if (gameStarted) {
                            Utils.animate(buttons[i], 'flash', i);
                            Game.listen(i+1);
                        }
                    };
                    buttons[i].addEventListener('click', listener, false);
                    listeners[buttons[i].id] = listener;

                })(i);
            }
        },

        tearDownButtons: function() {
            for(var i = 0; i < buttons.length; i++) {
                (function (i) {
                    buttons[i].removeEventListener('click', listeners[buttons[i].id], false);
                })(i);
            }
        }
    };

    SettingsPanel = {
        setupSettings: function() {
            startButton.addEventListener('click', Game.startGame, false);
            strictModeButton.addEventListener('click', Game.toggleStrict, false);
        },

        tearDownSettings: function() {
            startButton.removeEventListener('click', Game.startGame, false);
            strictModeButton.removeEventListener('click', Game.toggleStrict, false);
        },

        deactivateStartButton: function() {
            startButton.removeEventListener('click', Game.startGame, false);
        }
    };

    Utils = {
        cellNumberStripper: function(cellNameWithDashedNumber) {
            return parseInt(cellNameWithDashedNumber);
        },

        selectElementById: function(name) {
            return document.getElementById(name);
        },

        selectElementByClass: function(name) {
            return document.getElementsByClassName(name)[0];
        },

        randomize: function() {
           /* var randomNumber = [];
            if (count > 0) {
                for(var i = 0; i < count; i++) {
                    randomNumber.push(Math.floor((Math.random() * 3) + 1));
                }
            }
            console.log(randomNumber);
            return randomNumber;*/
            return Math.floor((Math.random() * 3) + 1);
        },

        compareArrays: function(array1, array2) {
            return array1.length == array2.length && array1.every(function(element, index) {
                    return element === array2[index];
                });
        },

        getAssociatedButtons: function(indexArray) {
            return indexArray.map(function(val){
                return Utils.selectElementById('button'+val)
            });
        },

        animateButtons: function(buttons) {
            animationTimers.length = 0;
            (function animationLoop(i){
                animationTimers[i] = setTimeout(function () {
                    Utils.animate(buttons[i], 'flash', i);
                    --i;
                    if (i >= 0) {
                        animationLoop(i);
                    }
                }, 1500);
            })(buttons.length - 1);
        },

        animate: function(element, animationName, buttonIndex) {
            if (element.style.WebkitAnimationName !== animationName) {
                element.style.WebkitAnimationName = animationName;
                element.style.WebkitAnimationDuration = '1s';

                console.log("animating..."+buttonIndex);
                Utils.playAudioFile(Utils.getAudioFile(buttonIndex));

                //Resetting...
                setTimeout(function() {
                    element.style.WebkitAnimationName = '';
                }, 100);
            }
        },

        toggleActivatorDisplay: function() {
            var off = Utils.selectElementById('off'),
                on = Utils.selectElementById('on');

            if (gameActivated) {
                on.style.backgroundColor = 'black';
                off.style.backgroundColor = 'cornflowerblue';
            } else {
                off.style.backgroundColor = 'black';
                on.style.backgroundColor = 'cornflowerblue';
            }
        },

        toggleStrictModeDisplay: function() {
            var sMode = Utils.selectElementById('strict-mode-img');
            if (strictMode) {
                sMode.style.backgroundColor = 'white';
            } else {
                sMode.style.backgroundColor = 'yellow';
            }
        },

        display: function(element, value) {
            element.innerText = value;
        },

        getAudioFile: function(index) {
            var audioFiles = ["https://s3.amazonaws.com/freecodecamp/simonSound1.mp3", "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3", "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3", "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"];
            return audioFiles[index];
        },

        playAudioFile: function(audioFile) {
            var audio = new Audio(audioFile);
            audio.play();
        }
    };

    Utils.selectElementById("off").addEventListener('click', function() {
        if (gameActivated) {
            Game.discontinue();
            clearTimeout(gameLoop);
            Utils.toggleActivatorDisplay();
            SettingsPanel.tearDownSettings();
            gameActivated = false;
        }
    }, false);

    Utils.selectElementById("on").addEventListener('click', function() {
        if ( ! gameActivated) {
            Utils.toggleActivatorDisplay();
            Game.init();
            gameActivated = true;
        }
    }, false);
}());