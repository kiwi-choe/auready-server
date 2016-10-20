
module.exports.oauth2 = {
    // you can customize token_duration for each grant type and refreshable
    // (implicit grant type's token_refreshable must be always 'false' by spec
    type : {
        password: {
            name: "password",
            token_refreshable: true,
            token_duration: 3600 * 24 * 365
        }
    }
};