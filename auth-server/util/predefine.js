
const _oauth2 = {
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

const _fcmServerKey = {
    key: 'AAAAxivu5nQ:APA91bHj0GZCYh-d65c8GuSxmYqn5MNFraLuJtlDPqzRRpV5kNC8unqcEO_arJO0j7u5MRtUpSuVbVsdIm5lviz5adensEgl3fMp2jHy3bTRWeAqGFCik2PUmRy6aMWIHaUBoHjjfBfl',
    senderId: 851140601460
};

module.exports = {
    oauth2: _oauth2,
    fcmServerKey: _fcmServerKey
}