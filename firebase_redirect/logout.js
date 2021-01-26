module.exports = {

    // Run Function
    run: function (auth) {

        // Sign Out
        auth.signOut()
        
        // Success
        .then(() => {
            // Sign-out successful.
        })
        
        // Fail
        .catch((error) => {
            // An error happened.
        });
    
    }

};