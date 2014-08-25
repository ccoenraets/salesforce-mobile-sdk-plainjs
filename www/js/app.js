(function () {

    "use strict";

    var $body = $('body'),
        $homePage,
        contactService,
        slider = new PageSlider($body); // Initialize PageSlider micro-library for nice and hardware-accelerated page transitions

    document.addEventListener("deviceready", function () {
        FastClick.attach(document.body); // avoid 300ms delay (see: https://github.com/ftlabs/fastclick)
        authenticate(
            function (forceClient) {
                contactService = new services.ContactService(forceClient);
                router.start();
            },
            function () {
                alert('Authentication Error');
            }
        );

    }, false);

    // Handle back button throughout the entire app
    $body.on('click', '.btn-back', function () {
        window.history.back();
        return false;
    });

    router.addRoute('', showHomePage);
    router.addRoute('contacts/new', newContact);
    router.addRoute('contacts/:id', showContactPage);

    function authenticate(successHandler, errorHandler) {

        // Get reference to Salesforce OAuth plugin
        var oauthPlugin = cordova.require("com.salesforce.plugin.oauth");

        // Authenticate
        oauthPlugin.getAuthCredentials(
            function (creds) {
                // Instantiate ForceTK client
                var forceClient = new forcetk.Client();
                forceClient.setSessionToken(creds.accessToken, "v31.0", creds.instanceUrl);
                if (successHandler) successHandler(forceClient);
            },
            function (error) {
                if (errorHandler) errorHandler(error);
            }
        );
    }

    function showHomePage() {
        // Lazy instantiation of the home page. We keep it cached in $homePage.
        if (!$homePage) {
            $homePage = new views.HomeView(contactService).render();
        }
        slider.slidePage($homePage);
    }

    function showContactPage(contactId) {
        contactService.findById(contactId, function (contact) {
            slider.slidePage(new views.ContactView(contactService, contact).render());
        });
    }

    function newContact() {
        slider.slidePage(new views.ContactView(contactService).render());
    }

}());