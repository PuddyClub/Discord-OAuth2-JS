module.exports = {

    // Run Function
    run: function (token, redirect_url, callback) {

        // Prepare Redirect
        const final_redirect = function (error) {

            // The Redirect
            const start_redirect = function () {
                window.location.href = window.location.origin + '/' + redirect_url;
                return;
            };

            if (typeof callback !== "function") { start_redirect(); }
            else { callback(start_redirect, error); }

            // Complete
            return;

        };

        // Sign Out
        auth.signOut()

            // Success
            .then(() => {
                final_redirect();
                return;
            })

            // Fail
            .catch((error) => {
                alert(`Error ${error.code}: ${error.message}`);
                final_redirect(error);
                return;
            });

        // Complete
        return;

    }

};