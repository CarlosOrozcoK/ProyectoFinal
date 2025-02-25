import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
    name: {
        type: String,
        required: [true, "¡El nombre es obligatorio!"],
        maxlength: 25,
    },
    
    description: {
        type: String,
        required: [true, "¡La descripción es obligatoria!"],
        maxlength: 500,
    },

    productos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],

    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model("Category", CategorySchema);
