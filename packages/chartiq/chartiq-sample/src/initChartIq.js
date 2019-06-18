/**
 * ChartIQ example code. This is pretty much the JS from sample-template-advanced.html
 * factored out in to a function, modded to take a QuoteFeed instance.
 *
 * @param quoteFeed
 * @param lookupDriver
 */
export default function(quoteFeed, lookupDriver) {
    /**
     * Check the current width of the window and assign the appropriate css class
     * that will provide a better look and feel for your screen size.
     * Choices are small (break-sm), medium (break-md), large (break-lg)
     */
    function checkWidth() {
        if ($(window).width() > 700) {
            $("body")
                .removeClass("break-md break-sm")
                .addClass("break-lg");
            $(".icon-toggles")
                .removeClass("sidenav active")
                .addClass("ciq-toggles");
            stxx.layout.sidenav = "sidenavOff";
            $("#symbol").attr("placeholder", "Enter Symbol");
        } else if ($(window).width() <= 700 && $(window).width() > 584) {
            $("body")
                .removeClass("break-lg break-sm")
                .addClass("break-md");
            $(".icon-toggles")
                .removeClass("sidenav active")
                .addClass("ciq-toggles");
            stxx.layout.sidenav = "sidenavOff";
            $("#symbol").attr("placeholder", "Symbol");
        } else if ($(window).width() <= 584) {
            $("body")
                .removeClass("break-md break-lg")
                .addClass("break-sm");
            $(".icon-toggles")
                .removeClass("ciq-toggles")
                .addClass("sidenav");
            $("#symbol").attr("placeholder", "");
        }
        $("cq-dialog").each(function() {
            this.center();
        });
    }

    function setHeight() {
        var windowHeight = $(window).height();
        var ciqHeight = $(".ciq-chart").height();

        if ($("body").hasClass("toolbar-on")) {
            $(stxx.chart.container).height(ciqHeight - 45);
        } else {
            $(stxx.chart.container).height(ciqHeight);
        }
        // This little snippet will ensure that dialog boxes are never larger than the screen height
        $("#maxHeightCSS").remove();
        $("head").append('<style id="maxHeightCSS">cq-dialog { max-height: ' + windowHeight + "px }</style>");
    }

    var circleEvent = $(".stx-markers cq-item.circle");
    circleEvent[0].selectFC = function() {
        $(".stx-markers .ciq-radio").removeClass("ciq-active");
        circleEvent.find($(".ciq-radio")).addClass("ciq-active");
        showMarkers("circle");
    };
    circleEvent.stxtap(circleEvent[0].selectFC);

    var squareEvent = $(".stx-markers cq-item.square");
    squareEvent[0].selectFC = function() {
        $(".stx-markers .ciq-radio").removeClass("ciq-active");
        squareEvent.find($(".ciq-radio")).addClass("ciq-active");
        showMarkers("square");
    };
    squareEvent.stxtap(squareEvent[0].selectFC);

    var calloutEvent = $(".stx-markers cq-item.callout");
    calloutEvent[0].selectFC = function() {
        $(".stx-markers .ciq-radio").removeClass("ciq-active");
        calloutEvent.find($(".ciq-radio")).addClass("ciq-active");
        showMarkers("callout");
    };
    calloutEvent.stxtap(calloutEvent[0].selectFC);

    var abstractEvent = $(".stx-markers cq-item.abstract");
    abstractEvent[0].selectFC = function() {
        $(".stx-markers .ciq-radio").removeClass("ciq-active");
        abstractEvent.find($(".ciq-radio")).addClass("ciq-active");
        hideMarkers();
        var helicopter = $(".stx-marker.abstract").clone();
        helicopter.css({
            "z-index": "30",
            left: (0.4 * stxx.chart.width).toString() + "px"
        });
        var marker = new CIQ.Marker({
            stx: stxx,
            xPositioner: "none",
            yPositioner: "above_candle",
            label: "helicopter",
            permanent: true,
            chartContainer: true,
            node: helicopter[0]
        });
        stxx.draw(); // call draw() when you're done adding markers. They will be positioned in batch.
    };
    abstractEvent.stxtap(abstractEvent[0].selectFC);

    var noneEvent = $(".stx-markers cq-item.none");
    noneEvent[0].selectFC = function() {
        $(".stx-markers .ciq-radio").removeClass("ciq-active");
        noneEvent.find($(".ciq-radio")).addClass("ciq-active");
        hideMarkers();
    };
    noneEvent.stxtap(noneEvent[0].selectFC);

    var stxx = new CIQ.ChartEngine({
        container: $(".chartContainer")[0],
        preferences: {
            labels: false,
            currentPriceLine: true,
            whitespace: 0
        }
    });
    stxx.setDrawingContainer($$$("cq-toolbar"));

    // Attach an automated quote feed to the chart to handle initial load, pagination and updates at preset intervals.
    stxx.attachQuoteFeed(quoteFeed, {
        refreshInterval: 1,
        bufferSize: 200
    });

    // Optionally set a market factory to the chart to make it market hours aware. Otherwise it will operate in 24x7 mode.
    // This is required for the simulator, or if you intend to also enable Extended hours trading zones.
    // Please note that, this method is set to use the CIQ.Market.Symbology functions by default,
    // which must be reviewed and adjust to comply with your quote feed and symbology format before they can be used.
    stxx.setMarketFactory(CIQ.Market.Symbology.factory);

    // Extended hours trading zones -- Make sure this is instantiated before calling startUI as a timing issue with may occur
    new CIQ.ExtendedHours({
        stx: stxx,
        filter: true
    });

    // Floating tooltip on mousehover
    // comment in the following line if you want a tooltip to display when the crosshair toggle is turned on
    // This should be used as an *alternative* to the HeadsUP (HUD).
    //new CIQ.Tooltip({stx:stxx, ohl:true, volume:true, series:true, studies:true});

    // Inactivity timer
    new CIQ.InactivityTimer({
        stx: stxx,
        minutes: 30
    });

    // Animation (using tension requires splines.js)
    //new CIQ.Animation(stxx, {tension:0.3});

    function restoreLayout(stx, cb) {
        var datum = CIQ.localStorage.getItem("myChartLayout");
        //if(datum===null) return;  //commented to make sure cb is called even when no layout found
        function closure() {
            restoreDrawings(stx, stx.chart.symbol);
            if (cb) cb();
        }
        stx.importLayout(JSON.parse(datum), {
            managePeriodicity: true,
            cb: closure
        });
    }

    function saveLayout(obj) {
        var s = JSON.stringify(obj.stx.exportLayout(true));
        CIQ.localStorageSetItem("myChartLayout", s);
    }

    function restoreDrawings(stx, symbol) {
        var memory = CIQ.localStorage.getItem(symbol);
        if (memory !== null) {
            var parsed = JSON.parse(memory);
            if (parsed) {
                stx.importDrawings(parsed);
                stx.draw();
            }
        }
    }

    function saveDrawings(obj) {
        var tmp = obj.stx.exportDrawings();
        if (tmp.length === 0) {
            CIQ.localStorage.removeItem(obj.symbol);
        } else {
            CIQ.localStorageSetItem(obj.symbol, JSON.stringify(tmp));
        }
    }

    function restorePreferences() {
        var pref = CIQ.localStorage.getItem("myChartPreferences");
        if (pref) stxx.importPreferences(JSON.parse(pref));
    }

    function savePreferences(obj) {
        CIQ.localStorageSetItem("myChartPreferences", JSON.stringify(stxx.exportPreferences()));
    }

    function retoggleEvents(obj) {
        var active = $(".stx-markers .ciq-radio.ciq-active");
        active.parent().triggerHandler("stxtap");
    }

    stxx.callbacks.layout = saveLayout;
    stxx.callbacks.symbolChange = saveLayout;
    stxx.callbacks.drawing = saveDrawings;
    stxx.callbacks.newChart = retoggleEvents;
    stxx.callbacks.preferences = savePreferences;

    var UIContext;

    function startUI() {
        UIContext = new CIQ.UI.Context(stxx, $("cq-context,[cq-context]"));
        var UILayout = new CIQ.UI.Layout(UIContext);
        var UIHeadsUpDynamic = new CIQ.UI.HeadsUp($("cq-hu-dynamic"), UIContext, {
            followMouse: true,
            autoStart: false
        });
        var UIHeadsUpStatic = new CIQ.UI.HeadsUp($("cq-hu-static"), UIContext, {
            autoStart: true
        });

        UIContext.changeSymbol = function(data) {
            var stx = this.stx;
            if (this.loader) this.loader.show();
            if (data.symbol == data.symbol.toLowerCase()) data.symbol = data.symbol.toUpperCase(); // set a pretty display version

            // reset comparisons - remove this loop to transfer from symbol to symbol.
            for (var field in stx.chart.series) {
                // keep studies
                if (stxx.chart.series[field].parameters.bucket != "study") stx.removeSeries(field);
            }

            var self = this;
            stx.loadChart(data, function(err) {
                if (err) {
                    // add 'symbol not found error' here if one needed.
                    if (self.loader) self.loader.hide();
                    return;
                }
                if (self.loader) self.loader.hide();
                restoreDrawings(stx, stx.chart.symbol);
            });
        };

        UIContext.setLookupDriver(lookupDriver);

        UIContext.UISymbolLookup = $(".ciq-search cq-lookup")[0];
        UIContext.UISymbolLookup.setCallback(function(context, data) {
            context.changeSymbol(data);
        });

        // KeystrokeHub is attached to the "body" to be able to just start typing anywhere on the page to activate the chart's symbol input box.
        // Change to a different div tag if this behavior is too broad for your particular implementation.
        var KeystrokeHub = new CIQ.UI.KeystrokeHub($("body"), UIContext, {
            cb: CIQ.UI.KeystrokeHub.defaultHotKeys
        });

        var UIDrawingEdit = new CIQ.UI.DrawingEdit(null, UIContext);

        UIDrawingEdit.preventAutoClose = true;

        UIDrawingEdit.node.addEventListener(
            "drawing-edit-begin",
            function(event) {
                if ($("body").hasClass("toolbar-on")) return;
                UIDrawingEdit.preventAutoClose = false;

                $(".ciq-draw").each(function() {
                    this.priorVectorType = event.detail.tool;
                    this.set(true);
                });
            },
            false
        );

        UIDrawingEdit.node.addEventListener(
            "drawing-edit-end",
            function(event) {
                if (UIDrawingEdit.preventAutoClose) return;
                if (event.detail.action !== "edit") UIDrawingEdit.preventAutoClose = true;
                if (event.detail.action !== "close") return;

                $(".ciq-draw").each(function() {
                    this.set(false);
                });
            },
            false
        );

        var UIStudyEdit = new CIQ.UI.StudyEdit(null, UIContext);

        var UIStorage = new CIQ.NameValueStore();

        var UIThemes = $("cq-themes");
        UIThemes[0].initialize({
            builtInThemes: {
                "ciq-day": "Day",
                "ciq-night": "Night"
            },
            defaultTheme: "ciq-night",
            nameValueStore: UIStorage
        });

        var sidePanel = $("cq-side-panel")[0];
        if (sidePanel) sidePanel.registerCallback(resizeScreen);

        $(".ciq-sidenav")[0].registerCallback(function(value) {
            var stx = this.context.stx,
                rightPx;
            var sidePanelWidth = sidePanel ? sidePanel.nonAnimatedWidth() : 0;
            if (value === "sidenavOn") {
                var chartHolderHeight = $(".stx-holder").height();
                $(".sidenav").height(chartHolderHeight);
                this.node.addClass("active");
                stx.layout.sidenav = "sidenavOn";
                $(".sidenav").addClass("active");
                rightPx = this.node.width() + sidePanelWidth;
            } else if (value === "sidenavOff") {
                rightPx = sidePanelWidth;
                $(".sidenav").removeClass("active");
                this.node.removeClass("active");
                stx.layout.sidenav = "sidenavOff";
            }
            $("cq-side-panel").css("right", rightPx - sidePanelWidth + "px");
            $(".ciq-chart-area").css({
                right: rightPx + "px"
            });
            $("cq-tradingcentral").css({
                "margin-right": rightPx + 15 + "px"
            });
            stx.resizeChart();
        });

        $(".ciq-HU")[0].registerCallback(function(value) {
            if (value === "static") {
                UIHeadsUpDynamic.end();
                UIHeadsUpStatic.begin();
                this.node.addClass("active");
            } else if (value === "dynamic") {
                if (CIQ.isMobile || this.context.stx.layout.crosshair) {
                    // The dynamic headsUp doesn't make any sense on mobile devices so we skip that toggle
                    // by manually setting the toggle to "static"
                    this.set("static");
                    UIHeadsUpDynamic.end();
                    UIHeadsUpStatic.begin();
                    this.node.addClass("active");
                } else {
                    UIHeadsUpStatic.end();
                    UIHeadsUpDynamic.begin();
                    this.node.addClass("active");
                }
            } else {
                UIHeadsUpStatic.end();
                UIHeadsUpDynamic.end();
                this.node.removeClass("active");
            }
        });

        $(".ciq-draw")[0].registerCallback(function(value) {
            if (value) {
                this.node.addClass("active");
                $("body").addClass("toolbar-on");
            } else {
                this.node.removeClass("active");
                $("body").removeClass("toolbar-on");
            }
            setHeight();
            var stx = this.context.stx;
            stx.resizeChart();

            // a little code here to remember what the previous drawing tool was
            // and to re-enable it when the toolbar is reopened
            if (value) {
                stx.changeVectorType(this.priorVectorType);
            } else {
                this.priorVectorType = stx.currentVectorParameters.vectorType;
                stx.changeVectorType("");
            }
        });

        if ($(".stx-trade")[0]) {
            $(".stx-trade")[0].registerCallback(function(value) {
                var sidePanel = $("cq-side-panel")[0];
                if (value) {
                    sidePanel.open({
                        selector: ".stx-trade-panel",
                        className: "active"
                    });
                    this.node.addClass("active");
                    $(".stx-trade-panel").removeClass("closed");
                    stxx.layout.sidenav = "sidenavOff"; // in break-sm hide sidenav when turning on tfc side panel
                } else {
                    sidePanel.close();
                    this.node.removeClass("active");
                    $(".stx-trade-panel").addClass("closed");
                }
            });
        }

        if ($(".stx-tradingcentral")[0]) {
            $(".stx-tradingcentral")[0].registerCallback(function(value) {
                var tcElement = $("cq-tradingcentral")[0];
                if (value) {
                    tcElement.removeAttribute("disabled");
                } else {
                    tcElement.setAttribute("disabled", "disabled");
                }
            });
        }

        $("cq-redo")[0].pairUp($("cq-undo"));

        $("cq-views").each(function() {
            this.initialize();
        });

        var params = {
            excludedStudies: {
                Directional: true,
                Gopala: true,
                vchart: true
            },
            alwaysDisplayDialog: {
                ma: true,
                AVWAP: true
            }
            /*dialogBeforeAddingStudy: {"rsi": true} // here's how to always show a dialog before adding the study*/
        };

        $("cq-studies").each(function() {
            this.initialize(params);
        });

        if (UIContext.loader) UIContext.loader.show();

        function loadTheChart() {
            restorePreferences();
            restoreLayout(stxx, function() {
                if (UIContext.loader) UIContext.loader.hide();

                // study legend needs the chart layout restored before rendering
                var studyLegend = $("cq-study-legend");
                if (studyLegend.length) {
                    for (var i = 0; i < studyLegend.length; i++) {
                        studyLegend[i].begin();
                    }
                }
            });

            if (!stxx.chart.symbol) {
                UIContext.UISymbolLookup.selectItem({
                    symbol: "AAPL"
                }); // load an initial symbol
            }

            CIQ.UI.begin();
        }

        loadTheChart();

        //CIQ.I18N.setLanguage(stxx, "zh");		// Optionally set a language for the UI, after it has been initialized, and translate.

        //Trade From Chart (TFC) - comment in if using module
        //set account key to your custom account class, or leave as null to automatically load the Demo class (CIQ.Account.Demo)
        // new CIQ.TFC({stx:stxx, account: null, context:UIContext});
    }

    function hideMarkers() {
        CIQ.Marker.removeByLabel(stxx, "circle");
        CIQ.Marker.removeByLabel(stxx, "square");
        CIQ.Marker.removeByLabel(stxx, "callout");
        CIQ.Marker.removeByLabel(stxx, "helicopter");
    }

    function showMarkers(standardType) {
        // Remove any existing markers
        hideMarkers();
        var l = stxx.masterData.length;
        // An example of a data array to drive the marker creation
        var data = [];
        if (l >= 5)
            data.push({
                x: stxx.masterData[l - 5].DT,
                type: standardType,
                category: "news",
                headline: "This is a Marker for a News Item"
            });
        if (l >= 15)
            data.push({
                x: stxx.masterData[l - 15].DT,
                type: standardType,
                category: "earningsUp",
                headline: "This is a Marker for Earnings (+)"
            });
        if (l >= 25)
            data.push({
                x: stxx.masterData[l - 25].DT,
                type: standardType,
                category: "earningsDown",
                headline: "This is a Marker for Earnings (-)"
            });
        if (l >= 35)
            data.push({
                x: stxx.masterData[l - 35].DT,
                type: standardType,
                category: "dividend",
                headline: "This is a Marker for Dividends"
            });
        if (l >= 45)
            data.push({
                x: stxx.masterData[l - 45].DT,
                type: standardType,
                category: "filing",
                headline: "This is a Marker for a Filing"
            });
        if (l >= 55)
            data.push({
                x: stxx.masterData[l - 55].DT,
                type: standardType,
                category: "split",
                headline: "This is a Marker for a Split"
            });

        var story =
            "Like all ChartIQ markers, the object itself is managed by the chart, so when you scroll the chart the object moves with you. It is also destroyed automatically for you when the symbol is changed.";

        // Loop through the data and create markers
        for (var i = 0; i < data.length; i++) {
            var datum = data[i];
            datum.story = story;
            var params = {
                stx: stxx,
                label: standardType,
                xPositioner: "date",
                x: datum.x,
                //chartContainer: true, // Allow markers to float out of chart. Set css .stx-marker{ z-index:20}
                node: new CIQ.Marker.Simple(datum)
            };

            var marker = new CIQ.Marker(params);
        }
        stxx.draw();
    }

    //Range Slider; needs to be created before startUI() is called for custom themes to apply
    new CIQ.RangeSlider({
        stx: stxx
    });

    // cryptoIQ
    // Market Depth plugin must be instantiated before startUI() is called for custom themes to apply.
    // Uncomment the following line to enable the cryptoIQ Market Depth panel:
    // new CIQ.MarketDepth({stx:stxx, volume:true, mountain:true, step:true, height:"50%", orderbook:true});
    // Uncomment the following line to enable the simulated L2 data loader.
    // CIQ.loadScript("examples/feeds/L2_simulator.js", function(stx){return function(){CIQ.simulateL2({stx:stx, onInterval:1000, onTrade:true});};}(stxx));
    // **In your implementation, you must instead load L2 data using https://documentation.chartiq.com/CIQ.ChartEngine.html#updateCurrentMarketData**

    startUI();
    resizeScreen();

    function resizeScreen() {
        if (!UIContext) return;
        checkWidth();
        setHeight();
        var sidePanel = $("cq-side-panel")[0];
        var sideNav = $(".sidenav");
        var sideNavWidth = sideNav.hasClass("active") ? sideNav.width() : 0;
        if (sidePanel) {
            $(".ciq-chart-area").css({
                right: sidePanel.nonAnimatedWidth() + sideNavWidth + "px"
            });
            $("cq-tradingcentral").css({
                "margin-right": sidePanel.nonAnimatedWidth() + 15 + "px"
            });
        } else {
            $(".ciq-chart-area").css({
                right: sideNavWidth + "px"
            });
        }
        stxx.resizeChart();
    }

    $(window).resize(resizeScreen);

    return stxx;
}
