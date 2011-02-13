;(function($) {
    $.fn.slideShow = function(o) {
        var options = o || {};
        options = $.extend({}, $.fn.slideShow.defaults, options);

        var $container = $(this);
        var $slides = (options.slide ? $(options.slide, this) : $container.children());

        var currentSlideIndex = 0;
        var timerId = null;

        var spinnerSteps = 60;
        var spinnerTimerId = null;
        var spinnerTimeout = options.timeout / spinnerSteps;
        var spinnerStartAngle = 1.5 * Math.PI;
        var spinnerAngleStep = (2 / spinnerSteps) * Math.PI;

        function buildPager() {
            var $pager = $(options.pager);
            $.each($slides, function(index, object) {
                buildPageAnchor(index, $pager);
            });
            updatePager(options.pager, options.pagerActiveClass);
        }

        function buildPageAnchor(i, $pager) {
            var $anchor = $('<a href="#">' + (i + 1) + '</a>');
            $anchor.appendTo($pager);
            $anchor.bind('click.slideShow', function() {
                if (i != currentSlideIndex) {
                    if (timerId || spinnerTimerId) {
                        clearTimeout(timerId);
                        clearTimeout(spinnerTimerId);
                        timerId = null;
                    }
                    $next = $($slides[i]);
                    slide($($slides[currentSlideIndex]), $next);
                }
            });
        }

        function nextSlide() {
            $current = $($slides[currentSlideIndex]);
            $next = $($slides[(currentSlideIndex + 1) % $slides.length]);

            slide($current, $next);
        }

        function slide($from, $to) {
            $to.css({opacity: 0});
            $to.show();
            options.effect($from, $to);
            currentSlideIndex = $slides.index($to);

            if (options.pager) {
                updatePager(options.pager, options.pagerActiveClass);
            }

            startTimer();
        }

        function startTimer() {
            if (options.spinner) {
                spinnerTimerId = setTimeout(function() {
                    updateSpinner(0);
                }, spinnerTimeout);
            }
            else {
                timerId = setTimeout(function() {
                    nextSlide();
                }, options.timeout);
            }
        }

        function updatePager(pager, activeClass) {
            $(pager).each(function() {
                $(this).children().removeClass(activeClass).eq(currentSlideIndex).addClass(activeClass);
            });
        }

        function updateSpinner(step) {
            $(options.spinner).each(function() {
                var $s = $(this);
                if ($s[0].getContext) {
                    var context = $s[0].getContext('2d');
                    if (step < spinnerSteps) {
                        var x = $s.width() * 0.5;
                        var y = $s.height() * 0.5;

                        if (step === 1) {
                            context.fillStyle = '#888';
                            context.clearRect(0, 0, $s.width(), $s.height());
                        }

                        context.beginPath();
                        context.arc(x, y, x, spinnerStartAngle, spinnerStartAngle + step * spinnerAngleStep, false);
                        context.lineTo(x, y);
                        context.lineTo(x, 0);
                        context.closePath();
                        context.fill();
                    }
                }
            });

            if (step < spinnerSteps) {
                spinnerTimerId = setTimeout(function() {
                    updateSpinner(step + 1);
                }, spinnerTimeout);
            }
            else {
                nextSlide();
            }
        }

        return this.each(function() {
            if ($slides.length < 2) {
                return;
            }

            if ($container.css('position') == 'static') {
                $container.css('position', 'relative');
            }

            // We use negative z-indices here to make sure that any pagers present are display on top.
            $slides.css({position: 'absolute', top: 0, left: 0}).hide().each(function(i) {
                $(this).css('z-index', -i - 1);
            });

            $($slides[0]).css({'opacity': 1}).show();

            if (options.pager) {
                buildPager();
            }

            startTimer();
        });
    };

    $.fn.slideShow.effects = {
        fade: function($currentSlide, $nextSlide) {
            $currentSlide.animate({opacity: 0}, function() {
                $currentSlide.css({display: 'none'});
            });
            $nextSlide.animate({opacity: 1});
        }
    };

    $.fn.slideShow.defaults = {
        effect: $.fn.slideShow.effects.fade,
        pager: null,
        pagerActiveClass: 'activeSlide',
        slide: null,
        spinner: null,
        timeout: 2000
    };
})(jQuery);
