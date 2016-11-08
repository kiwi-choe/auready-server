const should = require('should');

const server = require('../../../www');
const request = require('supertest')(server);

const accessToken = 'QjxAmH8WEhwOQsXVFMV99SM3MjNZN284YDls5310fMB4DzLWe6nr5xv9nVLwPEUHBfzcOJ54QhiCjprK5G7EF973OVDhPZjJBvaLsNjeVPbKeMXobUtwCN1OcVY2xH7yzWLiTpWGcVQalja6bStMdDfHPU4UXpMR7LQkgJtHWSB6Olr5bGhhrFmWdt6py0UsgwXKOEvgXZrzADG6MGiZ4cEukv0D8ITWPGbiKW0JmSsscgUbtItDVdnKyfk4Ubgl';

const config = {

    headerForApi: {
        Authorization: 'Bearer' + ' ' + accessToken
    },
};

const search = 'kiwi';
describe('GET /user/:search', () => {
    it('GET /user/:search - should return 200 code', done => {
        request
            .get('/user/' + search)
            .set(config.headerForApi)
            .expect(200)
            .end((err, res) => {
                if(err) throw err;
                // res.body.should.have.property('email', 'kiwi');

                done();
            });
    });
});