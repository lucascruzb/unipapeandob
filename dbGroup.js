import mongoose from "mongoose";

const grupoSchema = mongoose.Schema({
    tema : String,
    idioma : String,
    nivel : String,
    Key : String,
});

export default mongoose.model('group', grupoSchema);
