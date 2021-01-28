module.exports = {

    // Run Function
    run: function (token, redirect_url, csrfToken, original_csrfToken, callback) {

        // Compare CSRF Token
        if (original_csrfToken.length < 1 || original_csrfToken === csrfToken) {

            // Fix Redirect
            if (typeof redirect_url === "string") {
                if (redirect_url.startsWith('/')) {
                    redirect_url = redirect_url.substring(1);
                }
            }

            // Nope
            else {
                redirect_url = '';
            }

            // Prepare Redirect
            const final_redirect = function (error) {

                // The Redirect
                const start_redirect = function () {
                    window.location.href = window.location.origin + '/' + redirect_url;
                    return;
                };

                // Default Redirect
                if (typeof callback !== "function") {

                    // Show Error
                    if (error) { alert(error.message); }

                    // Redirect Now
                    start_redirect();

                }

                // Custom Redirect
                else { callback(start_redirect, error); }

                // Complete
                return;

            };

            // Sign Out
            firebase.auth().signOut()

                // Success
                .then(() => {

                    fetch(window.location.pathname, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token: token, csrfToken: csrfToken })
                    }).then(response => {
                        response.json().then(() => {
                            final_redirect();
                            return;
                        }).catch(err => {
                            final_redirect(error);
                            return;
                        });
                    }).catch(err => {
                        final_redirect(error);
                        return;
                    });

                    // Complete
                    return;

                })

                // Fail
                .catch((error) => {
                    final_redirect(error);
                    return;
                });

        }

        // Invalid
        else { final_redirect(new Error('Invalid csrfToken!')); }

        // Complete
        return;

    }

};