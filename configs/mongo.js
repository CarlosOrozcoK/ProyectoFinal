'use strict';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/users/user.model.js';
import { hash as hashPassword } from 'argon2'; 

dotenv.config();

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            console.log('MongoDB | Could not be connected to MongoDB');
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | Try connecting...');
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Connected to MongoDB');
        });
        mongoose.connection.on('open', async () => {
            console.log('MongoDB | Connected to database');
            await createDefaultAdmin(); 
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | Reconnected to MongoDB');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Disconnected');
        });

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });

    } catch (error) {
        console.log('Database connection failed', error);
    }
};

const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'ADMIN_ROLE' });

        if (!adminExists) {
            const hashedPassword = await hashPassword('admin123'); 

            const admin = new User({
                name: "Carlos",
                surname: "Orozco",
                username: "orozcoc",
                email: "carlosorozco@gmail.com",
                password: hashedPassword, // 
                phone: "39679413",
                role: "ADMIN_ROLE",
            });

            await admin.save();
            console.log(' Default admin created: carlosorozco@gmail.com / 12345678');
        } else {
            console.log('🔹 Admin already exists, skipping creation.');
        }
    } catch (error) {
        console.log(' Error creating default admin:', error);
    }
};
