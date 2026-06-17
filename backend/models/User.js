const mongoose = require('mongoose');

const uderSchema = new mongoose.Schema(
    {
       name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlengthL: 50,
        },

        username: {
            type: String,
            required:[true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            match: [/^[a-z0-9_.]+$/, 'User can contain letters, numbers, dots amd underscores'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        bio: {
            type: String,
            default: '',
            maxlength:  160,
        },
        profilePic: {
              type: String,
              default: '',
            },
            followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        },
        { timestamp: true}
    )

module.exports = mongoose.module('User', Schema);