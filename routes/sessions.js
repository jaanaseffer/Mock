const router = require('express').Router();
const sessionModel = require('../models/Sessions');
const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../middleware')

router.post('/', async (req, res, next) => {

    // Get user by username from database
    const user = await userModel.findOne({username: req.body.username})

    // Validate username and password
    const passwordCheck = await bcrypt.compare(req.body.password, user.password);
    if (!user || !passwordCheck) {
        return res.status(401).json({error:"Invalid username/password"})
    }

    // Create session to database
    const session = await sessionModel.create({
        userId: user.id
    })

    // Return token to user
    return res.status(200).json({token:session._id})
})

router.delete('/', verifyToken, async (req, res, next) => {

    try {
        // Get session by userId from database
        const session = await sessionModel.findOne({userId: req.userId})

        // Check that session existed in the DB
        if(!session){
            return res.status(404).json({error:'Invalid  session'})
        }

        // Delete session from the database
        await sessionModel.deleteOne({_id:session._id.toString()})

        // Return token to user
        return res.status(204).json()

    } catch (e) {
        return res.status(400).json({error:e.message})
    }
})

module.exports = router;