import { Schema, model } from "mongoose";

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, "The name is required!"],
        maxLength: 25,
    },

    surname: {
        type: String,
        required: [true, "The surname is required!"],
        maxLength: [25, "25 characters maximum!"],
    },

    username: {
        type: String,
        unique: true,
    },

    email: {
        type: String,
        required: [true, "The email is required!"],
        unique: true,
    },

    password: {
        type: String,
        required: [true, "The password is required!"],
        minLength: [8, "8 minimum characters!"],
    },

    profile: {
        type: String,
    },

    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: [true, "The phone is required!"],
    },

    role: {
        type: String,
        enum: ['CLIENT_ROLE', 'ADMIN_ROLE'], 
        default: "CLIENT_ROLE",
    },

    estado: {
        type: Boolean,
        default: true,
    },

    google: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default model('User', UserSchema);
