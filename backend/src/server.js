require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });


const app = require('../api/index');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅  Career With Chaithanya API running on http://localhost:${PORT}`);
});
