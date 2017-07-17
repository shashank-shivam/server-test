var mongo = require('mongodb')
// var assert = require('assert')

// var url = 'mongodb://localhost:27017/smartHelmet'

// function accident(item) {
//
// 	mongo.connect(url, function(err, db) {
// 		assert.equal(null, err)
// 		db.collection('user').findOne()
// 	})
// 	mongo.connect(url, function(err, db) {
// 		assert.equal(null, err)
// 		db.collection('accident').insertOne(item, function(err, result) {
// 			assert.equal(null, err)
// 			console.log('item inserted')
// 			db.close()
// 		})
// 	})
// }

// function overspeeding(item) {
// 	overspeeding.native
	// mongo.connect(url, function(err, db) {
	// 	assert.equal(null, err)
	// 	db.collection('overspeeding').insertOne(item, function(err, result) {
	// 		assert.equal(null, err)
	// 		console.log('item inserted')
	// 		db.close()
	// 	})
	// })
// }

module.exports = {
	script: function(req, res) {

		var item = {
			'registeredNum': req.param('registeredNum'),
			'name': req.param('name'),
			'emergencyNums': req.param('emergencyNums'),
			'location': req.param('location'),
			'timestamp': req.param('timestamp'),
			'emergency': req.param('emergency')
		}
		async.auto({
			userCollection: User.native,
			overspCollection: Overspeeding.native,
			accidentCollection: Accident.native,
			allUser: ['userCollection', function(callback, results) {
				userCollection = results.userCollection
				userCollection.find({}).toArray(function(err, allUser) {
                    callback(err, allUser)
                })
				// userCollection.find({'registeredNum': item.registeredNum}).exec(function(err, registeredUser) {
				// 	if (err) {
				// 		return res.serverError(err)
				// 	}
				// 	if (!registeredUser) {
				// 		return res.notFound('Unaouthorized Number! Cannot process the request.')
				// 	}
				// 	callback(err, registeredUser)
				// })
			}],
			checkUser: ['allUser', function(callback, results) {
				allUser = results.allUser
				user = false
				for (var i = 0; i < allUser.length; i++) {
					if (allUser[i].registeredNum == item.registeredNum) {
						user = true
					}
				}
				if (!user) {
					return res.notFound('Unaouthorized Number! Cannot process the request.')
				}
				callback(null, item)
			}],
			overspeed: ['overspCollection', 'checkUser', function(callback, results) {
				overspCollection = results.overspCollection
				registeredUser = results.checkUser
				if (item.emergency == 'overspeeding') {
					console.log('ok1')
					overspCollection.update({
						'registeredNum': registeredUser.registeredNum,
						'name': registeredUser.name
					}, {
						$push: {
							'overspeed': {
								'location': "",
								'timestamp': ""
							}
						}
					}, {
						upsert: true
					})
				}
				callback(null, item)
			}],
			accident: ['accidentCollection', 'checkUser', function(callback, results) {
				accidentCollection = results.accidentCollection
				registeredUser = results.checkUser
				if (item.emergency == 'accident') {
					accidentCollection.update({
						'registeredNum': registeredUser.registeredNum,
						'name': registeredUser.name
					}, {
						$push: {
							'accident': {
								'location': "",
								'timestamp': ""
							}
						}
					}, {
						upsert: true
					})
				}
				callback(null, item)
			}],
		}, function(err, results) {
			if (err) {
                return res.serverError(err)
            }
			return res.json({'success':true})
		})
		// if(item.emergency == 'accident') {
		// 	accident(item);
		// }
		//
		// if(item.emergency == 'overspeeding') {
		// 	overspeeding(item);
		// }

	},
}
