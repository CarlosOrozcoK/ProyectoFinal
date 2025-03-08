import { Schema, model } from "mongoose";

const CarritoSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productos: [
        {
            producto: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            cantidad: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ],
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Carrito', CarritoSchema);