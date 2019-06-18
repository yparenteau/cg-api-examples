/*
 * jQuery utilities.
 */

import "jquery";

// ---------------------------------------------------------------------------------------------------------------------------------

// Adapted from http://stackoverflow.com/a/18667336.
export function addContextMenu(window: Window) {
    jQuery.fn.contextMenu = function(options: any) {
        const settings = jQuery.extend(
            {
                menuOpeningEvents: "contextmenu"
            },
            options
        );

        function getMenuPosition(mouseClientPosition: number, dimension: string, scrollDirection: string) {
            const thisWindow = jQuery(window);

            const windowSize = (thisWindow as any)[dimension]();
            const scrollOffset = (thisWindow as any)[scrollDirection]();
            const menuSize: number = (jQuery(settings.menuSelector) as any)[dimension]();
            let menuPosition = mouseClientPosition + scrollOffset;

            // Opening menu would pass the side of the page.
            if (mouseClientPosition + menuSize > windowSize && menuSize < mouseClientPosition) {
                menuPosition -= menuSize;
            }

            return menuPosition;
        }

        return this.each(function() {
            // Open context menu.
            jQuery(this).on(settings.menuOpeningEvents, function(openMenuEvent) {
                // Return native menu if pressing control.
                if (openMenuEvent.ctrlKey) {
                    return;
                }

                // Open menu.
                const menu = jQuery(settings.menuSelector)
                    .data("openMenuEventTarget", jQuery(openMenuEvent.target))
                    .css({
                        position: "absolute",
                        left: getMenuPosition(openMenuEvent.clientX!, "width", "scrollLeft"),
                        top: getMenuPosition(openMenuEvent.clientY!, "height", "scrollTop")
                    })
                    .off("click")
                    .on("click", "a", function(menuItemClickEvent) {
                        const selectedMenuItem = jQuery(menuItemClickEvent.target);

                        if (!selectedMenuItem.closest("li").hasClass("disabled")) {
                            const openMenuEventTarget = menu.data("openMenuEventTarget");
                            settings.menuItemSelectedCallback.call(this, openMenuEventTarget, selectedMenuItem);
                        } else {
                            menuItemClickEvent.stopPropagation();
                        }

                        menuItemClickEvent.preventDefault();
                    })
                    .show();

                return false;
            });

            // Make sure menu closes on any clicks (outside it).
            jQuery("body").click(() => jQuery(settings.menuSelector).hide());
        });
    };
}
