
app.directive('fixedHeader', ['$timeout', '$q', function ($timeout, $q) {
    return {
        restrict: 'A',
        //scope: true,
        scope: {watch: '@'},
        link: function ($scope, $element, $attrs, $ctrl) {

            // Set fixed widths for the table headers in case the text overflows.
            // There's no callback for when rendering is complete, so check the visibility of the table 
            // periodically -- see http://stackoverflow.com/questions/11125078
            function waitForRender() {
                var deferredRender = $q.defer();
                var tryout = 20;
                function wait() {
                    if (tryout-- <= 0) {
                        deferredRender.reject();
                    } else if ($element.find("tbody tr:first").length === 0) {
                        $timeout(wait, 200);
                    } else {
                        deferredRender.resolve();
                    }
                }
                $timeout(wait, 200);
                return deferredRender.promise;
            }

            function fixHeader() {
                waitForRender().then(fixHeaderInner);
            }

            function fixHeaderInner() {
             
                var thead = $element.find('thead');
                var tbody = $element.find('tbody');

                if ($element.find("tbody tr:first").length === 0) {
                    return;
                }

                $element.ready(function() { 
                    thead.find('tr:first th').each(function (i, thElem) {
                        thElem = $(thElem);
                        var tdElems = $element.find('tbody tr:first td:nth-child(' + (i + 1) + ')');
                        if (tdElems.length > 0) {
                            var columnWidth = tdElems[0].offsetWidth;
                            //tdElems.width(columnWidth);
                            //thElem.width(columnWidth);
                            thElem.attr("width", tdElems.attr("width"));

                            thElem.css({
                                'display': 'inline-block',
                                'width': columnWidth + "px",
                                'position': 'relative',
                                'white-space': 'normal'
                            });
                        }
                    });
                     
                    $element.css({
                        'display': 'block'
                    });

                    // set css styles on thead and tbody
                    thead.css({
                        'display': 'inline-block',
                        'overflow': 'hidden',
                        'white-space': 'nowrap'
                    });
					 
                    tbody.css({
                        'display': 'block',
                        'height': ($element.height() - thead.height()) + "px",
                        'overflow': 'auto'
                    });
                     
                    // reduce width of last column by width of scrollbar
                    var scrollBarWidth = thead.width() - tbody[0].clientWidth;
                    if (scrollBarWidth > 0) {
                        // for some reason trimming the width by 2px lines everything up better
                        scrollBarWidth -= 2;
                        tbody.find('tr:first td:last-child').each(function (i, elem) {
                            $(elem).width($(elem).width() - scrollBarWidth);
                        });
                    }
                });                
            }

            // for the first time
            fixHeader();

            // when window resize
            $(window).resize(fixHeaderInner);


            // when update data
            $scope.$watch('watch', function (newValue, oldValue) { 
                if (newValue != oldValue) {
                    fixHeader();
                }
            });
        }
    }
}]);