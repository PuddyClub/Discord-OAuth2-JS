module.exports = {

    // Run Function
    run: function (auth, token) {

        // Sign In
        auth.signInWithCustomToken(token)
    
            // Success
            .then((userCredential) => {
                // Signed in
                userCredential.getIdToken();
                var user = userCredential.user;
                // ...
            })
    
            // Fail
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });
    
    }

};