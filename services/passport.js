const passport = require('passport');
const { google } = require('googleapis');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
var gcal = require('google-calendar');
const { OAuth2 } = google.auth;

const User = require('../models/User');
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});


passport.use(
 
   
      listEvents();
      function listEvents(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.list(
          {
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
          },
          (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const events = res.data.items;
            if (events.length) {
              console.log(events);
              console.log('Upcoming 10 events:');
              events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
              });
            } else {
              console.log('No upcoming events found.');
            }
          }
        );
      }

      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }
      // const user = await new User({ googleId: profile.id }).save();
      //console.log(user);
      // console.log(existingUser);
      done(null, accessToken);
    }
  )
);
