mongosh
use replai
show collections
db.sentemails.find().pretty()
db.tokens.find().pretty()

// Delete all users
db.users.deleteMany({})

// Delete particular user
db.users.deleteOne({ email: "user@example.com" })

// To remove section
db.collectionName.drop()

// website performance test
npx lighthouse https://replai.tech --view

// Create demo account

db.users.insertOne({
  _id: ObjectId('67d4bad66bbe375d34eee376'),
  name: 'Test User',
  email: 'test@test.com',
  password: 'test1234',
  isVerified: true,
  connectedEmails: [],
  urls: [],
  createdAt: ISODate('2025-03-14T23:25:10.167Z'),
  updatedAt: ISODate('2025-03-16T13:09:27.548Z'),
  __v: 0,
  profilePicture: ''
})
