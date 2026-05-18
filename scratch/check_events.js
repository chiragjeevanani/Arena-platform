const mongoose = require('mongoose');
const CmsContent = require('./Backend/src/models/CmsContent');

async function checkEvents() {
    try {
        await mongoose.connect('mongodb://localhost:27017/arena'); // Assuming default port and DB name
        const events = await CmsContent.find({ kind: 'event' }).lean();
        console.log(JSON.stringify(events, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkEvents();
