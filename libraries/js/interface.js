
jQuery(document).ready(function(){
    acceptCookies(true);

    jQuery('a[href="#cookies-learn-more"]').on('click',function(e){
        e.preventDefault();
        jQuery('.notification-bar.cookies .full-text').toggleClass('active');
        // _gaq.push(['_trackEvent','Cookies','Learn more']);
    });

    //Keep in mind language priority is cookie language / browser language / english
    var cookieLanguage = getCookie('Paris26g_Language');
    //If cookie is set, use cookie language
    if(cookieLanguage != ''){
        language(cookieLanguage);
    //If not, use browser language if supported
    }else{
        //Browser language is supported
        if(languageRange(utilities.browserLanguage)){
            language(utilities.browserLanguage);
        //Browser language is not supported, use english
        }else{
            language('en');
        }
    }

    jQuery('a[href*="#language"]').on('click',function(e){
        e.preventDefault();
        var targetLanguage = jQuery(this).text();
        language(targetLanguage);
        // _gaq.push(['_trackEvent','User sets language',targetLanguage]);
        //On small devices, automatically close after click
        if(jQ_aToggle.css('display') != 'none' && !jQuery(this).parent().hasClass('hover')){
            jQuery(this).parent().addClass('hover');
        }else{
            jQuery(this).parent().removeClass('hover');
        }
    });

    jQ_sidebarMain.find('.content')
        .perfectScrollbar()
        .on('touchmove',function(e){
            e.preventDefault(); //to avoid pull down refresh
        });
    jQuery('.hotspot p[lang]')
        .perfectScrollbar()
        .on('touchmove',function(e){
            e.preventDefault(); //to avoid pull down refresh
        });


    cookies.forEach(function(cookie){
        // console.log(cookie.indexOf('EasterEgg'));
        //Filter easter eggs
        var thisCookieValue = getCookie(cookie);
        if(cookie.indexOf('EasterEgg') > 1 && thisCookieValue == 'true'){
            var prefixEasters = 'Paris26g_EasterEgg_';
            var easterEggId = cookie.replace(prefixEasters,'');
            easterEggsStates[easterEggId] = true;
            jQuery('nav.easter-eggs a[href="#'+easterEggId+'"],#hotspot-dom-easter-egg-'+easterEggId).addClass('checked');
        }
        if(cookie == 'Paris26g_MenuItem'){
            jQ_sidebarPrimary.find('a').removeClass('active');
            jQ_sidebarPrimary.find('a[href="'+thisCookieValue+'"]').addClass('active');

        }
        if(cookie == 'Paris26g_MenuStatus'){
            if(thisCookieValue == 'true'){
                tabulation(jQ_sidebarPrimary.find('p.toolbar>a.active').eq(0).attr('href'));
                toggleMenu('show');
            }else{
                // jQ_sidebarMain.removeClass('active');
                jQ_sidebarPrimary.find('p.toolbar>a').removeClass('active');
            }
        }
        if(cookie == 'Paris26g_Intro'){
            if(thisCookieValue == 'true'){
                jQuery('.intro').removeClass('active');
                jQ_sidebarPrimary.addClass('active');
                if(!feature.touch){
                    jQ_sidebarSecondary.addClass('active');
                }
            }
        }
    });

    if(getCookie('Paris26g') == 'true'){
        var jQeasterEggsContainer = jQ_sidebarMain.find('nav.easter-eggs');
        var jQfoundEasterEggItems = jQeasterEggsContainer.find('a.checked');
        jQfoundEasterEggItems.each(function(){
            jQuery(this).remove();
            jQeasterEggsContainer.prepend(jQuery(this));
        });
    }

    //Deep link URL update
    jQuery('#wrapper').on('mouseleave',function(){
        //Update only if share modal is closed
        if(!jQ_modalShare.hasClass('active')){
            deepLinkUpdater();
        }
    });

    //Launch button
    jQuery('a[href="#launch"]').on('click',function(){
        jQuery('.intro').removeClass('active');
        jQ_forgeContainer.removeClass('dimmed');
        jQuery('a[href="#get-helper"]').removeClass('disabled');
        var currentTabId = getCookie('Paris26g_MenuItem');
        var currentMenuStatus = getCookie('Paris26g_MenuStatus');
        if(currentTabId != '' && currentMenuStatus == 'true'){
            toggleMenu('show');
            tabulation(currentTabId);
        };
        modal('helper','show');
    });

    //Include toolbar for each spot
    jQ_hotspotsPoi.each(function(){
        jQuery(this).find('.hotspot-zone>.content')
            .prepend(jQuery('aside.toolbar-hotspot').html());
    });

    //Insert the toolbar for the monument details modal
    jQ_modalPlacesDetails.prepend(jQuery('aside.toolbar-hotspot').html());

    jQuery('a[href="#next-poi"], a[href="#previous-poi"]').on('click',function(e){
        e.preventDefault();
        var id = viewer.story.sceneUid;
        if(id == 'paris'){
            var rawId = jQuery('.hotspot:not(.easter-egg):not(.media-style__cache).active').attr('id');
            id = rawId.substring(12,14);
        }
        //Compute next/previous indexes for each POI
        var currentIndex = jQ_navPointsOfInterest.children('a[href="#'+id+'"]').index(),
            numberOfPoi = jQ_navPointsOfInterest.children('a').length,
            nextIndex = currentIndex + 1,
            previousIndex = currentIndex - 1,
            previousAnchor = jQ_navPointsOfInterest.children('a').eq(previousIndex).attr('href'),
            previousPoiId,
            nextAnchor = jQ_navPointsOfInterest.children('a').eq(nextIndex).attr('href'),
            nextPoiId;
        //First/last management
        if(previousAnchor === undefined){
            nextPoiId = nextAnchor.replace('#','');
        }else if(nextAnchor === undefined){
            previousPoiId = previousAnchor.replace('#','');
        }else{
            previousPoiId = previousAnchor.replace('#','');
            nextPoiId = nextAnchor.replace('#','');
        }

        //If POI opened
        if(jQ_modalPlacesDetails.hasClass('active')){
            if(jQuery(this).attr('href') == '#next-poi'){
                openPoi(nextPoiId);
            }else if(jQuery(this).attr('href') == '#previous-poi'){
                openPoi(previousPoiId);
            }
        //If no POI is opened
        }else{
            if(jQuery(this).attr('href') == '#next-poi'){
                kickMeTo(nextPoiId);
            }else if(jQuery(this).attr('href') == '#previous-poi'){
                kickMeTo(previousPoiId);
            }
        }
    });

    jQuery('.hotspot a[href="#close-hotspot"]').on('click',function(e){
        e.preventDefault();
        jQuery(this).closest('.hotspot').removeClass('active');
        viewerControllers(true);
    });

    jQ_hotspotsPoi.find('.media').on('click',function(e){
        var jQspot = jQuery(this).parent().parent(),
            rawId = jQuery(this).closest('.hotspot').attr('id'),
            id = rawId.substring(12,14),
            sceneUid = viewer.story.sceneUid;
        if(!jQspot.hasClass('active') && sceneUid == 'paris'){
            kickMeTo(id);
            var title = jQuery('a[href="#'+id+'"]').text();
            // _gaq.push(['_trackEvent','In Gigapixel, users clicks hotspot',title]);
        }
    });

    jQ_cache.on('click',function(){
        // _gaq.push(['_trackEvent','Easter Eggs','PTP Mix']);
        jQuery('body').append('<iframe style="position:fixed; top:50%; left:50%; max-width:500px; transform: translateX(-50%) translateY(-50%);" width="100%" height="265" src="https://clyp.it/c3gz5i2a/widget" frameborder="0"></iframe>');
    });

    jQuery('a[href="#learn-more"]').on('click',function(e){
        e.preventDefault();
        var rawId = jQuery(this).closest('.hotspot').attr('id'),
            targetSceneUid = rawId.substring(12,14);
        openPoi(targetSceneUid);
        // _gaq.push(['_trackEvent','Hotspot opened','Click on learn more']);
    });

    jQuery('.modal a[href="#close-hotspot"], .modal a[href="#toggle-visible"]').on('click',function(e){
        e.preventDefault();
        modalPlacesDetails();
    });

    jQuery('.modal.floor-plan').on('click',function(e){
        e.preventDefault();
        closePoi('home');
    });

    jQ_navPointsOfInterest.children('a').on('click',function(e){
        e.preventDefault();
        var id = jQuery(this).attr('href'),
            id = id.replace('#',''),
            currentSceneUid = viewer.story.sceneUid,
            text = jQuery(this).children('span').text(),
            //Are we in xs/sm screen size?
            displayType = jQ_aToggle.css('display');
        if(currentSceneUid == 'paris'){
            kickMeTo(id);
        }else{
            openPoi(id);
        }
        //Close menu is xs/sm device
        if(displayType != 'none'){
            toggleMenu('hide');
        }
        // _gaq.push(['_trackEvent','Menu',text]);
    });

    jQ_aToggle.on('click',function(e){
        e.preventDefault();
        toggleMenu();
    });

    jQuery('a[href="#point-of-interest"], a[href="#easter-eggs"], a[href="#about"]').on('click',function(e){
        e.preventDefault();
        //Are we in xs/sm screen size?
        var displayType = jQ_aToggle.css('display'),
            tabId = jQuery(this).attr('href');
        //Display 'none' means large screens
        if(displayType == 'none'){
            //If tabulation is already active, close menu
            if(jQuery(this).hasClass('active')){
                toggleMenu('hide');
                jQuery(this).removeClass('active');
                setCookie('Paris26g_MenuStatus','false',365);
            //Otherwise open menu and tab
            }else{
                tabulation(tabId);
            }
        //Otherwise it is small screens, just tabulate
        }else{
            tabulation(tabId);
        }


    });

    jQuery('a[href="#home"]').on('click',function(e){
        e.preventDefault();
        viewerControllers(true);
        var currentSceneUid = viewer.story.sceneUid;
        if(currentSceneUid == 'paris'){
            jQ_hotspotsPoi.removeClass('active');
            viewer.camera.lookAt(-22, -13, null, 40, 2000, false, 'easeInOutCubic');
        }else{
            closePoi('home-full');
        }
        // _gaq.push(['_trackEvent','Home button','click']);
    });

    //Share view
    jQuery('a[href="#share-view"]').on('click',function(e){
        e.preventDefault();
        shareView();
    });

    //Change share URL on optional description change
    jQ_modalShare.find('textarea').on('change',function(){
        //Get input change
        var text = jQuery(this).val();
        //Get current links
        var jQfacebookLink = jQ_modalShare.find('a.link-facebook');
        var jQtwitterLink = jQ_modalShare.find('a.link-twitter');
        var jQgoogleLink = jQ_modalShare.find('a.link-google');
        var jQpinterestLink = jQ_modalShare.find('a.link-pinterest');
        var jQcopyLink = jQ_modalShare.find('a[href="#copy-link"]');
        //Add description to links
        var new_share_facebook_url = jQfacebookLink.attr('href')+encodeURIComponent('&description='+text);
        var new_share_twitter_url = jQtwitterLink.attr('href')+'&text='+encodeURIComponent(text);
        var new_share_google_url = jQgoogleLink.attr('href')+encodeURIComponent('&description='+text);
        var new_share_pinterest_url = jQpinterestLink.attr('href')+'&description='+encodeURIComponent(text);
        var new_share_link_url = jQcopyLink.attr('data-clipboard-text')+'&description='+encodeURIComponent(text);
        //Include new links
        jQfacebookLink.attr('href',new_share_facebook_url);
        jQtwitterLink.attr('href',new_share_twitter_url);
        jQgoogleLink.attr('href',new_share_google_url);
        jQpinterestLink.attr('href',new_share_pinterest_url);
        jQcopyLink.attr('data-clipboard-text',new_share_link_url);
    });

    //Close share modal management, check if user has clicked a sharing network
    var userHasShared = false;
    jQuery('a[href="#close-shareview"], .backdrop.share').on('click',function(e){
        e.preventDefault();
        var id = jQ_modalShare.find('.image').attr('data-id');
        //User has shared, then reset
        if(userHasShared){
            userHasShared = false;
        //Or delete unused screenshot
        }else{
            jQuery.ajax({
                method: "POST",
                url: "delete.php",
                data: { id: id }
            });
        }
        modal('share','hide');
    });
    //User clicks on a social network, then update status
    jQuery('a.link-social').on('click',function(e){
        userHasShared = true;
        var text = jQuery(this).attr('data-tooltip-fr');
        // _gaq.push(['_trackEvent','Share','Click on '+text]);
    });

    //Clipboard management
    var clipboard = new Clipboard('a[href="#copy-link"]');
    clipboard.on('success', function(e) {
        notificationPush('<span lang="fr">Lien copié dans le presse-papier</span><span lang="en">Link copied to clipboard</span><span lang="es">Enlace copiado al portapapeles</span>','autohide','success','icon-check');
        e.clearSelection();
    });

    //Zoom management
    var mouseStillDown = false;
    var interval;
    var intervalDuration = 100;
    jQuery('a[href*="#zoom"]').on('mousedown mouseup',function(e){
        e.preventDefault();
        viewerControllers(true);
        var currentFov = viewer.camera.fov,
            destinationFov,
            coef,
            isZoomIn = false,
            yaw = viewer.camera.yaw,
            pitch = viewer.camera.pitch;

        //Zoom in
        if(jQuery(this).attr('href').indexOf('-in') > 1){
            coef = 0.95;
            isZoomIn = true;
        //Zoom out
        }else{
            coef = 1.05;
        }
        if(e.type == 'mousedown'){
            mouseStillDown = true;
            destinationFov = currentFov * coef;
            viewer.camera.lookAt(yaw, pitch, 0, destinationFov, intervalDuration, false);
            currentFov = destinationFov;
            interval = setInterval(function(){
                if(mouseStillDown){
                    destinationFov = currentFov * coef;
                    viewer.camera.lookAt(yaw, pitch, 0, destinationFov, intervalDuration, false);
                    currentFov = destinationFov;
                }
            },intervalDuration);
        }else{
            mouseStillDown = false;
            clearInterval(interval);
        }
    });

    jQuery('.easter-eggs>a').on('click',function(e){
        e.preventDefault();
        viewerControllers(true);

        var currentEgg = jQuery(this).attr('href');
        var delay = SV_viewerTransitionDuration * 2;
        currentEgg = currentEgg.replace('#','');
        //If already found
        if(easterEggsStates[currentEgg]){
            //Are we in xs/sm screen size?
            var displayType = jQ_aToggle.css('display');
            //Close menu is xs/sm device
            if(displayType != 'none'){
                toggleMenu('hide');
            }
            //If currently on main scene, adjust delay to go directly to easter egg
            if(viewer.story.sceneUid == 'paris'){
                delay = 0;
            //If current scene is not paris, got to paris
            }else{
                closePoi('home-full');
                goToScene('paris');
            }

            setTimeout(function(){
                viewer.camera.lookAt(easterEggsData[currentEgg][0],easterEggsData[currentEgg][1],null,easterEggsData[currentEgg][2],3000);
            },delay);
        }
    });

    //Notifications
    jQuery('a[href="#i-accept-cookies"]').one('click',function(e){
        e.preventDefault();
        setCookie('Paris26g_cookiesAccepted','true',365);
        jQuery('.notification-bar.cookies').removeClass('active');
        // _gaq.push(['_trackEvent','Cookies','Accepted']);
    });

    //About Forge JS
    jQuery('a[href="#forgejs.org"]').on('click',function(e){
        e.preventDefault();
        modal('forgejs','show');
        // _gaq.push(['_trackEvent','About','ForgeJS']);
        jQuery('a[href="#close-forgejs-modal"]').on('click',function(e){
            e.preventDefault();
            modal('forgejs','hide');
            jQuery(this).off();
        });
    });

    //Get helper
    jQuery('a[href="#get-helper"]').on('click',function(e){
        e.preventDefault();
        modal('helper','show');
        // _gaq.push(['_trackEvent','Helper','Open']);
    });
    //Close helper
    jQuery('a[href="#close-helper"]').on('click',function(e){
        e.preventDefault();
        modal('helper','hide');
    });

    //Fullscreen toggle button
    jQ_aFullscreen.on('click',function(e){
        e.preventDefault();
        toggleFullScreen();
    });

    jQuery(window).on('load',function(){
        if(easterEggsCount()[0] == easterEggsCount()[1]){
            congratulations('show');
        }
        jQuery('#container canvas').on('dblclick',function(e){
            var screenPosition = FORGE.Pointer.getRelativeMousePosition(e);
            var stw = viewer.view.screenToWorld(screenPosition);
            var spherical = FORGE.Math.cartesianToSpherical(stw.x, stw.y, stw.z, FORGE.Math.DEGREES);
            var yaw = spherical.theta,
                pitch = spherical.phi;
                destinationFov = 1;
            viewer.camera.lookAt(yaw, pitch, 0, destinationFov, 1000, false);
        });
    });

    //Deactivate tab key
    document.onkeydown = function(e) {
        if (e.defaultPrevented) return;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9) {
            e.preventDefault();
            return false;
        }
    };
});