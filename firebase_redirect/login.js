module.exports = {

    // Run Function
    run: function (token, redirect_url, csrfToken, callback) {

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

            if (typeof callback !== "function") { start_redirect(); }
            else { callback(start_redirect, error); }

            // Complete
            return;

        };

        // Sign In
        firebase.auth().signInWithCustomToken(token)

            // Success
            .then(() => {

                fetch(window.location.pathname, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: firebase.auth().currentUser.getIdToken().i, csrfToken: csrfToken })
                }).then(response => {
                    response.json().then((data) => {

                        // Show Error Message
                        if(!data.success){ alert(data.error); }

                        // Complete
                        final_redirect();
                        return;
                    
                    }).catch(err => {
                        alert(`Error ${error.code}: ${error.message}`);
                        final_redirect(error);
                        return;
                    });
                }).catch(err => {
                    alert(`Error ${error.code}: ${error.message}`);
                    final_redirect(error);
                    return;
                });

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