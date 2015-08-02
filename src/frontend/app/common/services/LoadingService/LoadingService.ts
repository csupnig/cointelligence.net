
module tvc {
    'use strict';

    export class LoadingIndicator {

        private $element: JQuery;
        private $overlay;

        constructor(element: HTMLElement) {
            this.$element = $(element);
        }

        /**
         * Trigger the loading indicator, which will overlay the element and display a spinner. Call this as before
         * the async/slow operations begin.
         */
        start() {
            this.$element.addClass('tvc-loading');
            this.createOverlay();
            $(window).on('resize', $.proxy(this.matchDimensions, this));
            // calculate the dimensions on the next event loop in order to allow
            // time for layout changes as the page elements render.
            setTimeout(() => this.matchDimensions(), 0);
            return this;
        }

        /**
         * Remove the loading indicator and spinner. Call this when the async/slow operations have all completed.
         */
        end() {
            this.$element.removeClass('tvc-loading');
            this.$overlay.fadeOut(() => this.$overlay.remove());
            $(window).off('resize', this.matchDimensions);
        }

        private createOverlay() {
            this.$overlay = $('<div>').addClass('tvc-loading-overlay');
            this.appendSpinnerTo(this.$overlay);
            $('body').append(this.$overlay);
        }

        private matchDimensions() {
            this.$overlay.css({
                top: this.$element.offset().top,
                left: this.$element.offset().left,
                width: this.$element.outerWidth(),
                height: this.$element.outerHeight()
            });
        }

        private appendSpinnerTo($el: JQuery) {
            var $spinner = $('<i class="fa fa-spinner fa-pulse"></i>').addClass('tvc-loading-spinner');
            $el.append($spinner);
        }
    }

    /**
     * This service is used to display a loading indicator to give the user a visual cue that something is going on
     * in the background.
     *
     * It has a single method `createLoadingIndicator()` which returns an instance of the LoadingIndicator class which
     * will apply the overlay effect to the specified element.
     *
     * Usage:
     * ======
     * ```
     * var loader = LoadingService.createLoadingIndicator(<optional HTMLElement>).start();
     *
     * myAsyncService.makeSlowCall().
     *   .then(() => loader.end());
     * ```
     */
    export class LoadingService {

        createLoadingIndicator(element: HTMLElement = document.body) {
            return new LoadingIndicator(element);
        }
    }

    angular.module('tvcCommon').service('LoadingService', LoadingService);

}