/**
 * User: kgoulding
 * Date: 4/3/12
 * Time: 11:12 PM
 */
(function () { // self-invoking function
    SAS.Main = function () {
        var _self = this;

        //region private fields and methods
        var _map;
        /** @type SAS.PriorityList */
        var _priorityList;
        var _bubbleChart;
        /** @type SAS.MechanismList */
        var _mechanismList;
        var _pages;
        var _layout;
        /** @type SAS.DataManager */
        var _dataManager;

        var _filename = SAS.configInstance.getFileName();

        var _detectSVG = function () {
            return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
        };

        var _detectiPad = function () {
            return true; //TODO: temp

            return (navigator.userAgent.match(/iPad/i) != null);
        };

        var _reportIncompatibleBrowser = function () {
            window.location = "oldbrowser.html";
        };

        var _preventAccidentalLeaving = function () {
            window.onbeforeunload = function () {
                if (!_dataManager.getIsSaved()) {
                    return "You have not submitted your response yet.";
                }
            };
        };

        var _setupClicksForActiveMech = function (activeMech) {
            $("#moreInfo").html("");
            if (activeMech != null) {
                var $link = $("<a href='#'>See all explanations for </a>").appendTo("#moreInfo").click(function () {
                    new SAS.InfoWindow().createImpactsWindow(activeMech, _priorityList.getPriorities());
                });
                var $boldSpan = $('<span>').appendTo($link);
                SAS.localizr.live(activeMech.data.progressive, function (str) {
                    $boldSpan.html(str.toLowerCase());
                });
                _bubbleChart.colorForMechanism(activeMech);
            }
        };

//        var _addLangBtn = function ($holder) {
//            var $langSel = $("<select></select>").appendTo($holder);
//
//            SAS.controlUtilsInstance.populateSelectList($langSel, null, ['en', 'af'], 'en');
//            $langSel.change(function() {
//                SAS.localizr.setActiveLang($(this).val());
//            });
//        };

        var _initialize = function () {
            if (!_detectSVG()) {
                _reportIncompatibleBrowser();
                return;
            }
            _dataManager = new SAS.DataManager(SAS.utilsInstance.gup('prId'));
            _layout = new SAS.Layout();
//            _map = new SAS.MapFrame();
            _priorityList = new SAS.PriorityList();
            _bubbleChart = new SAS.BubbleChart(_priorityList);
            _mechanismList = new SAS.MechanismList(_filename, _bubbleChart);
            _pages = new SAS.Pages(_layout, _priorityList, _mechanismList, _bubbleChart, _map, _dataManager);

            SAS.instructionsInstance.initialize();
//            _addLangBtn($('#langSel'));

            _priorityList.onLoad(function () {
                _bubbleChart.createBubbles();
                _layout.positionElements();
            });
            _mechanismList.onLoad(function () {
                _layout.positionElements();
            });
            _priorityList.onRatingChange(function () {
                _bubbleChart.resizeBubbles();
            });
            _mechanismList.onActiveMechanismChange(function () {
                _setupClicksForActiveMech(_mechanismList.getActiveMechanism());
            });
            _layout.onLayout(function () {
                _bubbleChart.updateLayout();
                _pages.afterLayout();
            });

            //--tipsy for any content created on a dialog
            _self.addTooltip($('#dialog a'), {gravity: $.fn.tipsy.autoNS, opacity: 0.9, live: true, trigger: 'manual'});
            _self.addTooltip($('#leftPanel a'), {gravity: $.fn.tipsy.autoNS, opacity: 0.85, live: true, trigger: 'manual'});
        };

        //endregion

        //region public API
        this.getCacheVersion = function () {
            //TODO - the cacheVersion should update each time any data changes on the server...
            return 13;
        };

        this.getPages = function () {
            return _pages;
        };

        /** @return {SAS.BubbleChart} */
        this.getBubbleChart = function () {
            return _bubbleChart;
        };

        /** @return {SAS.DataManager} */
        this.getDataManager = function () {
            return _dataManager;
        };

        /**
         * @param {String} pId
         * @return {SAS.PriorityDef}
         */
        this.getPriorityDef = function (pId) {
            return _priorityList.getPriorityDef(pId);
        };

        /**
         * @param {String} mechId
         * @return {SAS.MechanismDef}
         */
        this.getMechanismDef = function (mechId) {
            return _mechanismList.getMechanismDef(mechId);
        };

        /**
         * @param {String} mechId
         * @return {SAS.PriorityDef}
         */
        this.getActionCells = function (mechId) {
            return _mechanismList.getActionCells(mechId);
        };

        this.initialize = function () {
            _initialize();
        };

        this.preventAccidentalLeaving = function () {
            _preventAccidentalLeaving();
        };

        this.addTooltip = function ($element, options) {
            if (!_detectiPad()) {
                $element.tipsy(options);
            } else {
                $element.tipsy(options);
                Object.keys($element).forEach(function (key, i, array) {
                    console.log("click" + typeof ($element)[key]);
                    if (typeof (($element)[key]) == 'object') {
                        $(".node").tipsy(options);
                        $(".node").tipsy("show");
                    }
                });

//                $(".node").click( function () {
//                    console.log("click" + typeof $element);
//
//                        $(".node").tipsy("show");
////                        ($element).tipsy("hide");
//                });

//                $(window).live('touchstart click', function(event){
//                    event.stopPropagation();
//                    event.preventDefault();
//                    if(event.handled !== true) {
//                        // Do your magic
//                        $element.tipsy("hide");
//
//                        event.handled = true;
//                    } else {
//                        $element.tipsy("show");
//                        return false;
//                    }
//                });



//                $element.bind('touchstart', function () {
//                    $element.tipsy("hide");
//                });
//                ($element).forEach( function (value, i , array) {
//                    ($element)[i].click( function () {
//                        ($element)[i].tipsy("hide");
//                    });
//                });
//
//

                $(".node").bind('touchstart', function(){
                    console.log("touch started");
                    ($element).tipsy("hide");
                });

                $(".node").bind('touchend', function(){
                    console.log("touch ended");
                    ($element).tipsy("hide");
                });
            }
        };

        this.addClass = function ($element, options) {
            if (!_detectiPad()) {
                $element.addClass(options);
            }
        };

        this.removeClass = function ($element, options) {
            if (!_detectiPad()) {
                $element.removeClass(options);
            }
        };

        //endregion
    };
    /**
     @type SAS.Main
     @const
     */
    SAS.mainInstance = new SAS.Main();
    SAS.mainInstance.initialize();
//    SAS.mainInstance.detectiPad();
})();