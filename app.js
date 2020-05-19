const express = require('express');

const app = express();

// app.get('/', (req, resp) => {
//   resp.status(200).json({
//     message: 'Hello from the server side',
//     app: 'Natours',
//   });
// });

// app.post('/' , ((req, resp) => {
//     resp.send('You can post to this endpoint...')
// }))

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
